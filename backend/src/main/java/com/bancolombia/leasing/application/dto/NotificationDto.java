package com.bancolombia.leasing.application.dto;

import java.time.OffsetDateTime;

public record NotificationDto(
    long notificationId,
    String customerId,
    String requestId,
    String title,
    String message,
    boolean read,
    OffsetDateTime createdAt
) {
}
