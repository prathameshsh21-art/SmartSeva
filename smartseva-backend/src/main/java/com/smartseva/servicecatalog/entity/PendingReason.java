package com.smartseva.servicecatalog.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PendingReason {
    MISSING_DOCUMENTS,
    SERVER_DOWN,
    INCORRECT_INFO,
    PAYMENT_FAILED,
    PORTAL_ERROR,
    DOCUMENT_VERIFICATION,
    OTHER;

    @JsonCreator
    public static PendingReason fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (PendingReason reason : PendingReason.values()) {
            if (reason.name().equalsIgnoreCase(value.trim())) {
                return reason;
            }
        }
        return null;
    }
}