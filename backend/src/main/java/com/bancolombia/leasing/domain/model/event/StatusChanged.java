package com.bancolombia.leasing.domain.model.event;

import java.time.LocalDateTime;

public record StatusChanged(String requestId, String status, LocalDateTime occurredAt) implements DomainEvent {

    @Override
    public String eventName() {
        return "StatusChanged";
    }
}
