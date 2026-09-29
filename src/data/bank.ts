import { BankFile, type ChapitreMeta, type Niveau, type Question } from './schema'
import { GABARITS } from '../gabarits'
import { SEP, instancier, nouvelleGraine, type Gabarit } from '../gabarits/types'

// Toutes les banques sont embarquées dans le build (hors-ligne complet).
const modules = import.meta.glob('../../questions/*.json', { eager: true, import: 'default' })

const banks = Object.entries(modules)
  .map(([path, raw]) => {
    const res = BankFile.safeParse(raw)
    if (!res.success) {
      console.error(`Banque invalide ignorée : ${path}`, res.error.issues)
      return null
    }
    return res.data
  })
  .filter((b): b is BankFile => b !== null)
  .sort((a, b) => a.chapitre.ordre - b.chapitre.ordre)

export const CHAPITRES: ChapitreMeta[] = banks.map((b) => b.chapitre)
/** Questions fixes (JSON). */
export const QUESTIONS: Question[] = banks.flatMap((b) => b.questions)

/**
 * Un « item » = ce que l'on suit dans la progression et le cahier d'erreurs :
 * une question fixe, ou un gabarit (qui produit une nouvelle variante à chaque tirage).
 */
export interface Item {
  cle: string
  chapitre: string
  section: string
  niveau: Niveau
  indispensable?: number | true
  gabarit?: Gabarit
  question?: Question
}

export const ITEMS: Item[] = [
  ...GABARITS.map((g) => ({ cle: g.id, chapitre: g.chapitre, section: g.section, niveau: g.niveau, indispensable: g.indispensable, gabarit: g })),
  ...QUESTIONS.map((q) => ({ cle: q.id, chapitre: q.chapitre, section: q.section, niveau: q.niveau, indispensable: q.indispensable, question: q })),
]

const itemParCle = new Map(ITEMS.map((it) => [it.cle, it]))
const questionParId = new Map(QUESTIONS.map((q) => [q.id, q]))
const chapById = new Map(CHAPITRES.map((c) => [c.id, c]))

/** Clé de suivi d'une question : l'id du gabarit pour une variante ("g1-cross~123" → "g1-cross"). */
export const cleDe = (id: string) => id.split(SEP)[0]
export const getItem = (cle: string) => itemParCle.get(cle)

/** Une nouvelle question pour cet item (nouvelle variante si c'est un gabarit). */
export function tirer(it: Item, graine = nouvelleGraine()): Question {
  return it.gabarit ? instancier(it.gabarit, graine) : it.question!
}
/** Aperçu stable d'un item (variante n°1) pour les listes. */
export const apercu = (it: Item) => tirer(it, 1)

/** Retrouve une question précise : question fixe, ou variante recalculée à partir de sa graine. */
export function getQuestion(id: string): Question | undefined {
  if (!id.includes(SEP)) return questionParId.get(id)
  const [cle, graine] = id.split(SEP)
  const it = itemParCle.get(cle)
  return it?.gabarit ? instancier(it.gabarit, Number(graine)) : undefined
}

export const getChapitre = (id: string) => chapById.get(id)
export const itemsDu = (chapitre: string) => ITEMS.filter((it) => it.chapitre === chapitre)
/** Titre lisible d'un item (titre du gabarit, ou début de l'énoncé). */
export const titreItem = (it: Item) => it.gabarit?.titre ?? null
export const titreSection = (id: string) => {
  const ch = chapById.get(id.split('.')[0])
  return ch?.sections.find((s) => s.id === id)?.titre ?? id
}
