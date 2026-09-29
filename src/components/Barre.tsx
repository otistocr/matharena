/** Barre empilée réussies (vert) / cahier (rouge) / nouvelles (gris), avec 2 px d'espace entre segments. */
export function Barre({ reussies, erreurs, total }: { reussies: number; erreurs: number; total: number }) {
  if (!total) return <div className="h-2 rounded-full bg-[var(--line)]" />
  const p = (n: number) => `${(n / total) * 100}%`
  return (
    <div
      className="flex h-2 gap-[2px] overflow-hidden rounded-full bg-[var(--line)]"
      role="img"
      aria-label={`${reussies} réussies, ${erreurs} dans le cahier, ${total - reussies - erreurs} jamais vues sur ${total}`}
    >
      {reussies > 0 && <div className="h-full rounded-full bg-[var(--ok)]" style={{ width: p(reussies) }} />}
      {erreurs > 0 && <div className="h-full rounded-full bg-[var(--ko)]" style={{ width: p(erreurs) }} />}
    </div>
  )
}

export function Legende() {
  return (
    <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
      <span>
        <span className="mr-1 inline-block size-2 rounded-full bg-[var(--ok)]" />
        réussies
      </span>
      <span>
        <span className="mr-1 inline-block size-2 rounded-full bg-[var(--ko)]" />
        dans le cahier
      </span>
      <span>
        <span className="mr-1 inline-block size-2 rounded-full border border-[var(--muted)]" />
        jamais vues
      </span>
    </p>
  )
}
