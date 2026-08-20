package com.smartseva.staff.mapper;

import com.smartseva.staff.dto.StaffDTO;
import com.smartseva.staff.entity.Staff;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public StaffDTO toDTO(Staff entity) {
        if (entity == null) {
            return null;
        }
        return StaffDTO.builder()
                .staffId(entity.getStaffId())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .email(entity.getEmail())
                .username(entity.getUsername())
                .role(entity.getRole())
                .status(entity.getStatus())
                .profilePhoto(entity.getProfilePhoto())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}