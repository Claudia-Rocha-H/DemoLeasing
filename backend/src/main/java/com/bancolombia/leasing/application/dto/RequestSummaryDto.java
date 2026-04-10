package com.bancolombia.leasing.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RequestSummaryDto(
    String requestId,
    String contractId,
    String customerId,
    String operationNumber,
    String type,
    String title,
    String status,
    String journeyStage,
    int progress,
    LocalDateTime filedAt,
    LocalDateTime estimatedResolutionDate,
    String responseNote,
    List<ManagementUpdateDto> managementUpdates
) {
}
