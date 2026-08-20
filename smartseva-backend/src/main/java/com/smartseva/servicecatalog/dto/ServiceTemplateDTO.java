package com.smartseva.servicecatalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTemplateDTO {
    private Long templateId;

    @NotBlank(message = "Service name is required")
    private String serviceName;

    private String portalUrl;
    private String description;
    private String suggestedDocuments;
    private boolean active;
}