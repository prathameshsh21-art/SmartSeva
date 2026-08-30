package com.smartseva.customer;

import com.smartseva.customer.dto.CustomerDTO;
import com.smartseva.customer.entity.Customer;
import com.smartseva.customer.mapper.CustomerMapper;
import com.smartseva.customer.repository.CustomerRepository;
import com.smartseva.customer.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;
    private CustomerDTO testCustomerDTO;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder()
                .customerId(1L)
                .fullName("Amit Kumar")
                .phoneNumber("9876543210")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .email("amit@example.com")
                .isArchived(false)
                .build();

        testCustomerDTO = CustomerDTO.builder()
                .customerId(1L)
                .fullName("Amit Kumar")
                .phoneNumber("9876543210")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .email("amit@example.com")
                .isArchived(false)
                .build();
    }

    @Test
    void testCreateNewCustomer() {
        when(customerRepository.findByPhoneNumber("9876543210")).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toDTO(testCustomer)).thenReturn(testCustomerDTO);

        CustomerDTO result = customerService.createOrGetCustomer(testCustomerDTO);

        assertNotNull(result);
        assertEquals("Amit Kumar", result.getFullName());
        assertEquals("9876543210", result.getPhoneNumber());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void testGetExistingCustomerWhenActive() {
        when(customerRepository.findByPhoneNumber("9876543210")).thenReturn(Optional.of(testCustomer));
        when(customerMapper.toDTO(testCustomer)).thenReturn(testCustomerDTO);

        CustomerDTO result = customerService.createOrGetCustomer(testCustomerDTO);

        assertNotNull(result);
        assertEquals("Amit Kumar", result.getFullName());
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void testReactivateArchivedCustomer() {
        Customer archivedCustomer = Customer.builder()
                .customerId(2L)
                .fullName("Old Name")
                .phoneNumber("9876543210")
                .isArchived(true)
                .build();

        when(customerRepository.findByPhoneNumber("9876543210")).thenReturn(Optional.of(archivedCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toDTO(testCustomer)).thenReturn(testCustomerDTO);

        CustomerDTO result = customerService.createOrGetCustomer(testCustomerDTO);

        assertNotNull(result);
        assertFalse(archivedCustomer.isArchived());
        verify(customerRepository, times(1)).save(archivedCustomer);
    }

    @Test
    void testGetAllCustomersPaginated() {
        Page<Customer> page = new PageImpl<>(List.of(testCustomer));
        when(customerRepository.findByIsArchivedFalse(any(PageRequest.class))).thenReturn(page);
        when(customerMapper.toDTO(testCustomer)).thenReturn(testCustomerDTO);

        Page<CustomerDTO> result = customerService.getAllCustomers(PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Amit Kumar", result.getContent().get(0).getFullName());
    }

    @Test
    void testDeleteCustomerSoftDelete() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        customerService.deleteCustomer(1L);

        assertTrue(testCustomer.isArchived());
        verify(customerRepository, times(1)).save(testCustomer);
    }

    @Test
    void testUpdateCustomerSuccessWithNewPhoneNumber() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.findByPhoneNumber("8050653488")).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        CustomerDTO updateDto = CustomerDTO.builder()
                .fullName("Amit Kumar Updated")
                .phoneNumber("8050653488")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .email("amit.new@example.com")
                .build();

        CustomerDTO mappedDto = CustomerDTO.builder()
                .customerId(1L)
                .fullName("Amit Kumar Updated")
                .phoneNumber("8050653488")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .email("amit.new@example.com")
                .build();

        when(customerMapper.toDTO(testCustomer)).thenReturn(mappedDto);

        CustomerDTO result = customerService.updateCustomer(1L, updateDto);

        assertNotNull(result);
        assertEquals("8050653488", testCustomer.getPhoneNumber());
        assertEquals("Amit Kumar Updated", testCustomer.getFullName());
        verify(customerRepository, times(1)).save(testCustomer);
    }

    @Test
    void testUpdateCustomerDuplicatePhoneNumberThrowsBadRequestException() {
        Customer otherCustomer = Customer.builder()
                .customerId(2L)
                .fullName("Other Customer")
                .phoneNumber("8050653488")
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.findByPhoneNumber("8050653488")).thenReturn(Optional.of(otherCustomer));

        CustomerDTO updateDto = CustomerDTO.builder()
                .fullName("Amit Kumar")
                .phoneNumber("8050653488")
                .build();

        assertThrows(com.smartseva.common.exception.BadRequestException.class, () -> {
            customerService.updateCustomer(1L, updateDto);
        });

        verify(customerRepository, never()).save(any(Customer.class));
    }
}