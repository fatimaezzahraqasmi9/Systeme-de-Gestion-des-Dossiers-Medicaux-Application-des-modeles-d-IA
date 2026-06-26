package com.clinique.backend.dto;

import com.clinique.backend.models.PredictionIA;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue d'une prediction IA renvoyee au client.
 */
public record PredictionIAResponse(
        Long id,
        LocalDateTime dateGeneration,
        List<String> symptomesAnalyses,
        String maladiePredite,
        Double probabilite,
        Long consultationId
) {
    public static PredictionIAResponse from(PredictionIA p) {
        if (p == null) {
            return null;
        }
        return new PredictionIAResponse(
                p.getId(),
                p.getDateGeneration(),
                p.getSymptomesAnalyses(),
                p.getMaladiePredite(),
                p.getProbabilite(),
                p.getConsultation() != null ? p.getConsultation().getId() : null
        );
    }
}
