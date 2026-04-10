package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.ManagementUpdateType;
import com.bancolombia.leasing.application.dto.OperationalAction;
import com.bancolombia.leasing.application.dto.RegisterOperationalUpdateCommand;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.event.StatusChanged;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class RegisterOperationalUpdateService {

    private final IRequestRepository requestRepository;
    private final OperationalHistoryService operationalHistoryService;
    private final INotifier notifier;
    private final NotificationCenterService notificationCenterService;

    public RegisterOperationalUpdateService(
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

    public RequestDto handle(RegisterOperationalUpdateCommand command) {
        Request request = requestRepository.findById(command.requestId());
        ManagementUpdateType updateType = toUpdateType(command.action());

        operationalHistoryService.append(
            request.getRequestId(),
            request.getStatus(),
            command.operatorName(),
            updateType,
            command.detail()
        );

        notificationCenterService.registerOperationalUpdateNotification(
            request.getCustomerId(),
            request.getRequestId(),
            titleForAction(command.action()),
            messageForAction(request.getRequestId(), command.action(), command.detail())
        );

        notifier.notify(new StatusChanged(request.getRequestId(), request.getStatus().name(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }

    private ManagementUpdateType toUpdateType(OperationalAction action) {
        return switch (action) {
            case START_ANALYSIS -> ManagementUpdateType.IN_ANALYSIS;
            case REQUEST_DOCUMENTS -> ManagementUpdateType.DOCUMENTS_REQUESTED;
            case ADD_NOTE -> ManagementUpdateType.COMMENT;
        };
    }

    private String titleForAction(OperationalAction action) {
        return switch (action) {
            case START_ANALYSIS -> "Request in analysis";
            case REQUEST_DOCUMENTS -> "Additional documents requested";
            case ADD_NOTE -> "Request updated";
        };
    }

    private String messageForAction(String requestId, OperationalAction action, String detail) {
        return switch (action) {
            case START_ANALYSIS -> "Your request " + requestId + " is now under analysis by the operational team.";
            case REQUEST_DOCUMENTS -> "Your request " + requestId + " requires additional documents.";
            case ADD_NOTE -> "Your request " + requestId + " has a new update: " + detail;
        };
    }
}
