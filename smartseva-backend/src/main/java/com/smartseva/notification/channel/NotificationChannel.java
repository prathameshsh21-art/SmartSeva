package com.smartseva.notification.channel;

import com.smartseva.document.entity.Document;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.servicecatalog.entity.ServiceOrder;

import java.util.List;

public interface NotificationChannel {
    NotificationType getChannelType();
    ChannelDeliveryResultDTO sendNotification(ServiceOrder service, String message, List<Document> documents);
}