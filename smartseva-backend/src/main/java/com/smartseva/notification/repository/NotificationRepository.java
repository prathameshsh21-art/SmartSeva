package com.smartseva.notification.repository;

import com.smartseva.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCustomerCustomerId(Long customerId);
    List<Notification> findByServiceOrderServiceId(Long serviceId);

    @EntityGraph(attributePaths = {"serviceOrder", "customer"})
    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);
}