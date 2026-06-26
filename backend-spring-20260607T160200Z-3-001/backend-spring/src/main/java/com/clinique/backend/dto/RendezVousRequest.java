package com.clinique.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Donnees de creation / mise a jour d'un rendez-vous.
 */
public record RendezVousRequest(
        @NotNull(message = "La date/heure est obligatoire")
        LocalDateTime dateHeure,

        @NotNull(message = "Le patient est obligatoire")
        Long patientId,

        @NotNull(message = "Le medecin est obligatoire")
        Long medecinId,

        Long secretaireId,

        String motif
) {
}
