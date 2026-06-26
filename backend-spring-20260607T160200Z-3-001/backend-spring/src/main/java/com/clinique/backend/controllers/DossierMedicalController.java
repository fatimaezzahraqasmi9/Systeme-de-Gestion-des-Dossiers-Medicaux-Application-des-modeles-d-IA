package com.clinique.backend.controllers;

import com.clinique.backend.dto.DossierMedicalResponse;
import com.clinique.backend.services.DossierMedicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST de consultation du dossier medical d'un patient.
 */
@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    @GetMapping("/patient/{patientId}")
    public DossierMedicalResponse obtenirParPatient(@PathVariable Long patientId) {
        return dossierMedicalService.obtenirParPatient(patientId);
    }
}
