package com.smartseva.document.repository;

import com.smartseva.document.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    @EntityGraph(attributePaths = {"serviceOrder", "uploadedBy"})
    List<Document> findByServiceOrderServiceIdAndDeletedFalse(Long serviceId);

    @EntityGraph(attributePaths = {"serviceOrder", "uploadedBy"})
    Page<Document> findByDeletedFalse(Pageable pageable);

    @EntityGraph(attributePaths = {"serviceOrder", "uploadedBy"})
    Page<Document> findByDeletedFalseOrderByUploadedAtDesc(Pageable pageable);

    long countByDeletedFalse();
}