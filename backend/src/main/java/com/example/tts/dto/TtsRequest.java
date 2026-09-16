package com.example.tts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TtsRequest(
    @NotBlank @Size(max = 5000) String text,
    @NotBlank String language,
    @NotBlank String voice
) {}
