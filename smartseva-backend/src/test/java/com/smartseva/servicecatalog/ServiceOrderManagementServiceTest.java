package com.smartseva.servicecatalog;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.common.exception.BadRequestException;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.document.entity.Document;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.notification.service.NotificationService;
import com.smartseva.servicecatalog.dto.ServiceOrderDTO;
import com.smartseva.servicecatalog.dto.ServiceStatusUpdateRequest;
import com.smartseva.servicecatalog.entity.PendingReason;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.servicecatalog.mapper.ServiceOrderMapper;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import com.smartseva.servicecatalog.service.ServiceOrderManagementService;
import com.smartseva.staff.entity.Role;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.repository.StaffRepository;
import com.smartseva.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ServiceOrderManagementServiceTest {

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ServiceOrderMapper serviceOrderMapper;

    @Mock
    private com.smartseva.security.encryption.CredentialEncryptionService credentialEncryptionService;

    @InjectMocks
    private ServiceOrderManagementService serviceOrderService;

    private Customer customer;
    private Staff staff;
    private ServiceOrder serviceOrder;
    private ServiceOrderDTO serviceOrderDTO;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId(10L)
                .fullName("Priya Sharma")
                .phoneNumber("9876543210")
                .email("priya@example.com")
                .build();

        staff = Staff.builder()
                .staffId(5L)
                .username("operator1")
                .fullName("Operator One")
                .role(Role.ROLE_STAFF)
                .build();

        serviceOrder = ServiceOrder.builder()
                .serviceId(100L)
                .customer(customer)
                .assignedStaff(staff)
                .serviceName("PAN Card Update")
                .status(ServiceStatus.NEW)
                .build();

        serviceOrderDTO = ServiceOrderDTO.builder()
                .serviceId(100L)
                .customerId(10L)
                .customerName("Priya Sharma")
                .customerPhone("9876543210")
                .customerEmail("priya@example.com")
                .serviceName("PAN Card Update")
                .status(ServiceStatus.NEW)
                .build();
    }

    @Test
    void testCreateServiceOrder() {
        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);

        ServiceOrderDTO result = serviceOrderService.createService(serviceOrderDTO, "operator1");

        assertNotNull(result);
        assertEquals("PAN Card Update", result.getServiceName());
        verify(activityLogService, times(1)).logActivity(eq(staff), any(), eq("SERVICE_CREATED"), anyString());
    }

    @Test
    void testUpdateStatusToInProgressWithChannels() {
        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.IN_PROGRESS)
                .remarks("Processing application")
                .channels(List.of(NotificationType.SMS, NotificationType.WHATSAPP))
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);
        when(notificationService.dispatchStatusNotifications(any(), eq(request.getChannels()), anyList(), eq("Processing application")))
                .thenReturn(List.of(
                        ChannelDeliveryResultDTO.builder().channel(NotificationType.SMS).success(true).build(),
                        ChannelDeliveryResultDTO.builder().channel(NotificationType.WHATSAPP).success(true).build()
                ));

        ServiceOrderDTO result = serviceOrderService.updateStatus(request, "operator1");

        assertNotNull(result);
        assertEquals(ServiceStatus.IN_PROGRESS, serviceOrder.getStatus());
        assertNull(serviceOrder.getPendingReason());
        verify(activityLogService, times(1)).logActivity(eq(staff), eq(serviceOrder), eq("STATUS_UPDATED"), anyString());
        verify(notificationService, times(1)).dispatchStatusNotifications(any(), eq(request.getChannels()), anyList(), anyString());
        assertNotNull(result.getNotificationResults());
        assertEquals(2, result.getNotificationResults().size());
    }

    @Test
    void testUpdateStatusCompletedWithSelectedDocuments() {
        Document doc1 = Document.builder()
                .documentId(501L)
                .originalFileName("Income_Certificate.pdf")
                .serviceOrder(serviceOrder)
                .deleted(false)
                .build();

        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.COMPLETED)
                .channels(List.of(NotificationType.EMAIL, NotificationType.SMS))
                .documentIds(List.of(501L))
                .remarks("Completed and certificate attached")
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(documentRepository.findAllById(List.of(501L))).thenReturn(List.of(doc1));
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);
        when(notificationService.dispatchStatusNotifications(any(), eq(request.getChannels()), eq(List.of(doc1)), anyString()))
                .thenReturn(List.of(
                        ChannelDeliveryResultDTO.builder().channel(NotificationType.EMAIL).success(true).build(),
                        ChannelDeliveryResultDTO.builder().channel(NotificationType.SMS).success(true).build()
                ));

        ServiceOrderDTO result = serviceOrderService.updateStatus(request, "operator1");

        assertNotNull(result);
        assertEquals(ServiceStatus.COMPLETED, serviceOrder.getStatus());
        assertNotNull(serviceOrder.getCompletedDate());
        assertEquals(1, result.getSharedDocumentNames().size());
        assertEquals("Income_Certificate.pdf", result.getSharedDocumentNames().get(0));
    }

    @Test
    void testUpdateStatusToPendingRequiresPendingReason() {
        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.PENDING)
                .pendingReason(null)
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));

        assertThrows(BadRequestException.class, () -> serviceOrderService.updateStatus(request, "operator1"));
    }

    @Test
    void testUpdateStatusToPendingWithReasonSucceeds() {
        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.PENDING)
                .pendingReason(PendingReason.MISSING_DOCUMENTS)
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);

        ServiceOrderDTO result = serviceOrderService.updateStatus(request, "operator1");

        assertNotNull(result);
        assertEquals(ServiceStatus.PENDING, serviceOrder.getStatus());
        assertEquals(PendingReason.MISSING_DOCUMENTS, serviceOrder.getPendingReason());
    }

    @Test
    void testPendingReasonFromString() {
        assertNull(PendingReason.fromString(""));
        assertNull(PendingReason.fromString("   "));
        assertNull(PendingReason.fromString(null));
        assertEquals(PendingReason.MISSING_DOCUMENTS, PendingReason.fromString("MISSING_DOCUMENTS"));
        assertEquals(PendingReason.SERVER_DOWN, PendingReason.fromString("server_down"));
    }

    @Test
    void testNonAdminCannotModifyCompletedService() {
        serviceOrder.setStatus(ServiceStatus.COMPLETED);
        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.IN_PROGRESS)
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));

        assertThrows(BadRequestException.class, () -> serviceOrderService.updateStatus(request, "operator1"));
    }

    @Test
    void testGetServicesByCustomer() {
        when(serviceOrderRepository.findByCustomerCustomerId(10L)).thenReturn(List.of(serviceOrder));
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);

        List<ServiceOrderDTO> list = serviceOrderService.getServicesByCustomer(10L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(100L, list.get(0).getServiceId());
    }

    @Test
    void testUpdateStatusRejectsUnauthorizedDocumentId() {
        ServiceOrder anotherServiceOrder = ServiceOrder.builder()
                .serviceId(999L)
                .customer(Customer.builder().customerId(99L).fullName("Another Customer").build())
                .build();

        Document unauthDoc = Document.builder()
                .documentId(888L)
                .originalFileName("Confidential_Report.pdf")
                .serviceOrder(anotherServiceOrder)
                .deleted(false)
                .build();

        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.COMPLETED)
                .channels(List.of(NotificationType.EMAIL))
                .documentIds(List.of(888L))
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(documentRepository.findAllById(List.of(888L))).thenReturn(List.of(unauthDoc));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                serviceOrderService.updateStatus(request, "operator1")
        );
        assertTrue(ex.getMessage().contains("does not belong to this service order"));
    }

    @Test
    void testUpdateStatusCompletedWithoutDocuments() {
        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.COMPLETED)
                .channels(List.of(NotificationType.SMS))
                .documentIds(null)
                .remarks("Completed without documents")
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);
        when(notificationService.dispatchStatusNotifications(any(), eq(request.getChannels()), eq(Collections.emptyList()), anyString()))
                .thenReturn(List.of(
                        ChannelDeliveryResultDTO.builder().channel(NotificationType.SMS).success(true).build()
                ));

        ServiceOrderDTO result = serviceOrderService.updateStatus(request, "operator1");

        assertNotNull(result);
        assertEquals(ServiceStatus.COMPLETED, serviceOrder.getStatus());
        assertNotNull(serviceOrder.getCompletedDate());
        assertNull(result.getSharedDocumentNames());
    }

    @Test
    void testUpdateStatusWithUploadedCompletionFiles() {
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "Bus_Application_Completed.pdf",
                "application/pdf",
                "PDF_CONTENT_TEST".getBytes()
        );

        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.COMPLETED)
                .channels(List.of(NotificationType.EMAIL))
                .remarks("Bus application completed")
                .build();

        Document savedDoc = Document.builder()
                .documentId(601L)
                .originalFileName("Bus_Application_Completed.pdf")
                .filePath("customers/9876543210/100/uuid.pdf")
                .serviceOrder(serviceOrder)
                .deleted(false)
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(fileStorageService.storeFile(eq(file), anyString())).thenReturn("customers/9876543210/100/uuid.pdf");
        when(documentRepository.save(any(Document.class))).thenReturn(savedDoc);
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);
        when(notificationService.dispatchStatusNotifications(any(), eq(request.getChannels()), anyList(), anyString()))
                .thenReturn(List.of(
                        ChannelDeliveryResultDTO.builder().channel(NotificationType.EMAIL).success(true).status("SENT").build()
                ));

        ServiceOrderDTO result = serviceOrderService.updateStatusWithFiles(request, List.of(file), "operator1");

        assertNotNull(result);
        assertEquals(ServiceStatus.COMPLETED, serviceOrder.getStatus());
        verify(fileStorageService, times(1)).storeFile(eq(file), anyString());
        verify(documentRepository, times(1)).save(any(Document.class));
        verify(activityLogService, times(1)).logActivity(eq(staff), eq(serviceOrder), eq("DOCUMENT_UPLOADED"), anyString());
        assertNotNull(result.getSharedDocumentNames());
        assertEquals(1, result.getSharedDocumentNames().size());
        assertEquals("Bus_Application_Completed.pdf", result.getSharedDocumentNames().get(0));
    }

    @Test
    void testCreateServiceWithEncryptedTemporaryPassword() {
        ServiceOrderDTO inputDto = ServiceOrderDTO.builder()
                .customerId(10L)
                .serviceName("Income Certificate")
                .applicationNumber("INC2026001")
                .portalLoginId("user123")
                .portalPassword("SecretTempPass123!")
                .status(ServiceStatus.NEW)
                .build();

        when(customerRepository.findById(10L)).thenReturn(Optional.of(customer));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(credentialEncryptionService.encrypt("SecretTempPass123!")).thenReturn("ENC_CIPHER_TEXT_BASE64");
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenAnswer(invocation -> {
            ServiceOrder saved = invocation.getArgument(0);
            saved.setServiceId(101L);
            return saved;
        });
        when(serviceOrderMapper.toDTO(any(ServiceOrder.class))).thenReturn(inputDto);

        ServiceOrderDTO result = serviceOrderService.createService(inputDto, "operator1");

        assertNotNull(result);
        verify(credentialEncryptionService, times(1)).encrypt("SecretTempPass123!");
    }

    @Test
    void testUpdateStatusCompletedErasesTemporaryPasswordPermanently() {
        serviceOrder.setEncryptedPortalPassword("ENC_CIPHER_TEXT_BASE64");
        serviceOrder.setPortalLoginId("user123");
        serviceOrder.setApplicationNumber("INC2026001");

        ServiceStatusUpdateRequest request = ServiceStatusUpdateRequest.builder()
                .serviceId(100L)
                .status(ServiceStatus.COMPLETED)
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(staffRepository.findByUsername("operator1")).thenReturn(Optional.of(staff));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(serviceOrder);
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(serviceOrderDTO);

        ServiceOrderDTO result = serviceOrderService.updateStatus(request, "operator1");

        assertNotNull(result);
        assertEquals(ServiceStatus.COMPLETED, serviceOrder.getStatus());
        assertNull(serviceOrder.getEncryptedPortalPassword(), "Encrypted password must be permanently erased upon COMPLETED status!");
        assertEquals("user123", serviceOrder.getPortalLoginId(), "Login ID remains for historical audit.");
        assertEquals("INC2026001", serviceOrder.getApplicationNumber(), "Application number remains for history.");
    }

    @Test
    void testGetServiceByIdDecryptsPasswordWhenNotCompleted() {
        serviceOrder.setStatus(ServiceStatus.IN_PROGRESS);
        serviceOrder.setEncryptedPortalPassword("ENC_CIPHER_TEXT_BASE64");

        ServiceOrderDTO mappedDto = ServiceOrderDTO.builder()
                .serviceId(100L)
                .status(ServiceStatus.IN_PROGRESS)
                .build();

        when(serviceOrderRepository.findById(100L)).thenReturn(Optional.of(serviceOrder));
        when(serviceOrderMapper.toDTO(serviceOrder)).thenReturn(mappedDto);
        when(credentialEncryptionService.decrypt("ENC_CIPHER_TEXT_BASE64")).thenReturn("SecretTempPass123!");

        ServiceOrderDTO result = serviceOrderService.getServiceById(100L);

        assertNotNull(result);
        assertEquals("SecretTempPass123!", result.getPortalPassword());
        assertTrue(result.getHasTemporaryPassword());
    }
}