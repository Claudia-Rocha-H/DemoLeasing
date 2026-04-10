package com.bancolombia.leasing.application.dto;

public record ContractDto(
    String contractId,
    String customerId,
    String operationNumber,
    String asset,
    String status,
    int progress,
    String nextMilestone
) {
}
