package com.smartseva.servicecatalog.controller;
import org.springframework.http.MediaType;
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

    @PatchMapping(value = "/status", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> updateStatus(
            @Valid @RequestBody ServiceStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Service status updated", serviceOrderService.updateStatus(request, userDetails.getUsername())));
    }

    @RequestMapping(value = "/status", method = {RequestMethod.POST, RequestMethod.PATCH}, consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> updateStatusWithFiles(
            @ModelAttribute ServiceStatusUpdateRequest request,
            @RequestPart(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Service status updated", serviceOrderService.updateStatusWithFiles(request, files, userDetails.getUsername())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ServiceOrderDTO>>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ServiceOrderDTO> result = serviceOrderService.getAllServices(PageRequest.of(page, size, Sort.by("createdDate").descending()));
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Service details retrieved", serviceOrderService.getServiceById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<java.util.List<ServiceOrderDTO>>> getServicesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success("Customer services retrieved", serviceOrderService.getServicesByCustomer(customerId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceOrderDTO>> updateService(
            @PathVariable Long id,
            @RequestBody ServiceOrderDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Service details updated", serviceOrderService.updateService(id, dto, userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        serviceOrderService.archiveService(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Service archived successfully", null));
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