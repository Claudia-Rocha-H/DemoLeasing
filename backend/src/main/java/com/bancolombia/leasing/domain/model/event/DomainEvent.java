package com.bancolombia.leasing.domain.model.event;

import java.time.LocalDateTime;

public interface DomainEvent {
    String eventName();

    LocalDateTime occurredAt();
}
