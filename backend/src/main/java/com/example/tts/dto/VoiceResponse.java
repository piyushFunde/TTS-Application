package com.example.tts.dto;

public record VoiceResponse(
    String id,
    String name,
    String language,
    String languageCode,
    String gender,
    String style,
    String sampleText
) {}
