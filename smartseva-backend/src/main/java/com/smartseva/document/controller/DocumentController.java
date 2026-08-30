package com.smartseva.document.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.document.dto.DocumentDTO;
import com.smartseva.document.service.DocumentManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentManagementService documentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DocumentDTO>>> getAllDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DocumentDTO> result = documentService.getAllDocuments(
                PageRequest.of(page, size, Sort.by("uploadedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", result));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @RequestParam("serviceId") Long serviceId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        DocumentDTO result = documentService.uploadDocument(serviceId, file, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", result));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getDocumentsByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(ApiResponse.success("Documents list retrieved", documentService.getDocumentsForService(serviceId)));
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        Resource fileResource = documentService.downloadDocument(documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileResource.getFilename() + "\"")
                .body(fileResource);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        documentService.deleteDocument(documentId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Document removed successfully"));
    }
}