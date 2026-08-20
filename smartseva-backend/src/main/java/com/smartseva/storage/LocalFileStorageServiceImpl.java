package com.smartseva.storage;

import com.smartseva.common.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
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
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");

        if (originalFileName.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFileName);
        }

        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }

        String storedFileName = UUID.randomUUID().toString() + extension;
        Path targetFolder = this.fileStorageLocation.resolve(subFolder);

        try {
            Files.createDirectories(targetFolder);
            Path targetLocation = targetFolder.resolve(storedFileName);
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