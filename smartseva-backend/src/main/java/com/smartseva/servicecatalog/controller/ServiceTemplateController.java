package com.smartseva.servicecatalog.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.servicecatalog.dto.ServiceTemplateDTO;
import com.smartseva.servicecatalog.service.ServiceTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class ServiceTemplateController {

    private final ServiceTemplateService templateService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServiceTemplateDTO>> createTemplate(@Valid @RequestBody ServiceTemplateDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Service template created", templateService.createTemplate(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceTemplateDTO>>> getActiveTemplates() {
        return ResponseEntity.ok(ApiResponse.success("Templates list retrieved", templateService.getActiveTemplates()));
    }
}