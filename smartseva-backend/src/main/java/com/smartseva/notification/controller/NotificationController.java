package com.smartseva.notification.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.notification.dto.NotificationDTO;
import com.smartseva.notification.dto.SendNotificationRequest;
import com.smartseva.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<NotificationDTO> result = notificationService.getAllNotifications(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", result));
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