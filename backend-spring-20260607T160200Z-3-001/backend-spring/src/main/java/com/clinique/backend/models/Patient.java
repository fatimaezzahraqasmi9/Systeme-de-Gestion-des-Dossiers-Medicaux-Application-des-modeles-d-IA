package com.clinique.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Sous-classe Patient (heritage JOINED : table "patients" jointe a "utilisateurs").
 */
@Entity
@Table(name = "patients")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Patient extends Utilisateur {

    @Column(unique = true)
    private String cin;

    private LocalDate dateNaissance;

    private String telephone;
}
