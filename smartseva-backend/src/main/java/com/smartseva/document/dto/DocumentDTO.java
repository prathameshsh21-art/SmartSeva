package com.smartseva.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long documentId;
    private Long serviceId;
    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private Long uploadedById;
    private String uploadedByName;
    private boolean deleted;
}