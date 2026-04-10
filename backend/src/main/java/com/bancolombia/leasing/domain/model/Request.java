package com.bancolombia.leasing.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class Request {

    private final String requestId;
    private final String customerId;
    private final String operationNumber;
    private final RequestType type;
    private final String description;
    private RequestStatus status;
    private final LocalDateTime filedAt;
    private final LocalDateTime estimatedResolutionDate;
    private String operativeId;
    private String responseNote;

    private Request(
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
        this.requestId = requestId;
        this.customerId = customerId;
        this.operationNumber = operationNumber;
        this.type = type;
        this.description = description;
        this.status = status;
        this.filedAt = filedAt;
        this.estimatedResolutionDate = estimatedResolutionDate;
        this.operativeId = operativeId;
        this.responseNote = responseNote;
    }

    public static Request create(
        String requestId,
        String customerId,
        String operationNumber,
        RequestType type,
        String description,
        LocalDateTime estimatedResolutionDate
    ) {
        validateRequired(requestId, "requestId");
        validateRequired(customerId, "customerId");
        validateRequired(operationNumber, "operationNumber");
        validateRequired(description, "description");
        Objects.requireNonNull(type, "type is required");
        Objects.requireNonNull(estimatedResolutionDate, "estimatedResolutionDate is required");

        Request request = new Request(
            requestId.trim(),
            customerId.trim(),
            operationNumber.trim(),
            type,
            description.trim(),
            RequestStatus.FILED,
            LocalDateTime.now(),
            estimatedResolutionDate,
            null,
            null
        );
        request.file();
        return request;
    }

    public static Request rehydrate(
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
        validateRequired(requestId, "requestId");
        validateRequired(customerId, "customerId");
        validateRequired(operationNumber, "operationNumber");
        validateRequired(description, "description");
        Objects.requireNonNull(type, "type is required");
        Objects.requireNonNull(status, "status is required");
        Objects.requireNonNull(filedAt, "filedAt is required");
        Objects.requireNonNull(estimatedResolutionDate, "estimatedResolutionDate is required");

        return new Request(
            requestId.trim(),
            customerId.trim(),
            operationNumber.trim(),
            type,
            description.trim(),
            status,
            filedAt,
            estimatedResolutionDate,
            operativeId,
            responseNote
        );
    }

    public void file() {
        this.status = RequestStatus.FILED;
    }

    public void classify(String classificationNote) {
        if (this.status != RequestStatus.FILED) {
            throw new IllegalStateException("Request can only be classified when filed");
        }
        this.status = RequestStatus.IN_PROGRESS;
        this.responseNote = classificationNote == null || classificationNote.isBlank()
            ? "Solicitud clasificada"
            : classificationNote.trim();
    }

    public void assign(String operativeId) {
        validateRequired(operativeId, "operativeId");
        this.operativeId = operativeId.trim();
        this.status = RequestStatus.IN_PROGRESS;
    }

    public void respond(String responseNote) {
        validateRequired(responseNote, "responseNote");
        this.responseNote = responseNote.trim();
        this.status = RequestStatus.RESPONDED;
    }

    public void reject(String rejectionReason) {
        validateRequired(rejectionReason, "rejectionReason");
        this.responseNote = rejectionReason.trim();
        this.status = RequestStatus.REJECTED;
    }

    public void close() {
        this.status = RequestStatus.CLOSED;
    }

    private static void validateRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    public String getId() {
        return requestId;
    }

    public String getRequestId() {
        return requestId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getOperationNumber() {
        return operationNumber;
    }

    public RequestType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public LocalDateTime getFiledAt() {
        return filedAt;
    }

    public LocalDateTime getEstimatedResolutionDate() {
        return estimatedResolutionDate;
    }

    public String getOperativeId() {
        return operativeId;
    }

    public String getResponseNote() {
        return responseNote;
    }
}
