package com.clinique.backend.dto;

import com.clinique.backend.models.Role;

/**
 * Reponse renvoyee apres inscription/connexion reussie : le token JWT
 * et quelques informations de base sur l'utilisateur.
 */
public record AuthResponse(
        String token,
        Long id,
        String nom,
        String prenom,
        String email,
        Role role
) {
}
