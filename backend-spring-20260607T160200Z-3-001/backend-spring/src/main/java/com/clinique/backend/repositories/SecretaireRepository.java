package com.clinique.backend.repositories;

import com.clinique.backend.models.Secretaire;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecretaireRepository extends JpaRepository<Secretaire, Long> {

    Optional<Secretaire> findByEmail(String email);
}
