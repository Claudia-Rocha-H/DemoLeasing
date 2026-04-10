package com.bancolombia.leasing.domain.port;

public interface IContractValidator {
    boolean validate(String operationNumber);

    boolean isActive(String operationNumber);
}
