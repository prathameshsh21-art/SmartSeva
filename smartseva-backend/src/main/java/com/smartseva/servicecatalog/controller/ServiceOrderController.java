package com.smartseva.servicecatalog.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.servicecatalog.dto.ServiceOrderDTO;
import com.smartseva.servicecatalog.dto.ServiceStatusUpdateRequest;
import com.smartseva.servicecatalog.service.ServiceOrderManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceOrderController {

    private final ServiceOrderManagementService serviceOrderService;

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> createService(
            @Valid @RequestBody ServiceOrderDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Service order created", serviceOrderService.createService(dto, userDetails.getUsername())));
    }

    @PatchMapping("/status")
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> updateStatus(
            @Valid @RequestBody ServiceStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Service status updated", serviceOrderService.updateStatus(request, userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Service details retrieved", serviceOrderService.getServiceById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ServiceOrderDTO>>> searchServices(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ServiceOrderDTO> result = serviceOrderService.searchServices(query, PageRequest.of(page, size, Sort.by("createdDate").descending()));
        return ResponseEntity.ok(ApiResponse.success("Services search results", result));
    }
}