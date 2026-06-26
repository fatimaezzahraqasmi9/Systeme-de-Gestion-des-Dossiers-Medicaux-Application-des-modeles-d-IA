package com.clinique.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Donnees de creation / mise a jour d'une consultation.
 */
public record ConsultationRequest(
        LocalDateTime dateConsultation,

        String motif,

        String diagnostic,

        String ordonnanceNotes,

        /** Liste des symptomes coches (parmi les 132 du modele IA). */
        List<String> symptomes,

        @NotNull(message = "Le patient est obligatoire")
        Long patientId,

        @NotNull(message = "Le medecin est obligatoire")
        Long medecinId
) {
}
