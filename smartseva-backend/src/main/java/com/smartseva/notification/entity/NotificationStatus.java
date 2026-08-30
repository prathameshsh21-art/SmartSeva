package com.smartseva.notification.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum NotificationStatus {
    PENDING,
    SENT,
    FAILED;

    @JsonCreator
    public static NotificationStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (NotificationStatus status : NotificationStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return null;
    }
}