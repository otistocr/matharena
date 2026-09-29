import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apercu, getChapitre, itemsDu } from '../data/bank'
import { NIVEAUX, type Niveau } from '../data/schema'
import { Barre, Legende } from '../components/Barre'
import { Tex } from '../components/Tex'
import { chargerStatuts, type Statut } from '../lib/session'
import { useAsync } from '../lib/useAsync'

const PASTILLE: Record<Statut, { c: string; t: string }> = {
  nouvelle: { c: 'var(--line)', t: 'jamais vue' },
  erreur: { c: 'var(--ko)', t: 'dans le cahier' },
  reussie: { c: 'var(--ok)', t: 'réussie' },
}

export function ChapitrePage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const ch = getChapitre(id)
  const data = useAsync(chargerStatuts, [id])
  const [niveau, setNiveau] = useState<Niveau | 0>(0)
  const [section, setSection] = useState('')
  if (!ch) return <p className="py-16 text-center">Chapitre introuvable.</p>
  const qs = itemsDu(id)
  const st = (cle: string): Statut => data?.statuts.get(cle) ?? 'nouvelle'
  const nb = (s: Statut, liste = qs) => liste.filter((it) => st(it.cle) === s).length
  const params = new URLSearchParams({ mode: 'entrainement', ch: id })
  if (niveau) params.set('niv', String(niveau))
  if (section) params.set('sec', section)

  return (
    <div className="mx-auto max-w-2xl space-y-7 pt-4">
      <Link to="/" className="text-sm text-[var(--muted)]">
        ← Accueil
      </Link>
      <header className="space-y-3 text-center">
        <div>
          <p className="text-sm text-[var(--muted)]">
            {ch.ordre === 0 ? 'Fondamentaux' : `Chapitre ${ch.ordre}`} · {ch.pages}
          </p>
          <h1 className="mt-1 text-2xl font-semibold">{ch.titre}</h1>
        </div>
        <Barre reussies={nb('reussie')} erreurs={nb('erreur')} total={qs.length} />
        <p className="text-sm">
          <span className="text-[var(--ok)]">{nb('reussie')} réussies</span> · <span className="text-[var(--ko)]">{nb('erreur')} dans le cahier</span> ·{' '}
          <span className="text-[var(--muted)]">{nb('nouvelle')} jamais vues</span>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => nav(`/jouer?mode=entrainement&ch=${id}`)} className="rounded-md bg-[var(--ink)] py-3 font-semibold text-[var(--bg)]">
          Tout le chapitre
        </button>
        <button onClick={() => nav(`/jouer?mode=blitz&ch=${id}`)} className="rounded-md border border-[var(--ink)] py-3 font-semibold">
          Blitz 3 min
        </button>
        {nb('erreur') > 0 && (
          <button onClick={() => nav(`/jouer?mode=erreurs&ch=${id}`)} className="col-span-2 rounded-md border border-[var(--ko)] py-3 font-semibold text-[var(--ko)]">
            {nb('erreur') === 1 ? 'Refaire mon erreur du chapitre' : `Refaire mes ${nb('erreur')} erreurs du chapitre`}
          </button>
        )}
      </div>

      <details>
        <summary className="cursor-pointer text-sm font-semibold">Entraînement ciblé (niveau, section)</summary>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {([0, 1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setNiveau(n)}
                className={`rounded-md border px-3 py-1.5 text-sm ${niveau === n ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]' : 'border-[var(--line)]'}`}
              >
                {n === 0 ? 'Tous' : NIVEAUX[n]}
              </button>
            ))}
          </div>
          <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2.5">
            <option value="">Toutes les sections</option>
            {ch.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titre} ({qs.filter((it) => it.section === s.id).length})
              </option>
            ))}
          </select>
          <button onClick={() => nav(`/jouer?${params}`)} className="w-full rounded-md border border-[var(--line)] py-3 font-semibold">
            Commencer
          </button>
        </div>
      </details>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Toutes les questions</h2>
        </div>
        <Legende />
        {ch.sections.map((s) => {
          const liste = qs.filter((it) => it.section === s.id)
          if (!liste.length) return null
          return (
            <div key={s.id}>
              <h3 className="flex items-baseline justify-between border-b border-[var(--line)] pb-1 text-sm font-semibold">
                {s.titre}
                <span className="font-mono text-xs font-normal text-[var(--muted)]">
                  {nb('reussie', liste)}/{liste.length}
                </span>
              </h3>
              <ul>
                {liste.map((it) => (
                  <li key={it.cle}>
                    <Link to={`/jouer?q=${it.cle}`} className="flex items-start gap-3 border-b border-[var(--line)] py-2.5 text-sm">
                      <span
                        className="mt-1.5 size-2.5 shrink-0 rounded-full border"
                        style={st(it.cle) === 'nouvelle' ? { borderColor: 'var(--muted)' } : { background: PASTILLE[st(it.cle)].c, borderColor: PASTILLE[st(it.cle)].c }}
                        title={PASTILLE[st(it.cle)].t}
                      />
                      <span className="line-clamp-2 min-w-0 flex-1">
                        {it.gabarit ? (
                          <span className="font-medium">{it.gabarit.titre}</span>
                        ) : (
                          <Tex className="[&_p]:m-0 [&_.katex-display]:hidden">{apercu(it).enonce.split('\n')[0]}</Tex>
                        )}
                      </span>
                      <span className="shrink-0 text-right text-xs text-[var(--muted)]">
                        {it.gabarit && <span className="mr-1 text-[var(--methode)]" title="nouvelle variante à chaque fois">∞</span>}
                        {it.indispensable !== undefined && '★ '}
                        {NIVEAUX[it.niveau].split(' ')[0]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>
    </div>
  )
}
