package com.smartseva.notification.dto;

import com.smartseva.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {

    private Long customerId;

    private Long serviceId;

    private NotificationType notificationType;

    private List<NotificationType> channels;

    private String message;

    private List<Long> documentIdsToShare;
}