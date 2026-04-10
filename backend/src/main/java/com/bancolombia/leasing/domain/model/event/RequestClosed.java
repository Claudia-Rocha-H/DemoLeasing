package com.bancolombia.leasing.domain.model.event;

import java.time.LocalDateTime;

public record RequestClosed(String requestId, LocalDateTime occurredAt) implements DomainEvent {

    @Override
    public String eventName() {
        return "RequestClosed";
    }
}
