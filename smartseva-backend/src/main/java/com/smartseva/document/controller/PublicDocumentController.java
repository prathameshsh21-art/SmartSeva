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

@RestController
@RequestMapping("/api/public/documents")
@RequiredArgsConstructor
public class PublicDocumentController {

    private final ServiceOrderRepository serviceOrderRepository;
    private final DocumentManagementService documentService;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> verifyAndGetDocuments(@Valid @RequestBody PublicDocumentVerifyRequest request) {
        ServiceOrder service = serviceOrderRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", request.getServiceId()));

        Customer customer = service.getCustomer();

        if (!customer.getPhoneNumber().equals(request.getPhoneNumber()) || !customer.getDateOfBirth().equals(request.getDateOfBirth())) {
            throw new BadRequestException("Verification failed: Phone number or Date of Birth does not match customer records.");
        }

        List<DocumentDTO> documents = documentService.getDocumentsForService(service.getServiceId());
        return ResponseEntity.ok(ApiResponse.success("Verification successful", documents));
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> publicDownload(@PathVariable Long documentId) {
        Resource fileResource = documentService.downloadDocument(documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileResource.getFilename() + "\"")
                .body(fileResource);
    }
}