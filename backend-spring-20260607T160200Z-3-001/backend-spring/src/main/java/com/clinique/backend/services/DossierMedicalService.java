package com.clinique.backend.services;

import com.clinique.backend.dto.ConsultationResponse;
import com.clinique.backend.dto.DossierMedicalResponse;
import com.clinique.backend.models.DossierMedical;
import com.clinique.backend.repositories.ConsultationRepository;
import com.clinique.backend.repositories.DossierMedicalRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Acces en lecture au dossier medical d'un patient.
 */
@Service
@RequiredArgsConstructor
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final ConsultationRepository consultationRepository;

    @Transactional(readOnly = true)
    public DossierMedicalResponse obtenirParPatient(Long patientId) {
        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Aucun dossier medical pour le patient " + patientId));

        List<ConsultationResponse> consultations = consultationRepository
                .findByDossierMedicalId(dossier.getId()).stream()
                .map(ConsultationResponse::from).toList();

        return DossierMedicalResponse.from(dossier, consultations);
    }
}
