import { useEffect, useState } from 'react'
import {
  CalendarPlus, CalendarDays, FileHeart, Sparkles, Stethoscope,
  ClipboardList, CalendarCheck,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import ChatWidget from '../../components/ChatWidget'
import { Alert, EmptyState, Loading, Spinner, StatCard, StatutBadge, formatDateTime } from '../../components/UI'
import { humanize } from '../../components/SymptomAutocomplete'
import { useAuth } from '../../context/AuthContext'
import { getMedecins } from '../../api/users'
import { createRendezVous, getRendezVous } from '../../api/rendezvous'
import { getConsultations } from '../../api/consultations'

const TABS = [
  { id: 'dossier', label: 'Mon dossier', icon: <FileHeart size={18} /> },
  { id: 'prendre', label: 'Prendre RDV', icon: <CalendarPlus size={18} /> },
  { id: 'rdv', label: 'Mes rendez-vous', icon: <CalendarDays size={18} /> },
  { id: 'chat', label: 'Assistant IA', icon: <Sparkles size={18} /> },
]

export default function PatientDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('dossier')
  const [consultations, setConsultations] = useState([])
  const [rdvs, setRdvs] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    setLoading(true)
    try {
      const [c, r] = await Promise.all([
        getConsultations({ patientId: user.id }).catch(() => []),
        getRendezVous({ patientId: user.id }).catch(() => []),
      ])
      setConsultations(c)
      setRdvs(r)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  return (
    <DashboardLayout title={`Bonjour ${user.prenom}`} subtitle="Voici un aperçu de votre suivi médical.">
      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--sp-5)' }}>
        <StatCard icon={<ClipboardList size={24} />} label="Consultations" value={consultations.length} />
        <StatCard icon={<CalendarDays size={24} />} label="Rendez-vous" value={rdvs.length} color="var(--color-accent)" />
        <StatCard icon={<CalendarCheck size={24} />} label="RDV confirmés" value={rdvs.filter((r) => r.statut === 'CONFIRME').length} color="var(--color-warning)" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 'var(--sp-5)' }}>
        {tab === 'dossier' && <DossierTab loading={loading} consultations={consultations} />}
        {tab === 'prendre' && <PrendreRdvTab onCreated={() => { reload(); setTab('rdv') }} />}
        {tab === 'rdv' && <MesRdvTab loading={loading} rdvs={rdvs} />}
        {tab === 'chat' && (
          <div style={{ maxWidth: 720 }}><ChatWidget /></div>
        )}
      </div>
    </DashboardLayout>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex wrap gap-2" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className="flex items-center gap-2"
          style={{
            padding: '10px 18px', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.9rem',
            transition: 'all .2s',
            background: active === t.id ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' : 'var(--color-surface)',
            color: active === t.id ? '#fff' : 'var(--color-text-soft)',
            border: `1px solid ${active === t.id ? 'transparent' : 'var(--color-border)'}`,
            boxShadow: active === t.id ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  )
}

