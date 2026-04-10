package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.ManagementUpdateType;
import com.bancolombia.leasing.application.dto.RejectRequestCommand;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.event.StatusChanged;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class RejectRequestService {

    private final IRequestRepository requestRepository;
    private final OperationalHistoryService operationalHistoryService;
    private final INotifier notifier;
    private final NotificationCenterService notificationCenterService;

    public RejectRequestService(
        IRequestRepository requestRepository,
        OperationalHistoryService operationalHistoryService,
        INotifier notifier,
        NotificationCenterService notificationCenterService
    ) {
        this.requestRepository = requestRepository;
        this.operationalHistoryService = operationalHistoryService;
        this.notifier = notifier;
        this.notificationCenterService = notificationCenterService;
    }

    public RequestDto handle(RejectRequestCommand command) {
        Request request = requestRepository.findById(command.requestId());
        request.reject(command.reason());
        requestRepository.save(request);

        operationalHistoryService.append(
            request.getRequestId(),
            request.getStatus(),
            command.operatorName(),
            ManagementUpdateType.REJECTED,
            command.reason()
        );

        notificationCenterService.registerOperationalUpdateNotification(
            request.getCustomerId(),
            request.getRequestId(),
            "Request rejected",
            "Your request " + request.getRequestId() + " was rejected. Reason: " + command.reason()
        );

        notifier.notify(new StatusChanged(request.getRequestId(), request.getStatus().name(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }
}
