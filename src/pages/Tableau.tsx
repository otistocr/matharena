import { Link } from 'react-router-dom'
import { CHAPITRES, ITEMS, cleDe, getItem, itemsDu, titreSection } from '../data/bank'
import { Barre, Legende } from '../components/Barre'
import { MODES, chargerStatuts, serieJours, type Statut } from '../lib/session'
import { jour } from '../lib/sm2'
import { useAsync } from '../lib/useAsync'

const pct = (x: number) => `${Math.round(x * 100)} %`

/** Progrès : tout voir — chaque chapitre, chaque section, ce qui est acquis et ce qui reste. */
export function Tableau() {
  const data = useAsync(chargerStatuts)
  if (!data) return <p className="py-16 text-center text-[var(--muted)]">…</p>
  const { statuts, tentatives } = data
  const compte = (ids: string[], s: Statut) => ids.filter((id) => statuts.get(id) === s).length
  const tous = ITEMS.map((it) => it.cle)
  const reussies = compte(tous, 'reussie')
  const erreurs = compte(tous, 'erreur')

  // 14 derniers jours d'activité
  const parJour = new Map<string, number>()
  for (const t of tentatives) parJour.set(jour(new Date(t.at)), (parJour.get(jour(new Date(t.at))) ?? 0) + 1)
  const jours = Array.from({ length: 14 }, (_, k) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - k))
    return { j: jour(d), n: parJour.get(jour(d)) ?? 0, label: d.toLocaleDateString('fr-FR', { weekday: 'narrow' }) }
  })
  const max = Math.max(1, ...jours.map((d) => d.n))

  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-4">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Progrès</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {reussies} question{reussies > 1 ? 's' : ''} réussie{reussies > 1 ? 's' : ''} sur {ITEMS.length} · 🔥 {serieJours(tentatives)} jour
          {serieJours(tentatives) > 1 ? 's' : ''} d’affilée
        </p>
      </header>

      <section className="space-y-2">
        <Barre reussies={reussies} erreurs={erreurs} total={ITEMS.length} />
        <Legende />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Activité (14 jours)</h2>
        <div className="flex h-20 items-end gap-1" role="img" aria-label="Nombre de questions par jour sur 14 jours">
          {jours.map((d) => (
            <div key={d.j} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
              <span className="pointer-events-none absolute -top-5 hidden rounded bg-[var(--ink)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--bg)] group-hover:block">
                {d.n}
              </span>
              <div className="w-full rounded-t-sm bg-[var(--ink)]" style={{ height: `${(d.n / max) * 56}px`, opacity: d.n ? 1 : 0 }} />
              <span className="text-[10px] text-[var(--muted)]">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Par chapitre</h2>
        {CHAPITRES.map((c) => {
          const ids = itemsDu(c.id).map((it) => it.cle)
          if (!ids.length)
            return (
              <p key={c.id} className="text-sm text-[var(--muted)]">
                {c.ordre > 0 ? `${c.ordre}. ` : ''}{c.titre} — bientôt
              </p>
            )
          const r = compte(ids, 'reussie')
          const e = compte(ids, 'erreur')
          return (
            <details key={c.id} className="space-y-2">
              <summary className="cursor-pointer list-none space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {c.ordre > 0 ? `${c.ordre}. ` : ''}{c.titre}
                  </span>
                  <span className="shrink-0 font-mono text-xs">
                    <span className="text-[var(--ok)]">{r}</span>
                    {e > 0 && <span className="text-[var(--ko)]"> · {e}</span>}
                    <span className="text-[var(--muted)]"> / {ids.length}</span>
                  </span>
                </div>
                <Barre reussies={r} erreurs={e} total={ids.length} />
              </summary>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {c.sections.map((s) => {
                    const sid = itemsDu(c.id)
                      .filter((it) => it.section === s.id)
                      .map((it) => it.cle)
                    if (!sid.length) return null
                    const essais = tentatives.filter((t) => t.section === s.id)
                    const taux = essais.length ? essais.reduce((a, t) => a + t.score, 0) / essais.length : null
                    return (
                      <tr key={s.id} className="border-b border-[var(--line)]">
                        <td className="py-2 pr-2">{s.titre}</td>
                        <td className="w-24 py-2">
                          <Barre reussies={compte(sid, 'reussie')} erreurs={compte(sid, 'erreur')} total={sid.length} />
                        </td>
                        <td className="w-14 py-2 text-right font-mono text-xs text-[var(--muted)]">{taux === null ? '—' : pct(taux)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <Link to={`/chapitre/${c.id}`} className="inline-block text-sm underline underline-offset-4">
                Voir toutes les questions du chapitre →
              </Link>
            </details>
          )
        })}
      </section>

      {tentatives.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Historique</h2>
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {[...tentatives]
              .reverse()
              .slice(0, 40)
              .map((t, k) => (
                <li key={k} className="flex items-center gap-3 py-2">
                  <span style={{ color: t.score >= 1 ? 'var(--ok)' : 'var(--ko)' }}>{t.score >= 1 ? '✓' : '✗'}</span>
                  <Link to={`/jouer?q=${t.qid}`} className="min-w-0 flex-1 truncate">
                    {titreSection(t.section)}
                    <span className="block text-xs text-[var(--muted)]">
                      {new Date(t.at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {MODES[t.mode as keyof typeof MODES]?.nom ?? t.mode}
                      {!getItem(cleDe(t.qid)) && ' · question retirée'}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  )
}
