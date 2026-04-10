package com.bancolombia.leasing.domain.port;

import com.bancolombia.leasing.domain.model.Request;

public interface IRequestRepository {
    String nextRequestId();

    void save(Request request);

    Request findById(String requestId);

    void deleteById(String requestId);
}
