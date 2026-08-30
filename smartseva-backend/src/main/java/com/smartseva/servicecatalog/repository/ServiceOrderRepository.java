package com.smartseva.servicecatalog.repository;

import com.smartseva.servicecatalog.entity.ServiceOrder;
import com.smartseva.servicecatalog.entity.ServiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {

    List<ServiceOrder> findByCustomerCustomerId(Long customerId);

    long countByStatusIn(List<ServiceStatus> statuses);

    @Query("SELECT COUNT(s) FROM ServiceOrder s WHERE s.status = 'COMPLETED' AND s.completedDate >= :startOfDay")
    long countCompletedToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT s FROM ServiceOrder s WHERE s.status != 'ARCHIVED' AND " +
           "(LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.applicationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "s.customer.phoneNumber LIKE CONCAT('%', :query, '%'))")
    Page<ServiceOrder> searchServices(@Param("query") String query, Pageable pageable);

    Page<ServiceOrder> findByStatus(ServiceStatus status, Pageable pageable);

    Page<ServiceOrder> findByStatusNot(ServiceStatus status, Pageable pageable);
}