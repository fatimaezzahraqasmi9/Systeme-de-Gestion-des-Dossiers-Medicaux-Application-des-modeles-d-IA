package com.clinique.backend.controllers;

import com.clinique.backend.dto.RendezVousRequest;
import com.clinique.backend.dto.RendezVousResponse;
import com.clinique.backend.models.StatutRendezVous;
import com.clinique.backend.services.RendezVousService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * API REST CRUD de gestion des rendez-vous (Etape 2.2).
 */
@RestController
@RequestMapping("/api/rendezvous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService rendezVousService;

    @PostMapping
    public ResponseEntity<RendezVousResponse> creer(@Valid @RequestBody RendezVousRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rendezVousService.creer(request));
    }

    @GetMapping
    public List<RendezVousResponse> lister(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long medecinId) {
        if (patientId != null) {
            return rendezVousService.listerParPatient(patientId);
        }
        if (medecinId != null) {
            return rendezVousService.listerParMedecin(medecinId);
        }
        return rendezVousService.lister();
    }

    @GetMapping("/{id}")
    public RendezVousResponse obtenir(@PathVariable Long id) {
        return rendezVousService.obtenir(id);
    }

    @PutMapping("/{id}")
    public RendezVousResponse modifier(@PathVariable Long id, @Valid @RequestBody RendezVousRequest request) {
        return rendezVousService.modifier(id, request);
    }

    @PatchMapping("/{id}/statut")
    public RendezVousResponse changerStatut(@PathVariable Long id, @RequestParam StatutRendezVous statut) {
        return rendezVousService.changerStatut(id, statut);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        rendezVousService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
