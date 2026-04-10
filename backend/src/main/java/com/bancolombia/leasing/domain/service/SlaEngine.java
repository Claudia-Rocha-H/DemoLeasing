package com.bancolombia.leasing.domain.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.bancolombia.leasing.domain.model.RequestStatus;
import com.bancolombia.leasing.domain.model.RequestType;

/*
 * SlaEngine centralizes granular SLA segments by request type and lifecycle status
 * to produce a single estimated resolution date for newly filed requests.
 */
@Component
public class SlaEngine {

    private final Map<RequestType, Map<RequestStatus, Duration>> slaMatrix;

    public SlaEngine() {
        this.slaMatrix = buildSlaMatrix();
    }

    public LocalDateTime calculateEstimatedResolutionDate(RequestType type, LocalDateTime from) {
        Map<RequestStatus, Duration> statusSla = slaMatrix.get(type);
        if (statusSla == null) {
            throw new IllegalArgumentException("SLA is not configured for type " + type);
        }

        Duration total = statusSla.values()
            .stream()
            .reduce(Duration.ZERO, Duration::plus);

        return from.plus(total);
    }

    private Map<RequestType, Map<RequestStatus, Duration>> buildSlaMatrix() {
        Map<RequestType, Map<RequestStatus, Duration>> matrix = new EnumMap<>(RequestType.class);

        matrix.put(RequestType.CERTIFICATE, statusMap(4, 24, 4, 2));
        matrix.put(RequestType.AUTHORIZATION, statusMap(6, 28, 6, 2));
        matrix.put(RequestType.PAYMENT_ISSUE, statusMap(8, 36, 8, 2));
        matrix.put(RequestType.CLAIM, statusMap(10, 48, 10, 2));
        matrix.put(RequestType.PREPAYMENTS, statusMap(6, 30, 6, 2));
        matrix.put(RequestType.DOCUMENT_COPY, statusMap(4, 18, 4, 2));

        return matrix;
    }

    private Map<RequestStatus, Duration> statusMap(int filedHours, int inProgressHours, int respondedHours, int closedHours) {
        Map<RequestStatus, Duration> map = new EnumMap<>(RequestStatus.class);
        map.put(RequestStatus.FILED, Duration.ofHours(filedHours));
        map.put(RequestStatus.IN_PROGRESS, Duration.ofHours(inProgressHours));
        map.put(RequestStatus.RESPONDED, Duration.ofHours(respondedHours));
        map.put(RequestStatus.CLOSED, Duration.ofHours(closedHours));
        return map;
    }
}
