package com.smartseva.notification.channel;

import com.smartseva.customer.entity.Customer;
import com.smartseva.document.entity.Document;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class WhatsAppNotificationChannel implements NotificationChannel {

    @Value("${app.portal.base-url:http://localhost:5173}")
    private String portalBaseUrl;

    @Override
    public NotificationType getChannelType() {
        return NotificationType.WHATSAPP;
    }

    @Override
    public ChannelDeliveryResultDTO sendNotification(ServiceOrder service, String message, List<Document> documents) {
        Customer customer = service != null ? service.getCustomer() : null;
        if (customer == null || customer.getPhoneNumber() == null || customer.getPhoneNumber().isBlank()) {
            log.warn("Cannot generate WhatsApp link: Customer {} has no phone number on file.", customer != null ? customer.getFullName() : "Unknown");
            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.WHATSAPP)
                    .success(false)
                    .status("FAILED")
                    .recipient("NO_PHONE")
                    .failureReason("Customer does not have a valid WhatsApp phone number on file.")
                    .build();
        }

        String rawPhone = customer.getPhoneNumber().trim();
        String waNumber = normalizeForWhatsApp(rawPhone);

        if (waNumber == null || waNumber.isBlank()) {
            log.warn("Cannot generate WhatsApp link: Customer {} has an invalid phone number: {}",
                    customer.getFullName(), rawPhone);

            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.WHATSAPP)
                    .success(false)
                    .status("FAILED")
                    .recipient(rawPhone)
                    .failureReason("Customer has an invalid mobile phone number on file: " + rawPhone)
                    .build();
        }

        String appNo = service != null && service.getApplicationNumber() != null && !service.getApplicationNumber().isBlank()
                ? service.getApplicationNumber().trim()
                : (service != null && service.getServiceId() != null ? "SS-" + service.getServiceId() : "");

        String serviceName = service != null && service.getServiceName() != null ? service.getServiceName().trim() : "Service";

        StringBuilder waContent = new StringBuilder();

        if (service != null && service.getServiceId() != null) {
            waContent.append("Hello *").append(customer.getFullName()).append("*,\n\n");
            waContent.append("Your SmartSeva service request status has been updated.\n\n");
            waContent.append("📋 *Service:* ").append(serviceName).append("\n");
            waContent.append("🆔 *Application ID:* ").append(appNo).append("\n");
            waContent.append("🔄 *Status:* *").append(service.getStatus()).append("*\n");

            if (service.getPendingReason() != null) {
                waContent.append("⚠️ *Pending Reason:* ").append(service.getPendingReason().name()).append("\n");
            }

            if (message != null && !message.isBlank()) {
                waContent.append("💬 *Notes:* ").append(message.trim()).append("\n");
            }

            if (service.getStatus() == ServiceStatus.COMPLETED && documents != null && !documents.isEmpty()) {
                waContent.append("\n📁 *Delivered Official Document(s):*\n");
                for (Document doc : documents) {
                    waContent.append("  ✓ ").append(doc.getOriginalFileName()).append("\n");
                }
                waContent.append("\n🔗 *Secure Citizen Portal Download:*\n")
                        .append(portalBaseUrl).append("/verify?serviceId=").append(service.getServiceId()).append("\n");
            }

            waContent.append("\nThank you for choosing SmartSeva Citizen Services.");
        } else {
            // Direct customer notification
            waContent.append("Hello *").append(customer.getFullName()).append("*,\n\n");
            if (message != null && !message.isBlank()) {
                waContent.append(message.trim());
            } else {
                waContent.append("You have an update regarding your SmartSeva citizen services.");
            }
            waContent.append("\n\nThank you for choosing SmartSeva.");
        }

        String rawMessageText = waContent.toString();

        // Generate wa.me deep link (phone format: digits only, NO leading '+')
        String encodedBody = URLEncoder.encode(rawMessageText, StandardCharsets.UTF_8).replace("+", "%20");
        String waActionLink = "https://wa.me/" + waNumber + "?text=" + encodedBody;

        log.info("Generated WhatsApp link for recipient: {}", waNumber);

        return ChannelDeliveryResultDTO.builder()
                .channel(NotificationType.WHATSAPP)
                .success(true)
                .status("COMPOSER_READY")
                .recipient("+" + waNumber)
                .actionLink(waActionLink)
                .rawMessage(rawMessageText)
                .message("WhatsApp opened. Please press Send.")
                .build();
    }

    /**
     * Normalizes a phone number for WhatsApp wa.me links (digits only, no '+' sign).
     * E.g.
     *  "8050653488" -> "918050653488"
     *  "+918050653488" -> "918050653488"
     *  "918050653488" -> "918050653488"
     *  "08050653488" -> "918050653488"
     */
    public String normalizeForWhatsApp(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return null;
        }

        String cleaned = phoneNumber.trim().replaceAll("[\\s\\-\\(\\)\\+]", "");

        // If exactly 10 digits starting with 6, 7, 8, or 9 (standard Indian mobile)
        if (cleaned.matches("^[6-9]\\d{9}$")) {
            return "91" + cleaned;
        }

        // If 12 digits starting with 91 (e.g. 918050653488)
        if (cleaned.matches("^91[6-9]\\d{9}$")) {
            return cleaned;
        }

        // If starts with 0 followed by 10 digits
        if (cleaned.matches("^0[6-9]\\d{9}$")) {
            return "91" + cleaned.substring(1);
        }

        return cleaned;
    }
}