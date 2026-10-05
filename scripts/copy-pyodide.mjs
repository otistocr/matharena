/**
 * Copie le moteur Python (Pyodide) de node_modules vers public/pyodide, pour qu'il soit servi
 * avec l'appli (et mis en cache hors-ligne). Lancé automatiquement avant `dev`, `build` et `test`.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(racine, 'node_modules', 'pyodide')
const dst = join(racine, 'public', 'pyodide')
mkdirSync(dst, { recursive: true })
for (const f of ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) copyFileSync(join(src, f), join(dst, f))
console.log('Pyodide copié dans public/pyodide')
