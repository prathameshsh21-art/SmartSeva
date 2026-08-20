package com.smartseva.notification.service;

import com.smartseva.notification.dto.NotificationDTO;
import com.smartseva.notification.dto.SendNotificationRequest;
import com.smartseva.notification.entity.NotificationStatus;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    public NotificationDTO sendCompletionNotification(
            SendNotificationRequest request) {

        NotificationDTO notification = new NotificationDTO();

        notification.setServiceId(request.getServiceId());
        notification.setNotificationType(request.getNotificationType());
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        notification.setCreatedAt(LocalDateTime.now());

        return notification;
    }
}