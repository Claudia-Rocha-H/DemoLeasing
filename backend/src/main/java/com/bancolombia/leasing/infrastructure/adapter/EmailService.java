package com.bancolombia.leasing.infrastructure.adapter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/*
 * Email service for sending notification emails.
 * Handles SMTP communication and HTML email construction.
 */
@Service
public class EmailService {

  private final JavaMailSender mailSender;
  private final String fromEmail;
  private final String demoRecipientEmail;
  private final boolean demoMode;

  public EmailService(
      JavaMailSender mailSender,
      @Value("${leasing.email.from}") String fromEmail,
      @Value("${leasing.email.demo.recipient}") String demoRecipientEmail,
      @Value("${leasing.email.demo.enabled}") boolean demoMode
  ) {
    this.mailSender = mailSender;
    this.fromEmail = fromEmail;
    this.demoRecipientEmail = demoRecipientEmail;
    this.demoMode = demoMode;
  }

  public void sendNotificationEmail(
      String customerName,
      String customerEmail,
      String requestId,
      String title,
      String message,
      String actionUrl
  ) {
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

      String recipientEmail = demoMode ? demoRecipientEmail : customerEmail;
      String htmlContent = EmailTemplateBuilder.buildNotificationEmail(
          customerName,
          requestId,
          title,
          message,
          actionUrl
      );

      helper.setFrom(fromEmail);
      helper.setTo(recipientEmail);
      helper.setSubject("Notificación: " + title);
      helper.setText(htmlContent, true);

      mailSender.send(mimeMessage);
    } catch (MessagingException e) {
      throw new RuntimeException("Failed to send notification email: " + e.getMessage(), e);
    }
  }

  public void sendSimpleEmail(String to, String subject, String body) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      String recipientEmail = demoMode ? demoRecipientEmail : to;

      message.setFrom(fromEmail);
      message.setTo(recipientEmail);
      message.setSubject(subject);
      message.setText(body);

      mailSender.send(message);
    } catch (RuntimeException e) {
      throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
    }
  }
}
