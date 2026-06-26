import { useMemo, useRef, useState } from 'react'
import { Search, X, Plus } from 'lucide-react'

/** Transforme "skin_rash" / "foul_smell_of urine" en "Skin rash" lisible. */
export function humanize(symptom) {
  return symptom
    .replace(/[_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

const normalize = (s) => s.toLowerCase().replace(/[\s_.]/g, '')

/**
 * Barre de recherche multi-sélection (autocomplete) des 132 symptômes.
 * value : tableau de noms exacts de symptômes ; onChange(next).
 */
export default function SymptomAutocomplete({ symptoms = [], value = [], onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  const suggestions = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    return symptoms
      .filter((s) => !value.includes(s) && normalize(s).includes(q))
      .slice(0, 8)
  }, [query, symptoms, value])

  const add = (symptom) => {
    if (!value.includes(symptom)) onChange([...value, symptom])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const remove = (symptom) => onChange(value.filter((s) => s !== symptom))

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      add(suggestions[0])
    }
  }

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-soft)' }}
        />
        <input
          ref={inputRef}
          className="input"
          style={{ paddingLeft: 42 }}
          placeholder="Rechercher un symptôme (ex : « toux », « fièvre »)…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          aria-label="Rechercher un symptôme"
          autoComplete="off"
        />

        {open && suggestions.length > 0 && (
          <ul
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30,
              background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)', listStyle: 'none', overflow: 'hidden', maxHeight: 300, overflowY: 'auto',
            }}
            role="listbox"
          >
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(s)}
                  className="flex items-center justify-between full"
                  style={{ padding: '11px 14px', textAlign: 'left', transition: 'background .15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: 'var(--color-text)' }}>{humanize(s)}</span>
                  <Plus size={16} style={{ color: 'var(--color-primary)' }} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex wrap gap-2" style={{ marginTop: 'var(--sp-3)' }}>
          {value.map((s) => (
            <span key={s} className="chip">
              {humanize(s)}
              <button type="button" onClick={() => remove(s)} aria-label={`Retirer ${humanize(s)}`}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <p className="helper">{value.length} symptôme(s) sélectionné(s)</p>
      )}
    </div>
  )
}
