package com.clinique.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Document medical (ordonnance ou analyse PDF) rattache a une consultation.
 * Le fichier est stocke sur le disque ; seules les metadonnees sont en base.
 */
@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomFichier;

    @Column(name = "content_type")
    private String contentType;

    private Long taille;

    /** Chemin du fichier sur le disque. */
    @Column(name = "chemin_stockage", nullable = false)
    private String cheminStockage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocument type;

    @Column(name = "date_upload", updatable = false)
    private LocalDateTime dateUpload;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;

    @PrePersist
    protected void onCreate() {
        if (dateUpload == null) {
            dateUpload = LocalDateTime.now();
        }
    }
}
