package com.bancolombia.leasing.application.usecase;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.after;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;

import com.bancolombia.leasing.application.dto.NotificationDto;
import com.bancolombia.leasing.application.dto.UpdateNotificationEmailPreferenceCommand;
import com.bancolombia.leasing.infrastructure.adapter.EmailService;

@ExtendWith(MockitoExtension.class)
class NotificationCenterServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private EmailService emailService;

    private NotificationCenterService service() {
        return new NotificationCenterService(jdbcTemplate, emailService);
    }

    @Test
    void getEmailPrefEnabled() {
        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<ResultSetExtractor<Boolean>>any(),
            eq("CUS-001")
        )).thenReturn(Boolean.TRUE);

        var response = service().getEmailPreference("CUS-001");

        assertEquals("CUS-001", response.customerId());
        assertTrue(response.emailEnabled());
    }

    @Test
    void getEmailPrefDisabled() {
        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<ResultSetExtractor<Boolean>>any(),
            eq("CUS-001")
        )).thenReturn(null);

        var response = service().getEmailPreference("CUS-001");

        assertEquals("CUS-001", response.customerId());
        assertFalse(response.emailEnabled());
    }

    @Test
    void updateEmailPref() {
        var command = new UpdateNotificationEmailPreferenceCommand("CUS-001", true);

        service().updateEmailPreference(command);

        verify(jdbcTemplate).update(anyString(), eq("CUS-001"), eq(true));
    }

    @Test
    void markAsRead() {
        service().markAsRead(11L, "CUS-001");

        verify(jdbcTemplate).update(anyString(), eq(11L), eq("CUS-001"));
    }

    @Test
    void deleteById() {
        service().delete(25L, "CUS-001");

        verify(jdbcTemplate).update(anyString(), eq(25L), eq("CUS-001"));
    }

    @Test
    void findByCustomer() {
        var expected = List.of(
            new NotificationDto(
                100L,
                "CUS-001",
                "REQ-1001",
                "Solicitud actualizada",
                "Tu solicitud cambió de estado",
                false,
                OffsetDateTime.now()
            )
        );

        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<RowMapper<NotificationDto>>any(),
            eq("CUS-001")
        )).thenReturn(expected);

        var result = service().findByCustomer("CUS-001");

        assertEquals(1, result.size());
        assertEquals(100L, result.getFirst().notificationId());
        assertEquals("REQ-1001", result.getFirst().requestId());
    }

    @Test
    void registerAndSendEmail() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), eq("CUS-001"), eq("REQ-1001"), eq("Cambio de estado"), eq("Tu solicitud fue actualizada")))
            .thenReturn(88L);
        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<ResultSetExtractor<Boolean>>any(),
            eq("CUS-001")
        )).thenReturn(Boolean.TRUE);

        service().registerOperationalUpdateNotification("CUS-001", "REQ-1001", "Cambio de estado", "Tu solicitud fue actualizada");

        verify(emailService, timeout(1000)).sendNotificationEmail(
            eq("Cliente Bancolombia"),
            eq("demo@leasing.local"),
            eq("REQ-1001"),
            eq("Cambio de estado"),
            eq("Tu solicitud fue actualizada"),
            eq("http://localhost:5173")
        );
    }

    @Test
    void noSendWhenEmailOff() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), eq("CUS-001"), eq("REQ-1001"), eq("Cambio de estado"), eq("Tu solicitud fue actualizada")))
            .thenReturn(89L);
        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<ResultSetExtractor<Boolean>>any(),
            eq("CUS-001")
        )).thenReturn(Boolean.FALSE);

        service().registerOperationalUpdateNotification("CUS-001", "REQ-1001", "Cambio de estado", "Tu solicitud fue actualizada");

        verify(emailService, after(400).never()).sendNotificationEmail(anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void failOnInsertError() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), eq("CUS-001"), eq("REQ-1001"), eq("Cambio de estado"), eq("Tu solicitud fue actualizada")))
            .thenThrow(new RuntimeException("insert failed"));

        var ex = assertThrows(
            RuntimeException.class,
            () -> service().registerOperationalUpdateNotification("CUS-001", "REQ-1001", "Cambio de estado", "Tu solicitud fue actualizada")
        );
        assertNotNull(ex);
    }

    @Test
    void failOnFindError() {
        when(jdbcTemplate.query(anyString(), ArgumentMatchers.<RowMapper<NotificationDto>>any(), eq("CUS-001")))
            .thenThrow(new RuntimeException("query failed"));

        var ex = assertThrows(RuntimeException.class, () -> service().findByCustomer("CUS-001"));
        assertNotNull(ex);
    }

    @Test
    void failOnMarkError() {
        when(jdbcTemplate.update(anyString(), eq(11L), eq("CUS-001")))
            .thenThrow(new RuntimeException("update failed"));

        var ex = assertThrows(RuntimeException.class, () -> service().markAsRead(11L, "CUS-001"));
        assertNotNull(ex);
    }

    @Test
    void failOnDeleteError() {
        when(jdbcTemplate.update(anyString(), eq(25L), eq("CUS-001")))
            .thenThrow(new RuntimeException("delete failed"));

        var ex = assertThrows(RuntimeException.class, () -> service().delete(25L, "CUS-001"));
        assertNotNull(ex);
    }

    @Test
    void failOnPrefReadError() {
        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<ResultSetExtractor<Boolean>>any(),
            eq("CUS-001")
        )).thenThrow(new RuntimeException("query failed"));

        var ex = assertThrows(RuntimeException.class, () -> service().getEmailPreference("CUS-001"));
        assertNotNull(ex);
    }

    @Test
    void failOnPrefUpdateError() {
        when(jdbcTemplate.update(anyString(), eq("CUS-001"), eq(true)))
            .thenThrow(new RuntimeException("upsert failed"));

        var ex = assertThrows(
            RuntimeException.class,
            () -> service().updateEmailPreference(new UpdateNotificationEmailPreferenceCommand("CUS-001", true))
        );
        assertNotNull(ex);
    }

    @Test
    void keepFlowWhenEmailFails() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Long.class), eq("CUS-001"), eq("REQ-1001"), eq("Cambio de estado"), eq("Tu solicitud fue actualizada")))
            .thenReturn(90L);
        when(jdbcTemplate.query(
            anyString(),
            ArgumentMatchers.<ResultSetExtractor<Boolean>>any(),
            eq("CUS-001")
        )).thenReturn(Boolean.TRUE);

        org.mockito.Mockito.doThrow(new RuntimeException("smtp down"))
            .when(emailService)
            .sendNotificationEmail(anyString(), anyString(), anyString(), anyString(), anyString(), anyString());

        service().registerOperationalUpdateNotification("CUS-001", "REQ-1001", "Cambio de estado", "Tu solicitud fue actualizada");

        verify(emailService, timeout(1000)).sendNotificationEmail(
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString()
        );
    }
}
