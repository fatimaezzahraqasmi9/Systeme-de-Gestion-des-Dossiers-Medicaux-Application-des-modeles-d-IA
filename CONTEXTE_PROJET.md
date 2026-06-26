# CONTEXTE DU PROJET : Système de Gestion des Dossiers Médicaux & Modèles d'IA

Ce document sert de référence globale pour le développement du projet. Claude Code doit lire ce fichier pour comprendre l'architecture globale et respecter les contraintes imposées à chaque étape du projet.

---

## 🏗️ Architecture Globale de l'Application

L'application est structurée en une architecture découplée et orientée microservices/services :

1. **`backend-spring`** (Backend Principal) :
   - **Framework** : Spring Boot (Java 17+)
   - **Base de données** : PostgreSQL (Host: `localhost`, Port: `5433`, User: `postgres`, Password: `2006`, Database: `gestion_clinique`)
   - **Rôle** : Gérer la logique métier, la sécurité (Authentification/Autorisation JWT), la gestion des utilisateurs (Patients, Médecins, Secrétaires), les rendez-vous, les dossiers médicaux et l'upload de documents (ordonnances, analyses PDF).
   - **Communication** : API REST exposée pour le Frontend React, et requêtes HTTP asynchrones/synchrones vers le microservice IA (FastAPI).

2. **`frontend-react`** (Interface Utilisateur) :
   - **Framework** : React (avec Vite et TypeScript/JavaScript)
   - **Styling** : CSS moderne (Clean & Responsive)
   - **Rôle** : Interface utilisateur pour les différents acteurs (Médecins, Secrétaires, Patients) permettant la prise de rendez-vous, la consultation des dossiers, le chat avec l'assistant virtuel et la visualisation des prédictions d'aide au diagnostic.
   - **Spécification UX Consultation (Médecin)** : Pour la saisie des symptômes lors d'une consultation, l'interface React **ne doit pas** afficher 132 cases à cocher. À la place, elle doit proposer une **barre de recherche dynamique à multi-sélection (Autocomplete)**. Le médecin tape les premières lettres d'un symptôme (ex: "tou..."), le système lui suggère les symptômes correspondants (ex: "Toux", "Toux sèche"), et le médecin clique dessus pour les ajouter sous forme de badges/chips. Seuls les symptômes ainsi sélectionnés sont conservés et envoyés pour la prédiction IA.

3. **`ai-service`** (Microservice Intelligence Artificielle) :
   - **Framework** : FastAPI (Python 3.9+)
   - **Rôle** : 
     - Exposer des points d'accès (endpoints) API pour l'entraînement et la prédiction de modèles de Machine Learning.
     - Prédire et analyser de nombreuses maladies (prognosis) à partir d'un ensemble de 132 symptômes en utilisant le dataset Kaggle "Disease Prediction Using Machine Learning" (100% Accuracy). Le service recevra une liste de symptômes sous forme de tableau, l'encodera en vecteurs binaires et renverra la maladie prédite.
     - Intégrer l'API d'un LLM (Gemini ou OpenAI) pour le Chatbot médical (Questions/Réponses sur la santé et les maladies).

4. **`Docker`** (Conteneurisation et Déploiement) :
   - Chaque service (`backend-spring`, `frontend-react`, `ai-service`) doit avoir son propre `Dockerfile` pour être conteneurisé.
   - Un fichier `docker-compose.yml` à la racine permettra de lancer l'ensemble des services ainsi qu'un conteneur PostgreSQL si nécessaire (ici configuré sur le port `5433` local).

---

## 📂 Structure des Dossiers du Projet

Le projet doit être structuré de la manière suivante dans le répertoire racine :

```text
Gestion des dossiers médicaux/
├── backend-spring/       # Projet Spring Boot
├── frontend-react/       # Projet React
├── ai-service/           # Projet FastAPI & Modèles d'IA
├── conception/           # Diagrammes UML et documents de conception
├── docker-compose.yml    # Fichier d'orchestration Docker
└── CONTEXTE_PROJET.md    # Ce document de contexte
```

---

## 🗄️ Structure des Modèles & Conception (Consultation & IA)

Afin d'intégrer le nouveau modèle de prédiction basé sur les 132 symptômes, les modèles Java de Spring Boot doivent être configurés ainsi :

### Entité `Consultation`
*   `id` : Long (Généré)
*   `dateConsultation` : LocalDateTime
*   `motif` : String
*   `diagnostic` : String (saisie manuelle du médecin)
*   `symptomes` : `List<String>` (Représente les symptômes cochés par le médecin pour cette consultation. Stocké sous forme de JSONB ou de texte sérialisé en base PostgreSQL).
*   **Relations** :
    *   `patient` : relation `@ManyToOne` vers `Patient`
    *   `medecin` : relation `@ManyToOne` vers `Medecin`
    *   `predictionIA` : relation `@OneToOne` vers `PredictionIA` (facultatif ou inverse)

