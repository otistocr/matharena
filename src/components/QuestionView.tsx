import { useEffect, useState } from 'react'
import { NIVEAUX, type Question } from '../data/schema'
import { titreSection } from '../data/bank'
import { checkExpression, checkNumeric, respecteForme, toLatex } from '../lib/mathexpr'
import { CodeInput } from './CodeInput'
import { MathInput } from './MathInput'
import { REUSSITES_POUR_CORRIGER, type Statut } from '../lib/session'
import { Tex } from './Tex'

export interface Verdict {
  score: number
  /** L'utilisateur a contesté la correction automatique. */
  conteste?: boolean
  /** Ce qui a été répondu (texte lisible). */
  saisie?: string
  /** Exercice de code : nombre de lancements des tests avant la réussite. */
  essais?: number
}

/** Où en était la question avant de répondre (pour un message adapté). */
export interface Contexte {
  statut: Statut
  /** Réussites d'affilée depuis la dernière erreur (si dans le cahier). */
  reussites: number
}

const BRAVO = ['Bien joué !', 'Exact !', 'Parfait.', 'Nickel !', 'Bien vu !', 'Impeccable.']

/** Message encourageant après une réponse. */
export function message(v: Verdict, ctx?: Contexte): string {
  if (v.score >= 1) {
    if (v.conteste) return '✓ Compté juste'
    if (v.essais && v.essais > 1) return `✓ Tous les tests passent, au ${v.essais}ᵉ essai. Bien joué d’avoir corrigé !`
    if (ctx?.statut === 'erreur')
      return ctx.reussites + 1 >= REUSSITES_POUR_CORRIGER ? '🎉 Erreur corrigée : elle sort de ton cahier !' : '✓ Bien ! Encore une réussite et elle sort du cahier.'
    if (ctx?.statut === 'nouvelle') return `✓ ${BRAVO[Math.floor(Math.random() * BRAVO.length)]} Du premier coup.`
    return `✓ ${BRAVO[Math.floor(Math.random() * BRAVO.length)]}`
  }
  if (ctx?.statut === 'erreur') return 'Pas encore : elle reste dans ton cahier. Relis bien la correction 👇'
  return 'Pas grave : elle va dans ton cahier d’erreurs. Lis la correction 👇'
}

interface Props {
  q: Question
  /** Afficher le bouton d'indice (Entraînement). */
  indices?: boolean
  /** Mode zetamac pur (Blitz) : juste = on enchaîne, faux = secousse, « Passer » pour abandonner. */
  rapide?: boolean
  /** Appelé dès la validation (Blitz) ou au clic sur « Suivant ». */
  onFin: (v: Verdict) => void
  contexte?: Contexte
}

function corrige(q: Question): string {
  switch (q.type) {
    case 'qcm':
      return q.choix[q.reponse]
    case 'vf':
      return q.reponse ? '**Vrai**' : '**Faux**'
    case 'num':
      return `$${toLatex(String(q.reponse)) ?? q.reponse}$`
    case 'court':
      return `$${toLatex(q.reponse[0]) ?? q.reponse[0]}$`
    default:
      return ''
  }
}

/** Saisie → texte affichable (LaTeX si on sait l'analyser). */
const affichage = (s: string) => {
  const t = toLatex(s)
  return t ? `$${t}$` : s
}

const juste = (q: Question, saisie: string) =>
  q.type === 'num'
    ? checkNumeric(saisie, q.reponse, q.tolerance)
    : q.type === 'court'
      ? checkExpression(saisie, q.reponse, q.variables, q.mode) && (!q.forme || respecteForme(saisie, q.forme))
      : false

/** Ligne discrète au-dessus de l'énoncé : section · niveau · ★. */
export function Meta({ q }: { q: Question }) {
  return (
    <p className="text-center text-xs text-[var(--muted)]">
      {titreSection(q.section)} · {NIVEAUX[q.niveau]}
      {q.indispensable !== undefined && (
        <span className="ml-1 font-semibold text-[var(--cle)]">
          · ★ Énoncé indispensable{typeof q.indispensable === 'number' ? ` ${q.indispensable}` : ''}
        </span>
      )}
    </p>
  )
}

