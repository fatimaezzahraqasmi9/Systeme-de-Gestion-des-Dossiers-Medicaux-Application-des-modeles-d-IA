package com.clinique.backend.dto;

import com.clinique.backend.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Donnees recues lors de l'inscription (/api/auth/signup).
 * Les champs specifiques (cin, specialite, numeroBureau...) sont optionnels
 * et utilises selon le role choisi.
 */
public record RegisterRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @NotBlank(message = "Le prenom est obligatoire")
        String prenom,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caracteres")
        String motDePasse,

        @NotNull(message = "Le role est obligatoire")
        Role role,

        // Champs specifiques Patient
        String cin,
        LocalDate dateNaissance,
        String telephone,

        // Champ specifique Medecin
        String specialite,

        // Champ specifique Secretaire
        String numeroBureau
) {
}
