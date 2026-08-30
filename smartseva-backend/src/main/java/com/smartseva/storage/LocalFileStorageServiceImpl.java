package com.smartseva.storage;

import com.smartseva.common.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.smartseva.common.constants.AppConstants;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.UUID;

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageServiceImpl(@Value("${app.storage.local-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create storage directory", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Cannot upload an empty file");
        }

        if (file.getSize() > AppConstants.MAX_FILE_SIZE_BYTES) {
            throw new FileStorageException("File size exceeds maximum limit of 20MB");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");

        if (originalFileName.contains("..") || originalFileName.contains("/") || originalFileName.contains("\\")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFileName);
        }

        String extStr = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extStr = originalFileName.substring(i + 1).toLowerCase();
        }
        final String extension = extStr;

        // Validate file extension
        boolean isAllowedExt = Arrays.stream(AppConstants.ALLOWED_FILE_EXTENSIONS)
                .anyMatch(ext -> ext.equalsIgnoreCase(extension));
        if (!isAllowedExt) {
            throw new FileStorageException("File extension ." + extension + " is not allowed. Allowed: " + Arrays.toString(AppConstants.ALLOWED_FILE_EXTENSIONS));
        }

        // Validate Content-Type / MIME type
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            boolean isAllowedMime = Arrays.stream(AppConstants.ALLOWED_MIME_TYPES)
                    .anyMatch(mime -> mime.equalsIgnoreCase(contentType.trim()));
            if (!isAllowedMime) {
                throw new FileStorageException("File MIME type " + contentType + " is not permitted.");
            }
        }

        if (subFolder.contains("..")) {
            throw new FileStorageException("Invalid subfolder path sequence");
        }

        String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path targetFolder = this.fileStorageLocation.resolve(subFolder).normalize();

        if (!targetFolder.startsWith(this.fileStorageLocation)) {
            throw new FileStorageException("Directory traversal attempt detected");
        }

        try {
            Files.createDirectories(targetFolder);
            Path targetLocation = targetFolder.resolve(storedFileName).normalize();
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return subFolder + "/" + storedFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFileName, ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String relativeFilePath) {
        try {
            Path filePath = this.fileStorageLocation.resolve(relativeFilePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new FileStorageException("File not found " + relativeFilePath);
            }
        } catch (MalformedURLException ex) {
            throw new FileStorageException("File not found " + relativeFilePath, ex);
        }
    }

    @Override
    public void deleteFile(String relativeFilePath) {
        try {
            Path filePath = this.fileStorageLocation.resolve(relativeFilePath).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file " + relativeFilePath, ex);
        }
    }
}