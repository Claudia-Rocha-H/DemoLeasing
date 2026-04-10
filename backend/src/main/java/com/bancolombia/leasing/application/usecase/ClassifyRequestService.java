package com.bancolombia.leasing.application.usecase;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.ClassifyRequestCommand;
import com.bancolombia.leasing.application.dto.ManagementUpdateType;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.event.StatusChanged;
import com.bancolombia.leasing.domain.port.INotifier;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class ClassifyRequestService {

    private final IRequestRepository requestRepository;
    private final INotifier notifier;
    private final NotificationCenterService notificationCenterService;

    public ClassifyRequestService(
        IRequestRepository requestRepository,
        INotifier notifier,
        NotificationCenterService notificationCenterService
    ) {
        this.requestRepository = requestRepository;
        this.notifier = notifier;
        this.notificationCenterService = notificationCenterService;
    }

    public RequestDto handle(ClassifyRequestCommand command) {
        Request request = requestRepository.findById(command.requestId());
        String note = ManagementNoteCodec.tag(
            ManagementUpdateType.CLASSIFIED,
            command.note() == null || command.note().isBlank() ? "Solicitud clasificada por el equipo operativo" : command.note()
        );

        request.classify(note);
        requestRepository.save(request);

        notificationCenterService.registerOperationalUpdateNotification(
            request.getCustomerId(),
            request.getRequestId(),
            "Request classified",
            "Your request " + request.getRequestId() + " was classified by the operational team."
        );

        notifier.notify(new StatusChanged(request.getRequestId(), request.getStatus().name(), LocalDateTime.now()));
        notifier.notifyCustomer(request.getCustomerId());

        return RequestDto.from(request);
    }
}
