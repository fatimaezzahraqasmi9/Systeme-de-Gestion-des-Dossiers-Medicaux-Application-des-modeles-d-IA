package com.clinique.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Sous-classe Medecin (heritage JOINED : table "medecins" jointe a "utilisateurs").
 */
@Entity
@Table(name = "medecins")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Medecin extends Utilisateur {

    private String specialite;
}
