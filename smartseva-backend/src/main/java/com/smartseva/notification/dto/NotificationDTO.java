package com.smartseva.notification.dto;

import com.smartseva.notification.entity.NotificationStatus;
import com.smartseva.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long notificationId;
    private Long serviceId;
    private String serviceName;
    private Long customerId;
    private String customerName;
    private NotificationType notificationType;
    private String recipient;
    private NotificationStatus status;
    private String failureReason;
    private String messageContent;
    private List<ChannelDeliveryResultDTO> deliveryResults;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}