package com.bancolombia.leasing.infrastructure.adapter;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private MimeMessage createMessage() {
        Session session = Session.getInstance(new Properties());
        return new MimeMessage(session);
    }

    @Test
    void sendHtmlInDemoMode() throws Exception {
        MimeMessage mimeMessage = createMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        EmailService service = new EmailService(mailSender, "from@test.local", "demo@test.local", true);

        service.sendNotificationEmail(
            "Cliente",
            "real@test.local",
            "REQ-1",
            "Cambio",
            "Actualizacion",
            "http://localhost:5173"
        );

        verify(mailSender).send(mimeMessage);
        assertEquals("demo@test.local", ((InternetAddress) mimeMessage.getAllRecipients()[0]).getAddress());
    }

    @Test
    void sendHtmlInNormalMode() throws Exception {
        MimeMessage mimeMessage = createMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        EmailService service = new EmailService(mailSender, "from@test.local", "demo@test.local", false);

        service.sendNotificationEmail(
            "Cliente",
            "real@test.local",
            "REQ-2",
            "Cambio",
            "Actualizacion",
            "http://localhost:5173"
        );

        verify(mailSender).send(mimeMessage);
        assertEquals("real@test.local", ((InternetAddress) mimeMessage.getAllRecipients()[0]).getAddress());
    }

    @Test
    void sendSimpleInDemoMode() {
        EmailService service = new EmailService(mailSender, "from@test.local", "demo@test.local", true);

        service.sendSimpleEmail("real@test.local", "Hola", "Body");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void failSimpleWhenSenderFails() {
        doThrow(new RuntimeException("smtp error"))
            .when(mailSender)
            .send(any(SimpleMailMessage.class));

        EmailService service = new EmailService(mailSender, "from@test.local", "demo@test.local", true);

        var ex = assertThrows(RuntimeException.class, () -> service.sendSimpleEmail("real@test.local", "Hola", "Body"));
        assertNotNull(ex);
    }

    @Test
    void failHtmlWhenSenderFails() {
        MimeMessage mimeMessage = createMessage();
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("smtp error"))
            .when(mailSender)
            .send(any(MimeMessage.class));

        EmailService service = new EmailService(mailSender, "from@test.local", "demo@test.local", true);

        var ex = assertThrows(
            RuntimeException.class,
            () -> service.sendNotificationEmail("Cliente", "real@test.local", "REQ-3", "Cambio", "Actualizacion", "http://localhost:5173")
        );
        assertNotNull(ex);
    }
}
