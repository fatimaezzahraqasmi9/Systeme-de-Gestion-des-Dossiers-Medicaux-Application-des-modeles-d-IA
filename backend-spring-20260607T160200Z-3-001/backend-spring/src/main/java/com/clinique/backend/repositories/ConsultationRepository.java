package com.clinique.backend.repositories;

import com.clinique.backend.models.Consultation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientId(Long patientId);

    List<Consultation> findByMedecinId(Long medecinId);

    List<Consultation> findByDossierMedicalId(Long dossierMedicalId);
}
