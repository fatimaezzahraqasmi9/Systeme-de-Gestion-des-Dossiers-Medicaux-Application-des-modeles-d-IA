import { useEffect, useState } from 'react'
import {
  CalendarDays, CalendarPlus, Check, X, CheckCheck, Trash2,
  Clock, CalendarCheck, ListChecks, Pencil,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { Tabs } from '../patient/PatientDashboard'
import { Alert, EmptyState, Loading, Spinner, StatCard, StatutBadge, formatDateTime } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { getMedecins, getPatients } from '../../api/users'
import { createRendezVous, deleteRendezVous, getRendezVous, updateRendezVous, updateStatutRendezVous } from '../../api/rendezvous'

const TABS = [
  { id: 'gestion', label: 'Gérer les RDV', icon: <ListChecks size={18} /> },
  { id: 'creer', label: 'Planifier un RDV', icon: <CalendarPlus size={18} /> },
]

export default function SecretaireDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('gestion')
  const [rdvs, setRdvs] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    setLoading(true)
    try { setRdvs(await getRendezVous()) } catch { /* noop */ } finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [])

  const counts = {
    attente: rdvs.filter((r) => r.statut === 'EN_ATTENTE').length,
    confirme: rdvs.filter((r) => r.statut === 'CONFIRME').length,
  }

  return (
    <DashboardLayout title="Espace secrétariat" subtitle="Gérez et validez les rendez-vous de la clinique.">
      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--sp-5)' }}>
        <StatCard icon={<CalendarDays size={24} />} label="Total RDV" value={rdvs.length} />
        <StatCard icon={<Clock size={24} />} label="En attente" value={counts.attente} color="var(--color-warning)" />
        <StatCard icon={<CalendarCheck size={24} />} label="Confirmés" value={counts.confirme} color="var(--color-accent)" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 'var(--sp-5)' }}>
        {tab === 'gestion' && <GestionTab loading={loading} rdvs={rdvs} reload={reload} />}
        {tab === 'creer' && <CreerTab secretaireId={user.id} onCreated={() => { reload(); setTab('gestion') }} />}
      </div>
    </DashboardLayout>
  )
}

