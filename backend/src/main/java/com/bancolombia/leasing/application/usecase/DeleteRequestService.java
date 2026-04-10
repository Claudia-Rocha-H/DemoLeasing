package com.bancolombia.leasing.application.usecase;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.model.RequestStatus;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Service
public class DeleteRequestService {

    private final IRequestRepository requestRepository;

    public DeleteRequestService(IRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    public void handle(String requestId) {
        Request request = requestRepository.findById(requestId);
        if (!canDelete(request)) {
            throw new IllegalStateException("Request cannot be deleted after distribution");
        }
        requestRepository.deleteById(requestId);
    }

    private boolean canDelete(Request request) {
        if (request.getStatus() == RequestStatus.FILED) {
            return true;
        }
        return request.getStatus() == RequestStatus.IN_PROGRESS
            && (request.getOperativeId() == null || request.getOperativeId().isBlank());
    }
}
