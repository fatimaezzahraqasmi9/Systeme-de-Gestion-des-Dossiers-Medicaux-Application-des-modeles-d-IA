import { useEffect, useState } from 'react'
import {
  CalendarDays, Stethoscope, FilePlus2, Check, CheckCheck, X,
  Upload, FileText, ClipboardList, Activity, Users, Download, FileDown,
} from 'lucide-react'
import { generateOrdonnancePDF } from '../../utils/generatePDF'
import DashboardLayout from '../../components/DashboardLayout'
import { Tabs } from '../patient/PatientDashboard'
import SymptomAutocomplete, { humanize } from '../../components/SymptomAutocomplete'
import {
  Alert, EmptyState, Loading, Spinner, StatCard, StatutBadge, formatDateTime,
} from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import { getPatients } from '../../api/users'
import { getRendezVous, updateStatutRendezVous } from '../../api/rendezvous'
import {
  createConsultation, getConsultations, uploadDocument, getDocuments, documentDownloadUrl,
} from '../../api/consultations'
import { getSymptoms } from '../../api/ai'

const TABS = [
  { id: 'rdv', label: 'Mes rendez-vous', icon: <CalendarDays size={18} /> },
  { id: 'new', label: 'Nouvelle consultation', icon: <FilePlus2 size={18} /> },
  { id: 'hist', label: 'Mes consultations', icon: <ClipboardList size={18} /> },
]

export default function MedecinDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('rdv')
  const [rdvs, setRdvs] = useState([])
  const [consultations, setConsultations] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    setLoading(true)
    try {
      const [r, c] = await Promise.all([
        getRendezVous({ medecinId: user.id }).catch(() => []),
        getConsultations({}).catch(() => []),
      ])
      setRdvs(r)
      // Le backend ne filtre pas les consultations par médecin côté liste -> filtrage client.
      setConsultations(c.filter((x) => x.medecinId === user.id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    getSymptoms().then((d) => setSymptoms(d.symptoms || [])).catch(() => {})
  }, [])

  return (
    <DashboardLayout title={`Dr ${user.prenom} ${user.nom}`} >
      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--sp-5)' }}>
        <StatCard icon={<CalendarDays size={24} />} label="Rendez-vous" value={rdvs.length} />
        <StatCard icon={<ClipboardList size={24} />} label="Consultations" value={consultations.length} color="var(--color-accent)" />
        <StatCard icon={<Activity size={24} />} label="Prédictions IA" value={consultations.filter((c) => c.predictionIA).length} color="var(--color-warning)" />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 'var(--sp-5)' }}>
        {tab === 'rdv' && <RdvTab loading={loading} rdvs={rdvs} reload={reload} />}
        {tab === 'new' && <NewConsultationTab medecinId={user.id} medecinPrenom={user.prenom} medecinNom={user.nom} symptoms={symptoms} onDone={reload} />}
        {tab === 'hist' && <HistoriqueTab loading={loading} consultations={consultations} />}
      </div>
    </DashboardLayout>
  )
}

function RdvTab({ loading, rdvs, reload }) {
  const [busy, setBusy] = useState(null)
  const change = async (id, statut) => {
    setBusy(id)
    try { await updateStatutRendezVous(id, statut); await reload() } finally { setBusy(null) }
  }
  if (loading) return <div className="card"><Loading /></div>
  if (rdvs.length === 0)
    return <div className="card"><EmptyState icon={<CalendarDays size={28} />} title="Aucun rendez-vous" hint="Vos rendez-vous planifiés apparaîtront ici." /></div>
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Date</th><th>Patient</th><th>Motif</th><th>Statut</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {rdvs.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.dateHeure)}</td>
                <td>{r.patientNom}</td>
                <td className="text-soft">{r.motif || '—'}</td>
                <td><StatutBadge statut={r.statut} /></td>
                <td>
                  <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                    {busy === r.id ? <Spinner dark size={18} /> : (
                      <>
                        {r.statut === 'EN_ATTENTE' && <button className="btn btn-soft btn-sm" onClick={() => change(r.id, 'CONFIRME')}><Check size={15} /> Confirmer</button>}
                        {r.statut === 'CONFIRME' && <button className="btn btn-soft btn-sm" onClick={() => change(r.id, 'TERMINE')}><CheckCheck size={15} /> Terminé</button>}
                        {(r.statut === 'EN_ATTENTE' || r.statut === 'CONFIRME') && <button className="btn btn-danger btn-sm" onClick={() => change(r.id, 'ANNULE')}><X size={15} /></button>}
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
  )
}

