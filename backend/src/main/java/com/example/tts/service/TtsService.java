package com.example.tts.service;

import com.example.tts.dto.TtsRequest;
import com.example.tts.dto.TtsResponse;
import com.example.tts.dto.VoiceResponse;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

@Service
public class TtsService {

    private final Path storageDir = Paths.get("temp-audio");

    private static final List<VoiceResponse> VOICES = List.of(
        new VoiceResponse("en-US-JennyNeural", "Jenny", "English (US)", "en-US", "Female", "Warm & natural", "Welcome to Echo text to speech studio."),
        new VoiceResponse("en-US-GuyNeural", "Guy", "English (US)", "en-US", "Male", "Professional & clear", "Hello, this is a clear and professional voice sample."),
        new VoiceResponse("en-GB-RyanNeural", "Ryan", "English (UK)", "en-GB", "Male", "Assured & articulate", "Greetings, this is an articulate voice sample."),
        new VoiceResponse("hi-IN-SwaraNeural", "Swara", "Hindi", "hi-IN", "Female", "Expressive & warm", "नमस्ते, Echo में आपका स्वागत है।"),
        new VoiceResponse("hi-IN-MadhurNeural", "Madhur", "Hindi", "hi-IN", "Male", "Friendly & deep", "नमस्ते, आपकी आवाज़ तैयार है।"),
        new VoiceResponse("gu-IN-DhwaniNeural", "Dhwani", "Gujarati", "gu-IN", "Female", "Clear & calm", "નમસ્તે, Echo ટેક્સ્ટ ટુ સ્પીચમાં આપનું સ્વાગત છે."),
        new VoiceResponse("mr-IN-AarohiNeural", "Aarohi", "Marathi", "mr-IN", "Female", "Melodic & distinct", "नमस्कार, Echo मध्ये आपले स्वागत आहे."),
        new VoiceResponse("es-ES-ElviraNeural", "Elvira", "Spanish", "es-ES", "Female", "Smooth & fluid", "Hola, bienvenido al estudio de voz Echo."),
        new VoiceResponse("fr-FR-DeniseNeural", "Denise", "French", "fr-FR", "Female", "Bright & graceful", "Bonjour, bienvenue sur le studio Echo."),
        new VoiceResponse("de-DE-KatjaNeural", "Katja", "German", "de-DE", "Female", "Energetic & clear", "Guten Tag, willkommen im Echo Studio.")
    );

    public TtsService() {
        try {
            Files.createDirectories(storageDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public List<VoiceResponse> getAllVoices() {
        return VOICES;
    }

    public TtsResponse synthesizeSpeech(TtsRequest request) {
        VoiceResponse voice = VOICES.stream()
            .filter(v -> v.id().equalsIgnoreCase(request.voice()))
            .findFirst()
            .orElseGet(() -> VOICES.get(0));

        String text = request.text().trim();
        int characterCount = text.length();
        int wordCount = text.isEmpty() ? 0 : text.split("\\s+").length;

        double speed = request.speed() != null ? request.speed() : 1.0;
        double pitchMultiplier = request.pitch() != null ? request.pitch() : 1.0;

        String langCode = voice.languageCode() != null ? voice.languageCode() : request.language();
        String filename = "tts-" + UUID.randomUUID().toString() + ".mp3";
        Path outputPath = storageDir.resolve(filename);

        boolean success = fetchNativeLanguageAudio(text, langCode, outputPath);
        if (!success) {
            filename = "tts-" + UUID.randomUUID().toString() + ".wav";
            outputPath = storageDir.resolve(filename);
            generateSynthAudioFile(text, speed, pitchMultiplier, voice, outputPath);
        }

        cleanupOldFiles();

        double estimatedDuration = Math.max(1.5, (wordCount / (2.5 * speed)));

        return new TtsResponse(
            true,
            "/api/tts/audio/" + filename,
            filename,
            Math.round(estimatedDuration * 10.0) / 10.0,
            characterCount,
            wordCount,
            voice.name(),
            voice.language()
        );
    }

    public Resource loadAudioAsResource(String filename) {
        try {
            Path filePath = storageDir.resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath);
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("Audio file not found or unreadable: " + filename);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Audio file not found: " + filename);
        }
    }

    private boolean fetchNativeLanguageAudio(String text, String langCode, Path outputPath) {
        try {
            String langTag = langCode != null && langCode.contains("-") ? langCode.split("-")[0] : "en";
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String urlStr = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + langTag + "&q=" + encodedText;

            HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();

            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(urlStr))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .GET()
                .build();

            HttpResponse<byte[]> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200 && response.body().length > 100) {
                Files.write(outputPath, response.body(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                return true;
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private void generateSynthAudioFile(String text, double speed, double pitchMultiplier, VoiceResponse voice, Path outputPath) {
        float sampleRate = 22050.0f;
        AudioFormat format = new AudioFormat(sampleRate, 16, 1, true, false);

        int wordCount = text.isEmpty() ? 0 : text.split("\\s+").length;
        double durationSeconds = Math.max(1.5, Math.min(60.0, (wordCount * 0.4) / speed));
        int totalFrames = (int) (sampleRate * durationSeconds);
        byte[] pcmData = new byte[totalFrames * 2];

        double baseFreq = voice.gender().equalsIgnoreCase("Female") ? 220.0 : 130.0;
        baseFreq *= pitchMultiplier;

        char[] chars = text.toCharArray();
        int charIndex = 0;

        for (int frame = 0; frame < totalFrames; frame++) {
            double time = frame / (double) sampleRate;

            if (frame % (int)(sampleRate * 0.15) == 0 && chars.length > 0) {
                charIndex = (charIndex + 1) % chars.length;
            }

            char currentChar = chars.length > 0 ? chars[charIndex] : 'a';
            double charMod = (currentChar % 12) * 15.0;
            double currentFreq = baseFreq + charMod * Math.sin(2 * Math.PI * 4 * time);

            double envelope = Math.sin(Math.PI * (frame / (double) totalFrames));
            double cadence = 0.5 + 0.5 * Math.sin(2 * Math.PI * (3.5 * speed) * time);

            double fundamental = Math.sin(2 * Math.PI * currentFreq * time);
            double harmonic1 = 0.4 * Math.sin(2 * Math.PI * (currentFreq * 2.0) * time);

            double sampleValue = (fundamental + harmonic1) * envelope * cadence * 0.3;
            short sampleShort = (short) (sampleValue * Short.MAX_VALUE);

            pcmData[frame * 2] = (byte) (sampleShort & 0xff);
            pcmData[frame * 2 + 1] = (byte) ((sampleShort >> 8) & 0xff);
        }

        ByteArrayInputStream bais = new ByteArrayInputStream(pcmData);
        AudioInputStream ais = new AudioInputStream(bais, format, totalFrames);

        try {
            AudioSystem.write(ais, AudioFileFormat.Type.WAVE, outputPath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to write audio output file", e);
        }
    }

    private void cleanupOldFiles() {
        try {
            File dir = storageDir.toFile();
            File[] files = dir.listFiles((d, name) -> name.endsWith(".mp3") || name.endsWith(".wav"));
            if (files != null && files.length > 50) {
                Arrays.sort(files, Comparator.comparingLong(File::lastModified));
                for (int i = 0; i < files.length - 30; i++) {
                    files[i].delete();
                }
            }
        } catch (Exception ignored) {
        }
    }
}
