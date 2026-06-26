package com.clinique.backend.services;

import com.clinique.backend.client.AiPredictionResponse;
import com.clinique.backend.client.AiServiceClient;
import com.clinique.backend.dto.ConsultationRequest;
import com.clinique.backend.dto.ConsultationResponse;
import com.clinique.backend.dto.DocumentResponse;
import com.clinique.backend.dto.PredictionIAResponse;
import com.clinique.backend.models.Consultation;
import com.clinique.backend.models.Document;
import com.clinique.backend.models.DossierMedical;
import com.clinique.backend.models.Medecin;
import com.clinique.backend.models.Patient;
import com.clinique.backend.models.PredictionIA;
import com.clinique.backend.models.TypeDocument;
import com.clinique.backend.repositories.ConsultationRepository;
import com.clinique.backend.repositories.DocumentRepository;
import com.clinique.backend.repositories.DossierMedicalRepository;
import com.clinique.backend.repositories.MedecinRepository;
import com.clinique.backend.repositories.PatientRepository;
import com.clinique.backend.repositories.PredictionIARepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Logique metier des consultations : CRUD, rattachement au dossier medical,
 * gestion de la prediction IA et des documents (ordonnances / analyses PDF).
 */
@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final PredictionIARepository predictionIARepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final AiServiceClient aiServiceClient;

    @Transactional
    public ConsultationResponse creer(ConsultationRequest req) {
        Patient patient = patientRepository.findById(req.patientId())
                .orElseThrow(() -> notFound("Patient", req.patientId()));
        Medecin medecin = medecinRepository.findById(req.medecinId())
                .orElseThrow(() -> notFound("Medecin", req.medecinId()));

        // Recupere ou cree le dossier medical du patient.
        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patient.getId())
                .orElseGet(() -> dossierMedicalRepository.save(
                        DossierMedical.builder().patient(patient).build()));

        Consultation consultation = Consultation.builder()
                .dateConsultation(req.dateConsultation())
                .motif(req.motif())
                .diagnostic(req.diagnostic())
                .ordonnanceNotes(req.ordonnanceNotes())
                .symptomes(req.symptomes() != null ? req.symptomes() : new ArrayList<>())
                .patient(patient)
                .medecin(medecin)
                .dossierMedical(dossier)
                .build();

        // Etape 4.1 : appel au microservice IA pour obtenir une prediction.
        appelerPredictionIA(consultation);

        return ConsultationResponse.from(consultationRepository.save(consultation));
    }

    /**
     * Appelle le microservice IA avec les symptomes de la consultation et,
     * en cas de succes, rattache une {@link PredictionIA} (persistee en cascade).
     */
    private void appelerPredictionIA(Consultation consultation) {
        List<String> symptomes = consultation.getSymptomes();
        if (symptomes == null || symptomes.isEmpty()) {
            return;
        }

        aiServiceClient.predire(symptomes).ifPresent((AiPredictionResponse resultat) -> {
            PredictionIA prediction = PredictionIA.builder()
                    .symptomesAnalyses(new ArrayList<>(symptomes))
                    .maladiePredite(resultat.prognosis())
                    .probabilite(resultat.confidence())
                    .consultation(consultation)
                    .build();
            consultation.setPredictionIA(prediction);
        });
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> lister() {
        return consultationRepository.findAll().stream().map(ConsultationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ConsultationResponse obtenir(Long id) {
        return ConsultationResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> listerParPatient(Long patientId) {
        return consultationRepository.findByPatientId(patientId).stream()
                .map(ConsultationResponse::from).toList();
    }

    @Transactional
    public ConsultationResponse modifier(Long id, ConsultationRequest req) {
        Consultation c = getOrThrow(id);
        if (req.dateConsultation() != null) {
            c.setDateConsultation(req.dateConsultation());
        }
        c.setMotif(req.motif());
        c.setDiagnostic(req.diagnostic());
        c.setOrdonnanceNotes(req.ordonnanceNotes());
        if (req.symptomes() != null) {
            c.setSymptomes(req.symptomes());
        }
        return ConsultationResponse.from(consultationRepository.save(c));
    }

    @Transactional
    public void supprimer(Long id) {
        if (!consultationRepository.existsById(id)) {
            throw notFound("Consultation", id);
        }
        consultationRepository.deleteById(id);
    }

    // ===== Prediction IA =====

    /**
     * Recupere la prediction IA associee a une consultation.
     */
    @Transactional(readOnly = true)
    public PredictionIAResponse obtenirPrediction(Long consultationId) {
        PredictionIA prediction = predictionIARepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Aucune prediction pour la consultation " + consultationId));
        return PredictionIAResponse.from(prediction);
    }

    /**
     * Enregistre (ou remplace) une prediction IA pour une consultation.
     * <p>
     * NB : l'appel reel au microservice FastAPI sera branche a l'Etape 4.1 ;
     * cette methode persiste le resultat retourne par l'IA.
     */
    @Transactional
    public PredictionIAResponse enregistrerPrediction(
            Long consultationId, List<String> symptomes, String maladiePredite, Double probabilite) {
        Consultation c = getOrThrow(consultationId);

        PredictionIA prediction = c.getPredictionIA();
        if (prediction == null) {
            prediction = new PredictionIA();
            prediction.setConsultation(c);
            c.setPredictionIA(prediction);
        }
        prediction.setSymptomesAnalyses(
                symptomes != null ? symptomes : new ArrayList<>(c.getSymptomes()));
        prediction.setMaladiePredite(maladiePredite);
        prediction.setProbabilite(probabilite);

        consultationRepository.save(c);
        return PredictionIAResponse.from(c.getPredictionIA());
    }

    // ===== Documents (ordonnances / analyses PDF) =====

    @Transactional
    public DocumentResponse ajouterDocument(Long consultationId, MultipartFile fichier, TypeDocument type) {
        Consultation c = getOrThrow(consultationId);
        String cheminStockage = fileStorageService.store(fichier);

        Document document = Document.builder()
                .nomFichier(fichier.getOriginalFilename())
                .contentType(fichier.getContentType())
                .taille(fichier.getSize())
                .cheminStockage(cheminStockage)
                .type(type)
                .consultation(c)
                .build();

        return DocumentResponse.from(documentRepository.save(document));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listerDocuments(Long consultationId) {
        getOrThrow(consultationId);
        return documentRepository.findByConsultationId(consultationId).stream()
                .map(DocumentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Document obtenirDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> notFound("Document", documentId));
    }

    @Transactional(readOnly = true)
    public Resource chargerFichierDocument(Document document) {
        return fileStorageService.load(document.getCheminStockage());
    }

    private Consultation getOrThrow(Long id) {
        return consultationRepository.findById(id).orElseThrow(() -> notFound("Consultation", id));
    }

    private ResponseStatusException notFound(String entite, Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, entite + " introuvable (id=" + id + ")");
    }
}
