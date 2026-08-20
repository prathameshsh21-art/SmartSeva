package com.smartseva.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private DateUtils() {
        // Prevent instantiation
    }

    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DateTimeFormatter.ofPattern(DATE_FORMAT)) : null;
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern(DATE_TIME_FORMAT)) : null;
    }

    public static LocalDate parseDate(String dateStr) {
        return dateStr != null && !dateStr.isBlank() ? LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(DATE_FORMAT)) : null;
    }
}