import { api } from './axios'

export const getMedecins = () => api.get('/api/medecins').then((r) => r.data)
export const getPatients = () => api.get('/api/patients').then((r) => r.data)
