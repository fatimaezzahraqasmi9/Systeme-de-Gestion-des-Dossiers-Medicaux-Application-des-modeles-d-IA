package com.clinique.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Prediction renvoyee par le microservice IA (FastAPI) pour une consultation.
 */
@Entity
@Table(name = "predictions_ia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_generation", updatable = false)
    private LocalDateTime dateGeneration;

    /** Symptomes envoyes a l'IA, stockes en JSONB. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "symptomes_analyses", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> symptomesAnalyses = new ArrayList<>();

    @Column(name = "maladie_predite")
    private String maladiePredite;

    private Double probabilite;

    @JsonIgnore
    @OneToOne(optional = false)
    @JoinColumn(name = "consultation_id", unique = true)
    private Consultation consultation;

    @PrePersist
    protected void onCreate() {
        if (dateGeneration == null) {
            dateGeneration = LocalDateTime.now();
        }
    }
}
