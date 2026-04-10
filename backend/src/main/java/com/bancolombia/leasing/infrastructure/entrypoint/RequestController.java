package com.bancolombia.leasing.infrastructure.entrypoint;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.bancolombia.leasing.application.dto.AssignOperativeCommand;
import com.bancolombia.leasing.application.dto.ClassifyRequestCommand;
import com.bancolombia.leasing.application.dto.CloseRequestCommand;
import com.bancolombia.leasing.application.dto.FileRequestCommand;
import com.bancolombia.leasing.application.dto.RegisterOperationalUpdateCommand;
import com.bancolombia.leasing.application.dto.RejectRequestCommand;
import com.bancolombia.leasing.application.dto.RequestDto;
import com.bancolombia.leasing.application.dto.RespondRequestCommand;
import com.bancolombia.leasing.application.usecase.AssignOperativeService;
import com.bancolombia.leasing.application.usecase.ClassifyRequestService;
import com.bancolombia.leasing.application.usecase.CloseRequestService;
import com.bancolombia.leasing.application.usecase.DeleteRequestService;
import com.bancolombia.leasing.application.usecase.FileRequestService;
import com.bancolombia.leasing.application.usecase.RegisterOperationalUpdateService;
import com.bancolombia.leasing.application.usecase.RejectRequestService;
import com.bancolombia.leasing.application.usecase.RespondRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final FileRequestService fileRequestService;
    private final AssignOperativeService assignOperativeService;
    private final ClassifyRequestService classifyRequestService;
    private final RegisterOperationalUpdateService registerOperationalUpdateService;
    private final RespondRequestService respondRequestService;
    private final RejectRequestService rejectRequestService;
    private final CloseRequestService closeRequestService;
    private final DeleteRequestService deleteRequestService;

    public RequestController(
        FileRequestService fileRequestService,
        AssignOperativeService assignOperativeService,
        ClassifyRequestService classifyRequestService,
        RegisterOperationalUpdateService registerOperationalUpdateService,
        RespondRequestService respondRequestService,
        RejectRequestService rejectRequestService,
        CloseRequestService closeRequestService,
        DeleteRequestService deleteRequestService
    ) {
        this.fileRequestService = fileRequestService;
        this.assignOperativeService = assignOperativeService;
        this.classifyRequestService = classifyRequestService;
        this.registerOperationalUpdateService = registerOperationalUpdateService;
        this.respondRequestService = respondRequestService;
        this.rejectRequestService = rejectRequestService;
        this.closeRequestService = closeRequestService;
        this.deleteRequestService = deleteRequestService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RequestDto fileRequest(@Valid @RequestBody FileRequestCommand command) {
        return fileRequestService.handle(command);
    }

    @PatchMapping("/assign")
    public RequestDto assign(@Valid @RequestBody AssignOperativeCommand command) {
        return assignOperativeService.handle(command);
    }

    @PatchMapping("/classify")
    public RequestDto classify(@Valid @RequestBody ClassifyRequestCommand command) {
        return classifyRequestService.handle(command);
    }

    @PatchMapping("/operational-update")
    public RequestDto registerOperationalUpdate(@Valid @RequestBody RegisterOperationalUpdateCommand command) {
        return registerOperationalUpdateService.handle(command);
    }

    @PatchMapping("/respond")
    public RequestDto respond(@Valid @RequestBody RespondRequestCommand command) {
        return respondRequestService.handle(command);
    }

    @PatchMapping("/reject")
    public RequestDto reject(@Valid @RequestBody RejectRequestCommand command) {
        return rejectRequestService.handle(command);
    }

    @PatchMapping("/close")
    public RequestDto close(@Valid @RequestBody CloseRequestCommand command) {
        return closeRequestService.handle(command);
    }

    @DeleteMapping("/{requestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String requestId) {
        deleteRequestService.handle(requestId);
    }
}
