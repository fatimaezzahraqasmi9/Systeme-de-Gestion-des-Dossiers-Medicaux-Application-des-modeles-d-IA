import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const roleLabel = {
  PATIENT: 'Patient',
  MEDECIN: 'Médecin',
  SECRETAIRE: 'Secrétaire',
}

const roleBadge = {
  PATIENT: 'badge-blue',
  MEDECIN: 'badge-green',
  SECRETAIRE: 'badge-orange',
}

export default function DashboardLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() : ''

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="container flex items-center justify-between"
          style={{ height: 70, gap: 'var(--sp-4)' }}
        >
          <div className="flex items-center">
            <img src="/union-logo.png" alt="Union" style={{ height: 56 }} />
          </div>

          <div className="flex items-center gap-3">
            <span className={`badge ${roleBadge[user?.role] || 'badge-gray'}`}>
              {roleLabel[user?.role] || user?.role}
            </span>
            <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--color-primary-soft)', color: 'var(--color-primary-dark)',
                  display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.85rem',
                }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div style={{ lineHeight: 1.2, minWidth: 0 }} className="hide-mobile">
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-soft" style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} aria-label="Se déconnecter">
              <LogOut size={16} /> <span className="hide-mobile">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: 'var(--sp-6) var(--sp-5) var(--sp-8)' }}>
        <div className="fade-in" style={{ marginBottom: 'var(--sp-5)' }}>
          <h1 style={{ fontSize: '1.7rem' }}>{title}</h1>
          {subtitle && <p className="text-soft mt-2">{subtitle}</p>}
        </div>
        {children}
      </main>

      <style>{`
        @media (max-width: 620px) { .hide-mobile { display: none; } }
      `}</style>
    </div>
  )
}
