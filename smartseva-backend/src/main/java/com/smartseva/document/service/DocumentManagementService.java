package com.smartseva.document.service;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.document.dto.DocumentDTO;
import com.smartseva.document.entity.Document;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.repository.StaffRepository;
import com.smartseva.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentManagementService {

    private final DocumentRepository documentRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final StaffRepository staffRepository;
    private final FileStorageService fileStorageService;
    private final ActivityLogService activityLogService;

    @Transactional
    public DocumentDTO uploadDocument(Long serviceId, MultipartFile file, String currentUsername) {
        ServiceOrder serviceOrder = serviceOrderRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceOrder", "id", serviceId));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        String subFolder = "customers/" + serviceOrder.getCustomer().getPhoneNumber() + "/" + serviceId;
        String storedFilePath = fileStorageService.storeFile(file, subFolder);

        Document document = Document.builder()
                .serviceOrder(serviceOrder)
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedFilePath.substring(storedFilePath.lastIndexOf('/') + 1))
                .filePath(storedFilePath)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(staff)
                .deleted(false)
                .build();

        Document saved = documentRepository.save(document);
        activityLogService.logActivity(staff, serviceOrder, "DOCUMENT_UPLOADED", "Uploaded file: " + file.getOriginalFilename());

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public Resource downloadDocument(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return fileStorageService.loadFileAsResource(doc.getFilePath());
    }

    @Transactional(readOnly = true)
    public Page<DocumentDTO> getAllDocuments(Pageable pageable) {
        return documentRepository.findByDeletedFalse(pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsForService(Long serviceId) {
        return documentRepository.findByServiceOrderServiceIdAndDeletedFalse(serviceId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Long documentId, String currentUsername) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        Staff staff = staffRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "username", currentUsername));

        doc.setDeleted(true);
        doc.setDeletedAt(LocalDateTime.now());
        documentRepository.save(doc);

        fileStorageService.deleteFile(doc.getFilePath());
        activityLogService.logActivity(staff, doc.getServiceOrder(), "DOCUMENT_DELETED", "Deleted file: " + doc.getOriginalFileName());
    }

    private DocumentDTO mapToDTO(Document entity) {
        if (entity == null) {
            return null;
        }
        return DocumentDTO.builder()
                .documentId(entity.getDocumentId())
                .serviceId(entity.getServiceOrder() != null ? entity.getServiceOrder().getServiceId() : null)
                .originalFileName(entity.getOriginalFileName())
                .storedFileName(entity.getStoredFileName())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .uploadedAt(entity.getUploadedAt())
                .uploadedById(entity.getUploadedBy() != null ? entity.getUploadedBy().getStaffId() : null)
                .uploadedByName(entity.getUploadedBy() != null ? entity.getUploadedBy().getFullName() : "System")
                .deleted(entity.isDeleted())
                .build();
    }
}