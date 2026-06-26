package com.clinique.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
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

/**
 * Dossier medical d'un patient : regroupe l'ensemble de ses consultations.
 */
@Entity
@Table(name = "dossiers_medicaux")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_ouverture", updatable = false)
    private LocalDateTime dateOuverture;

    private String statut;

    @OneToOne
    @JoinColumn(name = "patient_id", unique = true)
    private Patient patient;

    @JsonIgnore
    @OneToMany(mappedBy = "dossierMedical", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Consultation> consultations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateOuverture == null) {
            dateOuverture = LocalDateTime.now();
        }
        if (statut == null) {
            statut = "OUVERT";
        }
    }
}
