package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectRequestCommand(
    @NotBlank String requestId,
    @NotBlank String reason,
    String operatorName
) {
}
