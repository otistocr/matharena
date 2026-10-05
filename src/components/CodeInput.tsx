import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { chargerPython, executer, type ResultatPython } from '../lib/python'

const INDENT = '    '
/** Touches pénibles à atteindre sur un clavier de téléphone. */
const TOUCHES = [':', '(', ')', '=', '==', '!=', '<', '>', '+', '-', '*', '/', '//', '%', '"', '_', ',', '[', ']', '#']

/** Les claviers tactiles remplacent guillemets et tirets par des variantes typographiques que Python refuse. */
const nettoyer = (s: string) =>
  s
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '--')
    .replace(/–/g, '-')
    .replace(/ /g, ' ')
    .replace(/\t/g, INDENT)

interface Props {
  value: string
  onChange: (v: string) => void
  /** Tests exécutés (affichés sous l'éditeur). */
  tests: string[]
  disabled?: boolean
  /** Appelé après chaque exécution. */
  onResultat: (r: ResultatPython, reussi: boolean) => void
}

/** Éditeur de code Python + bouton « Lancer les tests » (exécution réelle par Pyodide). */
export function CodeInput({ value, onChange, tests, disabled, onResultat }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const curseur = useRef<number | null>(null)
  const [etat, setEtat] = useState<'chargement' | 'pret' | 'execution' | 'indisponible'>('chargement')
  const [resultat, setResultat] = useState<ResultatPython | null>(null)

  // Python se charge en arrière-plan pendant que l'on lit l'énoncé.
  useEffect(() => {
    let actif = true
    chargerPython().then(
      () => actif && setEtat('pret'),
      () => actif && setEtat('indisponible'),
    )
    return () => {
      actif = false
    }
  }, [])

  // Replace le curseur après une modification faite par programme (indentation, barre de touches).
  useLayoutEffect(() => {
    if (curseur.current !== null && ref.current) {
      ref.current.setSelectionRange(curseur.current, curseur.current)
      curseur.current = null
    }
  })

  /** Remplace [debut, fin[ par `texte` et place le curseur juste après. */
  const remplacer = (debut: number, fin: number, texte: string) => {
    curseur.current = debut + texte.length
    onChange(value.slice(0, debut) + texte + value.slice(fin))
  }
  const inserer = (texte: string) => {
    const el = ref.current
    if (!el || disabled) return
    el.focus()
    remplacer(el.selectionStart, el.selectionEnd, texte)
  }
  /** Retire un niveau d'indentation au début de la ligne courante. */
  const desindenter = () => {
    const el = ref.current
    if (!el || disabled) return
    el.focus()
    const pos = el.selectionStart
    const debutLigne = value.lastIndexOf('\n', pos - 1) + 1
    const espaces = /^ */.exec(value.slice(debutLigne))![0].length
    const n = Math.min(INDENT.length, espaces)
    if (!n) return
    curseur.current = Math.max(debutLigne, pos - n)
    onChange(value.slice(0, debutLigne) + value.slice(debutLigne + n))
  }

  const touche = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    const [a, b] = [el.selectionStart, el.selectionEnd]
    if (e.key === 'Tab') {
      e.preventDefault()
      return e.shiftKey ? desindenter() : remplacer(a, b, INDENT)
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      return void lancer()
    }
    if (e.key === 'Enter') {
      // nouvelle ligne à la même indentation, un cran de plus après « : »
      e.preventDefault()
      const debutLigne = value.lastIndexOf('\n', a - 1) + 1
      const ligne = value.slice(debutLigne, a)
      const indent = /^ */.exec(ligne)![0]
      return remplacer(a, b, '\n' + indent + (ligne.trimEnd().endsWith(':') ? INDENT : ''))
    }
    if (e.key === 'Backspace' && a === b) {
      // dans l'indentation, on efface un cran entier
      const debutLigne = value.lastIndexOf('\n', a - 1) + 1
      const avant = value.slice(debutLigne, a)
      if (avant.length >= INDENT.length && /^ +$/.test(avant) && avant.length % INDENT.length === 0) {
        e.preventDefault()
        remplacer(a - INDENT.length, a, '')
      }
    }
  }

  const lancer = async () => {
    if (disabled || etat === 'execution' || etat === 'chargement') return
    setEtat('execution')
    const r = await executer(value, tests)
    setResultat(r)
    setEtat('pret')
    onResultat(r, !r.erreur && r.tests.length === tests.length && r.tests.every((t) => t.ok))
  }

  const lignes = Math.max(8, value.split('\n').length + 1)
  const bouton = 'rounded border border-[var(--line)] px-2.5 py-1.5 font-mono text-sm active:bg-[var(--line)] disabled:opacity-40'
  // onPointerDown + preventDefault : la touche ne vole pas le focus, le clavier du téléphone reste ouvert
  const sansPerdreLeFocus = (action: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      action()
    },
  })

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button type="button" disabled={disabled} className={bouton} aria-label="Indenter" {...sansPerdreLeFocus(() => inserer(INDENT))}>
          ⇥
        </button>
        <button type="button" disabled={disabled} className={bouton} aria-label="Désindenter" {...sansPerdreLeFocus(desindenter)}>
          ⇤
        </button>
        {TOUCHES.map((t) => (
          <button key={t} type="button" disabled={disabled} className={bouton} {...sansPerdreLeFocus(() => inserer(t))}>
            {t}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(nettoyer(e.target.value))}
        onKeyDown={touche}
        disabled={disabled}
        rows={lignes}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        aria-label="Ton code Python"
        className="block w-full resize-y rounded-md border border-[var(--line)] bg-[var(--calcul-bg)] p-3 font-mono text-[16px] leading-snug outline-none focus:border-[var(--ink)] sm:text-sm"
        style={{ tabSize: 4, whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'auto' }}
      />
      <div className="rich">
        <p className="text-xs text-[var(--muted)]">Tests exécutés :</p>
        <pre className="code">
          <code>{tests.join('\n')}</code>
        </pre>
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={lancer}
          disabled={etat === 'chargement' || etat === 'execution'}
          className="w-full rounded-md bg-[var(--ink)] py-3 font-semibold text-[var(--bg)] disabled:opacity-60"
        >
          {etat === 'chargement' ? 'Chargement de Python… (≈ 12 Mo la première fois)' : etat === 'execution' ? 'Exécution…' : '▶ Lancer les tests'}
        </button>
      )}
      {etat === 'indisponible' && !resultat && (
        <p className="text-sm text-[var(--ko)]">Python n’a pas pu être chargé. Il faut une connexion la première fois ; ensuite il fonctionne hors-ligne.</p>
      )}
      {resultat && <Compte r={resultat} />}
    </div>
  )
}

/** Compte rendu d'exécution : erreur, détail des tests, affichages. */
function Compte({ r }: { r: ResultatPython }) {
  const reussis = r.tests.filter((t) => t.ok).length
  return (
    <div className="space-y-2 text-sm">
      {r.erreur ? (
        <div className="rounded-md px-3 py-2 font-medium" style={{ background: 'var(--ko-bg)', color: 'var(--ko)' }}>
          {r.erreur}
        </div>
      ) : (
        <>
          <p className="font-semibold" style={{ color: reussis === r.tests.length ? 'var(--ok)' : 'var(--ko)' }}>
            {reussis} test{reussis > 1 ? 's' : ''} réussi{reussis > 1 ? 's' : ''} sur {r.tests.length}
          </p>
          <ul className="space-y-1">
            {r.tests.map((t, i) => (
              <li key={i} className="font-mono text-xs" style={{ color: t.ok ? 'var(--ok)' : 'var(--ko)' }}>
                {t.ok ? '✓' : '✗'} {t.test}
                {!t.ok && <span className="block pl-4 font-sans">{t.message}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      {r.sortie && (
        <div className="rich">
          <p className="text-xs text-[var(--muted)]">Affichages (print) :</p>
          <pre className="code">
            <code>{r.sortie}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
