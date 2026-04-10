package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;

public record RespondRequestCommand(
    @NotBlank String requestId,
    @NotBlank String responseNote
) {
}
