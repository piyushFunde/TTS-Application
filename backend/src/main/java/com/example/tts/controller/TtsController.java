package com.example.tts.controller;

import com.example.tts.dto.TtsRequest;
import com.example.tts.dto.TtsResponse;
import com.example.tts.dto.VoiceResponse;
import com.example.tts.service.TtsService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TtsController {

    private final TtsService ttsService;

    public TtsController(TtsService ttsService) {
        this.ttsService = ttsService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Echo Text-to-Speech API",
            "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/voices")
    public ResponseEntity<List<VoiceResponse>> voices() {
        return ResponseEntity.ok(ttsService.getAllVoices());
    }

    @PostMapping("/tts")
    public ResponseEntity<TtsResponse> createSpeech(@Valid @RequestBody TtsRequest request) {
        TtsResponse response = ttsService.synthesizeSpeech(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tts/audio/{filename:.+}")
    public ResponseEntity<Resource> getAudioFile(@PathVariable String filename) {
        Resource audioResource = ttsService.loadAudioAsResource(filename);
        String mediaType = filename.toLowerCase().endsWith(".mp3") ? "audio/mpeg" : "audio/wav";
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(mediaType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .body(audioResource);
    }
}
