package com.smartseva.dashboard.controller;

import com.smartseva.activity.dto.ActivityLogDTO;
import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.dto.ApiResponse;
import com.smartseva.dashboard.dto.DashboardStatsDTO;
import com.smartseva.dashboard.service.DashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardAnalyticsService dashboardAnalyticsService;
    private final ActivityLogService activityLogService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard metrics retrieved",
                        dashboardAnalyticsService.getDashboardStats()
                )
        );
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<ApiResponse<List<ActivityLogDTO>>> getRecentActivities() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Recent activities retrieved",
                        activityLogService.getRecentActivities()
                )
        );
    }
}