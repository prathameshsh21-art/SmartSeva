package com.smartseva.customer.mapper;

import com.smartseva.customer.dto.CustomerDTO;
import com.smartseva.customer.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerDTO toDTO(Customer entity) {
        if (entity == null) {
            return null;
        }
        return CustomerDTO.builder()
                .customerId(entity.getCustomerId())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .dateOfBirth(entity.getDateOfBirth())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .notes(entity.getNotes())
                .isArchived(entity.isArchived())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Customer toEntity(CustomerDTO dto) {
        if (dto == null) {
            return null;
        }
        return Customer.builder()
                .customerId(dto.getCustomerId())
                .fullName(dto.getFullName())
                .phoneNumber(dto.getPhoneNumber())
                .dateOfBirth(dto.getDateOfBirth())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .notes(dto.getNotes())
                .isArchived(dto.isArchived())
                .build();
    }
}