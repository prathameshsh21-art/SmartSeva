package com.smartseva.customer.service;

import com.smartseva.common.exception.BadRequestException;
import com.smartseva.common.exception.ResourceNotFoundException;
import com.smartseva.customer.dto.CustomerDTO;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.mapper.CustomerMapper;
import com.smartseva.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;


    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @Transactional
    public CustomerDTO createOrGetCustomer(CustomerDTO dto) {

        Optional<Customer> existingOpt =
                customerRepository.findByPhoneNumber(
                        dto.getPhoneNumber()
                );


        // Customer already exists
        if (existingOpt.isPresent()) {

            Customer existingCustomer = existingOpt.get();


            // If customer was archived earlier,
            // reactivate the customer
            if (existingCustomer.isArchived()) {

                existingCustomer.setArchived(false);

                existingCustomer.setFullName(
                        dto.getFullName()
                );

                existingCustomer.setDateOfBirth(
                        dto.getDateOfBirth()
                );

                existingCustomer.setEmail(
                        dto.getEmail()
                );

                existingCustomer.setAddress(
                        dto.getAddress()
                );

                existingCustomer.setNotes(
                        dto.getNotes()
                );

                return customerMapper.toDTO(
                        customerRepository.save(
                                existingCustomer
                        )
                );
            }


            // Customer is already active
            return customerMapper.toDTO(
                    existingCustomer
            );
        }


        // =================================================
        // CREATE NEW CUSTOMER
        // =================================================

        Customer customer = Customer.builder()

                .fullName(dto.getFullName())

                .phoneNumber(dto.getPhoneNumber())

                .dateOfBirth(dto.getDateOfBirth())

                .email(dto.getEmail())

                .address(dto.getAddress())

                .notes(dto.getNotes())

                .isArchived(false)

                .build();


        Customer savedCustomer =
                customerRepository.save(customer);


        return customerMapper.toDTO(savedCustomer);
    }


    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {

        Customer customer =
                customerRepository.findById(id)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer",
                                        "id",
                                        id
                                )
                        );


        return customerMapper.toDTO(customer);
    }


    // =====================================================
    // GET ALL ACTIVE CUSTOMERS (PAGINATED)
    // =====================================================

    @Transactional(readOnly = true)
    public Page<CustomerDTO> getAllCustomers(Pageable pageable) {
        return customerRepository
                .findByIsArchivedFalse(pageable)
                .map(customerMapper::toDTO);
    }


    // =====================================================
    // SEARCH CUSTOMERS
    // =====================================================

    @Transactional(readOnly = true)
    public Page<CustomerDTO> searchCustomers(
            String query,
            Pageable pageable) {

        return customerRepository
                .searchCustomers(query, pageable)
                .map(customerMapper::toDTO);
    }


    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @Transactional
    public CustomerDTO updateCustomer(
            Long id,
            CustomerDTO dto) {

        Customer customer =
                customerRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer",
                                        "id",
                                        id
                                )
                        );

        customer.setFullName(
                dto.getFullName()
        );

        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().trim().isEmpty()) {
            String newPhone = dto.getPhoneNumber().trim();
            Optional<Customer> existingWithPhone = customerRepository.findByPhoneNumber(newPhone);
            if (existingWithPhone.isPresent() && !existingWithPhone.get().getCustomerId().equals(id)) {
                throw new BadRequestException("Phone number " + newPhone + " is already registered to another customer.");
            }
            customer.setPhoneNumber(newPhone);
        }

        if (dto.getDateOfBirth() != null) {
            customer.setDateOfBirth(
                    dto.getDateOfBirth()
            );
        }

        customer.setEmail(
                dto.getEmail()
        );

        customer.setAddress(
                dto.getAddress()
        );

        customer.setNotes(
                dto.getNotes()
        );

        return customerMapper.toDTO(
                customerRepository.save(customer)
        );
    }


    // =====================================================
    // DELETE / ARCHIVE CUSTOMER
    // =====================================================

    @Transactional
    public void deleteCustomer(Long id) {

        Customer customer =
                customerRepository.findById(id)

                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer",
                                        "id",
                                        id
                                )
                        );


        customer.setArchived(true);


        customerRepository.save(customer);
    }

}