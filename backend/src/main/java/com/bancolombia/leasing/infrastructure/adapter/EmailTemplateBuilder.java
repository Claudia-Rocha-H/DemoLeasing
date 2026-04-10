package com.bancolombia.leasing.infrastructure.adapter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/*
 * HTML email template builder for notification emails.
 * Generates professional, responsive email templates with Bancolombia branding.
 */
public class EmailTemplateBuilder {

  private EmailTemplateBuilder() {
    throw new AssertionError("Utility class must not be instantiated");
  }

  public static String buildNotificationEmail(
      String customerName,
      String requestId,
      String title,
      String message,
      String actionUrl
  ) {
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
    String safeCustomerName = escapeHtml(customerName);
    String safeRequestId = escapeHtml(requestId);
    String safeTitle = escapeHtml(title);
    String safeMessage = escapeHtml(message);
    String safeActionUrl = escapeHtml(actionUrl);

    return """
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notificación de Solicitud</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #FFD600 0%, #FFF700 100%); padding: 30px 20px; text-align: center; border-bottom: 4px solid #000; }
            .header-title { color: #000; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
            .header-subtitle { color: #333; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
            .logo { font-size: 14px; color: #000; font-weight: 700; display: inline-block; background: rgba(0,0,0,0.05); padding: 8px 12px; border-radius: 4px; margin-bottom: 15px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; color: #000; font-weight: 600; margin-bottom: 20px; }
            .notification-card { background: #f9f9f9; border-left: 4px solid #FFD600; padding: 20px; border-radius: 4px; margin: 25px 0; }
            .notification-title { font-size: 18px; font-weight: 700; color: #000; margin-bottom: 8px; }
            .notification-request-id { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px; }
            .notification-message { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 15px; }
            .action-button { display: inline-block; background: #000; color: #FFD600; padding: 12px 28px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 15px; transition: all 0.3s ease; }
            .action-button:hover { background: #333; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .footer { background: #f5f5f5; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0; }
            .footer-text { font-size: 12px; color: #999; line-height: 1.6; }
            .footer-link { color: #FFD600; text-decoration: none; font-weight: 600; }
            .timestamp { font-size: 11px; color: #bbb; margin-top: 15px; text-align: center; }
            .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">B Bancolombia</div>
              <div class="header-title">Notificación de Solicitud</div>
              <div class="header-subtitle">Leasing - Gestión de Solicitudes</div>
            </div>

            <div class="content">
              <div class="greeting">Hola {{customerName}},</div>

              <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
                Tienes una nueva actualización en tu solicitud de leasing. Consulta los detalles a continuación:
              </p>

              <div class="notification-card">
                <div class="notification-title">{{title}}</div>
                <div class="notification-request-id">Solicitud: #{{requestId}}</div>
                <div class="notification-message">{{message}}</div>
              </div>

              <div style="text-align: center;">
                <a href="{{actionUrl}}" class="action-button">Ver Solicitud</a>
              </div>

              <div class="divider"></div>

              <p style="font-size: 12px; color: #999; margin-top: 25px;">
                Si necesitas más información, accede a tu portal de <strong>Gestión de Solicitudes</strong> directo en Bancolombia.
              </p>
            </div>

            <div class="footer">
              <div class="footer-text">
                <strong>Bancolombia Leasing</strong><br/>
                Este es un correo automático. Por favor, no responder directamente.<br/>
                <a href="https://www.bancolombia.com" class="footer-link">www.bancolombia.com</a><br/>
                <div class="timestamp">{{timestamp}}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
        """
        .replace("{{customerName}}", safeCustomerName)
        .replace("{{title}}", safeTitle)
        .replace("{{requestId}}", safeRequestId)
        .replace("{{message}}", safeMessage)
        .replace("{{actionUrl}}", safeActionUrl)
        .replace("{{timestamp}}", timestamp);
  }

  private static String escapeHtml(String value) {
    if (value == null) {
      return "";
    }

    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }
}
