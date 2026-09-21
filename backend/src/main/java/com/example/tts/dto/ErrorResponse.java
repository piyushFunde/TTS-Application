package com.example.tts.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
    boolean success,
    int status,
    String error,
    String message,
    Instant timestamp,
    Map<String, String> validationErrors
) {
    public ErrorResponse(int status, String error, String message, Map<String, String> validationErrors) {
        this(false, status, error, message, Instant.now(), validationErrors);
    }
}
