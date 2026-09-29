import { useRef } from 'react'
import { toLatex } from '../lib/mathexpr'
import { TexInline } from './Tex'

const TOUCHES_BASE = ['√(', 'π', '^', '(', ')', '/', 'i', ',']

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  variables?: string[]
  egal?: boolean
  secousse?: number
}

/** Champ de saisie façon zetamac : grand, centré, touches rapides pour le pouce, aperçu KaTeX discret. */
export function MathInput({ value, onChange, onSubmit, disabled, variables = [], egal, secousse = 0 }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const touches = [...variables, ...(egal ? ['='] : []), ...TOUCHES_BASE]
  const apercu = value.trim() ? toLatex(value) : null

  const inserer = (t: string) => {
    const el = ref.current
    if (!el) return onChange(value + t)
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    onChange(value.slice(0, start) + t + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + t.length, start + t.length)
    })
  }

  return (
    <div className="space-y-3">
      <input
        key={secousse}
        ref={ref}
        value={value}
        disabled={disabled}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && value.trim() && onSubmit()}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        className={`w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-3 text-center font-mono text-2xl outline-none focus:border-[var(--ink)] disabled:opacity-60 ${secousse ? 'secousse' : ''}`}
      />
      <div className="min-h-7 text-center text-[var(--muted)]">
        {value.trim() &&
          (apercu !== null ? (
            <span className="text-lg text-[var(--ink)]">
              <TexInline math={apercu} />
            </span>
          ) : (
            <span className="text-sm">…</span>
          ))}
      </div>
      {!disabled && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {touches.map((t) => (
            <button
              key={t}
              type="button"
              tabIndex={-1}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => inserer(t)}
              className="min-w-11 rounded-md border border-[var(--line)] px-3 py-2 font-mono text-base active:bg-[var(--line)]"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
