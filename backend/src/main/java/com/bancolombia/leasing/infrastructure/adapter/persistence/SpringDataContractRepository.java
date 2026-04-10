package com.bancolombia.leasing.infrastructure.adapter.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataContractRepository extends JpaRepository<ContractJpaEntity, String> {
    List<ContractJpaEntity> findByCustomerIdOrderByOperationNumberAsc(String customerId);

    boolean existsByOperationNumber(String operationNumber);

    boolean existsByOperationNumberAndStatusNot(String operationNumber, String status);

    boolean existsByCustomerId(String customerId);

    boolean existsByCustomerIdAndOperationNumber(String customerId, String operationNumber);
}
