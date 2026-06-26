import { aiApi } from './axios'

/** Récupère la liste ordonnée des 132 symptômes depuis FastAPI. */
export const getSymptoms = () => aiApi.get('/symptoms').then((r) => r.data)

/** Prédiction directe (optionnel — le backend le fait aussi à la création). */
export const predict = (symptoms) =>
  aiApi.post('/predict', { symptoms }).then((r) => r.data)

/** Chatbot médical Gemini. */
export const chat = (message, history = []) =>
  aiApi.post('/chat', { message, history }).then((r) => r.data)
