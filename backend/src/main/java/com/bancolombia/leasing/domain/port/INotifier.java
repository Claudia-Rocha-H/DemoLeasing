package com.bancolombia.leasing.domain.port;

import com.bancolombia.leasing.domain.model.event.DomainEvent;

public interface INotifier {
    void notify(DomainEvent event);

    void notifyCustomer(String customerId);
}
