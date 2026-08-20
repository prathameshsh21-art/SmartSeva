package com.smartseva.servicecatalog.repository;

import com.smartseva.servicecatalog.entity.ServiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTemplateRepository extends JpaRepository<ServiceTemplate, Long> {
    List<ServiceTemplate> findByActiveTrue();
    Boolean existsByServiceName(String serviceName);
}