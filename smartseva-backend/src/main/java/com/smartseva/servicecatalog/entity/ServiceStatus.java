package com.smartseva.servicecatalog.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ServiceStatus {
    NEW,
    IN_PROGRESS,
    PENDING,
    WAITING_FOR_DOCUMENT,
    SERVER_ISSUE,
    COMPLETED,
    ARCHIVED;

    @JsonCreator
    public static ServiceStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (ServiceStatus status : ServiceStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return null;
    }
}