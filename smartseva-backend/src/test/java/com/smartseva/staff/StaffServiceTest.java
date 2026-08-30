package com.smartseva.staff;

import com.smartseva.common.exception.BadRequestException;
import com.smartseva.staff.dto.CreateStaffRequest;
import com.smartseva.staff.dto.ResetPasswordRequest;
import com.smartseva.staff.dto.StaffDTO;
import com.smartseva.staff.entity.Role;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.entity.StaffStatus;
import com.smartseva.staff.mapper.StaffMapper;
import com.smartseva.staff.repository.StaffRepository;
import com.smartseva.staff.service.StaffService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StaffServiceTest {

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private StaffMapper staffMapper;

    @InjectMocks
    private StaffService staffService;

    private Staff staff;
    private StaffDTO staffDTO;

    @BeforeEach
    void setUp() {
        staff = Staff.builder()
                .staffId(1L)
                .fullName("Rajesh Patel")
                .username("rpatel")
                .email("rajesh@smartseva.com")
                .phoneNumber("9988776655")
                .role(Role.ROLE_STAFF)
                .status(StaffStatus.ACTIVE)
                .build();

        staffDTO = StaffDTO.builder()
                .staffId(1L)
                .fullName("Rajesh Patel")
                .username("rpatel")
                .email("rajesh@smartseva.com")
                .phoneNumber("9988776655")
                .role(Role.ROLE_STAFF)
                .status(StaffStatus.ACTIVE)
                .build();
    }

    @Test
    void testCreateStaffSuccess() {
        CreateStaffRequest request = new CreateStaffRequest();
        request.setFullName("Rajesh Patel");
        request.setUsername("rpatel");
        request.setEmail("rajesh@smartseva.com");
        request.setPhoneNumber("9988776655");
        request.setPassword("Secret@123");
        request.setRole(Role.ROLE_STAFF);

        when(staffRepository.existsByUsername("rpatel")).thenReturn(false);
        when(staffRepository.existsByEmail("rajesh@smartseva.com")).thenReturn(false);
        when(staffRepository.existsByPhoneNumber("9988776655")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("encodedPassword");
        when(staffRepository.save(any(Staff.class))).thenReturn(staff);
        when(staffMapper.toDTO(staff)).thenReturn(staffDTO);

        StaffDTO result = staffService.createStaff(request);

        assertNotNull(result);
        assertEquals("Rajesh Patel", result.getFullName());
        verify(staffRepository, times(1)).save(any(Staff.class));
    }

    @Test
    void testCreateStaffDuplicateUsernameThrows() {
        CreateStaffRequest request = new CreateStaffRequest();
        request.setUsername("rpatel");

        when(staffRepository.existsByUsername("rpatel")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> staffService.createStaff(request));
    }

    @Test
    void testResetPassword() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setNewPassword("NewPass@123");

        when(staffRepository.findById(1L)).thenReturn(Optional.of(staff));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("encodedNewPassword");

        staffService.resetPassword(1L, request);

        assertEquals("encodedNewPassword", staff.getPassword());
        verify(staffRepository, times(1)).save(staff);
    }

    @Test
    void testUpdateStaffStatus() {
        when(staffRepository.findById(1L)).thenReturn(Optional.of(staff));
        when(staffRepository.save(any(Staff.class))).thenReturn(staff);
        when(staffMapper.toDTO(staff)).thenReturn(staffDTO);

        StaffDTO result = staffService.updateStatus(1L, StaffStatus.INACTIVE);

        assertNotNull(result);
        assertEquals(StaffStatus.INACTIVE, staff.getStatus());
        verify(staffRepository, times(1)).save(staff);
    }
}