function DossierTab({ loading, consultations }) {
  if (loading) return <div className="card"><Loading /></div>
  if (consultations.length === 0)
    return (
      <div className="card">
        <EmptyState icon={<FileHeart size={28} />} title="Aucune consultation pour le moment"
          hint="Votre historique médical apparaîtra ici après votre première consultation." />
      </div>
    )

  return (
    <div className="grid" style={{ gap: 'var(--sp-4)' }}>
      {consultations.map((c) => (
        <div key={c.id} className="card fade-in">
          <div className="flex items-center justify-between wrap gap-2" style={{ marginBottom: 'var(--sp-3)' }}>
            <div className="flex items-center gap-2">
              <div className="card-title" style={{ margin: 0 }}>
                <span className="icon-chip"><Stethoscope size={18} /></span>
              </div>
              <div>
                <strong>{c.motif || 'Consultation'}</strong>
                <div className="text-soft" style={{ fontSize: '0.82rem' }}>{formatDateTime(c.dateConsultation)} · Dr {c.medecinNom}</div>
              </div>
            </div>
          </div>

          {c.diagnostic && (
            <p style={{ marginBottom: 'var(--sp-3)' }}><strong>Diagnostic :</strong> {c.diagnostic}</p>
          )}

          {c.symptomes?.length > 0 && (
            <div className="flex wrap gap-2" style={{ marginBottom: 'var(--sp-3)' }}>
              {c.symptomes.map((s) => <span key={s} className="badge badge-gray">{humanize(s)}</span>)}
            </div>
          )}

          {c.predictionIA && (
            <div style={{ background: 'var(--color-accent-soft)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <img src="/images/assistant%20sante.jpeg" alt="IA" style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover' }} />
                <strong style={{ color: 'var(--color-accent-dark)' }}>Aide au diagnostic IA</strong>
              </div>
              <div className="flex items-center justify-between wrap gap-2">
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-accent-dark)' }}>{c.predictionIA.maladiePredite}</span>
                {c.predictionIA.probabilite != null && (
                  <span className="badge badge-green">Confiance {(c.predictionIA.probabilite * 100).toFixed(0)}%</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PrendreRdvTab({ onCreated }) {
  const { user } = useAuth()
  const [medecins, setMedecins] = useState([])
  const [form, setForm] = useState({ medecinId: '', dateHeure: '', motif: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { getMedecins().then(setMedecins).catch(() => {}) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      await createRendezVous({
        patientId: user.id,
        medecinId: Number(form.medecinId),
        dateHeure: form.dateHeure,
        motif: form.motif,
      })
      setSuccess('Demande de rendez-vous envoyée ! Elle sera validée par le secrétariat.')
      setForm({ medecinId: '', dateHeure: '', motif: '' })
      setTimeout(onCreated, 900)
    } catch {
      setError("Impossible de créer le rendez-vous. Vérifiez les informations.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 620 }}>
      <div className="card-title"><span className="icon-chip"><CalendarPlus size={20} /></span> Demander un rendez-vous</div>
      <form onSubmit={submit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="field">
          <label htmlFor="medecinId">Médecin <span className="req">*</span></label>
          <select id="medecinId" className="select" required value={form.medecinId}
            onChange={(e) => setForm({ ...form, medecinId: e.target.value })}>
            <option value="">— Choisir un médecin —</option>
            {medecins.map((m) => (
              <option key={m.id} value={m.id}>Dr {m.prenom} {m.nom}{m.specialite ? ` · ${m.specialite}` : ''}</option>
            ))}
          </select>
          {medecins.length === 0 && <p className="helper">Aucun médecin inscrit pour l'instant.</p>}
        </div>

        <div className="field">
          <label htmlFor="dateHeure">Date et heure <span className="req">*</span></label>
          <input id="dateHeure" type="datetime-local" className="input" required value={form.dateHeure}
            onChange={(e) => setForm({ ...form, dateHeure: e.target.value })} />
        </div>

        <div className="field">
          <label htmlFor="motif">Motif</label>
          <textarea id="motif" className="textarea" placeholder="Décrivez brièvement la raison…"
            value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
        </div>

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? <Spinner /> : <><CalendarPlus size={18} /> Envoyer la demande</>}
        </button>
      </form>
    </div>
  )
}

function MesRdvTab({ loading, rdvs }) {
  if (loading) return <div className="card"><Loading /></div>
  if (rdvs.length === 0)
    return <div className="card"><EmptyState icon={<CalendarDays size={28} />} title="Aucun rendez-vous" hint="Prenez votre premier rendez-vous depuis l'onglet « Prendre RDV »." /></div>

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>Date</th><th>Médecin</th><th>Motif</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {rdvs.map((r) => (
              <tr key={r.id}>
                <td>{formatDateTime(r.dateHeure)}</td>
                <td>Dr {r.medecinNom}</td>
                <td className="text-soft">{r.motif || '—'}</td>
                <td><StatutBadge statut={r.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
