import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide, type PyodideInterface } from 'pyodide'
import { GABARITS } from '../src/gabarits'
import { instancier } from '../src/gabarits/types'
import { RUNNER } from '../src/lib/pyRunner'
import type { ResultatPython } from '../src/lib/python'

let py: PyodideInterface
const lancer = (code: string, tests: string[]): ResultatPython => {
  py.globals.set('_code', code)
  py.globals.set('_tests_json', JSON.stringify(tests))
  return JSON.parse(py.runPython(RUNNER + '\n_executer(_code, _tests_json)'))
}
const reussi = (r: ResultatPython, n: number) => !r.erreur && r.tests.length === n && r.tests.every((t) => t.ok)

beforeAll(async () => {
  py = await loadPyodide()
}, 60_000)

describe('exercices de programmation : chaque corrigé passe ses tests (vrai Python)', () => {
  for (const g of GABARITS.filter((g) => g.code)) {
    it(g.id, () => {
      const vus = new Set<string>()
      for (let graine = 1; graine <= 80; graine++) {
        const q = instancier(g, graine)
        if (q.type !== 'code') throw new Error('gabarit code attendu')
        if (vus.has(q.solution)) continue
        vus.add(q.solution)
        const ok = lancer(q.solution, q.tests)
        expect(reussi(ok, q.tests.length), `corrigé refusé : ${q.enonce}\n${JSON.stringify(ok)}`).toBe(true)
        // le code de départ (fonction vide) ne doit pas suffire
        expect(reussi(lancer(q.depart, q.tests), q.tests.length), `le code de départ passe les tests : ${q.enonce}`).toBe(false)
      }
      expect(vus.size).toBeGreaterThanOrEqual(6)
    })
  }
})

describe('compte rendu d’exécution', () => {
  const tests = ['assert f(2) == 4', 'assert f(3) == 9']
  it('signale la valeur obtenue quand un test échoue', () => {
    const r = lancer('def f(x: int) -> int:\n    return x + 2', tests)
    expect(r.erreur).toBeNull()
    expect(r.tests.map((t) => t.ok)).toEqual([true, false])
    expect(r.tests[1].message).toBe('obtenu 5, attendu 9')
  })
  it('signale une erreur de syntaxe avec sa ligne', () => {
    const r = lancer('def f(x: int) -> int:\n    return x *', tests)
    expect(r.erreur).toMatch(/^Erreur de syntaxe ligne 2/)
  })
  it('signale une erreur d’indentation', () => {
    expect(lancer('def f(x: int) -> int:\nreturn x', tests).erreur).toMatch(/indentation/)
  })
  it('signale une erreur à l’exécution avec la ligne fautive, et garde les print', () => {
    const r = lancer('def f(x: int) -> int:\n    print("x vaut", x)\n    return x // 0', tests)
    expect(r.tests[0].ok).toBe(False())
    expect(r.tests[0].message).toMatch(/division par zéro \(ligne 3\)/)
    expect(r.sortie).toContain('x vaut 2')
  })
  it('accepte les annotations du cours (List, Optional) et le module math', () => {
    const r = lancer('def f(x: float) -> Optional[float]:\n    return math.sqrt(x) ** 4', ['assert abs(f(2) - 4) < 1e-9'])
    expect(reussi(r, 1)).toBe(true)
  })
})

function False() {
  return false
}
