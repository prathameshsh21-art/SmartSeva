package com.smartseva.notification.repository;

import com.smartseva.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCustomerCustomerId(Long customerId);
    List<Notification> findByServiceOrderServiceId(Long serviceId);
}