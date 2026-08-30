package com.smartseva.activity.controller;

import com.smartseva.activity.dto.ActivityLogDTO;
import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActivityLogDTO>>> getAllActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ActivityLogDTO> result = activityLogService.getAllActivities(
                PageRequest.of(page, size, Sort.by("timestamp").descending()));
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", result));
    }

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