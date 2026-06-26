"""
Chatbot medical d'orientation, base sur l'API d'IA.

Le service expose une fonction `generer_reponse` qui prend le message de
l'utilisateur et l'historique de conversation, et renvoie la reponse du modele.
"""
import os
from typing import List, Optional
# pyrefly: ignore [missing-import]
import httpx

from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types

# Instructions systeme : cadre le role et la securite de l'assistant.
SYSTEM_INSTRUCTION = (
    "Tu es un assistant medical virtuel d'orientation pour une clinique. "
    "Ton role est de fournir des informations generales sur la sante, les "
    "symptomes et les maladies, et d'orienter l'utilisateur vers le bon "
    "professionnel de sante. Reponds toujours en francais, de maniere claire, "
    "bienveillante et pedagogique.\n"
    "Regles importantes :\n"
    "- Tu NE poses PAS de diagnostic medical definitif et tu NE prescris PAS "
    "de medicament.\n"
    "- Tu rappelles que tes reponses ne remplacent pas une consultation avec un "
    "medecin qualifie.\n"
    "- En cas de symptomes graves ou d'urgence (douleur thoracique intense, "
    "difficulte a respirer, perte de conscience, saignement abondant...), tu "
    "invites a contacter immediatement les urgences.\n"
    "- Tu restes dans le domaine medical et de la sante ; pour toute autre "
    "demande, tu rediriges poliment vers ce sujet."
)


class ChatbotService:
    """Encapsule le client d'IA (Gemini, OpenRouter, ou Groq)."""

    def __init__(self):
        self.api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
        self.model: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.client: Optional[genai.Client] = None
        
        # Detection automatique du fournisseur d'API
        self.provider = "google"
        if self.api_key:
            self.api_key = self.api_key.strip()
            if self.api_key.startswith("sk-or-"):
                self.provider = "openrouter"
            elif self.api_key.startswith("gsk_"):
                self.provider = "groq"
            else:
                self.client = genai.Client(api_key=self.api_key)

    @property
    def disponible(self) -> bool:
        return bool(self.api_key)

    def generer_reponse(self, message: str, history: Optional[List[dict]] = None) -> str:
        """Genere une reponse a partir du message et de l'historique."""
        if not self.disponible:
            raise RuntimeError(
                "Cle API absente : le chatbot n'est pas configure."
            )

        if self.provider == "openrouter":
            return self._call_openai_compatible(
                url="https://openrouter.ai/api/v1/chat/completions",
                message=message,
                history=history,
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
        elif self.provider == "groq":
            return self._call_openai_compatible(
                url="https://api.groq.com/openai/v1/chat/completions",
                message=message,
                history=history,
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
        else:
            # Google Gemini (Standard)
            contents = []
            for tour in history or []:
                role = tour.get("role", "user")
                role_gemini = "model" if role in ("assistant", "model") else "user"
                texte = tour.get("content", "")
                if texte:
                    contents.append(
                        types.Content(role=role_gemini, parts=[types.Part(text=texte)])
                    )
            contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.4,
                    max_output_tokens=1024,
                ),
            )
            return (response.text or "").strip()

    def _call_openai_compatible(self, url: str, message: str, history: Optional[List[dict]], headers: dict) -> str:
        """Appelle un endpoint compatible avec le standard OpenAI (OpenRouter / Groq)."""
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        for tour in history or []:
            role = "assistant" if tour.get("role") in ("assistant", "model") else "user"
            messages.append({"role": role, "content": tour.get("content", "")})
        messages.append({"role": "user", "content": message})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 1024
        }
        
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                raise RuntimeError(f"Erreur API ({response.status_code}): {response.text}")
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()