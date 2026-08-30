package com.smartseva.activity.repository;

import com.smartseva.activity.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @EntityGraph(attributePaths = {"serviceOrder", "staff"})
    List<ActivityLog> findByOrderByTimestampDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"serviceOrder", "staff"})
    org.springframework.data.domain.Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);

    List<ActivityLog> findByServiceOrderServiceId(Long serviceId);
}