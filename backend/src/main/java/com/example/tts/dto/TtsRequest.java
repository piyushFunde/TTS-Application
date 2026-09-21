package com.example.tts.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TtsRequest(
    @NotBlank(message = "Text cannot be empty or blank")
    @Size(max = 5000, message = "Text exceeds maximum limit of 5000 characters")
    String text,

    @NotBlank(message = "Language selection is required")
    String language,

    @NotBlank(message = "Voice selection is required")
    String voice,

    @DecimalMin(value = "0.5", message = "Speed must be at least 0.5")
    @DecimalMax(value = "2.0", message = "Speed cannot exceed 2.0")
    Double speed,

    @DecimalMin(value = "0.5", message = "Pitch must be at least 0.5")
    @DecimalMax(value = "1.5", message = "Pitch cannot exceed 1.5")
    Double pitch,

    String format
) {
    public TtsRequest {
        if (speed == null) speed = 1.0;
        if (pitch == null) pitch = 1.0;
        if (format == null || format.isBlank()) format = "wav";
    }
}
