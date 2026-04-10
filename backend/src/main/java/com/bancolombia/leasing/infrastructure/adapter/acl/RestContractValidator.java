package com.bancolombia.leasing.infrastructure.adapter.acl;

import org.springframework.stereotype.Component;

import com.bancolombia.leasing.domain.port.IContractValidator;
import com.bancolombia.leasing.infrastructure.adapter.persistence.SpringDataContractRepository;

/*
 * This ACL adapter simulates contract validation against external LeasingOperation context.
 */
@Component
public class RestContractValidator implements IContractValidator {

    private final SpringDataContractRepository contractRepository;

    public RestContractValidator(SpringDataContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @Override
    public boolean validate(String operationNumber) {
        return contractRepository.existsByOperationNumber(operationNumber);
    }

    @Override
    public boolean isActive(String operationNumber) {
        return contractRepository.existsByOperationNumberAndStatusNot(operationNumber, "CLOSED");
    }
}
