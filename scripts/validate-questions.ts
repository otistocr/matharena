/**
 * npm run validate-questions
 * Vérifie toutes les banques /questions/*.json : schéma Zod, ids uniques, réponses exploitables
 * (expressions analysables, forme attendue acceptée par le correcteur), et 300 variantes de chaque
 * gabarit. Code de sortie 1 si erreur.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BankFile } from '../src/data/schema'
import { checkAnswer, checkExplication, controler } from '../src/data/controle'
import { GABARITS } from '../src/gabarits'
import { instancier } from '../src/gabarits/types'

const dir = join(import.meta.dirname, '..', 'questions')
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
const errors: string[] = []
const ids = new Map<string, string>()
const chapters = new Set<string>()
const sections = new Set<string>()
const VARIANTES = 300

for (const f of files) {
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  } catch (e) {
    errors.push(`${f} : JSON invalide — ${(e as Error).message}`)
    continue
  }
  const res = BankFile.safeParse(raw)
  if (!res.success) {
    for (const issue of res.error.issues) {
      const path = issue.path.join('.')
      const qi = issue.path[0] === 'questions' ? (raw as { questions: { id?: string }[] }).questions?.[issue.path[1] as number]?.id : undefined
      errors.push(`${f} : ${qi ? `[${qi}] ` : ''}${path} — ${issue.message}`)
    }
    continue
  }
  const bank = res.data
  if (f !== `${bank.chapitre.id}.json`) errors.push(`${f} : le fichier doit s'appeler ${bank.chapitre.id}.json`)
  if (chapters.has(bank.chapitre.id)) errors.push(`${f} : chapitre ${bank.chapitre.id} en double`)
  chapters.add(bank.chapitre.id)
  bank.chapitre.sections.forEach((s) => sections.add(s.id))

  const stats = { n: 0, niveau: [0, 0, 0], transposee: 0, creee: 0, types: {} as Record<string, number> }
  for (const q of bank.questions) {
    if (ids.has(q.id)) errors.push(`${f} : id ${q.id} déjà utilisé dans ${ids.get(q.id)}`)
    ids.set(q.id, f)
    const a = checkAnswer(q) ?? checkExplication(q)
    if (a) errors.push(`${f} : [${q.id}] ${a}`)
    stats.n++
    stats.niveau[q.niveau - 1]++
    if (q.origine === 'transposée') stats.transposee++
    else stats.creee++
    stats.types[q.type] = (stats.types[q.type] ?? 0) + 1
  }
  const types = Object.entries(stats.types).map(([t, n]) => `${t}:${n}`).join(' ')
  console.log(
    `${bank.chapitre.id.padEnd(8)} ${String(stats.n).padStart(3)} q.  niv ${stats.niveau.join('/')}  transposées ${stats.transposee} / créées ${stats.creee}  ${types}`,
  )
}

// ---- Gabarits : on génère VARIANTES variantes de chacun et on contrôle chacune.
const parChapitre = new Map<string, number>()
for (const g of GABARITS) {
  if (ids.has(g.id)) errors.push(`gabarit ${g.id} : id déjà utilisé`)
  ids.set(g.id, 'gabarits')
  if (!chapters.has(g.chapitre)) errors.push(`gabarit ${g.id} : chapitre inconnu ${g.chapitre}`)
  parChapitre.set(g.chapitre, (parChapitre.get(g.chapitre) ?? 0) + 1)
  const enonces = new Set<string>()
  for (let graine = 1; graine <= VARIANTES; graine++) {
    let err: string | null
    try {
      const q = instancier(g, graine)
      enonces.add(q.enonce)
      err = controler(q, sections)
    } catch (e) {
      err = (e as Error).message
    }
    if (err) {
      errors.push(`gabarit ${g.id}, variante ${graine} : ${err}`)
      break
    }
  }
  if (enonces.size < 6) errors.push(`gabarit ${g.id} : seulement ${enonces.size} énoncés différents sur ${VARIANTES} (pas assez de variété)`)
}
console.log(`\nGabarits : ${[...parChapitre].map(([c, n]) => `${c} ${n}`).join(' · ')} (${VARIANTES} variantes contrôlées chacun)`)

if (errors.length) {
  console.error(`\n✗ ${errors.length} erreur(s) :`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log(`\n✓ ${ids.size - GABARITS.length} questions fixes et ${GABARITS.length} gabarits valides.`)
