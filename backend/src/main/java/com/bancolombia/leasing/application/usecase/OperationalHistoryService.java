package com.bancolombia.leasing.application.usecase;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.ManagementUpdateType;
import com.bancolombia.leasing.domain.model.RequestStatus;

@Service
public class OperationalHistoryService {

    private final JdbcTemplate jdbcTemplate;

    public OperationalHistoryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void append(String requestId, RequestStatus status, String changedBy, ManagementUpdateType type, String detail) {
        String actor = changedBy == null || changedBy.isBlank() ? "operational-team" : changedBy;
        String note = ManagementNoteCodec.tag(type, detail);

        jdbcTemplate.update(
            """
            insert into leasing.request_status_history(request_id, old_status, new_status, changed_by, note)
            values (?, cast(? as leasing.request_status), cast(? as leasing.request_status), ?, ?)
            """,
            requestId,
            status.name(),
            status.name(),
            actor,
            note
        );
    }
}
