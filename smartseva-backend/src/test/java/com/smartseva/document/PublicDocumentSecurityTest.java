package com.smartseva.document;

import com.smartseva.common.exception.BadRequestException;
import com.smartseva.customer.entity.Customer;
import com.smartseva.document.controller.PublicDocumentController;
import com.smartseva.document.dto.DocumentDTO;
import com.smartseva.document.dto.PublicDocumentVerifyRequest;
import com.smartseva.document.dto.PublicDocumentVerifyResponse;
import com.smartseva.document.service.DocumentManagementService;
import com.smartseva.security.jwt.JwtUtils;
import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.repository.ServiceOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicDocumentSecurityTest {

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @Mock
    private DocumentManagementService documentService;

    private JwtUtils jwtUtils;
    private PublicDocumentController controller;

    private ServiceOrder mockService;
    private Customer mockCustomer;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000L);

        controller = new PublicDocumentController(serviceOrderRepository, documentService, jwtUtils);

        mockCustomer = Customer.builder()
                .customerId(100L)
                .fullName("Ramesh Sharma")
                .phoneNumber("9876543210")
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .build();

        mockService = ServiceOrder.builder()
                .serviceId(1L)
                .customer(mockCustomer)
                .serviceName("Aadhaar Address Update")
                .build();
    }

    @Test
    @DisplayName("1. Valid verification + authorized document = ALLOWED")
    void testValidVerificationAndAuthorizedDocumentDownload() {
        PublicDocumentVerifyRequest verifyRequest = new PublicDocumentVerifyRequest();
        verifyRequest.setServiceId(1L);
        verifyRequest.setPhoneNumber("9876543210");
        verifyRequest.setDateOfBirth(LocalDate.of(1990, 5, 15));

        DocumentDTO doc1 = DocumentDTO.builder().documentId(501L).originalFileName("aadhaar.pdf").build();
        DocumentDTO doc2 = DocumentDTO.builder().documentId(502L).originalFileName("electricity_bill.pdf").build();

        when(serviceOrderRepository.findById(1L)).thenReturn(Optional.of(mockService));
        when(documentService.getDocumentsForService(1L)).thenReturn(List.of(doc1, doc2));
        Resource mockResource = new ByteArrayResource("test-file-content".getBytes());
        when(documentService.downloadDocument(501L)).thenReturn(mockResource);

        // Step 1: Verification
        var verifyResponse = controller.verifyAndGetDocuments(verifyRequest);
        assertNotNull(verifyResponse.getBody());
        PublicDocumentVerifyResponse body = verifyResponse.getBody().getData();
        assertNotNull(body.getToken());
        assertEquals(2, body.getDocuments().size());

        // Step 2: Download authorized document
        ResponseEntity<Resource> downloadResponse = controller.publicDownload(501L, body.getToken());
        assertNotNull(downloadResponse);
        assertEquals(200, downloadResponse.getStatusCode().value());
        assertNotNull(downloadResponse.getBody());
    }

    @Test
    @DisplayName("2. Valid verification + unauthorized document ID = DENIED")
    void testValidVerificationWithUnauthorizedDocumentDownload() {
        PublicDocumentVerifyRequest verifyRequest = new PublicDocumentVerifyRequest();
        verifyRequest.setServiceId(1L);
        verifyRequest.setPhoneNumber("9876543210");
        verifyRequest.setDateOfBirth(LocalDate.of(1990, 5, 15));

        DocumentDTO doc1 = DocumentDTO.builder().documentId(501L).originalFileName("aadhaar.pdf").build();

        when(serviceOrderRepository.findById(1L)).thenReturn(Optional.of(mockService));
        when(documentService.getDocumentsForService(1L)).thenReturn(List.of(doc1));

        var verifyResponse = controller.verifyAndGetDocuments(verifyRequest);
        PublicDocumentVerifyResponse body = verifyResponse.getBody().getData();
        String token = body.getToken();

        // Attempting to download document 999 belonging to another user/service
        assertThrows(BadRequestException.class, () -> controller.publicDownload(999L, token));
    }

    @Test
    @DisplayName("3. Invalid or modified token = DENIED")
    void testInvalidOrModifiedTokenDownload() {
        String token = jwtUtils.generatePublicDownloadToken(1L, List.of(501L));
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertThrows(BadRequestException.class, () -> controller.publicDownload(501L, tamperedToken));
        assertThrows(BadRequestException.class, () -> controller.publicDownload(501L, "invalid-garbage-token"));
        assertThrows(BadRequestException.class, () -> controller.publicDownload(501L, ""));
        assertThrows(BadRequestException.class, () -> controller.publicDownload(501L, null));
    }

    @Test
    @DisplayName("4. Expired token = DENIED")
    void testExpiredTokenDownload() {
        // Generate a token with negative validity (already expired)
        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .subject("public-document-access")
                .claim("serviceId", 1L)
                .claim("documentIds", List.of(501L))
                .issuedAt(new java.util.Date(System.currentTimeMillis() - 60000))
                .expiration(new java.util.Date(System.currentTimeMillis() - 1000)) // expired 1s ago
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor("9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b".getBytes(java.nio.charset.StandardCharsets.UTF_8)), io.jsonwebtoken.Jwts.SIG.HS256)
                .compact();

        assertThrows(BadRequestException.class, () -> controller.publicDownload(501L, expiredToken));
    }

    @Test
    @DisplayName("5. Invalid phone or DOB = DENIED verification")
    void testInvalidPhoneOrDobVerification() {
        when(serviceOrderRepository.findById(1L)).thenReturn(Optional.of(mockService));

        // Wrong phone
        PublicDocumentVerifyRequest wrongPhoneReq = new PublicDocumentVerifyRequest();
        wrongPhoneReq.setServiceId(1L);
        wrongPhoneReq.setPhoneNumber("9111111111");
        wrongPhoneReq.setDateOfBirth(LocalDate.of(1990, 5, 15));
        assertThrows(BadRequestException.class, () -> controller.verifyAndGetDocuments(wrongPhoneReq));

        // Wrong DOB
        PublicDocumentVerifyRequest wrongDobReq = new PublicDocumentVerifyRequest();
        wrongDobReq.setServiceId(1L);
        wrongDobReq.setPhoneNumber("9876543210");
        wrongDobReq.setDateOfBirth(LocalDate.of(2000, 1, 1));
        assertThrows(BadRequestException.class, () -> controller.verifyAndGetDocuments(wrongDobReq));
    }
}
