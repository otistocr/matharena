/**
 * Données personnelles en IndexedDB : tentatives, cahier d'erreurs (cartes SM-2), méta.
 * Export / import JSON (fusion) pour synchroniser ses appareils à la main.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Carte } from './sm2'

export type ModeJeu = 'entrainement' | 'blitz' | 'defi' | 'erreurs'

export interface Tentative {
  id?: number
  qid: string
  chapitre: string
  section: string
  mode: ModeJeu
  /** 0 ou 1. */
  score: number
  /** Horodatage ms. */
  at: number
  /** Durée de réponse ms. */
  duree: number
  /** Ce que tu as répondu (affiché dans le cahier d'erreurs). */
  saisie?: string
}

interface Meta {
  cle: string
  valeur: unknown
}

interface ArenaDB extends DBSchema {
  tentatives: { key: number; value: Tentative; indexes: { par_qid: string; par_chapitre: string; par_date: number } }
  cartes: { key: string; value: Carte }
  meta: { key: string; value: Meta }
}

let dbPromise: Promise<IDBPDatabase<ArenaDB>> | null = null
export function db() {
  dbPromise ??= openDB<ArenaDB>('matharena', 2, {
    upgrade(d, ancienne) {
      if (ancienne < 1) {
        const t = d.createObjectStore('tentatives', { keyPath: 'id', autoIncrement: true })
        t.createIndex('par_qid', 'qid')
        t.createIndex('par_chapitre', 'chapitre')
        t.createIndex('par_date', 'at')
        d.createObjectStore('cartes', { keyPath: 'qid' })
        d.createObjectStore('meta', { keyPath: 'cle' })
      }
      // v2 : plus d'ELO.
      if ((d.objectStoreNames as DOMStringList).contains('classements')) (d as unknown as IDBPDatabase).deleteObjectStore('classements')
    },
  })
  return dbPromise
}

// ---------------------------------------------------------------- Lecture / écriture

export async function toutesTentatives(): Promise<Tentative[]> {
  return (await db()).getAllFromIndex('tentatives', 'par_date')
}
export async function toutesCartes(): Promise<Carte[]> {
  return (await db()).getAll('cartes')
}
export async function carte(qid: string) {
  return (await db()).get('cartes', qid)
}
export async function getMeta<T>(cle: string, defaut: T): Promise<T> {
  const m = await (await db()).get('meta', cle)
  return m ? (m.valeur as T) : defaut
}
export async function enregistrerTentative(t: Tentative) {
  await (await db()).add('tentatives', t)
}
export async function sauverCarte(c: Carte) {
  await (await db()).put('cartes', c)
}
export async function setMeta(cle: string, valeur: unknown) {
  await (await db()).put('meta', { cle, valeur })
}

// ---------------------------------------------------------------- Export / import

export interface Sauvegarde {
  app: 'matharena'
  version: 1 | 2
  exporteLe: string
  tentatives: Tentative[]
  cartes: Carte[]
  meta: Meta[]
}

export async function exporter(): Promise<Sauvegarde> {
  const d = await db()
  return {
    app: 'matharena',
    version: 2,
    exporteLe: new Date().toISOString(),
    tentatives: (await d.getAll('tentatives')).map(({ id: _, ...t }) => t),
    cartes: await d.getAll('cartes'),
    meta: await d.getAll('meta'),
  }
}

/**
 * Fusionne une sauvegarde avec les données locales (aucune perte) :
 * tentatives dédoublonnées (qid + horodatage), carte révisée le plus récemment,
 * méta : l'importée l'emporte sauf les listes, réunies.
 */
export async function importer(s: Sauvegarde): Promise<{ tentatives: number }> {
  if (s?.app !== 'matharena' || ![1, 2].includes(s.version)) throw new Error("Ce fichier n'est pas une sauvegarde MathArena.")
  const d = await db()
  const tx = d.transaction(['tentatives', 'cartes', 'meta'], 'readwrite')

  const existantes = new Set((await tx.objectStore('tentatives').getAll()).map((t) => `${t.qid}@${t.at}`))
  let ajout = 0
  for (const { id: _, ...t } of s.tentatives ?? []) {
    if (existantes.has(`${t.qid}@${t.at}`)) continue
    await tx.objectStore('tentatives').add(t)
    ajout++
  }
  for (const c of s.cartes ?? []) {
    const local = await tx.objectStore('cartes').get(c.qid)
    if (!local || (c.derniere ?? '') > (local.derniere ?? '')) await tx.objectStore('cartes').put(c)
  }
  for (const m of s.meta ?? []) {
    const local = await tx.objectStore('meta').get(m.cle)
    if (local && Array.isArray(local.valeur) && Array.isArray(m.valeur)) {
      await tx.objectStore('meta').put({ cle: m.cle, valeur: [...new Set([...local.valeur, ...m.valeur])].sort() })
    } else {
      await tx.objectStore('meta').put(m)
    }
  }
  await tx.done
  return { tentatives: ajout }
}

export async function toutEffacer() {
  const d = await db()
  await Promise.all((['tentatives', 'cartes', 'meta'] as const).map((s) => d.clear(s)))
}
