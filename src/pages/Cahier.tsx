import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPITRES, apercu, cleDe, getItem, getQuestion, titreSection } from '../data/bank'
import type { Question } from '../data/schema'
import { Correction } from '../components/QuestionView'
import { Tex } from '../components/Tex'
import { toutesCartes, toutesTentatives, type Tentative } from '../lib/db'
import { REUSSITES_POUR_CORRIGER, dansLeCahier } from '../lib/session'
import { jour } from '../lib/sm2'
import { useAsync } from '../lib/useAsync'

interface Entree {
  cle: string
  titre: string | null
  q: Question
  echecs: number
  derniereSaisie?: string
  reussites: number
  due: boolean
}

/** Cahier d'erreurs : toutes les questions ratées, avec ta réponse et la correction complète. */
export function Cahier() {
  const data = useAsync(async () => {
    const [cartes, tent] = await Promise.all([toutesCartes(), toutesTentatives()])
    const parQ = new Map<string, Tentative[]>()
    for (const t of tent) parQ.set(cleDe(t.qid), [...(parQ.get(cleDe(t.qid)) ?? []), t])
    const aujourdhui = jour()
    const entree = (cle: string, reussites: number, due: boolean): Entree | null => {
      const it = getItem(cle)
      if (!it) return null
      const ratees = (parQ.get(cle) ?? []).filter((t) => t.score < 1)
      const derniere = ratees.at(-1)
      // la variante exacte que tu as ratée (recalculée à partir de sa graine)
      const q = (derniere && getQuestion(derniere.qid)) || apercu(it)
      return { cle, titre: it.gabarit?.titre ?? null, q, echecs: ratees.length, derniereSaisie: derniere?.saisie, reussites, due }
    }
    const ouvertes = cartes
      .filter(dansLeCahier)
      .sort((a, b) => a.echeance.localeCompare(b.echeance))
      .map((c) => entree(c.qid, c.repetitions, c.echeance <= aujourdhui))
      .filter((e): e is Entree => !!e)
    const corrigees = cartes
      .filter((c) => !dansLeCahier(c))
      .map((c) => entree(c.qid, c.repetitions, false))
      .filter((e): e is Entree => !!e)
    return { ouvertes, corrigees }
  })
  const [filtre, setFiltre] = useState<string>('tout')
  if (!data) return <p className="py-16 text-center text-[var(--muted)]">…</p>

  const visibles = data.ouvertes.filter((e) => filtre === 'tout' || e.q.chapitre === filtre)
  const chapitresPresents = CHAPITRES.filter((c) => data.ouvertes.some((e) => e.q.chapitre === c.id))

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Cahier d’erreurs</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Chaque question ratée arrive ici. Elle en sort quand tu la réussis {REUSSITES_POUR_CORRIGER} fois de suite.
        </p>
      </header>

      <div className="grid grid-cols-2 divide-x divide-[var(--line)] border-y border-[var(--line)] text-center">
        <div className="py-3">
          <p className="font-mono text-2xl">{data.ouvertes.length}</p>
          <p className="text-xs text-[var(--muted)]">à retravailler</p>
        </div>
        <div className="py-3">
          <p className="font-mono text-2xl text-[var(--ok)]">{data.corrigees.length}</p>
          <p className="text-xs text-[var(--muted)]">erreurs corrigées 🎉</p>
        </div>
      </div>

      {data.ouvertes.length === 0 ? (
        <div className="space-y-3 py-6 text-center">
          <p className="text-lg font-semibold">Rien à retravailler pour l’instant.</p>
          <p className="text-sm text-[var(--muted)]">Lance un entraînement : chaque erreur viendra se ranger ici avec sa correction.</p>
          <Link to="/" className="inline-block rounded-md bg-[var(--ink)] px-5 py-3 font-semibold text-[var(--bg)]">
            Jouer
          </Link>
        </div>
      ) : (
        <>
          <Link
            to={`/jouer?mode=erreurs&ch=${filtre}`}
            className="block rounded-md bg-[var(--ink)] py-3.5 text-center text-lg font-semibold text-[var(--bg)]"
          >
            {visibles.length === 1 ? 'Refaire cette erreur' : `Refaire ${filtre === 'tout' ? 'mes' : 'ces'} ${visibles.length} erreurs`}
          </Link>

          {chapitresPresents.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {[{ id: 'tout', court: 'Tout' }, ...chapitresPresents].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFiltre(c.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${filtre === c.id ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]' : 'border-[var(--line)]'}`}
                >
                  {c.court}
                </button>
              ))}
            </div>
          )}

          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {visibles.map((e) => (
              <li key={e.cle}>
                <details>
                  <summary className="flex cursor-pointer list-none items-start gap-3 py-3">
                    <span className="mt-0.5 font-mono text-sm text-[var(--ko)]">✗{e.echecs > 1 ? e.echecs : ''}</span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm">
                        {e.titre ? <span className="font-medium">{e.titre}</span> : <Tex className="[&_p]:m-0 [&_.katex-display]:hidden">{e.q.enonce.split('\n')[0]}</Tex>}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {titreSection(e.q.section)}
                        {e.reussites > 0 && <span className="text-[var(--ok)]"> · {e.reussites}/{REUSSITES_POUR_CORRIGER} réussite</span>}
                        {e.due && e.reussites === 0 && ' · à revoir aujourd’hui'}
                      </span>
                    </span>
                    <span className="text-xs text-[var(--muted)]">▾</span>
                  </summary>
                  <div className="space-y-3 pb-4">
                    {e.titre && <p className="text-xs text-[var(--muted)]">La variante que tu as ratée :</p>}
                    <Tex>{e.q.enonce}</Tex>
                    <Correction q={e.q} saisie={e.derniereSaisie} />
                    <Link to={`/jouer?q=${e.cle}`} className="inline-block rounded-md border border-[var(--ink)] px-4 py-2 text-sm font-semibold">
                      {e.titre ? 'Réessayer (nouvelle variante)' : 'Réessayer cette question'}
                    </Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}

      {data.corrigees.length > 0 && (
        <details className="border-t border-[var(--line)] pt-3">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--ok)]">
            ✓ Erreurs corrigées ({data.corrigees.length})
          </summary>
          <ul className="mt-2 space-y-1 text-sm">
            {data.corrigees.map((e) => (
              <li key={e.cle} className="flex gap-2">
                <span className="text-[var(--ok)]">✓</span>
                <Link to={`/jouer?q=${e.cle}`} className="line-clamp-1 min-w-0 flex-1">
                  {e.titre ?? <Tex className="[&_p]:m-0 [&_.katex-display]:hidden">{e.q.enonce.split('\n')[0]}</Tex>}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
