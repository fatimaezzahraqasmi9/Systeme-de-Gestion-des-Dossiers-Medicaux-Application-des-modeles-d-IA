package com.clinique.backend.controllers;

import com.clinique.backend.dto.ConsultationRequest;
import com.clinique.backend.dto.ConsultationResponse;
import com.clinique.backend.dto.DocumentResponse;
import com.clinique.backend.dto.PredictionIAResponse;
import com.clinique.backend.dto.PredictionRequest;
import com.clinique.backend.models.Document;
import com.clinique.backend.models.TypeDocument;
import com.clinique.backend.services.ConsultationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * API REST des consultations (Etape 2.3) :
 * CRUD, prediction IA et upload/telechargement de documents PDF.
 */
@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    // ===== CRUD consultation =====

    @PostMapping
    public ResponseEntity<ConsultationResponse> creer(@Valid @RequestBody ConsultationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultationService.creer(request));
    }

    @GetMapping
    public List<ConsultationResponse> lister(@RequestParam(required = false) Long patientId) {
        if (patientId != null) {
            return consultationService.listerParPatient(patientId);
        }
        return consultationService.lister();
    }

    @GetMapping("/{id}")
    public ConsultationResponse obtenir(@PathVariable Long id) {
        return consultationService.obtenir(id);
    }

    @PutMapping("/{id}")
    public ConsultationResponse modifier(@PathVariable Long id, @Valid @RequestBody ConsultationRequest request) {
        return consultationService.modifier(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        consultationService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Prediction IA =====

    @GetMapping("/{id}/prediction")
    public PredictionIAResponse obtenirPrediction(@PathVariable Long id) {
        return consultationService.obtenirPrediction(id);
    }

    @PutMapping("/{id}/prediction")
    public PredictionIAResponse enregistrerPrediction(
            @PathVariable Long id, @RequestBody PredictionRequest request) {
        return consultationService.enregistrerPrediction(
                id, request.symptomesAnalyses(), request.maladiePredite(), request.probabilite());
    }

    // ===== Documents (ordonnances / analyses PDF) =====

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploaderDocument(
            @PathVariable Long id,
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam("type") TypeDocument type) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationService.ajouterDocument(id, fichier, type));
    }

    @GetMapping("/{id}/documents")
    public List<DocumentResponse> listerDocuments(@PathVariable Long id) {
        return consultationService.listerDocuments(id);
    }

    @GetMapping("/documents/{documentId}")
    public ResponseEntity<Resource> telechargerDocument(@PathVariable Long documentId) {
        Document document = consultationService.obtenirDocument(documentId);
        Resource resource = consultationService.chargerFichierDocument(document);
        String contentType = document.getContentType() != null
                ? document.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getNomFichier() + "\"")
                .body(resource);
    }
}
