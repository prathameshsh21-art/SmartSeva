package com.smartseva.notification.dto;

import com.smartseva.notification.entity.NotificationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SendNotificationRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Notification type is required")
    private NotificationType notificationType;

    private List<Long> documentIdsToShare;
}