import { Link, useParams } from 'react-router-dom'
import { CHAPITRES, itemsDu } from '../data/bank'
import { FICHES, getFiche } from '../data/cours'
import { Tex } from '../components/Tex'

/** Liste des fiches de cours. */
export function CoursListe() {
  const ordre = (id: string) => CHAPITRES.find((c) => c.id === id)?.ordre ?? 99
  const fiches = [...FICHES].sort((a, b) => ordre(a.chapitre) - ordre(b.chapitre))
  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Cours</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">L’essentiel, les méthodes et les pièges — puis direct à l’entraînement.</p>
      </header>
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {fiches.map((f) => (
          <li key={f.chapitre}>
            <Link to={`/cours/${f.chapitre}`} className="flex items-baseline justify-between gap-3 py-3">
              <span className="font-medium">{f.titre}</span>
              <span className="shrink-0 text-xs text-[var(--muted)]">{f.sections.length} parties</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-[var(--muted)]">Les autres chapitres arrivent avec leurs banques de questions.</p>
    </div>
  )
}

/** Une fiche : sommaire, puis chaque partie avec un bouton d'entraînement ciblé. */
export function CoursFiche() {
  const { id = '' } = useParams()
  const f = getFiche(id)
  if (!f) return <p className="py-16 text-center">Fiche introuvable.</p>
  const aDesQuestions = (sec?: string) => !!sec && itemsDu(id).some((it) => it.section === sec)
  return (
    <article className="mx-auto max-w-2xl space-y-6 pt-4">
      <Link to="/cours" className="text-sm text-[var(--muted)]">
        ← Cours
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{f.titre}</h1>
        {f.intro && <Tex className="text-[var(--muted)]">{f.intro}</Tex>}
      </header>

      <nav className="rounded-md border border-[var(--line)] p-3 text-sm">
        <p className="mb-1 text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">Sommaire</p>
        <ol className="list-decimal space-y-0.5 pl-5">
          {f.sections.map((s, i) => (
            <li key={i}>
              <a href={`#/cours/${id}`} onClick={(e) => (e.preventDefault(), document.getElementById(`partie-${i}`)?.scrollIntoView({ behavior: 'smooth' }))} className="underline-offset-4 hover:underline">
                {s.titre}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {f.sections.map((s, i) => (
        <section key={i} id={`partie-${i}`} className="scroll-mt-4 space-y-2 border-t border-[var(--line)] pt-4">
          <h2 className="text-lg font-semibold">
            <span className="mr-2 font-mono text-sm text-[var(--muted)]">{i + 1}</span>
            {s.titre}
          </h2>
          <Tex className="text-[0.95rem]">{s.corps}</Tex>
          {aDesQuestions(s.section) && (
            <Link to={`/jouer?mode=entrainement&ch=${id}&sec=${s.section}`} className="inline-block rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--bg)]">
              S’entraîner sur cette partie →
            </Link>
          )}
        </section>
      ))}
      <div className="border-t border-[var(--line)] pt-4 text-center">
        <Link to={`/chapitre/${id}`} className="text-sm underline underline-offset-4">
          Voir toutes les questions du chapitre →
        </Link>
      </div>
    </article>
  )
}
