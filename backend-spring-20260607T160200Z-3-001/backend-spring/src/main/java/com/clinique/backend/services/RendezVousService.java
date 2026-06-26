package com.clinique.backend.services;

import com.clinique.backend.dto.RendezVousRequest;
import com.clinique.backend.dto.RendezVousResponse;
import com.clinique.backend.models.Medecin;
import com.clinique.backend.models.Patient;
import com.clinique.backend.models.RendezVous;
import com.clinique.backend.models.Secretaire;
import com.clinique.backend.models.StatutRendezVous;
import com.clinique.backend.repositories.MedecinRepository;
import com.clinique.backend.repositories.PatientRepository;
import com.clinique.backend.repositories.RendezVousRepository;
import com.clinique.backend.repositories.SecretaireRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Logique metier de gestion des rendez-vous (CRUD + changement de statut).
 */
@Service
@RequiredArgsConstructor
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final SecretaireRepository secretaireRepository;

    @Transactional
    public RendezVousResponse creer(RendezVousRequest req) {
        Patient patient = patientRepository.findById(req.patientId())
                .orElseThrow(() -> notFound("Patient", req.patientId()));
        Medecin medecin = medecinRepository.findById(req.medecinId())
                .orElseThrow(() -> notFound("Medecin", req.medecinId()));

        Secretaire secretaire = null;
        if (req.secretaireId() != null) {
            secretaire = secretaireRepository.findById(req.secretaireId())
                    .orElseThrow(() -> notFound("Secretaire", req.secretaireId()));
        }

        RendezVous rdv = RendezVous.builder()
                .dateHeure(req.dateHeure())
                .statut(StatutRendezVous.EN_ATTENTE)
                .motif(req.motif())
                .patient(patient)
                .medecin(medecin)
                .secretaire(secretaire)
                .build();

        return RendezVousResponse.from(rendezVousRepository.save(rdv));
    }

    @Transactional(readOnly = true)
    public List<RendezVousResponse> lister() {
        return rendezVousRepository.findAll().stream().map(RendezVousResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RendezVousResponse obtenir(Long id) {
        return RendezVousResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<RendezVousResponse> listerParPatient(Long patientId) {
        return rendezVousRepository.findByPatientId(patientId).stream().map(RendezVousResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<RendezVousResponse> listerParMedecin(Long medecinId) {
        return rendezVousRepository.findByMedecinId(medecinId).stream().map(RendezVousResponse::from).toList();
    }

    @Transactional
    public RendezVousResponse modifier(Long id, RendezVousRequest req) {
        RendezVous rdv = getOrThrow(id);

        if (req.dateHeure() != null) {
            rdv.setDateHeure(req.dateHeure());
        }
        rdv.setMotif(req.motif());

        if (req.patientId() != null) {
            rdv.setPatient(patientRepository.findById(req.patientId())
                    .orElseThrow(() -> notFound("Patient", req.patientId())));
        }
        if (req.medecinId() != null) {
            rdv.setMedecin(medecinRepository.findById(req.medecinId())
                    .orElseThrow(() -> notFound("Medecin", req.medecinId())));
        }
        if (req.secretaireId() != null) {
            rdv.setSecretaire(secretaireRepository.findById(req.secretaireId())
                    .orElseThrow(() -> notFound("Secretaire", req.secretaireId())));
        }

        return RendezVousResponse.from(rendezVousRepository.save(rdv));
    }

    @Transactional
    public RendezVousResponse changerStatut(Long id, StatutRendezVous statut) {
        RendezVous rdv = getOrThrow(id);
        rdv.setStatut(statut);
        return RendezVousResponse.from(rendezVousRepository.save(rdv));
    }

    @Transactional
    public void supprimer(Long id) {
        if (!rendezVousRepository.existsById(id)) {
            throw notFound("RendezVous", id);
        }
        rendezVousRepository.deleteById(id);
    }

    private RendezVous getOrThrow(Long id) {
        return rendezVousRepository.findById(id).orElseThrow(() -> notFound("RendezVous", id));
    }

    private ResponseStatusException notFound(String entite, Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, entite + " introuvable (id=" + id + ")");
    }
}