### Entité `PredictionIA`
*   `id` : Long (Généré)
*   `datePrediction` : LocalDateTime
*   `symptomesAnalyses` : `List<String>` (La liste des symptômes envoyés à l'IA)
*   `maladiePredite` : String (Le diagnostic retourné par le microservice FastAPI)
*   `probabilite` : Double (Optionnel : confiance du modèle)

---

## 🔑 Acteurs et Fonctionnalités Clés

* **Patient** : S'authentifie, prend/annule un rendez-vous, consulte son historique médical (comprenant les diagnostics et prédictions), discute avec le Chatbot d'orientation médicale.
* **Secrétaire** : Gère les rendez-vous de la clinique, valide les demandes de rendez-vous, enregistre les dossiers de base des patients.
* **Médecin** : Gère les consultations des patients, sélectionne les symptômes observés (qui seront sauvés dans la consultation), appelle le microservice IA pour avoir une prédiction de maladie sur 132 symptômes, saisit son diagnostic final, et charge des fichiers PDF (analyses/ordonnances).

---

## 📈 État d'avancement et Roadmap du Projet

Voici le suivi des tâches (Réinitialisé pour changement de Dataset). Chaque étape terminée doit être cochée `[x]`.

### Phase 1 : Initialisation & Sécurité (Backend Spring Boot)
- [x] **Étape 1.1 & 1.2** : Initialisation du projet `backend-spring`, configuration PostgreSQL (Port 5433, mdp: 2006) et création des entités d'héritage `Utilisateur` (Patient, Medecin, Secretaire) avec JPA.
- [x] **Étape 1.3** : Sécurité (Spring Security + JWT) et contrôleur d'Authentification (Inscription `/api/auth/signup` et Connexion `/api/auth/login`).

### Phase 2 : Métier & Médical (Spring Boot)
- [x] **Étape 2.1** : Entités `RendezVous` et `Consultation` (avec attribut `symptomes` sous forme de liste de chaînes stockée en JSONB ou TEXT) et `PredictionIA`.
- [x] **Étape 2.2** : API REST CRUD pour la gestion des rendez-vous.
- [x] **Étape 2.3** : API REST pour les consultations, récupération des prédictions IA et upload de documents PDF (ordonnances/analyses).

### Phase 3 : Microservice IA (FastAPI & ML)
- [x] **Étape 3.1** : Initialisation de `ai-service` avec FastAPI.
- [x] **Étape 3.2** : Import du dataset Kaggle "Disease Prediction Using Machine Learning" (132 symptômes -> prognosis), entraînement des modèles (Random Forest/SVM) et création de l'endpoint REST de prédiction de maladie. *(Modèle RandomForest entraîné sous Colab et chargé directement depuis `model/model.pkl` ; endpoint `POST /predict` opérationnel.)*
- [x] **Étape 3.3** : Intégration de l'API LLM pour le Chatbot d'orientation médicale. *(SDK google-genai, modèle gemini-2.0-flash, instructions système médicales en français, clé chargée depuis `.env`. Endpoint `POST /chat` implémenté ; la clé s'authentifie et la requête atteint Gemini, mais le free tier est actuellement à 0 (HTTP 429) — activer un quota/facturation côté Google pour des réponses réelles.)*

### Phase 4 : Connexion Microservices & Docker
- [x] **Étape 4.1** : Intégration de l'appel REST vers FastAPI depuis Spring Boot lors de l'ajout d'une consultation (liaison avec l'entité `PredictionIA`). *(Client `AiServiceClient` via RestClient ; à la création d'une consultation avec symptômes, le backend appelle `POST /predict` et persiste la `PredictionIA`. Testé de bout en bout : "Fungal infection" prob. 1.0. Appel résilient — la consultation reste créée si l'IA est indisponible.)*
- [x] **Étape 4.2** : Création des Dockerfiles et du `docker-compose.yml` global. *(Dockerfile multi-stage backend-spring, Dockerfile ai-service, et `docker-compose.yml` orchestrant PostgreSQL + ai-service + backend-spring. Config externalisée via variables d'environnement. Service frontend prévu en commentaire pour la Phase 5.)*

### Phase 5 : Interface Frontend (React)
- [x] **Étape 5.1** : Initialisation de `frontend-react` avec Vite. *(Vite + React, React Router, Axios, Lucide React. Style "Soft UI Evolution + AI-Native" : cyan/vert santé, ombres douces, polices Varela Round/Nunito Sans. Landing page incluse.)*
- [x] **Étape 5.2** : Pages de connexion/inscription et Tableaux de bord (Patient, Médecin, Secrétaire). *(Auth JWT via contexte + routes protégées par rôle. Dashboard Patient : dossier/historique, prise de RDV, mes RDV. Secrétaire : gestion/validation/planification des RDV. Médecin : RDV, consultations, historique.)*
- [x] **Étape 5.3** : Intégration du Chatbot et affichage du formulaire des 132 symptômes et des prédictions. *(ChatWidget Gemini ; autocomplete multi-sélection des 132 symptômes (FastAPI) ; affichage instantané de la prédiction IA (maladie + confiance) ; upload de PDF (ordonnance/analyse). CORS activé côté backend ; nouveaux endpoints `/api/medecins` et `/api/patients`. Dockerfile frontend (Nginx) + service ajouté au docker-compose.)*
