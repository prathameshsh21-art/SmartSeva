package com.smartseva.staff.service;

import com.smartseva.common.exception.BadRequestException;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.staff.dto.CreateStaffRequest;
import com.smartseva.staff.dto.ResetPasswordRequest;
import com.smartseva.staff.dto.StaffDTO;
import com.smartseva.staff.entity.Staff;
import com.smartseva.staff.entity.StaffStatus;
import com.smartseva.staff.mapper.StaffMapper;
import com.smartseva.staff.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final StaffMapper staffMapper;

    @Transactional
    public StaffDTO createStaff(CreateStaffRequest request) {
        if (staffRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (staffRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        if (staffRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number is already registered");
        }

        Staff staff = Staff.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(StaffStatus.ACTIVE)
                .build();

        return staffMapper.toDTO(staffRepository.save(staff));
    }

    @Transactional(readOnly = true)
    public Page<StaffDTO> getAllStaff(Pageable pageable) {
        return staffRepository.findAll(pageable).map(staffMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public StaffDTO getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));
        return staffMapper.toDTO(staff);
    }

    @Transactional
    public void resetPassword(Long staffId, ResetPasswordRequest request) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));
        staff.setPassword(passwordEncoder.encode(request.getNewPassword()));
        staffRepository.save(staff);
    }

    @Transactional
    public StaffDTO updateStatus(Long staffId, StaffStatus status) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));
        staff.setStatus(status);
        return staffMapper.toDTO(staffRepository.save(staff));
    }
}