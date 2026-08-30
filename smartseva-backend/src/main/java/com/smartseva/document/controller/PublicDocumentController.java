package com.smartseva.document.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.common.exception.BadRequestException;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.customer.entity.Customer;
import com.smartseva.document.dto.DocumentDTO;
import com.smartseva.document.dto.PublicDocumentVerifyRequest;
import com.smartseva.document.service.DocumentManagementService;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.smartseva.document.dto.PublicDocumentVerifyResponse;
import com.smartseva.security.jwt.JwtUtils;

@RestController
@RequestMapping("/api/public/documents")
@RequiredArgsConstructor
public class PublicDocumentController {

    private final ServiceOrderRepository serviceOrderRepository;
    private final DocumentManagementService documentService;
    private final JwtUtils jwtUtils;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PublicDocumentVerifyResponse>> verifyAndGetDocuments(
            @Valid @RequestBody PublicDocumentVerifyRequest request) {
        ServiceOrder service = serviceOrderRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", request.getServiceId()));

        Customer customer = service.getCustomer();

        if (!customer.getPhoneNumber().equals(request.getPhoneNumber()) || !customer.getDateOfBirth().equals(request.getDateOfBirth())) {
            throw new BadRequestException("Verification failed: Phone number or Date of Birth does not match customer records.");
        }

        List<DocumentDTO> documents = documentService.getDocumentsForService(service.getServiceId());
        List<Long> documentIds = documents.stream().map(DocumentDTO::getDocumentId).toList();
        String token = jwtUtils.generatePublicDownloadToken(service.getServiceId(), documentIds);

        PublicDocumentVerifyResponse response = PublicDocumentVerifyResponse.builder()
                .token(token)
                .serviceId(service.getServiceId())
                .serviceName(service.getServiceName())
                .customerName(customer.getFullName())
                .documents(documents)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Verification successful", response));
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> publicDownload(
            @PathVariable Long documentId,
            @RequestParam("token") String token) {

        if (token == null || token.isBlank() || !jwtUtils.validatePublicDownloadToken(token, documentId)) {
            throw new BadRequestException("Access denied: Invalid, expired, or unauthorized document download token.");
        }

        Resource fileResource = documentService.downloadDocument(documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileResource.getFilename() + "\"")
                .body(fileResource);
    }
}