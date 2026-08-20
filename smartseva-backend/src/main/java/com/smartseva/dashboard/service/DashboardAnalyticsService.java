package com.smartseva.dashboard.service;

import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.dashboard.dto.DashboardStatsDTO;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardAnalyticsService {

    private final CustomerRepository customerRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalCustomers = customerRepository.countByIsArchivedFalse();
        long totalServices = serviceOrderRepository.count();
        long pendingServices = serviceOrderRepository.countByStatusIn(List.of(
                ServiceStatus.NEW, ServiceStatus.IN_PROGRESS, ServiceStatus.PENDING,
                ServiceStatus.WAITING_FOR_DOCUMENT, ServiceStatus.SERVER_ISSUE
        ));
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        long completedToday = serviceOrderRepository.countCompletedToday(startOfDay);
        long documentsUploaded = documentRepository.countByDeletedFalse();

        return DashboardStatsDTO.builder()
                .totalCustomers(totalCustomers)
                .totalServices(totalServices)
                .pendingServices(pendingServices)
                .completedToday(completedToday)
                .documentsUploaded(documentsUploaded)
                .build();
    }
}