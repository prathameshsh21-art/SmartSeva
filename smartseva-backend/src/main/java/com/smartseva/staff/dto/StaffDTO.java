package com.smartseva.staff.dto;

import com.smartseva.staff.entity.Role;
import com.smartseva.staff.entity.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDTO {
    private Long staffId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String username;
    private Role role;
    private StaffStatus status;
    private String profilePhoto;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
