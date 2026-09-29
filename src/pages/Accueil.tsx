import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CHAPITRES, itemsDu } from '../data/bank'
import { Barre } from '../components/Barre'
import { getMeta } from '../lib/db'
import { MODES, chargerStatuts, serieJours, type Mode } from '../lib/session'
import { jour } from '../lib/sm2'
import { useAsync } from '../lib/useAsync'

const MODES_LANCEMENT: Mode[] = ['entrainement', 'blitz']

/** Accueil façon zetamac : quelques réglages, un bouton, et c'est parti. */
export function Accueil() {
  const nav = useNavigate()
  const data = useAsync(async () => {
    const [{ statuts, tentatives }, defis] = await Promise.all([chargerStatuts(), getMeta<string[]>('defis', [])])
    const erreurs = [...statuts.values()].filter((s) => s === 'erreur').length
    return { statuts, serie: serieJours(tentatives), erreurs, defiFait: defis.includes(jour()) }
  })
  const actifs = CHAPITRES.filter((c) => itemsDu(c.id).length > 0)
  const [mode, setMode] = useState<Mode>('entrainement')
  const [ch, setCh] = useState<string>('tout')
  const compte = (chId: string, s: string) => itemsDu(chId).filter((it) => data?.statuts.get(it.cle) === s).length

  return (
    <div className="space-y-8 pt-4">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">MathArena</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">UL1MA001 — entraînement rapide, corrections détaillées</p>
      </header>

      <section className="mx-auto max-w-md space-y-5">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">Mode</legend>
          {MODES_LANCEMENT.map((m) => (
            <label key={m} className="flex cursor-pointer items-start gap-3 py-1">
              <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="mt-1 size-4 accent-[var(--ink)]" />
              <span>
                <span className="font-medium">{MODES[m].nom}</span>
                <span className="block text-sm text-[var(--muted)]">{MODES[m].description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">Chapitre</span>
          <select value={ch} onChange={(e) => setCh(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2.5">
            <option value="tout">Tous les chapitres</option>
            {actifs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ordre ? `${c.ordre}. ` : ''}{c.titre}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => nav(`/jouer?mode=${mode}&ch=${ch}`)}
          disabled={actifs.length === 0}
          className="w-full rounded-md bg-[var(--ink)] py-3.5 text-lg font-semibold text-[var(--bg)] active:opacity-80 disabled:opacity-40"
        >
          Commencer
        </button>
      </section>

      <section className="mx-auto grid max-w-md grid-cols-3 divide-x divide-[var(--line)] border-y border-[var(--line)] text-center">
        <Link to="/jouer?mode=defi" className="py-3">
          <span className="block text-sm font-medium">Défi du jour</span>
          <span className="text-xs text-[var(--muted)]">{data?.defiFait ? 'relevé ✓' : '5 questions'}</span>
        </Link>
        <Link to="/cahier" className="py-3">
          <span className="block text-sm font-medium">Cahier d’erreurs</span>
          <span className={`text-xs ${data?.erreurs ? 'text-[var(--ko)]' : 'text-[var(--muted)]'}`}>{data ? `${data.erreurs} à revoir` : '…'}</span>
        </Link>
        <div className="py-3">
          <span className="block text-sm font-medium">Série</span>
          <span className="text-xs text-[var(--muted)]">🔥 {data?.serie ?? 0} jour{(data?.serie ?? 0) > 1 ? 's' : ''}</span>
        </div>
      </section>

      <section className="mx-auto max-w-md space-y-3">
        {CHAPITRES.map((c) => {
          const n = itemsDu(c.id).length
          if (!n)
            return (
              <p key={c.id} className="text-sm text-[var(--muted)]">
                {c.ordre ? `${c.ordre}. ` : ''}{c.titre} — bientôt
              </p>
            )
          const r = compte(c.id, 'reussie')
          const e = compte(c.id, 'erreur')
          return (
            <Link key={c.id} to={`/chapitre/${c.id}`} className="block space-y-1.5">
              <span className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">
                  {c.ordre ? `${c.ordre}. ` : ''}{c.titre}
                </span>
                <span className="shrink-0 font-mono text-xs text-[var(--muted)]">
                  {r}/{n}
                </span>
              </span>
              <Barre reussies={r} erreurs={e} total={n} />
            </Link>
          )
        })}
      </section>
    </div>
  )
}
