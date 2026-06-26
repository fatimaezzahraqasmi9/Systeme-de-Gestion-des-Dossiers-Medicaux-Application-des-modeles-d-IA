import { api } from './axios'

export const createRendezVous = (data) =>
  api.post('/api/rendezvous', data).then((r) => r.data)

export const getRendezVous = (params = {}) =>
  api.get('/api/rendezvous', { params }).then((r) => r.data)

export const updateStatutRendezVous = (id, statut) =>
  api.patch(`/api/rendezvous/${id}/statut`, null, { params: { statut } }).then((r) => r.data)

export const updateRendezVous = (id, data) =>
  api.put(`/api/rendezvous/${id}`, data).then((r) => r.data)

export const deleteRendezVous = (id) =>
  api.delete(`/api/rendezvous/${id}`).then((r) => r.data)
