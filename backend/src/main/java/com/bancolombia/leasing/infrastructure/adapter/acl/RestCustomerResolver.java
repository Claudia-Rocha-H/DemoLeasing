package com.bancolombia.leasing.infrastructure.adapter.acl;

import org.springframework.stereotype.Component;

import com.bancolombia.leasing.domain.port.ICustomerResolver;
import com.bancolombia.leasing.infrastructure.adapter.persistence.SpringDataContractRepository;

/*
 * This ACL adapter simulates customer identity checks against external CustomerIdentity context.
 */
@Component
public class RestCustomerResolver implements ICustomerResolver {

    private final SpringDataContractRepository contractRepository;

    public RestCustomerResolver(SpringDataContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @Override
    public String resolve(String customerId) {
        return customerId;
    }

    @Override
    public boolean authenticate(String customerId, String operationNumber) {
        return contractRepository.existsByCustomerIdAndOperationNumber(customerId, operationNumber);
    }
}
