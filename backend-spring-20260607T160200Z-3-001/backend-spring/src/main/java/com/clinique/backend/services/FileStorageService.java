package com.clinique.backend.services;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service de stockage des fichiers (documents medicaux PDF) sur le disque.
 */
@Service
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(@Value("${application.storage.location:uploads}") String location) {
        this.rootLocation = Paths.get(location).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de creer le repertoire de stockage", e);
        }
    }

    /**
     * Enregistre un fichier et renvoie le chemin de stockage (relatif au repertoire racine).
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier est vide");
        }
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String nomStockage = UUID.randomUUID() + "_" + Paths.get(original).getFileName();
        try {
            Path destination = rootLocation.resolve(nomStockage).normalize();
            if (!destination.getParent().equals(rootLocation)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin de fichier invalide");
            }
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return nomStockage;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Echec du stockage du fichier", e);
        }
    }

    /**
     * Charge un fichier stocke en tant que Resource telechargeable.
     */
    public Resource load(String nomStockage) {
        try {
            Path file = rootLocation.resolve(nomStockage).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable : " + nomStockage);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable : " + nomStockage, e);
        }
    }
}
