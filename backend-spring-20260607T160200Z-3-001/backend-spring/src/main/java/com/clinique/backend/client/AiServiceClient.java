package com.clinique.backend.client;

import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Client HTTP vers le microservice IA FastAPI (port 8000).
 * Appelle POST /predict avec la liste des symptomes et retourne
 * la prediction, ou Optional.empty() si le service est indisponible.
 */
@Component
@Slf4j
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${application.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${application.ai-service.enabled:true}")
    private boolean enabled;

    public AiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Optional<AiPredictionResponse> predire(List<String> symptomes) {
        if (!enabled || symptomes == null || symptomes.isEmpty()) {
            return Optional.empty();
        }
        try {
            AiPredictionRequest request = new AiPredictionRequest(symptomes);
            ResponseEntity<AiPredictionResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/predict",
                    request,
                    AiPredictionResponse.class
            );
            return Optional.ofNullable(response.getBody());
        } catch (Exception e) {
            log.warn("Microservice IA indisponible : {}", e.getMessage());
            return Optional.empty();
        }
    }
}
