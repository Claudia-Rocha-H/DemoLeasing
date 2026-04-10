package com.bancolombia.leasing.application.dto;

public record NotificationEmailPreferenceDto(
    String customerId,
    boolean emailEnabled
) {
}
