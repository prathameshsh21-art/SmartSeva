package com.smartseva.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalCustomers;
    private long totalServices;
    private long pendingServices;
    private long completedToday;
    private long documentsUploaded;
}