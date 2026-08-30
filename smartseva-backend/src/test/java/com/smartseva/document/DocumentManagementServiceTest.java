package com.smartseva.document;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.customer.entity.Customer;
import com.smartseva.document.dto.DocumentDTO;
import com.smartseva.document.entity.Document;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.document.service.DocumentManagementService;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.repository.StaffRepository;
import com.smartseva.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DocumentManagementServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private DocumentManagementService documentService;

    private Customer customer;
    private ServiceOrder serviceOrder;
    private Staff staff;
    private Document document;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId(1L)
                .phoneNumber("9876543210")
                .build();

        serviceOrder = ServiceOrder.builder()
                .serviceId(10L)
                .customer(customer)
                .build();

        staff = Staff.builder()
                .staffId(5L)
                .username("operator1")
                .fullName("Operator One")
                .build();

        document = Document.builder()
                .documentId(50L)
                .serviceOrder(serviceOrder)
                .originalFileName("aadhaar_card.pdf")
                .storedFileName("uuid_aadhaar.pdf")
                .filePath("customers/9876543210/10/uuid_aadhaar.pdf")
                .fileType("application/pdf")
                .fileSize(1024L)
                .uploadedBy(staff)
                .deleted(false)
                .build();
    }

    @Test
    void testUploadDocumentSuccess() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "aadhaar_card.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        when(serviceOrderRepository.findById(10L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(fileStorageService.storeFile(eq(file), anyString())).thenReturn("customers/9876543210/10/uuid_aadhaar.pdf");
        when(documentRepository.save(any(Document.class))).thenReturn(document);

        DocumentDTO result = documentService.uploadDocument(10L, file, "operator1");

        assertNotNull(result);
        assertEquals("aadhaar_card.pdf", result.getOriginalFileName());
        assertEquals(50L, result.getDocumentId());
        verify(activityLogService, times(1)).logActivity(eq(staff), eq(serviceOrder), eq("DOCUMENT_UPLOADED"), anyString());
    }

    @Test
    void testGetAllDocumentsPaginated() {
        Page<Document> page = new PageImpl<>(List.of(document));
        when(documentRepository.findByDeletedFalse(any(PageRequest.class))).thenReturn(page);

        Page<DocumentDTO> result = documentService.getAllDocuments(PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("aadhaar_card.pdf", result.getContent().get(0).getOriginalFileName());
        assertEquals("Operator One", result.getContent().get(0).getUploadedByName());
    }

    @Test
    void testGetAllDocumentsWithNullUploadedByDoesNotThrow() {
        Document docWithoutStaff = Document.builder()
                .documentId(51L)
                .originalFileName("ration_card.pdf")
                .deleted(false)
                .build();

        Page<Document> page = new PageImpl<>(List.of(docWithoutStaff));
        when(documentRepository.findByDeletedFalse(any(PageRequest.class))).thenReturn(page);

        Page<DocumentDTO> result = documentService.getAllDocuments(PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("ration_card.pdf", result.getContent().get(0).getOriginalFileName());
        assertEquals("System", result.getContent().get(0).getUploadedByName());
    }

    @Test
    void testGetDocumentsForService() {
        when(documentRepository.findByServiceOrderServiceIdAndDeletedFalse(10L)).thenReturn(List.of(document));

        List<DocumentDTO> list = documentService.getDocumentsForService(10L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("aadhaar_card.pdf", list.get(0).getOriginalFileName());
    }

    @Test
    void testDeleteDocumentSoftDelete() {
        when(documentRepository.findById(50L)).thenReturn(Optional.of(document));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));

        documentService.deleteDocument(50L, "operator1");

        assertTrue(document.isDeleted());
        assertNotNull(document.getDeletedAt());
        verify(documentRepository, times(1)).save(document);
        verify(fileStorageService, times(1)).deleteFile(document.getFilePath());
        verify(activityLogService, times(1)).logActivity(eq(staff), eq(serviceOrder), eq("DOCUMENT_DELETED"), anyString());
    }
}