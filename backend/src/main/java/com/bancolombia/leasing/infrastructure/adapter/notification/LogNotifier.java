package com.bancolombia.leasing.infrastructure.adapter.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.bancolombia.leasing.domain.model.event.DomainEvent;
import com.bancolombia.leasing.domain.port.INotifier;

@Component
public class LogNotifier implements INotifier {

    private static final Logger LOGGER = LoggerFactory.getLogger(LogNotifier.class);

    @Override
    public void notify(DomainEvent event) {
        LOGGER.info(
            "Domain event sent name={}, occurredAt={} ",
            event.eventName(),
            event.occurredAt()
        );
    }

    @Override
    public void notifyCustomer(String customerId) {
        LOGGER.info("Customer notified customerId={}", customerId);
    }
}
