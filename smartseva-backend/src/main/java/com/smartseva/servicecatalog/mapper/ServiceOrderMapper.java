package com.smartseva.servicecatalog.mapper;

import com.smartseva.servicecatalog.dto.ServiceOrderDTO;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import org.springframework.stereotype.Component;

@Component
public class ServiceOrderMapper {

    public ServiceOrderDTO toDTO(ServiceOrder entity) {
        if (entity == null) {
            return null;
        }
        return ServiceOrderDTO.builder()
                .serviceId(entity.getServiceId())
                .customerId(entity.getCustomer() != null ? entity.getCustomer().getCustomerId() : null)
                .customerName(entity.getCustomer() != null ? entity.getCustomer().getFullName() : null)
                .customerPhone(entity.getCustomer() != null ? entity.getCustomer().getPhoneNumber() : null)
                .staffId(entity.getAssignedStaff() != null ? entity.getAssignedStaff().getStaffId() : null)
                .staffName(entity.getAssignedStaff() != null ? entity.getAssignedStaff().getFullName() : null)
                .serviceName(entity.getServiceName())
                .portalLink(entity.getPortalLink())
                .applicationNumber(entity.getApplicationNumber())
                .status(entity.getStatus())
                .pendingReason(entity.getPendingReason())
                .remarks(entity.getRemarks())
                .createdDate(entity.getCreatedDate())
                .completedDate(entity.getCompletedDate())
                .archivedDate(entity.getArchivedDate())
                .build();
    }
}