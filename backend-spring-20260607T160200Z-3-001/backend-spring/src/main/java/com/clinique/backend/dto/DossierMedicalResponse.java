package com.clinique.backend.dto;

import com.clinique.backend.models.DossierMedical;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue d'un dossier medical avec ses consultations.
 */
public record DossierMedicalResponse(
        Long id,
        LocalDateTime dateOuverture,
        String statut,
        Long patientId,
        String patientNom,
        List<ConsultationResponse> consultations
) {
    public static DossierMedicalResponse from(DossierMedical d, List<ConsultationResponse> consultations) {
        return new DossierMedicalResponse(
                d.getId(),
                d.getDateOuverture(),
                d.getStatut(),
                d.getPatient() != null ? d.getPatient().getId() : null,
                d.getPatient() != null ? d.getPatient().getNom() + " " + d.getPatient().getPrenom() : null,
                consultations
        );
    }
}
