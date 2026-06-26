import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, User } from 'lucide-react'
import { chat } from '../api/ai'
import { Spinner } from './UI'

const WELCOME = {
  role: 'assistant',
  content:
    "Bonjour. Je suis votre assistant santé virtuel. Posez-moi vos questions sur des symptômes ou des maladies. Je ne remplace pas un médecin : en cas d'urgence, contactez les secours.",
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setError('')
    const history = messages.filter((m) => m !== WELCOME)
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await chat(text, history.map((m) => ({ role: m.role, content: m.content })))
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      setError(
        status === 503
          ? "Le chatbot n'est pas configuré (clé Gemini manquante)."
          : status === 502
          ? "Le service IA est momentanément indisponible (quota Gemini)."
          : detail || "Impossible de joindre l'assistant pour le moment."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 540, padding: 0, overflow: 'hidden' }}>
      <div
        className="flex items-center gap-2"
        style={{
          padding: 'var(--sp-4)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          color: '#fff',
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <strong style={{ fontFamily: 'var(--font-head)', color: '#fff' }}>Assistant IA santé</strong>
          <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>Propulsé par Gemini</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="flex gap-2"
            style={{ flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center',
                background: m.role === 'user' ? 'var(--color-primary-soft)' : 'var(--color-accent-soft)',
                color: m.role === 'user' ? 'var(--color-primary-dark)' : 'var(--color-accent-dark)',
              }}
            >
              {m.role === 'user' ? <User size={17} /> : <Bot size={17} />}
            </div>
            <div
              style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 14, whiteSpace: 'pre-wrap', fontSize: '0.92rem',
                background: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-muted)',
                color: m.role === 'user' ? '#fff' : 'var(--color-text)',
                borderTopRightRadius: m.role === 'user' ? 4 : 14,
                borderTopLeftRadius: m.role === 'user' ? 14 : 4,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-soft" style={{ fontSize: '0.85rem' }}>
            <Spinner dark size={16} /> L'assistant réfléchit…
          </div>
        )}
        {error && <div className="alert alert-error" style={{ margin: 0 }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2" style={{ padding: 'var(--sp-3)', borderTop: '1px solid var(--color-border)' }}>
        <input
          className="input"
          placeholder="Écrivez votre message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message à l'assistant"
        />
        <button className="btn btn-primary" disabled={loading || !input.trim()} aria-label="Envoyer">
          {loading ? <Spinner size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  )
}
