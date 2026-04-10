package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.FileRequestCommand;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.event.RequestFiled;
import com.bancolombia.leasing.domain.port.IContractValidator;
import com.bancolombia.leasing.domain.port.ICustomerResolver;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;
import com.bancolombia.leasing.domain.service.SlaEngine;

@Service
public class FileRequestService {

    private final IRequestRepository requestRepository;
    private final IContractValidator contractValidator;
    private final ICustomerResolver customerResolver;
    private final SlaEngine slaEngine;
    private final INotifier notifier;

    public FileRequestService(
        IRequestRepository requestRepository,
        IContractValidator contractValidator,
        ICustomerResolver customerResolver,
        SlaEngine slaEngine,
        INotifier notifier
    ) {
        this.requestRepository = requestRepository;
        this.contractValidator = contractValidator;
        this.customerResolver = customerResolver;
        this.slaEngine = slaEngine;
        this.notifier = notifier;
    }

    public RequestDto handle(FileRequestCommand command) {
        validate(command.operationNumber(), command.customerId());
        String requestId = requestRepository.nextRequestId();

        LocalDateTime estimatedResolutionDate = slaEngine.calculateEstimatedResolutionDate(
            command.type(),
            LocalDateTime.now()
        );

        Request request = Request.create(
            requestId,
            command.customerId(),
            command.operationNumber(),
            command.type(),
            command.description(),
            estimatedResolutionDate
        );

        requestRepository.save(request);
        notifier.notify(new RequestFiled(request.getRequestId(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }

    private void validate(String operationNumber, String customerId) {
        if (!contractValidator.validate(operationNumber) || !contractValidator.isActive(operationNumber)) {
            throw new IllegalArgumentException("Contract is invalid or inactive for operationNumber");
        }
        if (!customerResolver.authenticate(customerId, operationNumber)) {
            throw new IllegalArgumentException("Customer is not authenticated");
        }
        customerResolver.resolve(customerId);
    }
}
