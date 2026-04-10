package com.bancolombia.leasing.application.usecase;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.ContractDto;
import com.bancolombia.leasing.application.dto.ManagementUpdateDto;
import com.bancolombia.leasing.application.dto.ManagementUpdateType;
import com.bancolombia.leasing.application.dto.RequestSummaryDto;
import com.bancolombia.leasing.domain.model.RequestStatus;
import com.bancolombia.leasing.infrastructure.adapter.persistence.ContractJpaEntity;
import com.bancolombia.leasing.infrastructure.adapter.persistence.RequestJpaEntity;
import com.bancolombia.leasing.infrastructure.adapter.persistence.SpringDataContractRepository;
import com.bancolombia.leasing.infrastructure.adapter.persistence.SpringDataRequestRepository;

@Service
public class PortalQueryService {

    private final SpringDataContractRepository contractRepository;
    private final SpringDataRequestRepository requestRepository;
    private final JdbcTemplate jdbcTemplate;

    public PortalQueryService(
        SpringDataContractRepository contractRepository,
        SpringDataRequestRepository requestRepository,
        JdbcTemplate jdbcTemplate
    ) {
        this.contractRepository = contractRepository;
        this.requestRepository = requestRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ContractDto> findContracts(String customerId) {
        List<ContractJpaEntity> contracts = customerId == null || customerId.isBlank()
            ? contractRepository.findAll()
            : contractRepository.findByCustomerIdOrderByOperationNumberAsc(customerId);

        return contracts.stream()
            .map(item -> {
                Integer progress = item.getProgress();
                int safeProgress = progress != null ? progress : 0;
                return new ContractDto(
                    item.getContractId(),
                    item.getCustomerId(),
                    item.getOperationNumber(),
                    item.getAsset(),
                    item.getStatus(),
                    safeProgress,
                    item.getNextMilestone()
                );
            })
            .toList();
    }

    public List<RequestSummaryDto> findRequests(String customerId) {
        List<RequestJpaEntity> requests = requestRepository.findAllByOrderByFiledAtDesc();

        List<RequestJpaEntity> filtered = requests.stream()
            .filter(item -> customerId == null || customerId.isBlank() || customerId.equals(item.getCustomerId()))
            .toList();

        Map<String, String> contractByOperation = new HashMap<>();
        contractRepository.findAll().forEach(contract -> contractByOperation.put(contract.getOperationNumber(), contract.getContractId()));

        return filtered.stream()
            .map(item -> {
                List<ManagementUpdateDto> updates = loadManagementUpdates(item.getRequestId());
                return new RequestSummaryDto(
                    item.getRequestId(),
                    contractByOperation.get(item.getOperationNumber()),
                    item.getCustomerId(),
                    item.getOperationNumber(),
                    item.getType().name(),
                    titleByType(item.getType().name()),
                    toSummaryStatus(item.getStatus()),
                    toJourneyStage(item.getStatus(), item.getOperativeId(), updates),
                    toProgress(item.getStatus(), updates),
                    item.getFiledAt(),
                    item.getEstimatedResolutionDate(),
                    item.getResponseNote(),
                    updates
                );
            })
            .collect(Collectors.toList());
    }

    private List<ManagementUpdateDto> loadManagementUpdates(String requestId) {
        List<ManagementUpdateDto> updates = jdbcTemplate.query(
            """
            select old_status, new_status, changed_at, changed_by, coalesce(note, 'Estado actualizado') as note
            from leasing.request_status_history
            where request_id = ?
            order by changed_at asc, history_id asc
            limit 8
            """,
            (rs, rowNum) -> {
                String newStatus = rs.getString("new_status");
                String oldStatus = rs.getString("old_status");
                String note = rs.getString("note");
                OffsetDateTime changedAt = rs.getObject("changed_at", OffsetDateTime.class);
                String changedBy = rs.getString("changed_by");
                ManagementUpdateType fallbackType = mapUpdateType(oldStatus, newStatus, note);
                ManagementUpdateType type = ManagementNoteCodec.extractType(note, fallbackType);
                return new ManagementUpdateDto(
                    type,
                    titleByUpdateType(type),
                    ManagementNoteCodec.extractDetail(note),
                    changedAt,
                    changedBy == null || changedBy.isBlank() ? "system" : changedBy
                );
            },
            requestId
        );

        if (!updates.isEmpty()) {
            return updates;
        }

        return List.of(
            new ManagementUpdateDto(
                ManagementUpdateType.FILED,
                titleByUpdateType(ManagementUpdateType.FILED),
                "Solicitud recibida por el sistema",
                OffsetDateTime.now(),
                "system"
            )
        );
    }

    private ManagementUpdateType mapUpdateType(String oldStatus, String newStatus, String note) {
        if ("FILED".equals(newStatus)) {
            return ManagementUpdateType.FILED;
        }
        if ("IN_PROGRESS".equals(newStatus)) {
            return ManagementUpdateType.IN_PROGRESS;
        }
        if ("RESPONDED".equals(newStatus)) {
            return ManagementUpdateType.RESPONDED;
        }
        if ("REJECTED".equals(newStatus)) {
            return ManagementUpdateType.REJECTED;
        }
        if ("CLOSED".equals(newStatus)) {
            return ManagementUpdateType.CLOSED;
        }
        if (oldStatus == null && note != null && note.toLowerCase().contains("initial")) {
            return ManagementUpdateType.FILED;
        }
        return ManagementUpdateType.COMMENT;
    }

    private String titleByUpdateType(ManagementUpdateType type) {
        return switch (type) {
            case FILED -> "Radicada";
            case CLASSIFIED -> "Clasificada";
            case DISTRIBUTED -> "Distribuida";
            case IN_ANALYSIS -> "En análisis";
            case DOCUMENTS_REQUESTED -> "Documentos solicitados";
            case IN_PROGRESS -> "En gestión";
            case RESPONDED -> "Respondida";
            case REJECTED -> "Rechazada";
            case CLOSED -> "Cerrada";
            case COMMENT -> "Actualización";
        };
    }

    private String titleByType(String type) {
        return switch (type) {
            case "CERTIFICATE" -> "Certificado de estado";
            case "AUTHORIZATION" -> "Autorización contractual";
            case "PAYMENT_ISSUE" -> "Novedad de pago";
            case "CLAIM" -> "Siniestro";
            case "PREPAYMENTS" -> "Prepago";
            case "DOCUMENT_COPY" -> "Copia de contrato";
            default -> "Solicitud";
        };
    }

    private String toSummaryStatus(RequestStatus status) {
        if (status == RequestStatus.CLOSED || status == RequestStatus.RESPONDED) {
            return "CLOSED";
        }
        if (status == RequestStatus.REJECTED) {
            return "REJECTED";
        }
        return "IN_PROGRESS";
    }

    private String toJourneyStage(RequestStatus status, String operativeId, List<ManagementUpdateDto> updates) {
        if (status == RequestStatus.FILED) {
            return "FILED";
        }

        if (status == RequestStatus.RESPONDED || status == RequestStatus.CLOSED) {
            return "RESPONDED";
        }

        if (status == RequestStatus.REJECTED) {
            return "REJECTED";
        }

        ManagementUpdateType latestOperationalType = null;
        for (int index = updates.size() - 1; index >= 0; index--) {
            ManagementUpdateType candidate = updates.get(index).type();
            if (candidate == ManagementUpdateType.DISTRIBUTED
                || candidate == ManagementUpdateType.IN_ANALYSIS
                || candidate == ManagementUpdateType.DOCUMENTS_REQUESTED
                || candidate == ManagementUpdateType.CLASSIFIED) {
                latestOperationalType = candidate;
                break;
            }
        }

        if (latestOperationalType == ManagementUpdateType.IN_ANALYSIS
            || latestOperationalType == ManagementUpdateType.DOCUMENTS_REQUESTED) {
            return "IN_ANALYSIS";
        }

        if (latestOperationalType == ManagementUpdateType.DISTRIBUTED) {
            return "DISTRIBUTED";
        }

        if (operativeId != null && !operativeId.isBlank()) {
            return "DISTRIBUTED";
        }

        return "CLASSIFIED";
    }

    private int toProgress(RequestStatus status, List<ManagementUpdateDto> updates) {
        if (status == RequestStatus.FILED) {
            return 20;
        }
        if (status == RequestStatus.RESPONDED || status == RequestStatus.CLOSED) {
            return 100;
        }

        if (status == RequestStatus.REJECTED) {
            return 100;
        }

        String stage = toJourneyStage(status, null, updates);
        return switch (stage) {
            case "CLASSIFIED" -> 40;
            case "DISTRIBUTED" -> 60;
            case "IN_ANALYSIS" -> 80;
            default -> 70;
        };
    }
}
