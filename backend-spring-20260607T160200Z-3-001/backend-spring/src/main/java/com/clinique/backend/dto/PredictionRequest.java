package com.clinique.backend.dto;

import java.util.List;

/**
 * Donnees pour enregistrer une prediction IA sur une consultation.
 * (Le resultat provient du microservice FastAPI ; voir Etape 4.1.)
 */
public record PredictionRequest(
        List<String> symptomesAnalyses,
        String maladiePredite,
        Double probabilite
) {
}
