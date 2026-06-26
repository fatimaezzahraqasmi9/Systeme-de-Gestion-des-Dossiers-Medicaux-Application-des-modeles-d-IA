package com.clinique.backend.repositories;

import com.clinique.backend.models.Medecin;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {

    Optional<Medecin> findByEmail(String email);

    List<Medecin> findBySpecialite(String specialite);
}
