package com.smartseva.notification;

import com.smartseva.activity.service.ActivityLogService;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.document.entity.Document;
import com.smartseva.document.repository.DocumentRepository;
import com.smartseva.notification.channel.EmailNotificationChannel;
import com.smartseva.notification.channel.NotificationChannel;
import com.smartseva.notification.channel.SmsNotificationChannel;
import com.smartseva.notification.channel.WhatsAppNotificationChannel;
import com.smartseva.notification.dto.ChannelDeliveryResultDTO;
import com.smartseva.notification.dto.NotificationDTO;
import com.smartseva.notification.dto.SendNotificationRequest;
import com.smartseva.notification.entity.Notification;
import com.smartseva.notification.entity.NotificationStatus;
import com.smartseva.notification.entity.NotificationType;
import com.smartseva.notification.repository.NotificationRepository;
import com.smartseva.notification.service.NotificationService;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import com.smartseva.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private FileStorageService fileStorageService;

    private MockRestServiceServer mockServer;
    private EmailNotificationChannel emailChannel;
    private SmsNotificationChannel smsChannel;
    private WhatsAppNotificationChannel whatsAppChannel;

    private NotificationService notificationService;

    private Customer customer;
    private ServiceOrder serviceOrder;
    private Notification notification;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder().baseUrl("https://api.resend.com");
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        RestClient testRestClient = restClientBuilder.build();

        emailChannel = new EmailNotificationChannel(fileStorageService, "re_test_key_12345", "SmartSeva <updates@smartseva.in>", testRestClient);
        smsChannel = new SmsNotificationChannel();
        whatsAppChannel = new WhatsAppNotificationChannel();

        List<NotificationChannel> channels = List.of(emailChannel, smsChannel, whatsAppChannel);
        notificationService = new NotificationService(
                notificationRepository,
                serviceOrderRepository,
                customerRepository,
                documentRepository,
                activityLogService,
                channels
        );
        notificationService.init();

        customer = Customer.builder()
                .customerId(1L)
                .fullName("Rahul Verma")
                .email("rahul.verma@example.com")
                .phoneNumber("8050653488")
                .build();

        serviceOrder = ServiceOrder.builder()
                .serviceId(10L)
                .serviceName("Income Certificate")
                .applicationNumber("SS12345")
                .status(ServiceStatus.COMPLETED)
                .customer(customer)
                .build();

        notification = Notification.builder()
                .notificationId(100L)
                .serviceOrder(serviceOrder)
                .customer(customer)
                .notificationType(NotificationType.EMAIL)
                .recipient("rahul.verma@example.com")
                .status(NotificationStatus.PENDING)
                .build();
    }

    @Test
    void testDispatchMultiChannelSuccess() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(fileStorageService.loadFileAsResource(anyString())).thenReturn(new ByteArrayResource("test-cert".getBytes()));

        mockServer.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer re_test_key_12345"))
                .andRespond(withSuccess("{\"id\":\"email_123\"}", MediaType.APPLICATION_JSON));

        Document doc = Document.builder()
                .documentId(50L)
                .originalFileName("Income_Certificate.pdf")
                .filePath("uploads/customers/1/doc.pdf")
                .serviceOrder(serviceOrder)
                .build();

        List<ChannelDeliveryResultDTO> results = notificationService.dispatchStatusNotifications(
                serviceOrder,
                List.of(NotificationType.SMS, NotificationType.WHATSAPP, NotificationType.EMAIL),
                List.of(doc),
                "Your application is ready."
        );

        assertNotNull(results);
        assertEquals(3, results.size());
        assertTrue(results.stream().allMatch(ChannelDeliveryResultDTO::isSuccess));

        // Check SMS result deep link
        ChannelDeliveryResultDTO smsRes = results.stream().filter(r -> r.getChannel() == NotificationType.SMS).findFirst().orElseThrow();
        assertEquals("+918050653488", smsRes.getRecipient());
        assertNotNull(smsRes.getActionLink());
        assertTrue(smsRes.getActionLink().startsWith("sms:+918050653488?body="));

        // Check WhatsApp result deep link (wa.me uses 918050653488 without '+')
        ChannelDeliveryResultDTO waRes = results.stream().filter(r -> r.getChannel() == NotificationType.WHATSAPP).findFirst().orElseThrow();
        assertNotNull(waRes.getActionLink());
        assertTrue(waRes.getActionLink().startsWith("https://wa.me/918050653488?text="));

        // Check Email result
        ChannelDeliveryResultDTO emailRes = results.stream().filter(r -> r.getChannel() == NotificationType.EMAIL).findFirst().orElseThrow();
        assertTrue(emailRes.isSuccess());
        assertEquals("SENT", emailRes.getStatus());
        assertTrue(emailRes.getMessage().contains("Resend API"));

        verify(activityLogService, atLeast(3)).logActivity(any(), eq(serviceOrder), anyString(), anyString());
    }

    @Test
    void testEmailResendApiFailureMarksNotificationFailed() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        mockServer.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError().body("{\"message\":\"Resend API Internal Server Error\"}"));

        List<ChannelDeliveryResultDTO> results = notificationService.dispatchStatusNotifications(
                serviceOrder,
                List.of(NotificationType.EMAIL),
                Collections.emptyList(),
                "Status update"
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isSuccess());
        assertTrue(results.get(0).getFailureReason().contains("Email delivery failed"));
        assertEquals(NotificationStatus.FAILED, notification.getStatus());
    }

    @Test
    void testEmailChannelFailureWhenCustomerHasNoEmail() {
        customer.setEmail(null);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        List<ChannelDeliveryResultDTO> results = notificationService.dispatchStatusNotifications(
                serviceOrder,
                List.of(NotificationType.EMAIL),
                Collections.emptyList(),
                "Status updated"
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isSuccess());
        assertTrue(results.get(0).getFailureReason().contains("email address"));
    }

    @Test
    void testSmsChannelFailureWhenCustomerHasNoPhone() {
        customer.setPhoneNumber(null);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        List<ChannelDeliveryResultDTO> results = notificationService.dispatchStatusNotifications(
                serviceOrder,
                List.of(NotificationType.SMS),
                Collections.emptyList(),
                "Status updated"
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isSuccess());
        assertTrue(results.get(0).getFailureReason().contains("mobile phone number"));
    }

    @Test
    void testWhatsAppChannelFailureWhenCustomerHasNoPhone() {
        customer.setPhoneNumber(null);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        List<ChannelDeliveryResultDTO> results = notificationService.dispatchStatusNotifications(
                serviceOrder,
                List.of(NotificationType.WHATSAPP),
                Collections.emptyList(),
                "Status updated"
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isSuccess());
        assertTrue(results.get(0).getFailureReason().contains("WhatsApp phone number"));
    }

    @Test
    void testSendCompletionNotification() {
        SendNotificationRequest request = new SendNotificationRequest();
        request.setServiceId(10L);
        request.setNotificationType(NotificationType.EMAIL);

        mockServer.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"id\":\"email_123\"}", MediaType.APPLICATION_JSON));

        when(serviceOrderRepository.findById(10L)).thenReturn(Optional.of(serviceOrder));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDTO result = notificationService.sendCompletionNotification(request);

        assertNotNull(result);
        assertEquals(NotificationStatus.SENT, result.getStatus());
    }

    @Test
    void testSendNotificationWithCustomerIdAndBothChannels() {
        SendNotificationRequest request = SendNotificationRequest.builder()
                .customerId(1L)
                .channels(List.of(NotificationType.EMAIL, NotificationType.SMS))
                .message("Your documents are ready for collection at the center.")
                .build();

        mockServer.expect(requestTo("https://api.resend.com/emails"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"id\":\"email_123\"}", MediaType.APPLICATION_JSON));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(serviceOrderRepository.findByCustomerCustomerId(1L)).thenReturn(List.of(serviceOrder));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationDTO result = notificationService.sendCompletionNotification(request);

        assertNotNull(result);
        assertEquals(NotificationStatus.SENT, result.getStatus());
        assertEquals(1L, result.getCustomerId());
        assertEquals("Rahul Verma", result.getCustomerName());
        assertNotNull(result.getDeliveryResults());
        assertEquals(2, result.getDeliveryResults().size());
        verify(customerRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAllNotificationsPaginated() {
        notification.setStatus(NotificationStatus.SENT);
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(notificationRepository.findAllByOrderByCreatedAtDesc(any(PageRequest.class))).thenReturn(page);

        Page<NotificationDTO> result = notificationService.getAllNotifications(PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Rahul Verma", result.getContent().get(0).getCustomerName());
        assertEquals("Income Certificate", result.getContent().get(0).getServiceName());
        assertEquals(NotificationStatus.SENT, result.getContent().get(0).getStatus());
    }
}