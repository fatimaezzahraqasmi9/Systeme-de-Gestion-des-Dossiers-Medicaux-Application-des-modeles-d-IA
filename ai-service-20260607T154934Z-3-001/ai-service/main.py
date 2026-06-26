"""
Microservice IA - Prediction de maladies (FastAPI).

Charge un modele scikit-learn (RandomForestClassifier) entraine sur le dataset
Kaggle "Disease Prediction Using Machine Learning" (132 symptomes -> prognosis).

Le service recoit une liste de symptomes, construit le vecteur binaire d'entree
dans l'ordre exact attendu par le modele, puis renvoie la maladie predite et la
probabilite (confiance) associee.
"""
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from chatbot import ChatbotService

# Charge les variables d'environnement (.env) avant tout le reste.
load_dotenv()

MODEL_PATH = Path(__file__).parent / "model" / "model.pkl"

# Etat partage de l'application (rempli au demarrage).
state: dict = {
    "model": None,
    "symptoms": [],        # noms exacts des 132 features, dans l'ordre du modele
    "lookup": {},          # nom normalise -> nom exact de feature
    "classes": [],         # maladies possibles
    "chatbot": None,       # service de chatbot Gemini
}


def _normalize(name: str) -> str:
    """Normalise un nom de symptome pour tolerer les variations d'ecriture.

    Le dataset contient des noms irreguliers ("spotting_ urination",
    "foul_smell_of urine", "dischromic _patches"...). On supprime espaces,
    underscores et la casse pour permettre une correspondance robuste.
    """
    return name.strip().lower().replace(" ", "").replace("_", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Charge le modele .pkl au demarrage de l'application."""
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Modele introuvable : {MODEL_PATH}")

    model = joblib.load(MODEL_PATH)

    # Ordre exact des features attendu par le modele.
    if hasattr(model, "feature_names_in_"):
        symptoms = [str(f) for f in model.feature_names_in_]
    else:
        symptoms = list(SYMPTOMS_FALLBACK)

    if len(symptoms) != getattr(model, "n_features_in_", len(symptoms)):
        raise RuntimeError(
            f"Incoherence : {len(symptoms)} symptomes pour "
            f"{getattr(model, 'n_features_in_', '?')} features attendues."
        )

    # Table de correspondance nom normalise -> nom exact (1ere occurrence gardee).
    lookup: dict = {}
    for feat in symptoms:
        lookup.setdefault(_normalize(feat), feat)

    state["model"] = model
    state["symptoms"] = symptoms
    state["lookup"] = lookup
    state["classes"] = [str(c) for c in getattr(model, "classes_", [])]

    # Initialise le service de chatbot (Gemini).
    state["chatbot"] = ChatbotService()

    print(f"[ai-service] Modele charge : {type(model).__name__} "
          f"| {len(symptoms)} symptomes | {len(state['classes'])} maladies")
    print(f"[ai-service] Chatbot Gemini : "
          f"{'configure' if state['chatbot'].disponible else 'NON configure (cle absente)'}")
    yield
    state.clear()


app = FastAPI(
    title="AI Service - Prediction de maladies",
    description="Microservice IA pour la prediction de maladies a partir de symptomes.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS ouvert (le backend Spring et le frontend React appellent ce service).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas (Pydantic)
# ---------------------------------------------------------------------------
class PredictionRequest(BaseModel):
    symptoms: List[str] = Field(
        ...,
        description="Liste des symptomes observes (ex: ['itching', 'skin_rash']).",
        examples=[["itching", "skin_rash", "nodal_skin_eruptions"]],
    )


class DiseaseProba(BaseModel):
    disease: str
    probability: float


class PredictionResponse(BaseModel):
    prognosis: str = Field(..., description="Maladie predite.")
    confidence: float = Field(..., description="Probabilite de la maladie predite (0..1).")
    matched_symptoms: List[str] = Field(..., description="Symptomes reconnus par le modele.")
    unknown_symptoms: List[str] = Field(..., description="Symptomes non reconnus (ignores).")
    top_predictions: List[DiseaseProba] = Field(..., description="Top 3 des maladies probables.")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"service": "ai-service", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {
        "status": "ok" if state.get("model") is not None else "model_not_loaded",
        "model": type(state["model"]).__name__ if state.get("model") is not None else None,
        "n_symptoms": len(state.get("symptoms", [])),
        "n_diseases": len(state.get("classes", [])),
    }


@app.get("/symptoms")
def list_symptoms():
    """Liste ordonnee des 132 symptomes (utile pour l'autocomplete du frontend)."""
    return {"count": len(state["symptoms"]), "symptoms": state["symptoms"]}


@app.get("/diseases")
def list_diseases():
    """Liste des maladies que le modele peut predire."""
    return {"count": len(state["classes"]), "diseases": state["classes"]}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    model = state.get("model")
    if model is None:
        raise HTTPException(status_code=503, detail="Modele non charge.")

    if not request.symptoms:
        raise HTTPException(status_code=400, detail="La liste de symptomes est vide.")

    symptoms = state["symptoms"]
    lookup = state["lookup"]

    # Construction du vecteur binaire dans l'ordre exact des features.
    vector = {feat: 0 for feat in symptoms}
    matched: List[str] = []
    unknown: List[str] = []

    for raw in request.symptoms:
        feat = lookup.get(_normalize(raw))
        if feat is not None:
            vector[feat] = 1
            matched.append(feat)
        else:
            unknown.append(raw)

    if not matched:
        raise HTTPException(
            status_code=400,
            detail="Aucun symptome reconnu. Voir GET /symptoms pour la liste valide.",
        )

    # DataFrame avec les noms de colonnes exacts -> evite tout warning sklearn.
    X = pd.DataFrame([[vector[feat] for feat in symptoms]], columns=symptoms)

    prediction = str(model.predict(X)[0])

    # Probabilites (confiance).
    proba = model.predict_proba(X)[0]
    classes = [str(c) for c in model.classes_]
    pairs = sorted(zip(classes, proba), key=lambda t: t[1], reverse=True)

    confidence = float(dict(pairs).get(prediction, max(proba)))
    top3 = [DiseaseProba(disease=d, probability=round(float(p), 4)) for d, p in pairs[:3]]

    return PredictionResponse(
        prognosis=prediction,
        confidence=round(confidence, 4),
        matched_symptoms=matched,
        unknown_symptoms=unknown,
        top_predictions=top3,
    )


# ---------------------------------------------------------------------------
# Chatbot medical (Gemini) - Etape 3.3
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' ou 'assistant'.")
    content: str = Field(..., description="Contenu du message.")


class ChatRequest(BaseModel):
    message: str = Field(..., description="Message de l'utilisateur.",
                         examples=["J'ai de la fievre et mal a la gorge, que faire ?"])
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Historique de la conversation (optionnel).",
    )


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Reponse de l'assistant medical.")


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    chatbot = state.get("chatbot")
    if chatbot is None or not chatbot.disponible:
        raise HTTPException(
            status_code=503,
            detail="Chatbot non configure : verifiez la variable GEMINI_API_KEY.",
        )
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Le message est vide.")

    try:
        reply = chatbot.generer_reponse(
            request.message,
            [m.model_dump() for m in request.history],
        )
    except Exception as exc:  # erreur d'appel a l'API Gemini
        raise HTTPException(status_code=502, detail=f"Erreur du service Gemini : {exc}")

    return ChatResponse(reply=reply)


# ---------------------------------------------------------------------------
# Liste de secours des 132 symptomes (ordre du dataset Kaggle).
# Utilisee uniquement si le modele n'expose pas feature_names_in_.
# ---------------------------------------------------------------------------
SYMPTOMS_FALLBACK = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering",
    "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting",
    "vomiting", "burning_micturition", "spotting_ urination", "fatigue", "weight_gain",
    "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness",
    "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", "high_fever",
    "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion", "headache",
    "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes",
    "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine",
    "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach",
    "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision", "phlegm",
    "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion",
    "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements",
    "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness",
    "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels",
    "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties",
    "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech",
    "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck", "swelling_joints",
    "movement_stiffness", "spinning_movements", "loss_of_balance", "unsteadiness",
    "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort", "foul_smell_of urine",
    "continuous_feel_of_urine", "passage_of_gases", "internal_itching", "toxic_look_(typhos)",
    "depression", "irritability", "muscle_pain", "altered_sensorium", "red_spots_over_body",
    "belly_pain", "abnormal_menstruation", "dischromic _patches", "watering_from_eyes",
    "increased_appetite", "polyuria", "family_history", "mucoid_sputum", "rusty_sputum",
    "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion",
    "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen",
    "history_of_alcohol_consumption", "fluid_overload.1", "blood_in_sputum",
    "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples",
    "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails",
    "inflammatory_nails", "blister", "red_sore_around_nose", "yellow_crust_ooze",
]
