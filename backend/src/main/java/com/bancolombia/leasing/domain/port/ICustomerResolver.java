package com.bancolombia.leasing.domain.port;

public interface ICustomerResolver {
    String resolve(String customerId);

    boolean authenticate(String customerId, String operationNumber);
}
