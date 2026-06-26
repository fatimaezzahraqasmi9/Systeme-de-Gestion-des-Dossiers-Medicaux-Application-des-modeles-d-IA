package com.clinique.backend.repositories;

import com.clinique.backend.models.PredictionIA;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionIARepository extends JpaRepository<PredictionIA, Long> {

    Optional<PredictionIA> findByConsultationId(Long consultationId);
}
