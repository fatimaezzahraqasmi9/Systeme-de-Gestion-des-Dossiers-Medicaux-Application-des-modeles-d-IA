import { Link } from 'react-router-dom'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'grid', placeItems: 'center', padding: 'var(--sp-5)' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 860 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-5)' }}>
          <Link to="/">
            <img src="/union-logo.png" alt="Union" style={{ height: 56 }} />
          </Link>
        </div>
        <div className="card" style={{ padding: 'var(--sp-6) var(--sp-7)' }}>
          <div style={{ marginBottom: 'var(--sp-5)' }}>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>{title}</h1>
            <p className="text-soft" style={{ fontSize: '0.95rem' }}>{subtitle}</p>
          </div>
          {children}
          {footer && <div className="text-center text-soft mt-5" style={{ fontSize: '0.92rem', marginTop: 'var(--sp-4)' }}>{footer}</div>}
        </div>
      </div>
    </div>
  )
}