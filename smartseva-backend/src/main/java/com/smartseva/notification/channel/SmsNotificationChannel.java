
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
public class SmsNotificationChannel implements NotificationChannel {

    @Value("${app.portal.base-url:http://localhost:5173}")
    private String portalBaseUrl;

    @Override
    public NotificationType getChannelType() {
        return NotificationType.SMS;
    }

    @Override
    public ChannelDeliveryResultDTO sendNotification(
            ServiceOrder service,
            String message,
            List<Document> documents) {

        Customer customer = service != null ? service.getCustomer() : null;

        // 1. Validate customer existence and phone number
        if (customer == null
                || customer.getPhoneNumber() == null
                || customer.getPhoneNumber().isBlank()) {

            log.warn(
                    "Cannot generate SMS link: Customer {} has no mobile phone number on file.",
                    customer != null ? customer.getFullName() : "Unknown"
            );

            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.SMS)
                    .success(false)
                    .status("FAILED")
                    .recipient("NO_PHONE")
                    .failureReason("Customer does not have a valid mobile phone number on file.")
                    .build();
        }

        String rawPhone = customer.getPhoneNumber().trim();
        String recipient = normalizeIndianPhoneNumber(rawPhone);

        if (recipient == null || recipient.isBlank()) {
            log.warn("Cannot generate SMS link: Customer {} has an invalid mobile phone number on file: {}",
                    customer.getFullName(), rawPhone);

            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.SMS)
                    .success(false)
                    .status("FAILED")
                    .recipient(rawPhone)
                    .failureReason("Customer has an invalid mobile phone number on file: " + rawPhone)
                    .build();
        }

        // 2. Application number and service name
        String appNo = service != null && service.getApplicationNumber() != null && !service.getApplicationNumber().isBlank()
                ? service.getApplicationNumber().trim()
                : (service != null && service.getServiceId() != null ? "SS-" + service.getServiceId() : "");

        String serviceName = service != null && service.getServiceName() != null ? service.getServiceName().trim() : "Service";

        StringBuilder smsContent = new StringBuilder();

        // 3. Generate status-specific or direct customer SMS messages
        if (service != null && service.getServiceId() != null) {
            if (service.getStatus() == ServiceStatus.COMPLETED) {
                smsContent.append("SmartSeva: Your ").append(serviceName).append(" request is COMPLETED.");

                if (documents != null && !documents.isEmpty()) {
                    smsContent.append(" ")
                            .append(documents.size())
                            .append(" official document(s) are ready. Download securely: ")
                            .append(portalBaseUrl)
                            .append("/verify?serviceId=")
                            .append(service.getServiceId());
                } else {
                    smsContent.append(" Application ID: ")
                            .append(appNo)
                            .append(". Thank you for choosing SmartSeva.");
                }

            } else if (service.getStatus() == ServiceStatus.IN_PROGRESS) {
                smsContent.append("SmartSeva: Your ")
                        .append(serviceName)
                        .append(" request is now IN PROGRESS. Application ID: ")
                        .append(appNo)
                        .append(".");

            } else if (service.getStatus() == ServiceStatus.PENDING
                    || service.getStatus() == ServiceStatus.WAITING_FOR_DOCUMENT
                    || service.getStatus() == ServiceStatus.SERVER_ISSUE) {

                smsContent.append("SmartSeva: Your ")
                        .append(serviceName)
                        .append(" request is PENDING");

                if (service.getPendingReason() != null) {
                    smsContent.append(" (").append(service.getPendingReason().name()).append(")");
                }

                smsContent.append(". Please provide required details.");

            } else {
                smsContent.append("SmartSeva: Your ")
                        .append(serviceName)
                        .append(" status has been updated to ")
                        .append(service.getStatus())
                        .append(". Application ID: ")
                        .append(appNo)
                        .append(".");
            }

            // Optional remarks / processing notes
            if (message != null && !message.isBlank()) {
                smsContent.append(" Note: ").append(message.trim());
            }
        } else {
            // Direct customer notification
            smsContent.append("SmartSeva: Hello ").append(customer.getFullName()).append(", ");
            if (message != null && !message.isBlank()) {
                smsContent.append(message.trim());
            } else {
                smsContent.append("You have an update regarding your SmartSeva citizen services.");
            }
        }

        String rawMessageText = smsContent.toString();

        // 4. Generate device-native sms: URI deep link
        String encodedBody = URLEncoder.encode(rawMessageText, StandardCharsets.UTF_8).replace("+", "%20");
        String smsActionLink = "sms:" + recipient + "?body=" + encodedBody;

        log.info("Generated device SMS link for recipient: {}", recipient);

        return ChannelDeliveryResultDTO.builder()
                .channel(NotificationType.SMS)
                .success(true)
                .status("COMPOSER_READY")
                .recipient(recipient)
                .actionLink(smsActionLink)
                .rawMessage(rawMessageText)
                .message("SMS composer opened. Please press Send on your device.")
                .build();
    }

    /**
     * Normalizes a phone number to standard E.164 format for Indian mobile numbers.
     * Rules:
     * 1. 10-digit number starting with 6, 7, 8, or 9 (e.g. "8050653488") -> "+918050653488"
     * 2. Already starts with "+91" (e.g. "+918050653488") -> unchanged
     * 3. Starts with "91" and contains 12 digits (e.g. "918050653488") -> "+918050653488"
     * 4. Starts with "0" followed by 10 digits (e.g. "08050653488") -> "+918050653488"
     * 5. International numbers (e.g. "+14155552671") -> unchanged
     * 6. Strips internal whitespace, hyphens, and parentheses.
     */
    public String normalizeIndianPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return null;
        }

        String cleaned = phoneNumber.trim().replaceAll("[\\s\\-\\(\\)]", "");

        // If already in international format starting with '+'
        if (cleaned.startsWith("+")) {
            return cleaned;
        }

        // If exactly 10 digits starting with 6, 7, 8, or 9 (standard Indian mobile)
        if (cleaned.matches("^[6-9]\\d{9}$")) {
            return "+91" + cleaned;
        }

        // If 12 digits starting with 91 (e.g. 918050653488)
        if (cleaned.matches("^91[6-9]\\d{9}$")) {
            return "+" + cleaned;
        }

        // If starts with 0 and followed by 10 digits (e.g. 08050653488)
        if (cleaned.matches("^0[6-9]\\d{9}$")) {
            return "+91" + cleaned.substring(1);
        }

        return cleaned;
    }
}
