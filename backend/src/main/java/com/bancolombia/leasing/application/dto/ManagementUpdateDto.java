package com.bancolombia.leasing.application.dto;

import java.time.OffsetDateTime;

public record ManagementUpdateDto(
    ManagementUpdateType type,
    String title,
    String detail,
    OffsetDateTime occurredAt,
    String actor
) {
}
