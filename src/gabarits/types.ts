import type { Niveau, Question } from '../data/schema'
import { Rng } from './outils'

type SansMeta<T> = T extends unknown ? Omit<T, 'id' | 'chapitre' | 'section' | 'niveau' | 'source' | 'origine' | 'refCours' | 'indispensable'> : never
/** Ce que produit un gabarit : l'énoncé, la réponse et l'explication d'UNE variante. */
export type Corps = SansMeta<Question>

/**
 * Gabarit : une « famille » de questions de même style. Chaque appel à `generer`
 * donne une nouvelle variante (nombres, noms des points/vecteurs, formulation).
 */
export interface Gabarit {
  id: string
  chapitre: string
  section: string
  niveau: Niveau
  /** Nom court affiché dans les listes, ex. « Produit vectoriel ». */
  titre: string
  /** Inspiration : « TD1 ex 4 », « poly p.20 (Test) »… */
  source: string
  refCours: string
  indispensable?: number | true
  generer: (r: Rng) => Corps
}

/** Séparateur entre id de gabarit et graine : "g1-cross~12345". */
export const SEP = '~'

export function instancier(g: Gabarit, graine: number): Question {
  const corps = g.generer(new Rng(graine))
  return {
    ...corps,
    id: `${g.id}${SEP}${graine}`,
    chapitre: g.chapitre,
    section: g.section,
    niveau: g.niveau,
    source: `variante (style ${g.source})`,
    origine: 'créée',
    refCours: g.refCours,
    ...(g.indispensable !== undefined ? { indispensable: g.indispensable } : {}),
  } as Question
}

export const nouvelleGraine = () => 1 + Math.floor(Math.random() * 2_000_000_000)
