package com.smartseva.notification.dto;

import com.smartseva.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelDeliveryResultDTO {
    private NotificationType channel;
    private boolean success;
    private String status; // SENT, FAILED, NOT_CONFIGURED
    private String recipient;
    private String message;
    private String failureReason;
    private String actionLink; // e.g. "sms:+918050653488?body=..." or "https://wa.me/918050653488?text=..."
    private String rawMessage; // Raw formatted notification text for staff review/clipboard
}