package com.smartseva.servicecatalog.dto;

import com.smartseva.notification.entity.NotificationType;
import com.smartseva.servicecatalog.entity.PendingReason;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStatusUpdateRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "New status is required")
    private ServiceStatus status;

    private PendingReason pendingReason;
    private String remarks;

    // Explicitly selected communication channels (SMS, WHATSAPP, EMAIL)
    private List<NotificationType> channels;

    // Document IDs to share with the customer (especially for COMPLETED status)
    private List<Long> documentIds;
}