package com.bancolombia.leasing.domain.model.event;

import java.time.LocalDateTime;

public record RequestFiled(String requestId, LocalDateTime occurredAt) implements DomainEvent {

    @Override
    public String eventName() {
        return "RequestFiled";
    }
}