function NewConsultationTab({ medecinId, medecinPrenom, medecinNom, symptoms, onDone }) {
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState({ patientId: '', motif: '', diagnostic: '', ordonnanceNotes: '' })
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // consultation créée

  useEffect(() => { getPatients().then(setPatients).catch(() => {}) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      const consultation = await createConsultation({
        patientId: Number(form.patientId),
        medecinId,
        motif: form.motif,
        diagnostic: form.diagnostic,
        ordonnanceNotes: form.ordonnanceNotes,
        symptomes: selectedSymptoms,
      })
      setResult(consultation)
      onDone?.()
    } catch {
      setError("Impossible d'enregistrer la consultation.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setForm({ patientId: '', motif: '', diagnostic: '', ordonnanceNotes: '' })
    setSelectedSymptoms([])
    setResult(null)
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 'var(--sp-5)', alignItems: 'start' }}>
      <div className="card">
        <div className="card-title"><span className="icon-chip"><FilePlus2 size={20} /></span> Nouvelle consultation</div>
        <form onSubmit={submit}>
          <Alert type="error">{error}</Alert>

          <div className="field">
            <label>Patient <span className="req">*</span></label>
            <select className="select" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">— Choisir un patient —</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.prenom} {p.nom}{p.cin ? ` · CIN ${p.cin}` : ''}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Motif de consultation</label>
            <input className="input" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} placeholder="ex : Douleurs abdominales" />
          </div>

          <div className="field">
            <label>Symptômes observés</label>
            <SymptomAutocomplete symptoms={symptoms} value={selectedSymptoms} onChange={setSelectedSymptoms} />
            {symptoms.length === 0 && <p className="helper">Liste des symptômes indisponible (microservice IA hors-ligne ?).</p>}
          </div>

          <div className="field">
            <label>Diagnostic du médecin</label>
            <textarea className="textarea" value={form.diagnostic} onChange={(e) => setForm({ ...form, diagnostic: e.target.value })} placeholder="Votre diagnostic clinique…" />
          </div>

          <div className="field">
            <label>Notes / Ordonnance</label>
            <textarea className="textarea" value={form.ordonnanceNotes} onChange={(e) => setForm({ ...form, ordonnanceNotes: e.target.value })} />
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? <Spinner /> : <> analyser</>}
            </button>
            {result && <button type="button" className="btn btn-ghost" onClick={reset}>Nouvelle</button>}
          </div>
        </form>
      </div>

      {result && <ResultPanel consultation={result} medecinPrenom={medecinPrenom} medecinNom={medecinNom} />}
    </div>
  )
}

