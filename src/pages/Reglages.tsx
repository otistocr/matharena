import { useRef, useState } from 'react'
import { ITEMS, CHAPITRES } from '../data/bank'
import { exporter, importer, toutEffacer, type Sauvegarde } from '../lib/db'

export function Reglages() {
  const [msg, setMsg] = useState<string | null>(null)
  const fichier = useRef<HTMLInputElement>(null)

  const exporterFichier = async () => {
    const s = await exporter()
    const blob = new Blob([JSON.stringify(s)], { type: 'application/json' })
    const nom = `matharena-${new Date().toISOString().slice(0, 10)}.json`
    const file = new File([blob], nom, { type: 'application/json' })
    // Sur iPhone/iPad, la feuille de partage permet d'enregistrer dans Fichiers / AirDrop.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Sauvegarde MathArena' })
        return setMsg(`✓ ${s.tentatives.length} réponses exportées.`)
      } catch {
        /* partage annulé : on retombe sur le téléchargement */
      }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = nom
    a.click()
    URL.revokeObjectURL(a.href)
    setMsg(`✓ ${s.tentatives.length} réponses exportées.`)
  }

  const importerFichier = async (f: File) => {
    try {
      const s = JSON.parse(await f.text()) as Sauvegarde
      const r = await importer(s)
      setMsg(`✓ Import fusionné : ${r.tentatives} nouvelle(s) réponse(s) ajoutée(s).`)
    } catch (e) {
      setMsg(`✗ ${(e as Error).message}`)
    }
  }

  const effacer = async () => {
    if (!confirm('Effacer définitivement ton historique et ton cahier d’erreurs sur cet appareil ? Exporte d’abord si tu veux garder une copie.')) return
    await toutEffacer()
    setMsg('Données effacées sur cet appareil.')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Données</h1>

      <section className="space-y-3 rounded-md border border-[var(--line)] p-4">
        <h2 className="font-semibold">Synchroniser mes appareils</h2>
        <p className="text-sm text-[var(--muted)]">
          Tout est stocké uniquement sur cet appareil. Pour passer du téléphone à l’iPad : <b>Exporter</b> ici, envoie le fichier (AirDrop, Fichiers, mail), puis{' '}
          <b>Importer</b> sur l’autre appareil. L’import <b>fusionne</b> sans rien écraser.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={exporterFichier} className="rounded-md bg-[var(--ink)] py-3 font-semibold text-[var(--bg)]">
            Exporter
          </button>
          <button onClick={() => fichier.current?.click()} className="rounded-md border border-[var(--line)] py-3 font-semibold">
            Importer
          </button>
        </div>
        <input
          ref={fichier}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importerFichier(f)
            e.target.value = ''
          }}
        />
        {msg && <p className="text-sm">{msg}</p>}
      </section>

      <section className="space-y-2 rounded-md border border-[var(--line)] p-4 text-sm">
        <h2 className="font-semibold">Banque de questions</h2>
        <p className="text-[var(--muted)]">
          {ITEMS.filter((it) => it.gabarit).length} gabarits à variantes infinies + {ITEMS.filter((it) => it.question).length} questions fixes · {CHAPITRES.length} chapitres. Sources : poly UL1MA001 (version du 18/11/2025), feuilles de TD, CC1 2019–2024. Chaque question
          indique sa source et la section du cours.
        </p>
      </section>

      <section className="rounded-md border border-[var(--ko-line)] p-4">
        <button onClick={effacer} className="text-sm font-semibold text-[var(--ko)]">
          Effacer toutes mes données sur cet appareil
        </button>
      </section>

      <p className="text-center text-xs text-[var(--muted)]">MathArena v{__APP_VERSION__} · hors-ligne · aucune donnée envoyée</p>
    </div>
  )
}
