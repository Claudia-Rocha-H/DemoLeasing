package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.application.dto.RespondRequestCommand;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.event.StatusChanged;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class RespondRequestService {

    private final IRequestRepository requestRepository;
    private final INotifier notifier;
    private final NotificationCenterService notificationCenterService;

    public RespondRequestService(
        IRequestRepository requestRepository,
        INotifier notifier,
        NotificationCenterService notificationCenterService
    ) {
        this.requestRepository = requestRepository;
        this.notifier = notifier;
        this.notificationCenterService = notificationCenterService;
    }

    public RequestDto handle(RespondRequestCommand command) {
        Request request = requestRepository.findById(command.requestId());
        request.respond(command.responseNote());
        requestRepository.save(request);

        notificationCenterService.registerOperationalUpdateNotification(
            request.getCustomerId(),
            request.getRequestId(),
            "Request responded",
            "Your request " + request.getRequestId() + " now has an official response."
        );

        notifier.notify(new StatusChanged(request.getRequestId(), request.getStatus().name(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }
}
