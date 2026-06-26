import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ArrowRight, Activity,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { dashboardPath } from '../App'

function Feature({ image, title, text }) {
  return (
    <div
      className="card fade-in"
      style={{ position: 'relative', overflow: 'hidden', minHeight: 320, padding: 0, borderRadius: 'var(--radius)', cursor: 'pointer' }}
      onMouseEnter={(e) => {
        e.currentTarget.querySelector('.feat-img').style.filter = 'brightness(0.35)'
        e.currentTarget.querySelector('.feat-overlay').style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.querySelector('.feat-img').style.filter = 'brightness(1)'
        e.currentTarget.querySelector('.feat-overlay').style.opacity = '0'
      }}
    >
      <img
        className="feat-img"
        src={image}
        alt={title}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'filter .35s ease' }}
      />
      <div
        className="feat-overlay"
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'var(--sp-4)', color: '#fff', opacity: 0, transition: 'opacity .35s ease' }}
      >
        <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,.9)', fontSize: '0.95rem' }}>{text}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const goDash = () => navigate(dashboardPath(user.role))

  return (
    <div>
      {/* ===== Navbar ===== */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container flex items-center justify-between" style={{ height: 72 }}>
          <div className="flex items-center">
            <img src="/union-logo.png" alt="Union" style={{ height: 60 }} />
          </div>
          <nav className="flex items-center gap-3">
  {user && (
    <button className="btn btn-primary" onClick={goDash}>
      Mon espace <ArrowRight size={18} />
    </button>
  )}
</nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ padding: 'var(--sp-8) var(--sp-5)' }}>
          <div className="fade-in hero-text text-center" style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: 'var(--sp-4)' }}>
              Votre écosystème clinique connecté et assisté par l'IA.
            </h1>
            <p className="text-soft" style={{ fontSize: '1.12rem', maxWidth: 540, margin: '0 auto var(--sp-5)' }}>
              Prenez rendez-vous, suivez vos consultations et bénéficiez d'une aide au diagnostic
              par intelligence artificielle sur 132 symptômes. Le tout dans une interface apaisante et sécurisée.
            </p>
            <div className="flex gap-3 wrap justify-center">
              <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Créer un compte <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                J'ai déjà un compte
              </Link>
            </div>
            <div className="flex gap-4 wrap justify-center" style={{ marginTop: 'var(--sp-6)' }}>
              
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="container" style={{ padding: 'var(--sp-7) var(--sp-5)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--sp-6)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)' }}>Une plateforme qui pense à tous</h2>
         
        </div>
        <div className="grid grid-auto">
          <Feature image="/images/rendez%20vous.jpeg" title="Rendez-vous simplifiés" text="Prise et suivi des rendez-vous en quelques clics, avec validation par le secrétariat." />
          <Feature image="/images/diagnostic%20ia.jpeg" title="Diagnostic assisté par IA" text="Sélection intelligente des symptômes et prédiction instantanée de la maladie probable." />
          <Feature image="/images/assistant%20sante.jpeg" title="Assistant santé 24/7" text="Un chatbot médical pour vous orienter et répondre à vos questions de santé." />
          <Feature image="/images/dossier%20medical%20complet.jpeg" title="Dossier médical complet" text="Historique des consultations, diagnostics, ordonnances et analyses PDF centralisés." />
        </div>
        
      </section>

      {/* ===== CTA (card diagnostic IA) ===== */}
      <section className="container" style={{ padding: '0 var(--sp-5) var(--sp-8)' }}>
        <div
          className="card fade-in"
          style={{ maxWidth: 720, margin: '0 auto', boxShadow: 'var(--shadow-lg)', padding: 'var(--sp-5)' }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--sp-4)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/images/assistant%20sante.jpeg" alt="IA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <strong>Aide au diagnostic IA</strong>
              <div className="text-soft" style={{ fontSize: '0.8rem' }}>Analyse en temps réel</div>
            </div>
          </div>

          <div className="flex wrap gap-2" style={{ marginBottom: 'var(--sp-4)' }}>
            {['Fièvre', 'Toux', 'Fatigue', 'Maux de tête'].map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>

          <div style={{ background: 'var(--color-accent-soft)', borderRadius: 'var(--radius)', padding: 'var(--sp-4)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-soft" style={{ fontSize: '0.8rem' }}>Maladie prédite</div>
                <strong style={{ color: 'var(--color-accent-dark)', fontSize: '1.15rem' }}>Grippe saisonnière</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-soft" style={{ fontSize: '0.8rem' }}>Confiance</div>
                <strong style={{ color: 'var(--color-accent-dark)', fontSize: '1.4rem' }}>92%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="container text-center text-soft" style={{ padding: 'var(--sp-5)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Clinique Union — Plateforme de gestion des dossiers médicaux & IA.
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .hero-text h1 { font-size: 2.1rem !important; }
        }
      `}</style>
    </div>
  )
}