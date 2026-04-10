package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;

public record ClassifyRequestCommand(
    @NotBlank String requestId,
    String note
) {
}