function ResultPanel({ consultation, medecinPrenom, medecinNom }) {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType] = useState('ORDONNANCE')
  const [msg, setMsg] = useState('')

  const refreshDocs = () => getDocuments(consultation.id).then(setDocs).catch(() => {})
  useEffect(() => { refreshDocs() }, [consultation.id])

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setMsg('')
    try {
      await uploadDocument(consultation.id, file, docType)
      setMsg('Document ajouté avec succès.')
      refreshDocs()
    } catch {
      setMsg("Échec de l'upload.")
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleGeneratePDF = () => {
    generateOrdonnancePDF({ consultation, medecinPrenom, medecinNom })
  }

  const p = consultation.predictionIA

  return (
    <div className="card fade-in" style={{ position: 'sticky', top: 90 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <span className="icon-chip" style={{ background: 'var(--color-accent-soft)', overflow: 'hidden', padding: 0 }}>
            <img src="/images/assistant%20sante.jpeg" alt="IA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </span>
          Résultat de l'analyse IA
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleGeneratePDF}
          title="Télécharger l'ordonnance en PDF"
        >
          <FileDown size={16} /> Générer PDF
        </button>
      </div>

      {p ? (
        <div style={{ background: 'linear-gradient(135deg, var(--color-accent-soft), #fff)', borderRadius: 'var(--radius)', padding: 'var(--sp-5)', border: '1px solid var(--color-border)' }}>
          <div className="text-soft" style={{ fontSize: '0.85rem' }}>Maladie la plus probable</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent-dark)', margin: '4px 0 12px' }}>{p.maladiePredite}</div>
          {p.probabilite != null && (
            <>
              <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                <span className="text-soft">Indice de confiance</span>
                <strong style={{ color: 'var(--color-accent-dark)' }}>{(p.probabilite * 100).toFixed(0)}%</strong>
              </div>
              <div style={{ height: 10, background: 'var(--color-muted)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${p.probabilite * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', transition: 'width .6s' }} />
              </div>
            </>
          )}
        </div>
      ) : (
        <Alert type="info">Aucune prédiction (sélectionnez des symptômes, ou le microservice IA est indisponible).</Alert>
      )}

      {consultation.symptomes?.length > 0 && (
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <div className="text-soft" style={{ fontSize: '0.85rem', marginBottom: 6 }}>Symptômes analysés</div>
          <div className="flex wrap gap-2">{consultation.symptomes.map((s) => <span key={s} className="badge badge-gray">{humanize(s)}</span>)}</div>
        </div>
      )}

      {/* Upload PDF annexe */}
      <div style={{ marginTop: 'var(--sp-5)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-4)' }}>
        <div className="text-soft" style={{ fontSize: '0.85rem', marginBottom: 8 }}>Joindre un document annexe (PDF)</div>
        <div className="flex gap-2 wrap items-center">
          <select className="select" style={{ width: 'auto' }} value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="ORDONNANCE">Ordonnance</option>
            <option value="ANALYSE">Analyse</option>
          </select>
          <label className="btn btn-soft" style={{ cursor: 'pointer' }}>
            {uploading ? <Spinner dark size={16} /> : <Upload size={16} />} Choisir un fichier
            <input type="file" accept="application/pdf" hidden onChange={onUpload} disabled={uploading} />
          </label>
        </div>
        {msg && <p className="helper">{msg}</p>}

        {docs.length > 0 && (
          <div className="flex" style={{ flexDirection: 'column', gap: 6, marginTop: 'var(--sp-3)' }}>
            {docs.map((d) => (
              <a key={d.id} href={documentDownloadUrl(d.id)} target="_blank" rel="noreferrer"
                className="flex items-center justify-between"
                style={{ padding: '10px 12px', background: 'var(--color-muted)', borderRadius: 'var(--radius-sm)' }}>
                <span className="flex items-center gap-2" style={{ fontSize: '0.88rem' }}>
                  <FileText size={16} style={{ color: 'var(--color-primary)' }} /> {d.nomFichier}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`badge ${d.type === 'ORDONNANCE' ? 'badge-blue' : 'badge-green'}`}>{d.type}</span>
                  <Download size={15} style={{ color: 'var(--color-text-soft)' }} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HistoriqueTab({ loading, consultations }) {
  if (loading) return <div className="card"><Loading /></div>
  if (consultations.length === 0)
    return <div className="card"><EmptyState icon={<ClipboardList size={28} />} title="Aucune consultation" hint="Créez votre première consultation dans l'onglet dédié." /></div>
  return (
    <div className="grid" style={{ gap: 'var(--sp-4)' }}>
      {consultations.map((c) => (
        <div key={c.id} className="card fade-in">
          <div className="flex items-center justify-between wrap gap-2" style={{ marginBottom: 'var(--sp-3)' }}>
            <div className="flex items-center gap-2">
              <span className="card-title" style={{ margin: 0 }}><span className="icon-chip"><Users size={18} /></span></span>
              <div>
                <strong>{c.patientNom}</strong>
                <div className="text-soft" style={{ fontSize: '0.82rem' }}>{formatDateTime(c.dateConsultation)} · {c.motif || 'Consultation'}</div>
              </div>
            </div>
            {c.predictionIA && <span className="badge badge-green"> {c.predictionIA.maladiePredite}</span>}
          </div>
          {c.diagnostic && <p className="text-soft" style={{ fontSize: '0.92rem' }}><strong style={{ color: 'var(--color-text)' }}>Diagnostic :</strong> {c.diagnostic}</p>}
          {c.symptomes?.length > 0 && (
            <div className="flex wrap gap-2" style={{ marginTop: 'var(--sp-2)' }}>
              {c.symptomes.map((s) => <span key={s} className="badge badge-gray">{humanize(s)}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
