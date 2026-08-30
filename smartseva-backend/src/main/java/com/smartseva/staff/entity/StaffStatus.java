package com.smartseva.staff.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum StaffStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED;

    @JsonCreator
    public static StaffStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (StaffStatus status : StaffStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return null;
    }
}