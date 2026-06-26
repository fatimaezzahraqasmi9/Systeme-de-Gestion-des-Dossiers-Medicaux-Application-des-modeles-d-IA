package com.clinique.backend.client;

import java.util.List;

/**
 * Corps de la requete envoyee au microservice IA (POST /predict).
 */
public record AiPredictionRequest(List<String> symptoms) {
}
