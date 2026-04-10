package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;

public record CloseRequestCommand(
    @NotBlank String requestId
) {
}
