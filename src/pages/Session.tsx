import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Question } from '../data/schema'
import { cleDe, getChapitre, getItem, getQuestion, tirer } from '../data/bank'
import { Correction, QuestionView, type Contexte, type Verdict } from '../components/QuestionView'
import { Tex } from '../components/Tex'
import { getMeta, setMeta, toutesCartes } from '../lib/db'
import {
  BLITZ_DUREE_MS,
  MODES,
  chargerStatuts,
  enregistrerReponse,
  selectionBlitz,
  selectionDefi,
  selectionEntrainement,
  selectionErreurs,
  type Evenement,
  type Mode,
} from '../lib/session'
import { jour } from '../lib/sm2'

interface Ligne {
  q: Question
  score: number
  saisie?: string
  evenement: Evenement
}

export function Session() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const mode = (sp.get('mode') ?? 'entrainement') as Mode
  const ch = sp.get('ch') ?? 'tout'
  const niv = Number(sp.get('niv')) || undefined
  const sec = sp.get('sec') ?? undefined
  const unique = sp.get('q')

  const [file, setFile] = useState<Question[] | null>(null)
  const [i, setI] = useState(0)
  const [journal, setJournal] = useState<Ligne[]>([])
  const [contextes, setContextes] = useState<Map<string, Contexte>>(new Map())
  const [fini, setFini] = useState(false)
  const [defiDejaFait, setDefiDejaFait] = useState(false)
  const [serie, setSerie] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ko' | null>(null)
  const [restant, setRestant] = useState(BLITZ_DUREE_MS)
  const [partie, setPartie] = useState(0)
  const debutQ = useRef(Date.now())
  const finBlitz = useRef(0)
  const enCours = useRef(false)

  // ---- Chargement
  useEffect(() => {
    let vivant = true
    ;(async () => {
      const filtre = { chapitre: ch, niveau: niv as 1 | 2 | 3 | undefined, section: sec }
      let qs: Question[] = []
      let fait = false
      if (unique) {
        // clé d'item → nouvelle variante ; id de variante précis → cette variante-là
        const it = getItem(unique)
        qs = [it ? tirer(it) : getQuestion(unique)].filter((q): q is Question => !!q)
      }
      else if (mode === 'entrainement') qs = await selectionEntrainement(filtre)
      else if (mode === 'blitz') qs = selectionBlitz(filtre)
      else if (mode === 'erreurs') qs = await selectionErreurs(ch)
      else if (mode === 'defi') {
        qs = selectionDefi()
        fait = (await getMeta<string[]>('defis', [])).includes(jour())
      }
      const { statuts } = await chargerStatuts()
      const cartes = new Map((await toutesCartes()).map((c) => [c.qid, c]))
      const ctx = new Map<string, Contexte>()
      for (const q of qs) ctx.set(cleDe(q.id), { statut: statuts.get(cleDe(q.id)) ?? 'nouvelle', reussites: cartes.get(cleDe(q.id))?.repetitions ?? 0 })
      if (!vivant) return
      finBlitz.current = Date.now() + BLITZ_DUREE_MS
      setContextes(ctx)
      setDefiDejaFait(fait)
      setFile(qs)
      setI(0)
      setJournal([])
      setFini(false)
      setSerie(0)
      debutQ.current = Date.now()
    })()
    return () => {
      vivant = false
    }
  }, [mode, ch, niv, sec, unique, partie])

  // ---- Chrono Blitz
  useEffect(() => {
    if (mode !== 'blitz' || fini || !file) return
    const t = setInterval(() => {
      const r = finBlitz.current - Date.now()
      setRestant(Math.max(0, r))
      if (r <= 0) setFini(true)
    }, 250)
    return () => clearInterval(t)
  }, [mode, fini, file])

  const terminer = useCallback(async () => {
    setFini(true)
    if (mode === 'defi' && !defiDejaFait) {
      const defis = await getMeta<string[]>('defis', [])
      await setMeta('defis', [...new Set([...defis, jour()])])
    }
  }, [mode, defiDejaFait])

  const courant = file?.[i]

  const onFin = async (v: Verdict) => {
    if (!courant || enCours.current || fini) return
    enCours.current = true
    const evenement = await enregistrerReponse(courant, v.score, mode, Date.now() - debutQ.current, v.saisie)
    setJournal((j) => [...j, { q: courant, score: v.score, saisie: v.saisie, evenement }])
    setSerie((s) => (v.score >= 1 ? s + 1 : 0))
    if (mode === 'blitz') {
      setFlash(v.score >= 1 ? 'ok' : 'ko')
      setTimeout(() => setFlash(null), 450)
    }
    // Blitz : on reboucle sur le paquet mélangé si on a tout vu avant la fin du temps.
    const suivant = i + 1
    if (suivant < (file?.length ?? 0)) setI(suivant)
    else if (mode === 'blitz' && Date.now() < finBlitz.current) {
      // paquet épuisé : on retire tout le filtre en NOUVELLES variantes
      const nouveau = selectionBlitz({ chapitre: ch, niveau: niv as 1 | 2 | 3 | undefined, section: sec })
      setFile(nouveau)
      setI(0)
    } else await terminer()
    debutQ.current = Date.now()
    enCours.current = false
  }

  // ---- Rendus
  const chAffiche = unique ? (getItem(unique)?.chapitre ?? getQuestion(unique)?.chapitre ?? ch) : ch
  const nomCh = chAffiche === 'tout' ? 'Tous chapitres' : (getChapitre(chAffiche)?.court ?? chAffiche)

  if (!file) return <p className="py-16 text-center text-[var(--muted)]">…</p>

  if (file.length === 0 || !courant)
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-3xl">{mode === 'erreurs' ? '🎉' : '📭'}</p>
        <p className="text-lg font-semibold">{mode === 'erreurs' ? 'Ton cahier d’erreurs est vide !' : 'Aucune question pour ces critères.'}</p>
        <p className="text-sm text-[var(--muted)]">
          {mode === 'erreurs' ? 'Toutes tes erreurs sont corrigées. Continue comme ça.' : 'Change de niveau ou de section.'}
        </p>
        <Link to="/" className="inline-block rounded-md bg-[var(--ink)] px-5 py-3 font-semibold text-[var(--bg)]">
          Accueil
        </Link>
      </div>
    )

  if (fini) return <Bilan journal={journal} mode={mode} titre={unique ? 'Question' : MODES[mode].nom} onRejouer={() => setPartie((p) => p + 1)} onQuitter={() => nav(-1)} />

  const score = journal.reduce((s, l) => s + l.score, 0)
  const secondes = Math.ceil(restant / 1000)

  return (
    <div className="space-y-8">
      {/* Barre façon zetamac : temps (ou progression) à gauche, score à droite. */}
      <div className="flex items-baseline justify-between gap-3 pt-1 font-mono text-sm">
        <div className="flex items-baseline gap-3">
          <button onClick={() => (journal.length ? terminer() : nav(-1))} className="text-[var(--muted)]" aria-label="Quitter">
            ✕
          </button>
          {mode === 'blitz' ? (
            <span className={secondes <= 20 ? 'text-[var(--ko)]' : ''}>Temps : {secondes}</span>
          ) : (
            <span>
              {i + 1}/{file.length}
            </span>
          )}
        </div>
        <span className="truncate text-xs text-[var(--muted)]">
          {unique ? 'Question' : MODES[mode].nom} · {nomCh}
          {defiDejaFait && ' · déjà relevé'}
        </span>
        <span className="flex items-baseline gap-3">
          {serie >= 2 && <span className="text-[var(--cle)]">🔥{serie}</span>}
          <span>Score : {score}</span>
        </span>
      </div>

      {flash && (
        <p className="-my-6 text-center font-mono text-sm font-semibold" style={{ color: flash === 'ok' ? 'var(--ok)' : 'var(--ko)' }}>
          {flash === 'ok' ? '✓' : '✗'}
        </p>
      )}

      <QuestionView
        key={`${courant.id}-${journal.length}`}
        q={courant}
        indices={mode === 'entrainement' || mode === 'erreurs'}
        rapide={mode === 'blitz'}
        onFin={onFin}
        contexte={contextes.get(cleDe(courant.id))}
      />
    </div>
  )
}

