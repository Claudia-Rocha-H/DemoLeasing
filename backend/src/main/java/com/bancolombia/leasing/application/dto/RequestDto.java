package com.bancolombia.leasing.application.dto;

import java.time.LocalDateTime;

import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.RequestStatus;
import com.bancolombia.leasing.domain.model.RequestType;

public record RequestDto(
    String requestId,
    String customerId,
    String operationNumber,
    RequestType type,
    String description,
    RequestStatus status,
    LocalDateTime filedAt,
    LocalDateTime estimatedResolutionDate,
    String operativeId,
    String responseNote
) {
    public static RequestDto from(Request request) {
        return new RequestDto(
            request.getRequestId(),
            request.getCustomerId(),
            request.getOperationNumber(),
            request.getType(),
            request.getDescription(),
            request.getStatus(),
            request.getFiledAt(),
            request.getEstimatedResolutionDate(),
            request.getOperativeId(),
            request.getResponseNote()
        );
    }
}
