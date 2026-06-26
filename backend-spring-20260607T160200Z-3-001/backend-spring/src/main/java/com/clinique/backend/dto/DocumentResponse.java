package com.clinique.backend.dto;

import com.clinique.backend.models.Document;
import com.clinique.backend.models.TypeDocument;
import java.time.LocalDateTime;

/**
 * Vue des metadonnees d'un document medical.
 */
public record DocumentResponse(
        Long id,
        String nomFichier,
        String contentType,
        Long taille,
        TypeDocument type,
        LocalDateTime dateUpload,
        Long consultationId
) {
    public static DocumentResponse from(Document d) {
        return new DocumentResponse(
                d.getId(),
                d.getNomFichier(),
                d.getContentType(),
                d.getTaille(),
                d.getType(),
                d.getDateUpload(),
                d.getConsultation() != null ? d.getConsultation().getId() : null
        );
    }
}