function Bilan({ journal, mode, titre, onRejouer, onQuitter }: { journal: Ligne[]; mode: Mode; titre: string; onRejouer: () => void; onQuitter: () => void }) {
  const justes = journal.reduce((s, l) => s + l.score, 0)
  const n = (e: Evenement) => journal.filter((l) => l.evenement === e).length
  const lignes = [
    n('nouvelle-reussie') && `✓ ${n('nouvelle-reussie')} nouvelle${n('nouvelle-reussie') > 1 ? 's' : ''} question${n('nouvelle-reussie') > 1 ? 's' : ''} réussie${n('nouvelle-reussie') > 1 ? 's' : ''} du premier coup`,
    n('corrigee') && `🎉 ${n('corrigee')} erreur${n('corrigee') > 1 ? 's' : ''} corrigée${n('corrigee') > 1 ? 's' : ''} : sortie${n('corrigee') > 1 ? 's' : ''} du cahier`,
    n('progres') && `↗ ${n('progres')} erreur${n('progres') > 1 ? 's' : ''} en bonne voie (encore une réussite)`,
    n('cahier') && `📒 ${n('cahier')} question${n('cahier') > 1 ? 's' : ''} à retravailler, ajoutée${n('cahier') > 1 ? 's' : ''} au cahier`,
  ].filter(Boolean) as string[]
  const taux = journal.length ? justes / journal.length : 0
  const encouragement =
    journal.length === 0 ? '' : taux === 1 ? 'Sans faute. Bravo !' : taux >= 0.7 ? 'Très bonne série.' : taux >= 0.4 ? 'Ça avance, continue.' : 'Chaque erreur relue, c’est un point gagné au partiel.'

  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <p className="text-sm text-[var(--muted)]">{titre}</p>
        <p className="mt-2 font-mono text-4xl">Score : {justes}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          sur {journal.length} question{journal.length > 1 ? 's' : ''}
          {encouragement && ` · ${encouragement}`}
        </p>
      </div>

      {lignes.length > 0 && (
        <ul className="mx-auto max-w-sm space-y-1 text-sm">
          {lignes.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-center gap-2">
        <button onClick={onQuitter} className="rounded-md border border-[var(--line)] px-5 py-3 font-semibold">
          Retour
        </button>
        {mode !== 'defi' && (
          <button onClick={onRejouer} className="rounded-md bg-[var(--ink)] px-5 py-3 font-semibold text-[var(--bg)]">
            Rejouer
          </button>
        )}
      </div>

      {journal.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Corrections</h2>
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {journal.map((l, k) => (
              <li key={k}>
                <details open={l.score < 1 && mode !== 'blitz'}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3">
                    <span className="font-mono font-bold" style={{ color: l.score >= 1 ? 'var(--ok)' : 'var(--ko)' }}>
                      {l.score >= 1 ? '✓' : '✗'}
                    </span>
                    <span className="line-clamp-2 min-w-0 flex-1 text-sm">
                      <Tex className="[&_p]:m-0 [&_.katex-display]:hidden">{l.q.enonce.split('\n')[0]}</Tex>
                    </span>
                    <span className="text-xs text-[var(--muted)]">▾</span>
                  </summary>
                  <div className="pb-4">
                    <Correction q={l.q} saisie={l.score < 1 ? l.saisie : undefined} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