/** Carte de correction : verdict coloré, réponse attendue, explication en blocs colorés, source. */
export function Correction({ q, verdict, contexte, saisie }: { q: Question; verdict?: Verdict; contexte?: Contexte; saisie?: string }) {
  const ok = verdict ? verdict.score >= 1 : null
  return (
    <div className="apparition space-y-2">
      {verdict && (
        <div
          className="flex items-center justify-between rounded-md px-3 py-2 font-semibold"
          style={{ background: ok ? 'var(--ok-bg)' : 'var(--ko-bg)', color: ok ? 'var(--ok)' : 'var(--ko)' }}
        >
          <span>{message(verdict, contexte)}</span>
        </div>
      )}
      {!ok && q.type !== 'code' && (
        <div className="space-y-1 text-sm">
          {saisie && (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[var(--muted)]">Ta réponse :</span>
              <Tex className="[&_p]:m-0 [&_p]:text-[var(--ko)]">{saisie}</Tex>
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[var(--muted)]">Réponse attendue :</span>
            <Tex className="[&_p]:m-0 [&_p]:font-semibold [&_p]:text-[var(--ok)]">{corrige(q)}</Tex>
          </div>
        </div>
      )}
      <Tex className="text-[0.95rem]">{q.explication}</Tex>
      <p className="border-t border-[var(--line)] pt-2 text-xs text-[var(--muted)]">
        📖 {q.refCours} · {q.source === 'créée' ? 'Question créée' : `Source : ${q.source}`}
      </p>
    </div>
  )
}

export function QuestionView({ q, indices, rapide, onFin, contexte }: Props) {
  const [saisie, setSaisie] = useState('')
  const [code, setCode] = useState(q.type === 'code' ? q.depart : '')
  const [essais, setEssais] = useState(0)
  const [choix, setChoix] = useState<number | boolean | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [indiceVu, setIndiceVu] = useState(false)
  const [secousse, setSecousse] = useState(0)
  const [avertissement, setAvertissement] = useState<string | null>(null)

  const conclure = (score: number, rep?: string, nbEssais?: number) => {
    const v: Verdict = { score, saisie: rep, ...(nbEssais ? { essais: nbEssais } : {}) }
    if (rapide) return onFin(v)
    setVerdict(v)
  }

  // Zetamac : dès que la saisie est juste, c'est validé — pas besoin d'Entrée.
  const changer = (v: string) => {
    setSaisie(v)
    setAvertissement(null)
    if (!verdict && v.trim() && juste(q, v)) conclure(1, affichage(v))
  }
  const entree = () => {
    if (verdict) return
    if (juste(q, saisie)) return conclure(1, affichage(saisie))
    // valeur juste mais forme non demandée : on prévient au lieu de compter faux
    if (q.type === 'court' && q.forme && checkExpression(saisie, q.reponse, q.variables, q.mode)) {
      setSecousse((s) => s + 1)
      return setAvertissement(q.forme === 'developpee' ? 'C’est égal, mais pas développé : enlève les parenthèses.' : 'C’est égal, mais pas factorisé : écris un produit.')
    }
    if (rapide) return setSecousse((s) => s + 1)
    conclure(0, affichage(saisie))
  }
  const repondre = (r: number | boolean) => {
    if (verdict) return
    setChoix(r)
    const texte = typeof r === 'boolean' ? (r ? '**Vrai**' : '**Faux**') : q.type === 'qcm' ? q.choix[r] : String(r)
    conclure((q.type === 'qcm' || q.type === 'vf') && r === q.reponse ? 1 : 0, texte)
  }

  // Raccourcis clavier : 1–6 (QCM), V/F, Entrée = suivant.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (verdict && e.key === 'Enter') return onFin(verdict)
      if (verdict) return
      if (q.type === 'qcm' && /^[1-6]$/.test(e.key) && Number(e.key) <= q.choix.length) repondre(Number(e.key) - 1)
      if (q.type === 'vf' && /^[vf]$/i.test(e.key)) repondre(e.key.toLowerCase() === 'v')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const etat = (bon: boolean, choisi: boolean) =>
    !verdict
      ? 'border-[var(--line)] active:bg-[var(--line)]'
      : bon
        ? 'border-[var(--ok)] bg-[var(--ok-bg)]'
        : choisi
          ? 'border-[var(--ko)] bg-[var(--ko-bg)]'
          : 'border-[var(--line)] opacity-50'

  const court = q.enonce.length < 110 && !q.enonce.includes('\n')

  return (
    <div className="apparition space-y-6">
      <Meta q={q} />
      <Tex className={`text-xl leading-relaxed ${court ? 'text-center' : ''}`}>{q.enonce}</Tex>

      {q.type === 'qcm' && (
        <div className="grid gap-2">
          {q.choix.map((c, i) => (
            <button
              key={i}
              disabled={!!verdict}
              onClick={() => repondre(i)}
              className={`flex items-center gap-3 rounded-md border px-3 py-3 text-left ${etat(i === q.reponse, choix === i)}`}
            >
              <span className="w-5 shrink-0 font-mono text-sm text-[var(--muted)]">{i + 1}</span>
              <Tex className="[&_p]:m-0">{c}</Tex>
            </button>
          ))}
        </div>
      )}

      {q.type === 'vf' && (
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((b) => (
            <button
              key={String(b)}
              disabled={!!verdict}
              onClick={() => repondre(b)}
              className={`rounded-md border py-4 text-lg font-semibold ${etat(b === q.reponse, choix === b)}`}
            >
              {b ? 'Vrai' : 'Faux'} <span className="ml-1 font-mono text-xs font-normal text-[var(--muted)]">{b ? 'V' : 'F'}</span>
            </button>
          ))}
        </div>
      )}

      {(q.type === 'num' || q.type === 'court') && (
        <div className="space-y-2">
          <MathInput
            value={saisie}
            onChange={changer}
            onSubmit={entree}
            disabled={!!verdict}
            variables={q.type === 'court' ? q.variables : []}
            egal={q.type === 'court' && q.mode === 'equation'}
            secousse={secousse}
          />
          {avertissement && <p className="text-center text-sm font-medium text-[var(--cle)]">{avertissement}</p>}
          {q.type === 'court' && q.format && <p className="text-center text-xs text-[var(--muted)]">{q.format}</p>}
          {q.type === 'num' && q.unite && <p className="text-center text-xs text-[var(--muted)]">Unité : {q.unite}</p>}
          {!verdict && !rapide && (
            <p className="text-center text-xs text-[var(--muted)]">Validé tout seul dès que c’est juste · Entrée = je sèche, voir la correction</p>
          )}
        </div>
      )}

      {q.type === 'code' && (
        <div className="space-y-2">
          <CodeInput
            value={code}
            onChange={setCode}
            tests={q.tests}
            disabled={!!verdict}
            onResultat={(_, reussi) => {
              setEssais(essais + 1)
              if (reussi && !verdict) conclure(1, undefined, essais + 1)
            }}
          />
          {!verdict && (
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{essais > 0 ? 'Corrige ton code et relance les tests autant de fois que tu veux.' : 'Écris ta fonction, puis lance les tests.'}</span>
              <button onClick={() => conclure(0)} className="shrink-0 underline underline-offset-4">
                Je sèche : voir le corrigé
              </button>
            </div>
          )}
        </div>
      )}

      {rapide && (
        <div className="text-center">
          <button onClick={() => onFin({ score: 0 })} className="text-sm text-[var(--muted)] underline underline-offset-4">
            Passer
          </button>
        </div>
      )}

      {indices && q.indice && !verdict && (
        <div className="text-center">
          {indiceVu ? (
            <div className="bloc bloc-methode text-left text-sm">
              <div className="bloc-label">💡 Indice</div>
              <Tex>{q.indice}</Tex>
            </div>
          ) : (
            <button onClick={() => setIndiceVu(true)} className="text-sm text-[var(--methode)] underline underline-offset-4">
              Indice
            </button>
          )}
        </div>
      )}

      {verdict && (
        <div className="space-y-3">
          <Correction q={q} verdict={verdict} contexte={contexte} saisie={verdict.saisie} />
          <div className="flex gap-2">
            {verdict.score < 1 && (q.type === 'num' || q.type === 'court') && (
              <button onClick={() => setVerdict({ ...verdict, score: 1, conteste: true })} className="rounded-md border border-[var(--line)] px-3 py-3 text-sm">
                J’avais juste
              </button>
            )}
            <button onClick={() => onFin(verdict)} className="flex-1 rounded-md bg-[var(--ink)] py-3 font-semibold text-[var(--bg)]">
              Suivant <span className="font-mono text-xs opacity-60">↵</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
