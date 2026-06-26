package com.clinique.backend.dto;

import com.clinique.backend.models.Patient;
import java.time.LocalDate;

/**
 * Vue legere d'un patient (pour les listes / selections cote frontend).
 */
public record PatientResponse(
        Long id,
        String nom,
        String prenom,
        String email,
        String cin,
        String telephone,
        LocalDate dateNaissance
) {
    public static PatientResponse from(Patient p) {
        return new PatientResponse(
                p.getId(), p.getNom(), p.getPrenom(), p.getEmail(),
                p.getCin(), p.getTelephone(), p.getDateNaissance());
    }
}
