import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, User, HeartPulse, Briefcase } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { Alert, Spinner } from '../components/UI'
import { signup } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { dashboardPath } from '../App'

const ROLES = [
  { value: 'PATIENT', label: 'Patient', icon: <HeartPulse size={18} /> },
  { value: 'MEDECIN', label: 'Médecin', icon: <User size={18} /> },
  { value: 'SECRETAIRE', label: 'Secrétaire', icon: <Briefcase size={18} /> },
]

export default function Register() {
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', role: 'PATIENT',
    cin: '', telephone: '', dateNaissance: '', specialite: '', numeroBureau: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // N'envoie que les champs pertinents pour le rôle.
    const payload = {
      nom: form.nom, prenom: form.prenom, email: form.email,
      motDePasse: form.motDePasse, role: form.role,
    }
    if (form.role === 'PATIENT') {
      payload.cin = form.cin || null
      payload.telephone = form.telephone || null
      payload.dateNaissance = form.dateNaissance || null
    } else if (form.role === 'MEDECIN') {
      payload.specialite = form.specialite || null
    } else if (form.role === 'SECRETAIRE') {
      payload.numeroBureau = form.numeroBureau || null
    }
    try {
      const res = await signup(payload)
      loginSuccess(res)
      navigate(dashboardPath(res.role))
    } catch (err) {
      setError(
        err.response?.status === 409
          ? 'Cet email est déjà utilisé.'
          : err.response?.data?.message || "Inscription impossible. Vérifiez les champs."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Rejoignez Union en quelques secondes."
      footer={<>Déjà inscrit ? <Link to="/login">Se connecter</Link></>}
    >
      <form onSubmit={onSubmit}>
        <Alert type="error">{error}</Alert>

        {/* Ligne 1 : choix du rôle */}
        <div className="field">
          <label>Je suis…</label>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                type="button" key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className="flex items-center gap-2"
                style={{
                  flex: 1, justifyContent: 'center', padding: '11px 6px', borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${form.role === r.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: form.role === r.value ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  color: form.role === r.value ? 'var(--color-primary-dark)' : 'var(--color-text-soft)',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all .2s',
                }}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 2 : Prénom + Nom */}
        <div className="grid grid-cols-2">
          <div className="field">
            <label htmlFor="prenom">Prénom <span className="req">*</span></label>
            <input id="prenom" name="prenom" className="input" value={form.prenom} onChange={onChange} required />
          </div>
          <div className="field">
            <label htmlFor="nom">Nom <span className="req">*</span></label>
            <input id="nom" name="nom" className="input" value={form.nom} onChange={onChange} required />
          </div>
        </div>

        {/* Ligne 3 : Email + Mot de passe */}
        <div className="grid grid-cols-2">
          <div className="field">
            <label htmlFor="email">Email <span className="req">*</span></label>
            <input id="email" name="email" type="email" className="input" value={form.email} onChange={onChange} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="motDePasse">Mot de passe <span className="req">*</span></label>
            <input id="motDePasse" name="motDePasse" type="password" className="input" value={form.motDePasse} onChange={onChange} required minLength={6} autoComplete="new-password" />
            <p className="helper">Au moins 6 caractères.</p>
          </div>
        </div>

        {/* Ligne 4 : champs spécifiques au rôle */}
        {form.role === 'PATIENT' && (
          <div className="grid grid-cols-3">
            <div className="field">
              <label htmlFor="cin">CIN</label>
              <input id="cin" name="cin" className="input" value={form.cin} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="telephone">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" className="input" value={form.telephone} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="dateNaissance">Date de naissance</label>
              <input id="dateNaissance" name="dateNaissance" type="date" className="input" value={form.dateNaissance} onChange={onChange} />
            </div>
          </div>
        )}
        {form.role === 'MEDECIN' && (
          <div className="grid grid-cols-2">
            <div className="field">
              <label htmlFor="specialite">Spécialité</label>
              <input id="specialite" name="specialite" className="input" placeholder="ex : Cardiologie" value={form.specialite} onChange={onChange} />
            </div>
          </div>
        )}
        {form.role === 'SECRETAIRE' && (
          <div className="grid grid-cols-2">
            <div className="field">
              <label htmlFor="numeroBureau">Numéro de bureau</label>
              <input id="numeroBureau" name="numeroBureau" className="input" value={form.numeroBureau} onChange={onChange} />
            </div>
          </div>
        )}

        <button className="btn btn-primary full" disabled={loading} style={{ marginTop: 'var(--sp-2)' }}>
          {loading ? <Spinner /> : <><UserPlus size={18} /> Créer mon compte</>}
        </button>
      </form>
    </AuthShell>
  )
}
