import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { Alert, Spinner } from '../components/UI'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { dashboardPath } from '../App'

export default function Login() {
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()
  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginApi(form)
      loginSuccess(res)
      navigate(dashboardPath(res.role))
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'Email ou mot de passe incorrect.'
          : "Connexion impossible. Vérifiez que le serveur est démarré."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous pour accéder à votre espace."
      footer={<>Pas encore de compte ? <Link to="/register">Créer un compte</Link></>}
    >
      <form onSubmit={onSubmit}>
        <Alert type="error">{error}</Alert>

        <div className="grid grid-cols-2">
          <div className="field">
            <label htmlFor="email">Adresse email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={iconStyle} />
              <input id="email" name="email" type="email" className="input" style={{ paddingLeft: 42 }}
                placeholder="vous@exemple.com" value={form.email} onChange={onChange} required autoComplete="email" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={iconStyle} />
              <input id="motDePasse" name="motDePasse" type={showPwd ? 'text' : 'password'} className="input"
                style={{ paddingLeft: 42, paddingRight: 44 }} placeholder="••••••••"
                value={form.motDePasse} onChange={onChange} required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeStyle} aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button className="btn btn-primary full" disabled={loading} style={{ marginTop: 'var(--sp-2)' }}>
          {loading ? <Spinner /> : <><LogIn size={18} /> Se connecter</>}
        </button>
      </form>
    </AuthShell>
  )
}

const iconStyle = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-soft)' }
const eyeStyle = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-soft)' }
