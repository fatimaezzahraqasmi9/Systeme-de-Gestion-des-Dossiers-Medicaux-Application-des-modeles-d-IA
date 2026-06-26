package com.clinique.backend.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Reponse du microservice IA (POST /predict).
 * Les noms de champs cote FastAPI sont en snake_case.
 */
public record AiPredictionResponse(
        String prognosis,
        Double confidence,
        @JsonProperty("matched_symptoms") List<String> matchedSymptoms,
        @JsonProperty("unknown_symptoms") List<String> unknownSymptoms
) {
}
