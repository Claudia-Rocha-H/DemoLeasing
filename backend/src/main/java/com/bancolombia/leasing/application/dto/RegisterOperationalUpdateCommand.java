package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterOperationalUpdateCommand(
    @NotBlank String requestId,
    @NotBlank String operatorName,
    @NotNull OperationalAction action,
    @NotBlank String detail
) {
}
