// Fil d'exécution Python (module worker) : charge Pyodide une fois, puis exécute le code reçu.
// Tourne à part pour que la page puisse l'arrêter si le code boucle indéfiniment.
import { loadPyodide } from './pyodide/pyodide.mjs'

const pret = loadPyodide({ indexURL: new URL('./pyodide/', self.location.href).href })
pret.then(
  () => postMessage({ type: 'pret' }),
  (e) => postMessage({ type: 'echec', message: String(e) }),
)

self.onmessage = async (ev) => {
  const { id, runner, code, tests } = ev.data
  try {
    const py = await pret
    py.globals.set('_code', code)
    py.globals.set('_tests_json', JSON.stringify(tests))
    const json = py.runPython(runner + '\n_executer(_code, _tests_json)')
    postMessage({ type: 'resultat', id, resultat: JSON.parse(json) })
  } catch (e) {
    postMessage({ type: 'resultat', id, resultat: { erreur: String(e), tests: [], sortie: '' } })
  }
}
