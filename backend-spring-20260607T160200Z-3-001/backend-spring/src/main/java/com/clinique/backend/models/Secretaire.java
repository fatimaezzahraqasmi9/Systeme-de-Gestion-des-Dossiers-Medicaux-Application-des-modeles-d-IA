package com.clinique.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Sous-classe Secretaire (heritage JOINED : table "secretaires" jointe a "utilisateurs").
 */
@Entity
@Table(name = "secretaires")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Secretaire extends Utilisateur {

    private String numeroBureau;
}
