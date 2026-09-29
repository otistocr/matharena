/**
 * Logique des modes de jeu : choix des questions, statut de chaque item
 * (nouveau / dans le cahier d'erreurs / réussi) et enregistrement d'une réponse.
 *
 * Un item est une question fixe OU un gabarit à variantes : la progression et le cahier d'erreurs
 * suivent l'item (la notion), et chaque tirage d'un gabarit donne une nouvelle variante.
 */
import type { Question } from '../data/schema'
import { ITEMS, cleDe, getItem, itemsDu, tirer, type Item } from '../data/bank'
import { carte as lireCarte, enregistrerTentative, sauverCarte, toutesCartes, toutesTentatives, type ModeJeu, type Tentative } from './db'
import { jour, nouvelleCarte, qualiteDepuisScore, reviser, type Carte } from './sm2'

export type Mode = ModeJeu

export const MODES: Record<Mode, { nom: string; description: string }> = {
  entrainement: { nom: 'Entraînement', description: 'Toutes les notions, les nouvelles d’abord, avec indices' },
  blitz: { nom: 'Blitz', description: '3 minutes, un maximum de bonnes réponses' },
  defi: { nom: 'Défi du jour', description: '5 questions, une fois par jour' },
  erreurs: { nom: 'Cahier d’erreurs', description: 'Refaire les notions ratées (nouvelles variantes)' },
}

export const BLITZ_DUREE_MS = 3 * 60 * 1000
export const DEFI_NB = 5
/** Une erreur est « corrigée » (sort du cahier) après 2 réussites d'affilée. */
export const REUSSITES_POUR_CORRIGER = 2

/** Types jouables en quiz (la Rédaction a son propre mode). */
const jouable = (it: Item) => !it.question || it.question.type !== 'redaction'

export function melanger<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function graine(s: string) {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------- Statuts

export type Statut = 'nouvelle' | 'erreur' | 'reussie'

export const dansLeCahier = (c: Carte | undefined) => !!c && c.repetitions < REUSSITES_POUR_CORRIGER

/** Statut de chaque item (par clé) à partir de l'historique et des cartes. */
export function statuts(tentatives: Tentative[], cartes: Carte[]): Map<string, Statut> {
  const cartesParCle = new Map(cartes.map((c) => [c.qid, c]))
  const vues = new Set(tentatives.map((t) => cleDe(t.qid)))
  const m = new Map<string, Statut>()
  for (const it of ITEMS) m.set(it.cle, dansLeCahier(cartesParCle.get(it.cle)) ? 'erreur' : vues.has(it.cle) ? 'reussie' : 'nouvelle')
  return m
}

export async function chargerStatuts() {
  const [t, c] = await Promise.all([toutesTentatives(), toutesCartes()])
  return { statuts: statuts(t, c), tentatives: t, cartes: c }
}

// ---------------------------------------------------------------- Sélections

export interface Filtre {
  chapitre: string | 'tout'
  niveau?: 1 | 2 | 3
  section?: string
}

export function itemsFiltres(f: Filtre): Item[] {
  const base = f.chapitre === 'tout' ? ITEMS : itemsDu(f.chapitre)
  return base.filter((it) => jouable(it) && (!f.niveau || it.niveau === f.niveau) && (!f.section || it.section === f.section))
}

/** Entraînement : TOUS les items du filtre — nouveaux d'abord, puis ceux du cahier, puis les réussis. */
export async function selectionEntrainement(f: Filtre): Promise<Question[]> {
  const { statuts: st } = await chargerStatuts()
  const rang: Record<Statut, number> = { nouvelle: 0, erreur: 1, reussie: 2 }
  return melanger(itemsFiltres(f))
    .sort((a, b) => rang[st.get(a.cle)!] - rang[st.get(b.cle)!])
    .map((it) => tirer(it))
}

/** Blitz : tout le filtre mélangé ; appelée à nouveau quand le paquet est épuisé (nouvelles variantes). */
export function selectionBlitz(f: Filtre): Question[] {
  return melanger(itemsFiltres(f)).map((it) => tirer(it))
}

/** Défi du jour : 5 items et 5 variantes tirés de façon déterministe à partir de la date. */
export function selectionDefi(date = jour()): Question[] {
  const rnd = graine('defi-' + date)
  return melanger(ITEMS.filter(jouable), rnd)
    .slice(0, DEFI_NB)
    .map((it) => tirer(it, 1 + Math.floor(rnd() * 1e9)))
}

/** Cahier d'erreurs : les plus « urgentes » (échéance SM-2) d'abord, chacune en NOUVELLE variante. */
export async function selectionErreurs(chapitre: string | 'tout' = 'tout'): Promise<Question[]> {
  const cartes = (await toutesCartes()).filter(dansLeCahier).sort((a, b) => a.echeance.localeCompare(b.echeance))
  return cartes
    .map((c) => getItem(c.qid))
    .filter((it): it is Item => !!it && jouable(it) && (chapitre === 'tout' || it.chapitre === chapitre))
    .map((it) => tirer(it))
}

export async function nbErreurs(): Promise<number> {
  return (await toutesCartes()).filter(dansLeCahier).length
}

// ---------------------------------------------------------------- Enregistrement

/** Ce qui s'est passé pour l'item, pour un retour encourageant. */
export type Evenement =
  | 'nouvelle-reussie' // première fois, réussie du premier coup
  | 'reussie' // déjà réussie, encore réussie
  | 'progres' // dans le cahier : 1 réussite sur 2
  | 'corrigee' // sort du cahier 🎉
  | 'cahier' // ratée : entre (ou reste) dans le cahier

export async function enregistrerReponse(q: Question, score: number, mode: Mode, duree: number, saisie?: string): Promise<Evenement> {
  const cle = cleDe(q.id)
  const dejaVue = (await toutesTentatives()).some((t) => cleDe(t.qid) === cle)
  await enregistrerTentative({ qid: q.id, chapitre: q.chapitre, section: q.section, mode, score, at: Date.now(), duree, saisie })

  const aujourdhui = jour()
  const existante = await lireCarte(cle)
  const qualite = qualiteDepuisScore(score, duree < 20_000)
  if (score < 1) {
    await sauverCarte(reviser(existante ?? nouvelleCarte(cle, aujourdhui), qualite, aujourdhui))
    return 'cahier'
  }
  if (existante) {
    const etaitDansCahier = dansLeCahier(existante)
    const nv = reviser(existante, qualite, aujourdhui)
    await sauverCarte(nv)
    if (etaitDansCahier) return dansLeCahier(nv) ? 'progres' : 'corrigee'
    return 'reussie'
  }
  return dejaVue ? 'reussie' : 'nouvelle-reussie'
}

/** Série de jours consécutifs avec au moins une réponse (aujourd'hui ou hier inclus). */
export function serieJours(tentatives: Tentative[], aujourdhui = jour()): number {
  const jours = new Set(tentatives.map((t) => jour(new Date(t.at))))
  let n = 0
  const d = new Date(aujourdhui + 'T12:00:00')
  if (!jours.has(aujourdhui)) d.setDate(d.getDate() - 1)
  while (jours.has(jour(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
