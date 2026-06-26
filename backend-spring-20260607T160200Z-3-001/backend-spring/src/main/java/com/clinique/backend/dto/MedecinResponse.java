package com.clinique.backend.dto;

import com.clinique.backend.models.Medecin;

/**
 * Vue legere d'un medecin (pour les listes / selections cote frontend).
 */
public record MedecinResponse(
        Long id,
        String nom,
        String prenom,
        String email,
        String specialite
) {
    public static MedecinResponse from(Medecin m) {
        return new MedecinResponse(m.getId(), m.getNom(), m.getPrenom(), m.getEmail(), m.getSpecialite());
    }
}
