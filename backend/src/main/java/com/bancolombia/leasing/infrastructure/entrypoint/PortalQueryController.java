package com.bancolombia.leasing.infrastructure.entrypoint;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bancolombia.leasing.application.dto.ContractDto;
import com.bancolombia.leasing.application.dto.NotificationDto;
import com.bancolombia.leasing.application.dto.NotificationEmailPreferenceDto;
import com.bancolombia.leasing.application.dto.RequestSummaryDto;
import com.bancolombia.leasing.application.dto.UpdateNotificationEmailPreferenceCommand;
import com.bancolombia.leasing.application.usecase.NotificationCenterService;
import com.bancolombia.leasing.application.usecase.PortalQueryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/portal")
public class PortalQueryController {

    private final PortalQueryService portalQueryService;
    private final NotificationCenterService notificationCenterService;

    public PortalQueryController(
        PortalQueryService portalQueryService,
        NotificationCenterService notificationCenterService
    ) {
        this.portalQueryService = portalQueryService;
        this.notificationCenterService = notificationCenterService;
    }

    @GetMapping("/contracts")
    public List<ContractDto> contracts(@RequestParam(required = false) String customerId) {
        return portalQueryService.findContracts(customerId);
    }

    @GetMapping("/requests")
    public List<RequestSummaryDto> requests(@RequestParam(required = false) String customerId) {
        return portalQueryService.findRequests(customerId);
    }

    @GetMapping("/notifications")
    public List<NotificationDto> notifications(@RequestParam String customerId) {
        return notificationCenterService.findByCustomer(customerId);
    }

    @PatchMapping("/notifications/{notificationId}/open")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void openNotification(@PathVariable long notificationId, @RequestParam String customerId) {
        notificationCenterService.markAsRead(notificationId, customerId);
    }

    @DeleteMapping("/notifications/{notificationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotification(@PathVariable long notificationId, @RequestParam String customerId) {
        notificationCenterService.delete(notificationId, customerId);
    }

    @GetMapping("/notifications/email-preference")
    public NotificationEmailPreferenceDto notificationEmailPreference(@RequestParam String customerId) {
        return notificationCenterService.getEmailPreference(customerId);
    }

    @PatchMapping("/notifications/email-preference")
    public NotificationEmailPreferenceDto updateNotificationEmailPreference(@Valid @RequestBody UpdateNotificationEmailPreferenceCommand command) {
        return notificationCenterService.updateEmailPreference(command);
    }
}
