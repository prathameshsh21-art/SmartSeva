CREATE DATABASE IF NOT EXISTS `smartseva_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smartseva_db`;

CREATE TABLE IF NOT EXISTS `staff` (
    `staff_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ROLE_ADMIN', 'ROLE_STAFF') NOT NULL DEFAULT 'ROLE_STAFF',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `profile_photo` VARCHAR(255) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_staff_username` (`username`),
    INDEX `idx_staff_phone` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer` (
    `customer_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL UNIQUE,
    `date_of_birth` DATE NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `notes` TEXT NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_customer_phone` (`phone_number`),
    INDEX `idx_customer_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_template` (
    `template_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_name` VARCHAR(100) NOT NULL UNIQUE,
    `portal_url` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `suggested_documents` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service` (
    `service_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` BIGINT NOT NULL,
    `staff_id` BIGINT NOT NULL,
    `service_name` VARCHAR(100) NOT NULL,
    `portal_link` VARCHAR(255) NULL,
    `application_number` VARCHAR(100) NULL,
    `status` ENUM('NEW', 'IN_PROGRESS', 'PENDING', 'WAITING_FOR_DOCUMENT', 'SERVER_ISSUE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    `pending_reason` ENUM('MISSING_DOCUMENTS', 'SERVER_DOWN', 'INCORRECT_INFO', 'PAYMENT_FAILED', 'PORTAL_ERROR', 'DOCUMENT_VERIFICATION', 'OTHER') NULL,
    `remarks` TEXT NULL,
    `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `completed_date` DATETIME NULL,
    `archived_date` DATETIME NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_service_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_service_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE RESTRICT,
    INDEX `idx_service_app_num` (`application_number`),
    INDEX `idx_service_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `document` (
    `document_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_id` BIGINT NOT NULL,
    `original_file_name` VARCHAR(255) NOT NULL,
    `stored_file_name` VARCHAR(255) NOT NULL UNIQUE,
    `file_path` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) NOT NULL,
    `file_size` BIGINT NOT NULL,
    `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `uploaded_by` BIGINT NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `deleted_at` DATETIME NULL,
    CONSTRAINT `fk_document_service` FOREIGN KEY (`service_id`) REFERENCES `service` (`service_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_document_staff` FOREIGN KEY (`uploaded_by`) REFERENCES `staff` (`staff_id`) ON DELETE RESTRICT,
    INDEX `idx_document_service` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_log` (
    `activity_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_id` BIGINT NULL,
    `staff_id` BIGINT NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_activity_service` FOREIGN KEY (`service_id`) REFERENCES `service` (`service_id`) ON DELETE SET NULL,
    CONSTRAINT `fk_activity_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
    INDEX `idx_activity_service` (`service_id`),
    INDEX `idx_activity_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification` (
    `notification_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `service_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `notification_type` ENUM('EMAIL', 'SMS', 'WHATSAPP') NOT NULL DEFAULT 'EMAIL',
    `recipient` VARCHAR(100) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `sent_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notification_service` FOREIGN KEY (`service_id`) REFERENCES `service` (`service_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notification_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refresh_token` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `staff_id` BIGINT NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expiry_date` DATETIME NOT NULL,
    CONSTRAINT `fk_refresh_token_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `staff` (`full_name`, `phone_number`, `email`, `username`, `password`, `role`, `status`)
VALUES ('System Admin', '9999999999', 'admin@smartseva.com', 'admin', '$2a$10$eD2/fR5M8A0Uo5vS0c1Z.O3C4jN8UuY.dKkQZ3P2I3eG0L1F5V8mG', 'ROLE_ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE `staff_id`=`staff_id`;

USE smartseva_db;

INSERT INTO staff
(
    full_name,
    phone_number,
    email,
    username,
    password,
    role,
    status,
    profile_photo,
    created_at,
    updated_at
)
VALUES
(
    'System Admin',
    '9999999999',
    'admin@smartseva.com',
    'admin',
    '$2a$10$..yNmFLtGsvw.RFVcagFx.vtf.wSTfEWX8OAiVoknQxRHDJdrV2rG',
    'ROLE_ADMIN',
    'ACTIVE',
    NULL,
    NOW(),
    NOW()
);

SELECT staff_id,
       username,
       email,
       role,
       status,
       phone_number
FROM staff;

UPDATE staff
SET password = '$2a$10$..yNmFLtGsvw.RFVcagFx.vtf.wSTfEWX8OAiVoknQxRHDJdrV2rG'
WHERE username = 'admin';
DESCRIBE document;
ALTER TABLE document
MODIFY COLUMN file_type VARCHAR(255) NOT NULL;