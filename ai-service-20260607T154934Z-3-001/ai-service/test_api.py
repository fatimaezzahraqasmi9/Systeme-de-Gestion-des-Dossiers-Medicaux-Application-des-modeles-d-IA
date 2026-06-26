"""
Script de test simple de l'API de prediction.
Lancer l'API d'abord :  uvicorn main:app --reload
Puis :                   python test_api.py
"""
import httpx

BASE_URL = "http://127.0.0.1:8000"


def main():
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        print("== /health ==")
        print(client.get("/health").json())

        print("\n== /symptoms (extrait) ==")
        data = client.get("/symptoms").json()
        print("count:", data["count"], "| 5 premiers:", data["symptoms"][:5])

        # Cas 1 : symptomes d'une infection fongique typique
        print("\n== /predict (itching, skin_rash, nodal_skin_eruptions, dischromic_patches) ==")
        r = client.post("/predict", json={
            "symptoms": ["itching", "skin_rash", "nodal_skin_eruptions", "dischromic_patches"]
        })
        print(r.json())

        # Cas 2 : symptomes respiratoires + un symptome inconnu (ignore)
        print("\n== /predict (continuous_sneezing, chills, fatigue, symptome_bidon) ==")
        r = client.post("/predict", json={
            "symptoms": ["continuous_sneezing", "chills", "fatigue", "symptome_bidon"]
        })
        print(r.json())

        # Cas 3 : chatbot medical (Gemini)
        print("\n== /chat ==")
        r = client.post("/chat", json={
            "message": "Bonjour, j'ai de la fievre et des maux de tete depuis hier. Que me conseilles-tu ?",
            "history": []
        }, timeout=30)
        if r.status_code == 200:
            print("Reponse:", r.json()["reply"][:500])
        else:
            print("Statut:", r.status_code, "| Detail:", r.json())


if __name__ == "__main__":
    main()