function GestionTab({ loading, rdvs, reload }) {
  const [busy, setBusy] = useState(null)
  const [editingRdv, setEditingRdv] = useState(null)

  const change = async (id, statut) => {
    setBusy(id)
    try { await updateStatutRendezVous(id, statut); await reload() } finally { setBusy(null) }
  }
  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement ce rendez-vous ?')) return
    setBusy(id)
    try { await deleteRendezVous(id); await reload() } finally { setBusy(null) }
  }

  if (loading) return <div className="card"><Loading /></div>
  if (rdvs.length === 0)
    return <div className="card"><EmptyState icon={<CalendarDays size={28} />} title="Aucun rendez-vous" hint="Les demandes des patients apparaîtront ici." /></div>

  return (
    <>
      {editingRdv && (
        <EditModal
          rdv={editingRdv}
          onClose={() => setEditingRdv(null)}
          onSaved={() => { setEditingRdv(null); reload() }}
        />
      )}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Médecin</th><th>Motif</th><th>Statut</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {rdvs.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.dateHeure)}</td>
                  <td>{r.patientNom}</td>
                  <td>Dr {r.medecinNom}</td>
                  <td className="text-soft">{r.motif || '—'}</td>
                  <td><StatutBadge statut={r.statut} /></td>
                  <td>
                    <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                      {busy === r.id ? <Spinner dark size={18} /> : (
                        <>
                          <button className="btn btn-soft btn-sm" title="Modifier" onClick={() => setEditingRdv(r)}>
                            <Pencil size={14} /> Modifier
                          </button>
                          {r.statut === 'EN_ATTENTE' && (
                            <button className="btn btn-soft btn-sm" title="Confirmer" onClick={() => change(r.id, 'CONFIRME')}><Check size={15} /> Valider</button>
                          )}
                          {r.statut === 'CONFIRME' && (
                            <button className="btn btn-soft btn-sm" title="Marquer terminé" onClick={() => change(r.id, 'TERMINE')}><CheckCheck size={15} /></button>
                          )}
                          {(r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRME') && (
                            <button className="btn btn-danger btn-sm" title="Annuler" onClick={() => change(r.id, 'ANNULE')}><X size={15} /></button>
                          )}
                          <button className="btn btn-danger btn-sm" title="Supprimer" onClick={() => remove(r.id)}><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function EditModal({ rdv, onClose, onSaved }) {
  const toLocalInput = (iso) => {
    if (!iso) return ''
    return iso.slice(0, 16)
  }
  const [form, setForm] = useState({
    dateHeure: toLocalInput(rdv.dateHeure),
    motif: rdv.motif || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await updateRendezVous(rdv.id, {
        dateHeure: form.dateHeure,
        motif: form.motif,
        patientId: rdv.patientId,
        medecinId: rdv.medecinId,
      })
      onSaved()
    } catch {
      setError('Impossible de modifier le rendez-vous.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', padding: 'var(--sp-4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-soft)' }}
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
        <div className="card-title" style={{ marginBottom: 'var(--sp-4)' }}>
          <span className="icon-chip"><Pencil size={18} /></span> Modifier le rendez-vous
        </div>

        <div style={{ marginBottom: 'var(--sp-4)', padding: 'var(--sp-3)', background: 'var(--color-muted)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
          <div><strong>Patient :</strong> {rdv.patientNom}</div>
          <div><strong>Médecin :</strong> Dr {rdv.medecinNom}</div>
        </div>

        <form onSubmit={submit}>
          <Alert type="error">{error}</Alert>

          <div className="field">
            <label>Date et heure <span className="req">*</span></label>
            <input
              type="datetime-local"
              className="input"
              required
              value={form.dateHeure}
              onChange={(e) => setForm({ ...form, dateHeure: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Motif</label>
            <textarea
              className="textarea"
              value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              placeholder="Motif de la consultation…"
            />
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? <Spinner /> : <><Check size={16} /> Enregistrer</>}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreerTab({ secretaireId, onCreated }) {
  const [patients, setPatients] = useState([])
  const [medecins, setMedecins] = useState([])
  const [form, setForm] = useState({ patientId: '', medecinId: '', dateHeure: '', motif: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getPatients().then(setPatients).catch(() => {})
    getMedecins().then(setMedecins).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      await createRendezVous({
        patientId: Number(form.patientId),
        medecinId: Number(form.medecinId),
        secretaireId,
        dateHeure: form.dateHeure,
        motif: form.motif,
      })
      setSuccess('Rendez-vous planifié avec succès.')
      setForm({ patientId: '', medecinId: '', dateHeure: '', motif: '' })
      setTimeout(onCreated, 900)
    } catch {
      setError('Impossible de planifier le rendez-vous.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <div className="card-title"><span className="icon-chip"><CalendarPlus size={20} /></span> Planifier un rendez-vous</div>
      <form onSubmit={submit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="grid grid-cols-2">
          <div className="field">
            <label>Patient <span className="req">*</span></label>
            <select className="select" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">— Choisir —</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Médecin <span className="req">*</span></label>
            <select className="select" required value={form.medecinId} onChange={(e) => setForm({ ...form, medecinId: e.target.value })}>
              <option value="">— Choisir —</option>
              {medecins.map((m) => <option key={m.id} value={m.id}>Dr {m.prenom} {m.nom}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Date et heure <span className="req">*</span></label>
          <input type="datetime-local" className="input" required value={form.dateHeure} onChange={(e) => setForm({ ...form, dateHeure: e.target.value })} />
        </div>
        <div className="field">
          <label>Motif</label>
          <textarea className="textarea" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
        </div>

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? <Spinner /> : <><CalendarPlus size={18} /> Planifier</>}
        </button>
      </form>
    </div>
  )
}
