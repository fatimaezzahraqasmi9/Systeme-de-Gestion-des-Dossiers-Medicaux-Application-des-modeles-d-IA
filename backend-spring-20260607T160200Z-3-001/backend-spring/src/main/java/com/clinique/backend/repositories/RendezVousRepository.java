package com.clinique.backend.repositories;

import com.clinique.backend.models.RendezVous;
import com.clinique.backend.models.StatutRendezVous;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    List<RendezVous> findByPatientId(Long patientId);

    List<RendezVous> findByMedecinId(Long medecinId);

    List<RendezVous> findByStatut(StatutRendezVous statut);
}
