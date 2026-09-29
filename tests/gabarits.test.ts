import { describe, expect, it } from 'vitest'
import { GABARITS } from '../src/gabarits'
import { instancier } from '../src/gabarits/types'
import { controler } from '../src/data/controle'
import { checkExpression, checkNumeric } from '../src/lib/mathexpr'
import { Ex, cosT, sinT, tanT } from '../src/gabarits/exact'

describe('gabarits : chaque variante est valide et auto-cohérente', () => {
  for (const g of GABARITS) {
    it(g.id, () => {
      for (let graine = 1; graine <= 200; graine++) {
        const q = instancier(g, graine)
        expect(controler(q), `variante ${graine}`).toBeNull()
        // la bonne réponse doit être acceptée ; une réponse absurde doit être refusée
        if (q.type === 'num') {
          expect(checkNumeric(String(q.reponse), q.reponse, q.tolerance)).toBe(true)
          expect(checkNumeric('123456789', q.reponse, q.tolerance)).toBe(false)
        }
        if (q.type === 'court') expect(checkExpression('123456789', q.reponse, q.variables, q.mode)).toBe(false)
      }
    })
  }
  it('même graine = même variante (le cahier d’erreurs peut la retrouver)', () => {
    for (const g of GABARITS) expect(instancier(g, 99).enonce).toBe(instancier(g, 99).enonce)
  })
})

describe('valeurs exactes', () => {
  it('cos, sin, tan remarquables', () => {
    for (let t = -24; t <= 24; t++) {
      if (t % 2 && t % 3) continue
      expect(cosT(t).valeur()).toBeCloseTo(Math.cos((t * Math.PI) / 12), 12)
      expect(sinT(t).valeur()).toBeCloseTo(Math.sin((t * Math.PI) / 12), 12)
      const tn = tanT(t)
      if (tn) expect(tn.valeur()).toBeCloseTo(Math.tan((t * Math.PI) / 12), 9)
    }
  })
  it('formules d’addition exactes et écriture', () => {
    const c = cosT(4).mul(cosT(3)).add(sinT(4).mul(sinT(3))) // cos(π/3 − π/4)
    expect(c.tex()).toBe('\\frac{\\sqrt2 + \\sqrt6}{4}')
    expect(checkNumeric(c.ascii(), Math.cos(Math.PI / 12))).toBe(true)
    expect(Ex.rac(3, 1).mul(Ex.rac(3, 1)).tex()).toBe('3')
  })
})
