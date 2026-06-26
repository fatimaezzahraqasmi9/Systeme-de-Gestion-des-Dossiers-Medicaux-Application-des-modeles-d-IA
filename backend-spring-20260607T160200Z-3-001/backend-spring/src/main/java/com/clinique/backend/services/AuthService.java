package com.clinique.backend.services;

import com.clinique.backend.config.JwtService;
import com.clinique.backend.dto.AuthResponse;
import com.clinique.backend.dto.LoginRequest;
import com.clinique.backend.dto.RegisterRequest;
import com.clinique.backend.models.Medecin;
import com.clinique.backend.models.Patient;
import com.clinique.backend.models.Secretaire;
import com.clinique.backend.models.Utilisateur;
import com.clinique.backend.repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Logique metier de l'authentification : inscription et connexion.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Inscription : cree la bonne sous-classe d'utilisateur selon le role,
     * encode le mot de passe et renvoie un token JWT.
     */
    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est deja utilise");
        }

        String motDePasseEncode = passwordEncoder.encode(request.motDePasse());

        Utilisateur utilisateur;
        if (request.role() == com.clinique.backend.models.Role.PATIENT) {
            utilisateur = Patient.builder()
                    .nom(request.nom())
                    .prenom(request.prenom())
                    .email(request.email())
                    .motDePasse(motDePasseEncode)
                    .role(request.role())
                    .cin(request.cin())
                    .dateNaissance(request.dateNaissance())
                    .telephone(request.telephone())
                    .build();
        } else if (request.role() == com.clinique.backend.models.Role.MEDECIN) {
            utilisateur = Medecin.builder()
                    .nom(request.nom())
                    .prenom(request.prenom())
                    .email(request.email())
                    .motDePasse(motDePasseEncode)
                    .role(request.role())
                    .specialite(request.specialite())
                    .build();
        } else {
            utilisateur = Secretaire.builder()
                    .nom(request.nom())
                    .prenom(request.prenom())
                    .email(request.email())
                    .motDePasse(motDePasseEncode)
                    .role(request.role())
                    .numeroBureau(request.numeroBureau())
                    .build();
        }

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        String token = jwtService.generateToken(saved);
        return toAuthResponse(token, saved);
    }

    /**
     * Connexion : valide les identifiants via l'AuthenticationManager
     * et renvoie un token JWT.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.motDePasse())
        );

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

        String token = jwtService.generateToken(utilisateur);
        return toAuthResponse(token, utilisateur);
    }

    private AuthResponse toAuthResponse(String token, Utilisateur u) {
        return new AuthResponse(token, u.getId(), u.getNom(), u.getPrenom(), u.getEmail(), u.getRole());
    }
}
