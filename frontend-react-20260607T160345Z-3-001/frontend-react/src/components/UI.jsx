import { Loader2 } from 'lucide-react'

export function Spinner({ dark = false, size = 20 }) {
  return (
    <span
      className={`spinner ${dark ? 'spinner-dark' : ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Chargement"
    />
  )
}

export function Loading({ label = 'Chargement…' }) {
  return (
    <div className="empty">
      <Loader2 className="spin-icon" size={32} style={{ color: 'var(--color-primary)' }} />
      <p className="mt-2 text-soft">{label}</p>
      <style>{`.spin-icon { animation: spin 1s linear infinite; }`}</style>
    </div>
  )
}

export function EmptyState({ icon, title, hint }) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>
      {hint && <p className="text-soft mt-2">{hint}</p>}
    </div>
  )
}

export function StatCard({ icon, label, value, color = 'var(--color-primary)' }) {
  return (
    <div className="card flex items-center gap-4" style={{ padding: 'var(--sp-4)' }}>
      <div
        style={{
          width: 52, height: 52, borderRadius: 16,
          background: `color-mix(in srgb, ${color} 14%, white)`,
          color, display: 'grid', placeItems: 'center', flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-foreground)', lineHeight: 1 }}>
          {value}
        </div>
        <div className="text-soft" style={{ fontSize: '0.86rem' }}>{label}</div>
      </div>
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  if (!children) return null
  return <div className={`alert alert-${type}`}>{children}</div>
}

const statutBadge = {
  EN_ATTENTE: { cls: 'badge-orange', label: 'En attente' },
  CONFIRME: { cls: 'badge-green', label: 'Confirmé' },
  ANNULE: { cls: 'badge-red', label: 'Annulé' },
  TERMINE: { cls: 'badge-blue', label: 'Terminé' },
}

export function StatutBadge({ statut }) {
  const s = statutBadge[statut] || { cls: 'badge-gray', label: statut }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}
