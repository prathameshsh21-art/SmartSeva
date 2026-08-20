package com.smartseva.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDTO {

    private Long activityId;

    private String action;

    private String description;

    private LocalDateTime timestamp;

    private Long serviceId;

    private String serviceName;

    private Long staffId;

    private String staffName;
}