import { api } from './axios'

export const createConsultation = (data) =>
  api.post('/api/consultations', data).then((r) => r.data)

export const getConsultations = (params = {}) =>
  api.get('/api/consultations', { params }).then((r) => r.data)

export const getConsultation = (id) =>
  api.get(`/api/consultations/${id}`).then((r) => r.data)

export const getDossierPatient = (patientId) =>
  api.get(`/api/dossiers/patient/${patientId}`).then((r) => r.data)

export const getDocuments = (consultationId) =>
  api.get(`/api/consultations/${consultationId}/documents`).then((r) => r.data)

export const uploadDocument = (consultationId, file, type) => {
  const form = new FormData()
  form.append('fichier', file)
  form.append('type', type)
  return api
    .post(`/api/consultations/${consultationId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

import { API_URL } from './axios'
export const documentDownloadUrl = (documentId) =>
  `${API_URL}/api/consultations/documents/${documentId}`
