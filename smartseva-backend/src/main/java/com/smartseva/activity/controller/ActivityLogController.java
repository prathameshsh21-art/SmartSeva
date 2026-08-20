package com.smartseva.activity.controller;

import com.smartseva.activity.dto.ActivityLogDTO;
import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<ActivityLogDTO>>> getRecentActivities() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Recent activity log retrieved",
                        activityLogService.getRecentActivities()
                )
        );
    }
}