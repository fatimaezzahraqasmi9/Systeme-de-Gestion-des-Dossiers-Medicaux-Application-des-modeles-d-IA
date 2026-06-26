package com.clinique.backend.repositories;

import com.clinique.backend.models.Patient;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByCin(String cin);

    Optional<Patient> findByEmail(String email);
}
