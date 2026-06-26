package com.clinique.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Consultation realisee par un medecin pour un patient.
 * <p>
 * L'attribut {@code symptomes} contient la liste des symptomes coches par le
 * medecin (parmi les 132 symptomes du modele IA). Il est persiste en JSONB
 * grace a {@link JdbcTypeCode}({@link SqlTypes#JSON}).
 */
@Entity
@Table(name = "consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_consultation", nullable = false)
    private LocalDateTime dateConsultation;

    private String motif;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(name = "ordonnance_notes", columnDefinition = "TEXT")
    private String ordonnanceNotes;

    /** Symptomes coches par le medecin, stockes en JSONB. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "symptomes", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> symptomes = new ArrayList<>();

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medecin_id")
    private Medecin medecin;

    @ManyToOne
    @JoinColumn(name = "dossier_medical_id")
    private DossierMedical dossierMedical;

    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true)
    private PredictionIA predictionIA;

    @JsonIgnore
    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateConsultation == null) {
            dateConsultation = LocalDateTime.now();
        }
    }
}
