package com.smartseva.servicecatalog.service;

import com.smartseva.common.exception.BadRequestException;
import com.smartseva.servicecatalog.dto.ServiceTemplateDTO;
import com.smartseva.servicecatalog.entity.ServiceTemplate;
import com.smartseva.servicecatalog.repository.ServiceTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceTemplateService {

    private final ServiceTemplateRepository templateRepository;

    @Transactional
    public ServiceTemplateDTO createTemplate(ServiceTemplateDTO dto) {
        if (templateRepository.existsByServiceName(dto.getServiceName())) {
            throw new BadRequestException("Service template already exists");
        }

        ServiceTemplate template = ServiceTemplate.builder()
                .serviceName(dto.getServiceName())
                .portalUrl(dto.getPortalUrl())
                .description(dto.getDescription())
                .suggestedDocuments(dto.getSuggestedDocuments())
                .active(true)
                .build();

        return mapToDTO(templateRepository.save(template));
    }

    @Transactional(readOnly = true)
    public List<ServiceTemplateDTO> getActiveTemplates() {
        return templateRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ServiceTemplateDTO mapToDTO(ServiceTemplate entity) {
        return ServiceTemplateDTO.builder()
                .templateId(entity.getTemplateId())
                .serviceName(entity.getServiceName())
                .portalUrl(entity.getPortalUrl())
                .description(entity.getDescription())
                .suggestedDocuments(entity.getSuggestedDocuments())
                .active(entity.isActive())
                .build();
    }
}