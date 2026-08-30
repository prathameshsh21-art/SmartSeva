package com.smartseva.notification.channel;

import com.smartseva.customer.entity.Customer;
import com.smartseva.document.entity.Document;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.storage.FileStorageService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationChannel implements NotificationChannel {

    private final JavaMailSender mailSender;
    private final FileStorageService fileStorageService;

    @Value("${spring.mail.username:noreply@smartseva.com}")
    private String mailFrom;

    @Override
    public NotificationType getChannelType() {
        return NotificationType.EMAIL;
    }

    @Override
    public ChannelDeliveryResultDTO sendNotification(ServiceOrder service, String message, List<Document> documents) {
        Customer customer = service.getCustomer();
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
        String appNo = service.getApplicationNumber() != null ? service.getApplicationNumber() : ("SS-" + service.getServiceId());
        String serviceName = service.getServiceName();

        try {
            if (documents != null && !documents.isEmpty()) {
                // Send with attachments
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                String fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@smartseva.com";
                try {
                    helper.setFrom(fromAddress, "SmartSeva");
                } catch (Exception fromEx) {
                    helper.setFrom(fromAddress);
                }
                helper.setTo(recipient);
                String subject;
                if (service != null && service.getServiceId() != null) {
                    subject = service.getStatus() == ServiceStatus.COMPLETED
                            ? "SmartSeva — Your " + serviceName + " is Completed"
                            : "SmartSeva — Service Status Update: " + serviceName;
                } else {
                    subject = "SmartSeva — Notification from Citizen Services";
                }
                helper.setSubject(subject);

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

                body.append("The following official document(s) are attached to this email for your records:\n");
                for (Document doc : documents) {
                    body.append("  • ").append(doc.getOriginalFileName()).append("\n");
                    try {
                        Resource resource = fileStorageService.loadFileAsResource(doc.getFilePath());
                        helper.addAttachment(doc.getOriginalFileName(), resource);
                    } catch (Exception docEx) {
                        log.error("Failed to attach file {} to email: {}", doc.getOriginalFileName(), docEx.getMessage());
                    }
                }

                body.append("\nThank you for using SmartSeva.\n\nRegards,\nSmartSeva Team");
                helper.setText(body.toString());

                mailSender.send(mimeMessage);
                log.info("Email with {} attachment(s) successfully sent to {} for service {}", documents.size(), recipient, serviceName);
            } else {
                // Send standard text email
                SimpleMailMessage mail = new SimpleMailMessage();
                String fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@smartseva.com";
                mail.setFrom(fromAddress);
                mail.setTo(recipient);

                String subject;
                if (service != null && service.getServiceId() != null) {
                    subject = service.getStatus() == ServiceStatus.COMPLETED
                            ? "SmartSeva — Your " + serviceName + " is Completed"
                            : "SmartSeva — Service Status Update: " + serviceName;
                } else {
                    subject = "SmartSeva — Notification from Citizen Services";
                }
                mail.setSubject(subject);

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

                body.append("Thank you for using SmartSeva.\n\nRegards,\nSmartSeva Team");
                mail.setText(body.toString());

                mailSender.send(mail);
                log.info("Email successfully sent to {} for service {}", recipient, serviceName);
            }

            return ChannelDeliveryResultDTO.builder()
                    .channel(NotificationType.EMAIL)
                    .success(true)
                    .status("SENT")
                    .recipient(recipient)
                    .message("Email sent successfully" + (documents != null && !documents.isEmpty() ? " with " + documents.size() + " attachment(s)." : "."))
                    .build();

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", recipient, e.getMessage(), e);
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