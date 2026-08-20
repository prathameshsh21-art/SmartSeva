package com.smartseva.servicecatalog.service;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.exception.BadRequestException;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.servicecatalog.dto.ServiceOrderDTO;
import com.smartseva.servicecatalog.dto.ServiceStatusUpdateRequest;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.servicecatalog.mapper.ServiceOrderMapper;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ServiceOrderManagementService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final ActivityLogService activityLogService;
    private final ServiceOrderMapper serviceOrderMapper;

    @Transactional
    public ServiceOrderDTO createService(ServiceOrderDTO dto, String currentUsername) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", dto.getCustomerId()));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        ServiceOrder serviceOrder = ServiceOrder.builder()
                .customer(customer)
                .assignedStaff(staff)
                .serviceName(dto.getServiceName())
                .portalLink(dto.getPortalLink())
                .applicationNumber(dto.getApplicationNumber())
                .status(ServiceStatus.NEW)
                .remarks(dto.getRemarks())
                .build();

        ServiceOrder saved = serviceOrderRepository.save(serviceOrder);
        activityLogService.logActivity(staff, saved, "SERVICE_CREATED", "Service initialized for " + customer.getFullName());

        return serviceOrderMapper.toDTO(saved);
    }

    @Transactional
    public ServiceOrderDTO updateStatus(ServiceStatusUpdateRequest request, String currentUsername) {
        ServiceOrder service = serviceOrderRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", request.getServiceId()));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        if (service.getStatus() == ServiceStatus.COMPLETED && !staff.getRole().name().equals("ROLE_ADMIN")) {
            throw new BadRequestException("Only Administrators can modify a completed service.");
        }

        service.setStatus(request.getStatus());
        service.setPendingReason(request.getPendingReason());
        if (request.getRemarks() != null) {
            service.setRemarks(request.getRemarks());
        }

        if (request.getStatus() == ServiceStatus.COMPLETED) {
            service.setCompletedDate(LocalDateTime.now());
        }

        ServiceOrder updated = serviceOrderRepository.save(service);
        activityLogService.logActivity(staff, updated, "STATUS_UPDATED", "Status updated to " + request.getStatus());

        return serviceOrderMapper.toDTO(updated);
    }

    @Transactional(readOnly = true)
    public ServiceOrderDTO getServiceById(Long id) {
        ServiceOrder service = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", id));
        return serviceOrderMapper.toDTO(service);
    }

    @Transactional(readOnly = true)
    public Page<ServiceOrderDTO> searchServices(String query, Pageable pageable) {
        return serviceOrderRepository.searchServices(query, pageable).map(serviceOrderMapper::toDTO);
    }
}