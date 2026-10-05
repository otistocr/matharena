/**
 * Exécution de code Python dans le navigateur (Pyodide), dans un fil séparé.
 * Le moteur (≈ 12 Mo) n'est téléchargé qu'à la première utilisation, puis gardé en cache hors-ligne.
 */
import { RUNNER } from './pyRunner'

export interface ResultatTest {
  test: string
  ok: boolean
  message: string
}
export interface ResultatPython {
  /** Erreur empêchant de lancer les tests (syntaxe, exception au chargement, temps dépassé…). */
  erreur: string | null
  tests: ResultatTest[]
  /** Ce que le code a affiché avec print. */
  sortie: string
}

/** Durée maximale d'une exécution : au-delà, on suppose une boucle infinie et on arrête tout. */
export const DELAI_MS = 6000

let worker: Worker | null = null
let pret: Promise<void> | null = null
let numero = 0

function demarrer(): Promise<void> {
  if (pret) return pret
  const w = new Worker(new URL('py-worker.js', document.baseURI), { type: 'module' })
  worker = w
  pret = new Promise<void>((resolve, reject) => {
    const ecoute = (ev: MessageEvent) => {
      if (ev.data?.type === 'pret') {
        w.removeEventListener('message', ecoute)
        resolve()
      } else if (ev.data?.type === 'echec') reject(new Error(ev.data.message))
    }
    w.addEventListener('message', ecoute)
    w.addEventListener('error', () => reject(new Error('Impossible de charger Python (connexion nécessaire la première fois).')))
  })
  pret.catch(arreter)
  pret.then(garderHorsLigne, () => {})
  return pret
}

const FICHIERS = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']

/**
 * Range le moteur Python dans le cache hors-ligne dès la première utilisation. (À la toute première
 * visite, le service worker ne contrôle pas encore la page et n'a donc pas vu passer ces fichiers.)
 */
async function garderHorsLigne() {
  if (!('caches' in window)) return
  try {
    const cache = await caches.open('pyodide')
    for (const f of FICHIERS) {
      const url = new URL(`pyodide/${f}`, document.baseURI).href
      if (!(await cache.match(url))) await cache.add(url)
    }
  } catch {
    // pas de cache disponible (navigation privée…) : Python reste utilisable en ligne
  }
}

function arreter() {
  worker?.terminate()
  worker = null
  pret = null
}

/** Précharge Python (à appeler dès qu'un exercice de code s'affiche). */
export const chargerPython = () => demarrer()

/** Exécute le code puis les tests. Ne lève jamais : les problèmes sont rapportés dans `erreur`. */
export async function executer(code: string, tests: string[]): Promise<ResultatPython> {
  try {
    await demarrer()
  } catch (e) {
    return { erreur: (e as Error).message, tests: [], sortie: '' }
  }
  const w = worker!
  const id = ++numero
  return new Promise<ResultatPython>((resolve) => {
    const fin = (r: ResultatPython) => {
      clearTimeout(minuterie)
      w.removeEventListener('message', ecoute)
      resolve(r)
    }
    const ecoute = (ev: MessageEvent) => {
      if (ev.data?.type === 'resultat' && ev.data.id === id) fin(ev.data.resultat as ResultatPython)
    }
    const minuterie = setTimeout(() => {
      arreter() // le fil est bloqué dans la boucle : on le tue, il sera recréé au prochain essai
      fin({ erreur: `Temps dépassé (${DELAI_MS / 1000} s) : ton code contient sans doute une boucle infinie.`, tests: [], sortie: '' })
    }, DELAI_MS)
    w.addEventListener('message', ecoute)
    w.postMessage({ id, runner: RUNNER, code, tests })
  })
}
