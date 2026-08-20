package com.smartseva.notification.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.notification.dto.NotificationDTO;
import com.smartseva.notification.dto.SendNotificationRequest;
import com.smartseva.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NotificationDTO>> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {

        NotificationDTO response =
                notificationService.sendCompletionNotification(request);

        return ResponseEntity.ok(
                ApiResponse.success("Notification processed", response)
        );
    }
}