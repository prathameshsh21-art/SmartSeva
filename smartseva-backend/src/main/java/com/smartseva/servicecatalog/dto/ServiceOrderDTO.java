package com.smartseva.servicecatalog.dto;

import com.smartseva.servicecatalog.entity.PendingReason;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrderDTO {
    private Long serviceId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
    private String customerName;
    private String customerPhone;

    private Long staffId;
    private String staffName;

    @NotBlank(message = "Service name is required")
    private String serviceName;

    private String portalLink;
    private String applicationNumber;

    private ServiceStatus status;
    private PendingReason pendingReason;
    private String remarks;

    private LocalDateTime createdDate;
    private LocalDateTime completedDate;
    private LocalDateTime archivedDate;
}