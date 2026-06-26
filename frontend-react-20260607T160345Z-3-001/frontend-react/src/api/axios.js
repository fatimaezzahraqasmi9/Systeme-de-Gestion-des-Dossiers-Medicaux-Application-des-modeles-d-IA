import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000'

/** Client vers le backend Spring Boot (auth, RDV, consultations, documents). */
export const api = axios.create({ baseURL: API_URL })

/** Client vers le microservice IA FastAPI (symptômes, prédiction, chat). */
export const aiApi = axios.create({ baseURL: AI_URL })

// Attache automatiquement le token JWT aux requêtes vers le backend.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Déconnecte l'utilisateur si le token est invalide / expiré.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export { API_URL, AI_URL }
