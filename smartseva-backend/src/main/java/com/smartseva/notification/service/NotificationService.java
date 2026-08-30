package com.smartseva.notification.service;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.exception.BadRequestException;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.document.entity.Document;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.notification.channel.NotificationChannel;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.dto.NotificationDTO;
import com.smartseva.notification.dto.SendNotificationRequest;
import com.smartseva.notification.entity.Notification;
import com.smartseva.notification.entity.NotificationStatus;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.notification.repository.NotificationRepository;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final CustomerRepository customerRepository;
    private final DocumentRepository documentRepository;
    private final ActivityLogService activityLogService;
    private final List<NotificationChannel> channelList;

    private final Map<NotificationType, NotificationChannel> channelMap = new EnumMap<>(NotificationType.class);

    @PostConstruct
    public void init() {
        for (NotificationChannel channel : channelList) {
            channelMap.put(channel.getChannelType(), channel);
            log.info("Registered notification channel handler for: {}", channel.getChannelType());
        }
    }

    @Transactional
    public List<ChannelDeliveryResultDTO> dispatchStatusNotifications(
            ServiceOrder service,
            List<NotificationType> requestedChannels,
            List<Document> documents,
            String remarks
    ) {
        if (service == null || requestedChannels == null || requestedChannels.isEmpty()) {
            return Collections.emptyList();
        }

        List<ChannelDeliveryResultDTO> results = new ArrayList<>();
        Customer customer = service.getCustomer();
        Set<NotificationType> uniqueChannels = new LinkedHashSet<>(requestedChannels);

        for (NotificationType type : uniqueChannels) {
            NotificationChannel channel = channelMap.get(type);
            if (channel == null) {
                log.warn("No handler registered for notification channel: {}", type);
                results.add(ChannelDeliveryResultDTO.builder()
                        .channel(type)
                        .success(false)
                        .status("FAILED")
                        .recipient(customer != null ? customer.getPhoneNumber() : "-")
                        .failureReason("Notification channel " + type + " is not configured.")
                        .build());
                continue;
            }

            String recipient = (type == NotificationType.EMAIL)
                    ? (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank() ? customer.getEmail().trim() : "NO_EMAIL")
                    : (customer != null && customer.getPhoneNumber() != null && !customer.getPhoneNumber().isBlank() ? customer.getPhoneNumber().trim() : "NO_PHONE");

            Notification notification = Notification.builder()
                    .serviceOrder(service.getServiceId() != null ? service : null)
                    .customer(customer)
                    .notificationType(type)
                    .recipient(recipient)
                    .status(NotificationStatus.PENDING)
                    .messageContent(remarks)
                    .build();

            Notification saved = notificationRepository.save(notification);

            ChannelDeliveryResultDTO result;
            try {
                result = channel.sendNotification(service, remarks, documents);
            } catch (Exception e) {
                log.error("Exception dispatching notification via channel {}: {}", type, e.getMessage(), e);
                result = ChannelDeliveryResultDTO.builder()
                        .channel(type)
                        .success(false)
                        .status("FAILED")
                        .recipient(recipient)
                        .failureReason("Dispatch error: " + e.getMessage())
                        .build();
            }

            if (result.isSuccess()) {
                saved.setStatus(NotificationStatus.SENT);
                saved.setSentAt(LocalDateTime.now());
                saved.setFailureReason(null);
                String actionDesc = (type == NotificationType.EMAIL)
                        ? "Sent EMAIL notification to " + result.getRecipient()
                        : "Generated " + type + " deep link for " + result.getRecipient();
                activityLogService.logActivity(
                        service != null ? service.getAssignedStaff() : null,
                        service != null && service.getServiceId() != null ? service : null,
                        "NOTIFICATION_SENT",
                        actionDesc
                );
            } else {
                saved.setStatus(NotificationStatus.FAILED);
                saved.setFailureReason(result.getFailureReason());
                activityLogService.logActivity(
                        service != null ? service.getAssignedStaff() : null,
                        service != null && service.getServiceId() != null ? service : null,
                        "NOTIFICATION_FAILED",
                        "Failed to send " + type + " notification: " + result.getFailureReason()
                );
            }

            notificationRepository.save(saved);
            results.add(result);
        }

        if (documents != null && !documents.isEmpty()) {
            activityLogService.logActivity(
                    service != null ? service.getAssignedStaff() : null,
                    service != null && service.getServiceId() != null ? service : null,
                    "DOCUMENT_SHARED",
                    "Shared " + documents.size() + " document(s) with customer via selected channel(s)."
            );
        }

        return results;
    }

    @Transactional
    public NotificationDTO sendCompletionNotification(SendNotificationRequest request) {
        Customer customer = null;
        ServiceOrder service = null;

        if (request.getServiceId() != null) {
            service = serviceOrderRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", request.getServiceId()));
            customer = service.getCustomer();
        } else if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
            List<ServiceOrder> services = serviceOrderRepository.findByCustomerCustomerId(customer.getCustomerId());
            if (!services.isEmpty()) {
                service = services.get(0);
            }
        } else {
            throw new BadRequestException("Either customerId or serviceId must be provided.");
        }

        if (customer == null) {
            throw new ResourceNotFoundException("Customer", "id", request.getCustomerId());
        }

        // Determine requested channels (EMAIL, SMS, or Both)
        List<NotificationType> requestedChannels = new ArrayList<>();
        if (request.getChannels() != null && !request.getChannels().isEmpty()) {
            requestedChannels.addAll(request.getChannels());
        } else if (request.getNotificationType() != null) {
            requestedChannels.add(request.getNotificationType());
        } else {
            requestedChannels.add(NotificationType.EMAIL);
        }

        String msg = (request.getMessage() != null && !request.getMessage().isBlank())
                ? request.getMessage().trim()
                : "Notification from SmartSeva Citizen Services.";

        // Retrieve documents if attached
        List<Document> documents = Collections.emptyList();
        if (request.getDocumentIdsToShare() != null && !request.getDocumentIdsToShare().isEmpty()) {
            documents = documentRepository.findAllById(request.getDocumentIdsToShare());
        }

        // Effective service for channel template
        ServiceOrder effectiveService = service != null ? service : ServiceOrder.builder()
                .customer(customer)
                .serviceName("Citizen Communication")
                .status(ServiceStatus.IN_PROGRESS)
                .build();

        List<ChannelDeliveryResultDTO> results = dispatchStatusNotifications(
                effectiveService,
                requestedChannels,
                documents,
                msg
        );

        NotificationStatus overallStatus = results.stream().anyMatch(ChannelDeliveryResultDTO::isSuccess)
                ? NotificationStatus.SENT
                : NotificationStatus.FAILED;

        String primaryRecipient = !results.isEmpty() ? results.get(0).getRecipient() : "-";
        NotificationType primaryChannel = !results.isEmpty() ? results.get(0).getChannel() : NotificationType.EMAIL;
        String failureReason = results.stream()
                .filter(r -> !r.isSuccess() && r.getFailureReason() != null)
                .map(r -> r.getChannel() + ": " + r.getFailureReason())
                .reduce((a, b) -> a + " | " + b)
                .orElse(null);

        return NotificationDTO.builder()
                .serviceId(service != null ? service.getServiceId() : null)
                .serviceName(service != null ? service.getServiceName() : "Citizen Communication")
                .customerId(customer.getCustomerId())
                .customerName(customer.getFullName())
                .notificationType(primaryChannel)
                .recipient(primaryRecipient)
                .status(overallStatus)
                .failureReason(failureReason)
                .messageContent(msg)
                .deliveryResults(results)
                .sentAt(overallStatus == NotificationStatus.SENT ? LocalDateTime.now() : null)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Transactional
    public void notifyStatusChange(ServiceOrder service, String message) {
        dispatchStatusNotifications(service, List.of(NotificationType.EMAIL), Collections.emptyList(), message);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getAllNotifications(Pageable pageable) {
        return notificationRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    private NotificationDTO mapToDTO(Notification entity) {
        if (entity == null) {
            return null;
        }
        return NotificationDTO.builder()
                .notificationId(entity.getNotificationId())
                .serviceId(entity.getServiceOrder() != null ? entity.getServiceOrder().getServiceId() : null)
                .serviceName(entity.getServiceOrder() != null ? entity.getServiceOrder().getServiceName() : null)
                .customerId(entity.getCustomer() != null ? entity.getCustomer().getCustomerId() : null)
                .customerName(entity.getCustomer() != null ? entity.getCustomer().getFullName() : null)
                .notificationType(entity.getNotificationType() != null ? entity.getNotificationType() : NotificationType.EMAIL)
                .recipient(entity.getRecipient() != null ? entity.getRecipient() : "-")
                .status(entity.getStatus() != null ? entity.getStatus() : NotificationStatus.PENDING)
                .failureReason(entity.getFailureReason())
                .messageContent(entity.getMessageContent())
                .sentAt(entity.getSentAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}