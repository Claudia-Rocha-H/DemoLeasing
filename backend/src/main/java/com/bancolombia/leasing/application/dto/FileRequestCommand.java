package com.bancolombia.leasing.application.dto;

import com.bancolombia.leasing.domain.model.RequestType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FileRequestCommand(
    @NotBlank String customerId,
    @NotBlank String operationNumber,
    @NotNull RequestType type,
    @NotBlank String description
) {
}
