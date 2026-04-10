package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.CloseRequestCommand;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.event.RequestClosed;
import com.bancolombia.leasing.domain.model.event.StatusChanged;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class CloseRequestService {

    private final IRequestRepository requestRepository;
    private final INotifier notifier;
    private final NotificationCenterService notificationCenterService;

    public CloseRequestService(
        IRequestRepository requestRepository,
        INotifier notifier,
        NotificationCenterService notificationCenterService
    ) {
        this.requestRepository = requestRepository;
        this.notifier = notifier;
        this.notificationCenterService = notificationCenterService;
    }

    public RequestDto handle(CloseRequestCommand command) {
        Request request = requestRepository.findById(command.requestId());
        request.close();
        requestRepository.save(request);

        notificationCenterService.registerOperationalUpdateNotification(
            request.getCustomerId(),
            request.getRequestId(),
            "Request closed",
            "Your request " + request.getRequestId() + " was closed by the operational team."
        );

        notifier.notify(new StatusChanged(request.getRequestId(), request.getStatus().name(), LocalDateTime.now()));
        notifier.notify(new RequestClosed(request.getRequestId(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }
}
