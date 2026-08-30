package com.smartseva.notification.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum NotificationType {
    EMAIL,
    SMS,
    WHATSAPP;

    @JsonCreator
    public static NotificationType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (NotificationType type : NotificationType.values()) {
            if (type.name().equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        return null;
    }
}