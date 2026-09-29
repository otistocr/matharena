/**
 * Répétition espacée SM-2 (SuperMemo 2, Wozniak 1987) sur les questions ratées.
 * qualité : 0–5 (0 = blackout, 3 = juste avec difficulté, 5 = parfait).
 */

export interface Carte {
  qid: string
  /** Facteur de facilité, ≥ 1,3. */
  ef: number
  /** Intervalle actuel en jours. */
  intervalle: number
  /** Nombre de révisions réussies consécutives. */
  repetitions: number
  /** Date d'échéance (AAAA-MM-JJ). */
  echeance: string
  derniere?: string
}

export const EF_MIN = 1.3

export function jour(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const j = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${j}`
}

export function ajouterJours(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return jour(new Date(y, m - 1, d + n))
}

export function nouvelleCarte(qid: string, aujourdhui: string): Carte {
  return { qid, ef: 2.5, intervalle: 0, repetitions: 0, echeance: aujourdhui }
}

export function reviser(carte: Carte, qualite: number, aujourdhui: string): Carte {
  if (!Number.isInteger(qualite) || qualite < 0 || qualite > 5) throw new RangeError('qualité entre 0 et 5')
  let { ef, intervalle, repetitions } = carte
  if (qualite < 3) {
    repetitions = 0
    intervalle = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalle = 1
    else if (repetitions === 2) intervalle = 6
    else intervalle = Math.round(intervalle * ef)
  }
  ef = Math.max(EF_MIN, ef + (0.1 - (5 - qualite) * (0.08 + (5 - qualite) * 0.02)))
  return { ...carte, ef: Math.round(ef * 1000) / 1000, intervalle, repetitions, echeance: ajouterJours(aujourdhui, intervalle), derniere: aujourdhui }
}

export const estDue = (carte: Carte, aujourdhui: string) => carte.echeance <= aujourdhui

/** Score de la partie (0 / 0,5 / 1) → qualité SM-2. */
export function qualiteDepuisScore(score: number, rapide = false): number {
  if (score >= 1) return rapide ? 5 : 4
  if (score >= 0.5) return 3
  return 1
}
