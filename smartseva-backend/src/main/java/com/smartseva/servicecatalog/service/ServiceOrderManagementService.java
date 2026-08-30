package com.smartseva.servicecatalog.service;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.exception.BadRequestException;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.document.entity.Document;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.service.NotificationService;
import com.smartseva.security.encryption.CredentialEncryptionService;
import com.smartseva.servicecatalog.dto.ServiceOrderDTO;
import com.smartseva.servicecatalog.dto.ServiceStatusUpdateRequest;
import com.smartseva.servicecatalog.entity.PendingReason;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.servicecatalog.mapper.ServiceOrderMapper;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.repository.StaffRepository;
import com.smartseva.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceOrderManagementService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final DocumentRepository documentRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final ServiceOrderMapper serviceOrderMapper;
    private final CredentialEncryptionService credentialEncryptionService;

    @Transactional
    public ServiceOrderDTO createService(ServiceOrderDTO dto, String currentUsername) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", dto.getCustomerId()));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        ServiceStatus initialStatus = dto.getStatus() != null ? dto.getStatus() : ServiceStatus.NEW;
        PendingReason pendingReason = null;
        if (initialStatus == ServiceStatus.PENDING) {
            if (dto.getPendingReason() == null) {
                throw new BadRequestException("Pending reason is required when service status is PENDING");
            }
            pendingReason = dto.getPendingReason();
        } else if (initialStatus == ServiceStatus.WAITING_FOR_DOCUMENT || initialStatus == ServiceStatus.SERVER_ISSUE) {
            pendingReason = dto.getPendingReason();
        }

        String encPassword = (dto.getPortalPassword() != null && !dto.getPortalPassword().isBlank() && initialStatus != ServiceStatus.COMPLETED)
                ? credentialEncryptionService.encrypt(dto.getPortalPassword().trim())
                : null;

        ServiceOrder serviceOrder = ServiceOrder.builder()
                .customer(customer)
                .assignedStaff(staff)
                .serviceName(dto.getServiceName())
                .portalLink(dto.getPortalLink())
                .applicationNumber(dto.getApplicationNumber())
                .portalLoginId(dto.getPortalLoginId() != null ? dto.getPortalLoginId().trim() : null)
                .encryptedPortalPassword(encPassword)
                .status(initialStatus)
                .pendingReason(pendingReason)
                .remarks(dto.getRemarks())
                .build();

        ServiceOrder saved = serviceOrderRepository.save(serviceOrder);
        activityLogService.logActivity(staff, saved, "SERVICE_CREATED", "Service order initialized for " + customer.getFullName());

        return serviceOrderMapper.toDTO(saved);
    }

    @Transactional
    public ServiceOrderDTO updateStatusWithFiles(ServiceStatusUpdateRequest request, List<org.springframework.web.multipart.MultipartFile> files, String currentUsername) {
        ServiceOrder service = serviceOrderRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", request.getServiceId()));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        if (service.getStatus() == ServiceStatus.COMPLETED && !staff.getRole().name().equals("ROLE_ADMIN")) {
            throw new BadRequestException("Only Administrators can modify a completed service.");
        }

        if (request.getStatus() == ServiceStatus.PENDING && request.getPendingReason() == null) {
            throw new BadRequestException("Pending reason is required when status is PENDING");
        }

        service.setStatus(request.getStatus());
        if (request.getStatus() == ServiceStatus.PENDING || 
            request.getStatus() == ServiceStatus.WAITING_FOR_DOCUMENT || 
            request.getStatus() == ServiceStatus.SERVER_ISSUE) {
            service.setPendingReason(request.getPendingReason());
        } else {
            service.setPendingReason(null);
        }

        if (request.getRemarks() != null) {
            service.setRemarks(request.getRemarks());
        }

        // COMPLETED status password lifecycle enforcement:
        // When status transitions to COMPLETED, permanently delete the temporary password in MySQL
        if (request.getStatus() == ServiceStatus.COMPLETED) {
            service.setEncryptedPortalPassword(null);
            service.setCompletedDate(LocalDateTime.now());
        }

        ServiceOrder updated = serviceOrderRepository.save(service);
        String auditMsg = request.getStatus() == ServiceStatus.COMPLETED
                ? "Status updated to COMPLETED (Temporary password permanently erased)"
                : "Status updated to " + request.getStatus();
        activityLogService.logActivity(staff, updated, "STATUS_UPDATED", auditMsg);

        List<Document> documentsToSend = new java.util.ArrayList<>();

        // Handle completion-time uploaded documents
        if (files != null && !files.isEmpty()) {
            String customerPhone = updated.getCustomer() != null && updated.getCustomer().getPhoneNumber() != null
                    ? updated.getCustomer().getPhoneNumber().trim()
                    : "unknown";
            String subFolder = "customers/" + customerPhone + "/" + updated.getServiceId();

            for (org.springframework.web.multipart.MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String storedFilePath = fileStorageService.storeFile(file, subFolder);
                    Document doc = Document.builder()
                            .serviceOrder(updated)
                            .originalFileName(file.getOriginalFilename())
                            .storedFileName(storedFilePath.substring(storedFilePath.lastIndexOf('/') + 1))
                            .filePath(storedFilePath)
                            .fileType(file.getContentType())
                            .fileSize(file.getSize())
                            .uploadedBy(staff)
                            .deleted(false)
                            .build();
                    Document savedDoc = documentRepository.save(doc);
                    activityLogService.logActivity(staff, updated, "DOCUMENT_UPLOADED", "Uploaded completion file: " + file.getOriginalFilename());
                    documentsToSend.add(savedDoc);
                }
            }
        }

        // Retrieve existing selected documents if provided and strictly validate ownership
        if (request.getDocumentIds() != null && !request.getDocumentIds().isEmpty()) {
            List<Document> loadedDocs = documentRepository.findAllById(request.getDocumentIds());
            if (loadedDocs.size() != request.getDocumentIds().size()) {
                throw new BadRequestException("One or more selected documents do not exist.");
            }
            for (Document doc : loadedDocs) {
                if (doc.isDeleted() || doc.getServiceOrder() == null || !doc.getServiceOrder().getServiceId().equals(service.getServiceId())) {
                    throw new BadRequestException("Access denied: Document #" + doc.getDocumentId() + " does not belong to this service order.");
                }
                if (!documentsToSend.contains(doc)) {
                    documentsToSend.add(doc);
                }
            }
        }

        // Dispatch notifications via explicitly selected communication channels
        List<ChannelDeliveryResultDTO> notificationResults = Collections.emptyList();
        if (request.getChannels() != null && !request.getChannels().isEmpty()) {
            notificationResults = notificationService.dispatchStatusNotifications(
                    updated,
                    request.getChannels(),
                    documentsToSend,
                    request.getRemarks()
            );
        }

        ServiceOrderDTO dto = serviceOrderMapper.toDTO(updated);
        dto.setNotificationResults(notificationResults);
        if (!documentsToSend.isEmpty()) {
            dto.setSharedDocumentNames(documentsToSend.stream().map(Document::getOriginalFileName).toList());
        }

        return dto;
    }

    @Transactional
    public ServiceOrderDTO updateStatus(ServiceStatusUpdateRequest request, String currentUsername) {
        return updateStatusWithFiles(request, Collections.emptyList(), currentUsername);
    }

    @Transactional(readOnly = true)
    public List<ServiceOrderDTO> getServicesByCustomer(Long customerId) {
        return serviceOrderRepository.findByCustomerCustomerId(customerId).stream()
                .filter(s -> s.getStatus() != ServiceStatus.ARCHIVED)
                .map(serviceOrderMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ServiceOrderDTO> getAllServices(Pageable pageable) {
        return serviceOrderRepository.findByStatusNot(ServiceStatus.ARCHIVED, pageable)
                .map(serviceOrderMapper::toDTO);
    }

    @Transactional
    public ServiceOrderDTO updateService(Long id, ServiceOrderDTO dto, String currentUsername) {
        ServiceOrder service = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", id));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        if (dto.getServiceName() != null && !dto.getServiceName().isBlank()) {
            service.setServiceName(dto.getServiceName());
        }
        if (dto.getPortalLink() != null) {
            service.setPortalLink(dto.getPortalLink());
        }
        if (dto.getApplicationNumber() != null) {
            service.setApplicationNumber(dto.getApplicationNumber());
        }
        if (dto.getPortalLoginId() != null) {
            service.setPortalLoginId(dto.getPortalLoginId().trim());
        }
        if (dto.getPortalPassword() != null) {
            if (!dto.getPortalPassword().isBlank() && service.getStatus() != ServiceStatus.COMPLETED) {
                service.setEncryptedPortalPassword(credentialEncryptionService.encrypt(dto.getPortalPassword().trim()));
            } else if (dto.getPortalPassword().isBlank()) {
                service.setEncryptedPortalPassword(null);
            }
        }
        if (dto.getRemarks() != null) {
            service.setRemarks(dto.getRemarks());
        }

        ServiceOrder updated = serviceOrderRepository.save(service);
        activityLogService.logActivity(staff, updated, "SERVICE_UPDATED", "Service order details updated");

        return getServiceById(updated.getServiceId());
    }

    @Transactional
    public void archiveService(Long id, String currentUsername) {
        ServiceOrder service = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", id));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        service.setStatus(ServiceStatus.ARCHIVED);
        service.setArchivedDate(LocalDateTime.now());
        serviceOrderRepository.save(service);

        activityLogService.logActivity(staff, service, "SERVICE_ARCHIVED", "Service order moved to archive");
    }

    @Transactional(readOnly = true)
    public ServiceOrderDTO getServiceById(Long id) {
        ServiceOrder service = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", id));
        ServiceOrderDTO dto = serviceOrderMapper.toDTO(service);
        if (service.getEncryptedPortalPassword() != null && service.getStatus() != ServiceStatus.COMPLETED) {
            dto.setPortalPassword(credentialEncryptionService.decrypt(service.getEncryptedPortalPassword()));
            dto.setHasTemporaryPassword(true);
        } else {
            dto.setPortalPassword(null);
            dto.setHasTemporaryPassword(false);
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<ServiceOrderDTO> searchServices(String query, Pageable pageable) {
        return serviceOrderRepository.searchServices(query, pageable).map(serviceOrderMapper::toDTO);
    }
}