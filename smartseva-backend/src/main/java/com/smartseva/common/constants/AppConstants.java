package com.smartseva.common.constants;

public final class AppConstants {

    private AppConstants() {
        // Prevent instantiation
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY_CREATED = "createdDate";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_STAFF = "ROLE_STAFF";

    public static final long MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    public static final String[] ALLOWED_FILE_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "docx"};

    public static final String NOTIFICATION_EMAIL_SUBJECT = "Application Status Update - SmartSeva";
}