package com.smartseva.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicDocumentVerifyResponse {
    private String token;
    private Long serviceId;
    private String serviceName;
    private String customerName;
    private List<DocumentDTO> documents;
}
