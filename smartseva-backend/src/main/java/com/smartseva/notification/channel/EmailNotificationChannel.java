package com.smartseva.notification.channel;

import com.smartseva.customer.entity.Customer;
import com.smartseva.document.entity.Document;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.storage.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.InputStream;
import java.time.Duration;
import java.util.*;

@Slf4j
@Component
public class EmailNotificationChannel implements NotificationChannel {

    private final FileStorageService fileStorageService;
    private final RestClient restClient;

    @Value("${resend.api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from-email:${RESEND_FROM_EMAIL:}}")
    private String resendFromEmail;

    @org.springframework.beans.factory.annotation.Autowired
    public EmailNotificationChannel(FileStorageService fileStorageService,
                                  @Value("${resend.api-key:${RESEND_API_KEY:}}") String resendApiKey,
                                  @Value("${resend.from-email:${RESEND_FROM_EMAIL:}}") String resendFromEmail) {
        this.fileStorageService = fileStorageService;
        this.resendApiKey = resendApiKey;
        this.resendFromEmail = resendFromEmail;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(15));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl("https://api.resend.com")
                .build();
    }

    public EmailNotificationChannel(FileStorageService fileStorageService,
                                  String resendApiKey,
                                  String resendFromEmail,
                                  RestClient restClient) {
        this.fileStorageService = fileStorageService;
        this.resendApiKey = resendApiKey;
        this.resendFromEmail = resendFromEmail;
        this.restClient = restClient;
    }

    @Override
    public NotificationType getChannelType() {
        return NotificationType.EMAIL;
    }

    @Override
    public ChannelDeliveryResultDTO sendNotification(ServiceOrder service, String message, List<Document> documents) {
        Customer customer = service != null ? service.getCustomer() : null;
        if (customer == null || customer.getEmail() == null || customer.getEmail().isBlank()) {
            log.warn("Cannot send email: Customer {} has no email address on file.", customer != null ? customer.getFullName() : "Unknown");
            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(false)
                    .status("FAILED")
                    .recipient("NO_EMAIL")
                    .failureReason("Customer does not have a valid email address on file.")
                    .build();
        }

        String recipient = customer.getEmail().trim();
        String appNo = (service != null && service.getApplicationNumber() != null)
                ? service.getApplicationNumber()
                : (service != null && service.getServiceId() != null ? ("SS-" + service.getServiceId()) : "N/A");
        String serviceName = service != null && service.getServiceName() != null ? service.getServiceName() : "Service";

        // Check Resend credentials configuration
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.error("Resend API key is not configured (RESEND_API_KEY is empty). Cannot send email to {}.", recipient);
            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(false)
                    .status("FAILED")
                    .recipient(recipient)
                    .failureReason("Email delivery failed: RESEND_API_KEY is not configured on the server.")
                    .build();
        }

        if (resendFromEmail == null || resendFromEmail.isBlank()) {
            log.error("Resend sender email is not configured (RESEND_FROM_EMAIL is empty). Cannot send email to {}.", recipient);
            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(false)
                    .status("FAILED")
                    .recipient(recipient)
                    .failureReason("Email delivery failed: RESEND_FROM_EMAIL is not configured on the server.")
                    .build();
        }

        String formattedSender = resendFromEmail.trim();
        if (!formattedSender.contains("<") && !formattedSender.contains(">")) {
            formattedSender = "SmartSeva <" + formattedSender + ">";
        }

        try {
            String subject;
            if (service != null && service.getServiceId() != null) {
                subject = service.getStatus() == ServiceStatus.COMPLETED
                        ? "SmartSeva — Your " + serviceName + " is Completed"
                        : "SmartSeva — Service Status Update: " + serviceName;
            } else {
                subject = "SmartSeva — Notification from Citizen Services";
            }

            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(customer.getFullName()).append(",\n\n");

            if (service != null && service.getServiceId() != null) {
                if (service.getStatus() == ServiceStatus.COMPLETED) {
                    body.append("Your ").append(serviceName).append(" request (Application ID: ").append(appNo).append(") has been successfully COMPLETED.\n\n");
                } else {
                    body.append("Your ").append(serviceName).append(" request (Application ID: ").append(appNo).append(") status has been updated to: ").append(service.getStatus()).append(".\n\n");
                }
                if (message != null && !message.isBlank()) {
                    body.append("Remarks / Notes: ").append(message.trim()).append("\n\n");
                }
            } else {
                if (message != null && !message.isBlank()) {
                    body.append(message.trim()).append("\n\n");
                }
            }

            // Build attachments if present
            List<Map<String, Object>> resendAttachments = new ArrayList<>();
            if (documents != null && !documents.isEmpty()) {
                body.append("The following official document(s) are attached to this email for your records:\n");
                for (Document doc : documents) {
                    body.append("  • ").append(doc.getOriginalFileName()).append("\n");
                    try {
                        Resource resource = fileStorageService.loadFileAsResource(doc.getFilePath());
                        try (InputStream is = resource.getInputStream()) {
                            byte[] bytes = is.readAllBytes();
                            String base64Content = Base64.getEncoder().encodeToString(bytes);

                            Map<String, Object> attachmentMap = new LinkedHashMap<>();
                            attachmentMap.put("filename", doc.getOriginalFileName());
                            attachmentMap.put("content", base64Content);
                            resendAttachments.add(attachmentMap);
                        }
                    } catch (Exception docEx) {
                        log.error("Failed to load attachment file {} for Resend email: {}", doc.getOriginalFileName(), docEx.getMessage());
                    }
                }
            }

            body.append("\nThank you for using SmartSeva.\n\nRegards,\nSmartSeva Team");

            // Construct Resend JSON payload
            Map<String, Object> requestPayload = new LinkedHashMap<>();
            requestPayload.put("from", formattedSender);
            requestPayload.put("to", List.of(recipient));
            requestPayload.put("subject", subject);
            requestPayload.put("text", body.toString());

            if (!resendAttachments.isEmpty()) {
                requestPayload.put("attachments", resendAttachments);
            }

            // Execute HTTP POST to Resend API
            log.info("Sending email via Resend API to recipient {} from sender {} for service {}", recipient, formattedSender, serviceName);
            ResponseEntity<String> response = restClient.post()
                    .uri("/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .toEntity(String.class);

            log.info("Resend API response for {}: HTTP {} - {}", recipient, response.getStatusCode(), response.getBody());

            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(true)
                    .status("SENT")
                    .recipient(recipient)
                    .message("Email sent successfully via Resend API" + (!resendAttachments.isEmpty() ? " with " + resendAttachments.size() + " attachment(s)." : "."))
                    .build();

        } catch (RestClientResponseException ex) {
            log.error("Resend API HTTP error sending email to {}: HTTP {} - {}", recipient, ex.getStatusCode(), ex.getResponseBodyAsString());
            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(false)
                    .status("FAILED")
                    .recipient(recipient)
                    .failureReason("Email delivery failed via Resend API (HTTP " + ex.getStatusCode().value() + "): " + ex.getResponseBodyAsString())
                    .build();
        } catch (Exception e) {
            log.error("Failed to send email via Resend API to {}: {}", recipient, e.getMessage(), e);
            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(false)
                    .status("FAILED")
                    .recipient(recipient)
                    .failureReason("Email delivery failed: " + e.getMessage())
                    .build();
        }
    }
}