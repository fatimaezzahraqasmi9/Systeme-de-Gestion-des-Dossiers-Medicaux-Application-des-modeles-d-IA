package com.clinique.backend.controllers;

import com.clinique.backend.dto.MedecinResponse;
import com.clinique.backend.dto.PatientResponse;
import com.clinique.backend.repositories.MedecinRepository;
import com.clinique.backend.repositories.PatientRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de lecture des utilisateurs (medecins / patients) pour alimenter
 * les selections cote frontend (prise de RDV, creation de consultation).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UtilisateurController {

    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/medecins")
    public List<MedecinResponse> listerMedecins() {
        return medecinRepository.findAll().stream().map(MedecinResponse::from).toList();
    }

    @GetMapping("/patients")
    public List<PatientResponse> listerPatients() {
        return patientRepository.findAll().stream().map(PatientResponse::from).toList();
    }
}
