package com.smartseva.customer.repository;

import com.smartseva.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhoneNumber(String phoneNumber);


    @Query("""
            SELECT c
            FROM Customer c
            WHERE c.isArchived = false
            AND (
                LOWER(c.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
                OR
                c.phoneNumber LIKE CONCAT('%', :query, '%')
            )
            """)
    Page<Customer> searchCustomers(
            @Param("query") String query,
            Pageable pageable
    );


    Page<Customer> findByIsArchivedFalse(Pageable pageable);

    long countByIsArchivedFalse();

}