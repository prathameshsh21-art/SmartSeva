package com.smartseva.servicecatalog.dto;

import com.smartseva.servicecatalog.entity.PendingReason;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ServiceStatusUpdateRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "New status is required")
    private ServiceStatus status;

    private PendingReason pendingReason;
    private String remarks;
}