package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.AssignOperativeCommand;
import com.bancolombia.leasing.application.dto.ManagementUpdateType;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.RequestStatus;
import com.bancolombia.leasing.domain.model.event.StatusChanged;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class AssignOperativeService {

    private final IRequestRepository requestRepository;
    private final INotifier notifier;
    private final OperationalHistoryService operationalHistoryService;
    private final NotificationCenterService notificationCenterService;

    public AssignOperativeService(
        IRequestRepository requestRepository,
        INotifier notifier,
        OperationalHistoryService operationalHistoryService,
        NotificationCenterService notificationCenterService
    ) {
        this.requestRepository = requestRepository;
        this.notifier = notifier;
        this.operationalHistoryService = operationalHistoryService;
        this.notificationCenterService = notificationCenterService;
    }

    public RequestDto handle(AssignOperativeCommand command) {
        Request request = requestRepository.findById(command.requestId());
        if (request.getStatus() == RequestStatus.FILED) {
            throw new IllegalStateException("Request must be classified before distribution");
        }
        if (request.getOperativeId() != null && !request.getOperativeId().isBlank()) {
            throw new IllegalStateException("Request is already distributed to an operative member");
        }

        request.assign(command.operativeId());
        requestRepository.save(request);

        operationalHistoryService.append(
            request.getRequestId(),
            request.getStatus(),
            "operational-team",
            ManagementUpdateType.DISTRIBUTED,
            "Solicitud distribuida a " + command.operativeId()
        );

        notificationCenterService.registerOperationalUpdateNotification(
            request.getCustomerId(),
            request.getRequestId(),
            "Request distributed",
            "Your request " + request.getRequestId() + " was assigned to an operational analyst."
        );

        notifier.notify(new StatusChanged(request.getRequestId(), request.getStatus().name(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }
}
