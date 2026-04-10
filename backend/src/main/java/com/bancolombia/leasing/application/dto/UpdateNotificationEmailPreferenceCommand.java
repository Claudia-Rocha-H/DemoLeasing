package com.bancolombia.leasing.application.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateNotificationEmailPreferenceCommand(
    @NotBlank String customerId,
    boolean emailEnabled
) {
}
