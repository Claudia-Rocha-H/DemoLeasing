package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignOperativeCommand(
    @NotBlank String requestId,
    @NotBlank String operativeId
) {
}
