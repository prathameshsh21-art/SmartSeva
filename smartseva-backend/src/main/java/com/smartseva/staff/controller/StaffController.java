package com.smartseva.staff.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.staff.dto.CreateStaffRequest;
import com.smartseva.staff.dto.ResetPasswordRequest;
import com.smartseva.staff.dto.StaffDTO;
import com.smartseva.staff.entity.StaffStatus;
import com.smartseva.staff.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffDTO>> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Staff account created successfully", staffService.createStaff(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<StaffDTO>>> getAllStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<StaffDTO> result = staffService.getAllStaff(PageRequest.of(page, size, Sort.by("fullName").ascending()));
        return ResponseEntity.ok(ApiResponse.success("Staff list retrieved", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffDTO>> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Staff details retrieved", staffService.getStaffById(id)));
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request) {
        staffService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success("Staff password reset successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffDTO>> updateStatus(@PathVariable Long id, @RequestParam StaffStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Staff status updated", staffService.updateStatus(id, status)));
    }
}