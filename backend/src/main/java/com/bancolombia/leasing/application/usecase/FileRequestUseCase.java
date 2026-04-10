package com.bancolombia.leasing.application.usecase;

import org.springframework.stereotype.Service;

import com.bancolombia.leasing.application.dto.FileRequestCommand;
import com.bancolombia.leasing.application.dto.RequestDto;

@Service
public class FileRequestUseCase {

    private final FileRequestService fileRequestService;

    public FileRequestUseCase(FileRequestService fileRequestService) {
        this.fileRequestService = fileRequestService;
    }

    public RequestDto execute(FileRequestCommand command) {
        return fileRequestService.handle(command);
    }
}
