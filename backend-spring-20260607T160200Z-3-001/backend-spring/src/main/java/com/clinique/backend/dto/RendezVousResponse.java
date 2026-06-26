package com.clinique.backend.dto;

import com.clinique.backend.models.RendezVous;
import com.clinique.backend.models.StatutRendezVous;
import java.time.LocalDateTime;

/**
 * Vue d'un rendez-vous renvoyee au client.
 */
public record RendezVousResponse(
        Long id,
        LocalDateTime dateHeure,
        StatutRendezVous statut,
        String motif,
        Long patientId,
        String patientNom,
        Long medecinId,
        String medecinNom,
        Long secretaireId
) {
    public static RendezVousResponse from(RendezVous rdv) {
        return new RendezVousResponse(
                rdv.getId(),
                rdv.getDateHeure(),
                rdv.getStatut(),
                rdv.getMotif(),
                rdv.getPatient() != null ? rdv.getPatient().getId() : null,
                rdv.getPatient() != null ? rdv.getPatient().getNom() + " " + rdv.getPatient().getPrenom() : null,
                rdv.getMedecin() != null ? rdv.getMedecin().getId() : null,
                rdv.getMedecin() != null ? rdv.getMedecin().getNom() + " " + rdv.getMedecin().getPrenom() : null,
                rdv.getSecretaire() != null ? rdv.getSecretaire().getId() : null
        );
    }
}
