package com.bancolombia.leasing.infrastructure.adapter;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class EmailTemplateBuilderTest {

    @Test
    void buildHtmlWithPercentages() {
        String html = EmailTemplateBuilder.buildNotificationEmail(
            "Cliente Demo",
            "REQ-9001",
            "Avance 100% completado",
            "Tu solicitud va al 75% y sigue en gestión.",
            "http://localhost:5173"
        );

        assertTrue(html.contains("Cliente Demo"));
        assertTrue(html.contains("REQ-9001"));
        assertTrue(html.contains("Avance 100% completado"));
        assertTrue(html.contains("Tu solicitud va al 75% y sigue en gestión."));
        assertTrue(html.contains("http://localhost:5173"));
        assertFalse(html.contains("{{title}}"));
        assertFalse(html.contains("{{message}}"));
    }
}
