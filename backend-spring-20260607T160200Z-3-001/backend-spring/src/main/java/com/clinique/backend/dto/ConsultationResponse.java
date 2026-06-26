package com.clinique.backend.dto;

import com.clinique.backend.models.Consultation;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue complete d'une consultation (avec sa prediction IA et ses documents).
 */
public record ConsultationResponse(
        Long id,
        LocalDateTime dateConsultation,
        String motif,
        String diagnostic,
        String ordonnanceNotes,
        List<String> symptomes,
        Long patientId,
        String patientNom,
        Long medecinId,
        String medecinNom,
        Long dossierMedicalId,
        PredictionIAResponse predictionIA,
        List<DocumentResponse> documents
) {
    public static ConsultationResponse from(Consultation c) {
        return new ConsultationResponse(
                c.getId(),
                c.getDateConsultation(),
                c.getMotif(),
                c.getDiagnostic(),
                c.getOrdonnanceNotes(),
                c.getSymptomes(),
                c.getPatient() != null ? c.getPatient().getId() : null,
                c.getPatient() != null ? c.getPatient().getNom() + " " + c.getPatient().getPrenom() : null,
                c.getMedecin() != null ? c.getMedecin().getId() : null,
                c.getMedecin() != null ? c.getMedecin().getNom() + " " + c.getMedecin().getPrenom() : null,
                c.getDossierMedical() != null ? c.getDossierMedical().getId() : null,
                PredictionIAResponse.from(c.getPredictionIA()),
                c.getDocuments() != null
                        ? c.getDocuments().stream().map(DocumentResponse::from).toList()
                        : List.of()
        );
    }
}
