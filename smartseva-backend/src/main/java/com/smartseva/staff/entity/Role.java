package com.smartseva.staff.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    ROLE_ADMIN,
    ROLE_STAFF;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String clean = value.trim().toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(clean)) {
                return role;
            }
        }
        return null;
    }
}