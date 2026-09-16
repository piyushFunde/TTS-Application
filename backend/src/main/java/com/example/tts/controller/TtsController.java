package com.example.tts.controller;

import com.example.tts.dto.TtsRequest;
import com.example.tts.dto.VoiceResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TtsController {
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/voices")
    public List<VoiceResponse> voices() {
        return List.of(
            new VoiceResponse("en-US-JennyNeural", "Jenny", "en-US", "Warm & natural"),
            new VoiceResponse("en-GB-RyanNeural", "Ryan", "en-GB", "Clear & assured"),
            new VoiceResponse("hi-IN-SwaraNeural", "Swara", "hi-IN", "Expressive"),
            new VoiceResponse("fr-FR-DeniseNeural", "Denise", "fr-FR", "Bright & smooth")
        );
    }

    @PostMapping("/tts")
    public ResponseEntity<Map<String, Object>> createSpeech(@Valid @RequestBody TtsRequest request) {
        return ResponseEntity.status(501).body(Map.of(
            "success", false,
            "message", "Connect a provider adapter and configure TTS_API_KEY before generating server audio.",
            "language", request.language(),
            "voice", request.voice()
        ));
    }
}
