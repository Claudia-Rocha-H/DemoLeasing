package com.bancolombia.leasing.infrastructure.entrypoint;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;

class ApiExceptionHandlerTest {

    private MockMvc mvc;

    @BeforeEach
    public void init() {
        mvc = MockMvcBuilders
            .standaloneSetup(new FailingController())
            .setControllerAdvice(new ApiExceptionHandler())
            .build();
    }

    @Test
    void mapIllegalArg() throws Exception {
        mvc.perform(get("/test/arg").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Bad Request"))
            .andExpect(jsonPath("$.message").value("bad request"));
    }

    @Test
    void mapIllegalState() throws Exception {
        mvc.perform(get("/test/state").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.error").value("Conflict"))
            .andExpect(jsonPath("$.message").value("invalid state"));
    }

    @Test
    void mapUnexpected() throws Exception {
        mvc.perform(get("/test/unexpected").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.status").value(500))
            .andExpect(jsonPath("$.error").value("Internal Server Error"))
            .andExpect(jsonPath("$.message").value("Unexpected server error"));
    }

    @Controller
    static class FailingController {

        @GetMapping("/test/arg")
        public void arg() {
            throw new IllegalArgumentException("bad request");
        }

        @GetMapping("/test/state")
        public void state() {
            throw new IllegalStateException("invalid state");
        }

        @GetMapping("/test/unexpected")
        public void unexpected() {
            throw new RuntimeException("boom");
        }
    }
}
