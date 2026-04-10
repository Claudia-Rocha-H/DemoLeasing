package com.bancolombia.leasing.application.usecase;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.NotificationDto;
import com.bancolombia.leasing.application.dto.NotificationEmailPreferenceDto;
import com.bancolombia.leasing.application.dto.UpdateNotificationEmailPreferenceCommand;
import com.bancolombia.leasing.infrastructure.adapter.EmailService;

@Service
public class NotificationCenterService {

    private final JdbcTemplate jdbcTemplate;
    private final EmailService emailService;
    private final ExecutorService executorService;

    public NotificationCenterService(JdbcTemplate jdbcTemplate, EmailService emailService) {
        this.jdbcTemplate = jdbcTemplate;
        this.emailService = emailService;
        this.executorService = Executors.newFixedThreadPool(2);
    }

    public void registerOperationalUpdateNotification(String customerId, String requestId, String title, String message) {
        /* Insert notification into database */
        Long notificationId = jdbcTemplate.queryForObject(
            """
            insert into leasing.customer_notification(customer_id, request_id, title, message, is_read)
            values (?, ?, ?, ?, false)
            returning notification_id
            """,
            Long.class,
            customerId,
            requestId,
            title,
            message
        );

        /* Send email asynchronously if enabled */
        executorService.execute(() -> tryToSendNotificationEmail(customerId, requestId, title, message, notificationId));
    }

    private void tryToSendNotificationEmail(String customerId, String requestId, String title, String message, Long notificationId) {
        try {
            Boolean emailEnabled = jdbcTemplate.query(
                "select email_enabled from leasing.customer_notification_preference where customer_id = ?",
                rs -> rs.next() ? rs.getBoolean("email_enabled") : false,
                customerId
            );

            if (!emailEnabled) {
                return;
            }

            String customerName = "Cliente Bancolombia";
            String customerEmail = "demo@leasing.local";
            String actionUrl = "http://localhost:5173";

            emailService.sendNotificationEmail(customerName, customerEmail, requestId, title, message, actionUrl);

            try {
                jdbcTemplate.update(
                    "update leasing.customer_notification set email_sent = true, email_sent_at = now() where notification_id = ?",
                    notificationId
                );
            } catch (DataAccessException ignored) {
                /* Backward compatibility with databases that do not yet have email_sent columns. */
            }
        } catch (RuntimeException e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }

    public List<NotificationDto> findByCustomer(String customerId) {
        return jdbcTemplate.query(
            """
            select notification_id, customer_id, request_id, title, message, is_read, created_at
            from leasing.customer_notification
            where customer_id = ?
            order by created_at desc, notification_id desc
            limit 50
            """,
            (rs, rowNum) -> new NotificationDto(
                rs.getLong("notification_id"),
                rs.getString("customer_id"),
                rs.getString("request_id"),
                rs.getString("title"),
                rs.getString("message"),
                rs.getBoolean("is_read"),
                rs.getObject("created_at", OffsetDateTime.class)
            ),
            customerId
        );
    }

    public void markAsRead(long notificationId, String customerId) {
        jdbcTemplate.update(
            """
            update leasing.customer_notification
            set is_read = true
            where notification_id = ? and customer_id = ?
            """,
            notificationId,
            customerId
        );
    }

    public void delete(long notificationId, String customerId) {
        jdbcTemplate.update(
            """
            delete from leasing.customer_notification
            where notification_id = ? and customer_id = ?
            """,
            notificationId,
            customerId
        );
    }

    public NotificationEmailPreferenceDto getEmailPreference(String customerId) {
        Boolean enabled = jdbcTemplate.query(
            """
            select email_enabled
            from leasing.customer_notification_preference
            where customer_id = ?
            """,
            rs -> rs.next() ? rs.getBoolean("email_enabled") : null,
            customerId
        );

        return new NotificationEmailPreferenceDto(customerId, enabled != null && enabled);
    }

    public NotificationEmailPreferenceDto updateEmailPreference(UpdateNotificationEmailPreferenceCommand command) {
        jdbcTemplate.update(
            """
            insert into leasing.customer_notification_preference(customer_id, email_enabled, updated_at)
            values (?, ?, now())
            on conflict (customer_id)
            do update set email_enabled = excluded.email_enabled, updated_at = now()
            """,
            command.customerId(),
            command.emailEnabled()
        );

        return new NotificationEmailPreferenceDto(command.customerId(), command.emailEnabled());
    }
}
