package com.example.tts.dto;

public record TtsResponse(
    boolean success,
    String audioUrl,
    String filename,
    double durationSeconds,
    int characterCount,
    int wordCount,
    String voice,
    String language
) {}
