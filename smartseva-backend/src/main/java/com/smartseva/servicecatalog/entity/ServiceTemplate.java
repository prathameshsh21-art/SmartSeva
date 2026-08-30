package com.smartseva.servicecatalog.entity;

import com.smartseva.common.audit.Auditable;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTemplate extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "service_name", nullable = false, unique = true, length = 100)
    private String serviceName;

    @Column(name = "portal_url")
    private String portalUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "suggested_documents", columnDefinition = "TEXT")
    private String suggestedDocuments;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;
}