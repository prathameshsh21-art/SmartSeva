package com.smartseva.customer.controller;

import com.smartseva.common.dto.ApiResponse;
import com.smartseva.customer.dto.CustomerDTO;
import com.smartseva.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;


    // CREATE CUSTOMER
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(
            @Valid @RequestBody CustomerDTO dto) {

        CustomerDTO result =
                customerService.createOrGetCustomer(dto);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer processed successfully",
                        result
                )
        );
    }


    // GET CUSTOMER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer retrieved",
                        customerService.getCustomerById(id)
                )
        );
    }


    // SEARCH CUSTOMERS
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> searchCustomers(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<CustomerDTO> result =
                customerService.searchCustomers(
                        query,
                        PageRequest.of(
                                page,
                                size,
                                Sort.by("fullName").ascending()
                        )
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Search results retrieved",
                        result
                )
        );
    }


    // UPDATE CUSTOMER
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDTO dto) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer updated successfully",
                        customerService.updateCustomer(id, dto)
                )
        );
    }


    // SOFT DELETE / ARCHIVE CUSTOMER
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer archived successfully",
                        null
                )
        );
    }
}