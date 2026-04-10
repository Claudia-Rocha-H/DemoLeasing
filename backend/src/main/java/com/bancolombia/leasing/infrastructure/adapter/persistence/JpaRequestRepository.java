package com.bancolombia.leasing.infrastructure.adapter.persistence;

import org.springframework.stereotype.Repository;

import com.bancolombia.leasing.domain.model.Request;
import com.bancolombia.leasing.domain.port.IRequestRepository;

@Repository
public class JpaRequestRepository implements IRequestRepository {

    private final SpringDataRequestRepository repository;

    public JpaRequestRepository(SpringDataRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    public String nextRequestId() {
        Integer maxNumericId = repository.findMaxRequestNumericId();
        int next = (maxNumericId == null ? 0 : maxNumericId) + 1;
        return "REQ-" + String.format("%04d", next);
    }

    @Override
    public void save(Request request) {
        RequestJpaEntity entity = new RequestJpaEntity();
        entity.setRequestId(request.getRequestId());
        entity.setCustomerId(request.getCustomerId());
        entity.setOperationNumber(request.getOperationNumber());
        entity.setType(request.getType());
        entity.setDescription(request.getDescription());
        entity.setStatus(request.getStatus());
        entity.setFiledAt(request.getFiledAt());
        entity.setEstimatedResolutionDate(request.getEstimatedResolutionDate());
        entity.setOperativeId(request.getOperativeId());
        entity.setResponseNote(request.getResponseNote());

        repository.save(entity);
    }

    @Override
    public Request findById(String requestId) {
        RequestJpaEntity saved = repository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        return Request.rehydrate(
            saved.getRequestId(),
            saved.getCustomerId(),
            saved.getOperationNumber(),
            saved.getType(),
            saved.getDescription(),
            saved.getStatus(),
            saved.getFiledAt(),
            saved.getEstimatedResolutionDate(),
            saved.getOperativeId(),
            saved.getResponseNote()
        );
    }

    @Override
    public void deleteById(String requestId) {
        if (!repository.existsById(requestId)) {
            throw new IllegalArgumentException("Request not found");
        }
        repository.deleteById(requestId);
    }
}
