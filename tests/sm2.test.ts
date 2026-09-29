import { describe, expect, it } from 'vitest'
import { nouvelleCarte, reviser, estDue, ajouterJours, qualiteDepuisScore, EF_MIN } from '../src/lib/sm2'

const J0 = '2026-09-28'

describe('SM-2', () => {
  it('une nouvelle carte est due immédiatement', () => {
    const c = nouvelleCarte('ch1-001', J0)
    expect(estDue(c, J0)).toBe(true)
    expect(c.ef).toBe(2.5)
  })
  it('intervalles 1, 6, puis ×EF', () => {
    let c = nouvelleCarte('q', J0)
    c = reviser(c, 4, J0)
    expect(c.intervalle).toBe(1)
    expect(c.echeance).toBe('2026-09-29')
    c = reviser(c, 4, c.echeance)
    expect(c.intervalle).toBe(6)
    c = reviser(c, 4, c.echeance)
    expect(c.intervalle).toBe(15) // 6 × 2,5
    expect(c.repetitions).toBe(3)
  })
  it('qualité 4 laisse EF inchangé, 5 l’augmente, 3 le baisse', () => {
    expect(reviser(nouvelleCarte('q', J0), 4, J0).ef).toBe(2.5)
    expect(reviser(nouvelleCarte('q', J0), 5, J0).ef).toBe(2.6)
    expect(reviser(nouvelleCarte('q', J0), 3, J0).ef).toBe(2.36)
  })
  it('un échec remet à zéro les répétitions mais pas l’EF plancher', () => {
    let c = nouvelleCarte('q', J0)
    for (let i = 0; i < 3; i++) c = reviser(c, 4, J0)
    c = reviser(c, 1, J0)
    expect(c.repetitions).toBe(0)
    expect(c.intervalle).toBe(1)
    for (let i = 0; i < 20; i++) c = reviser(c, 0, J0)
    expect(c.ef).toBe(EF_MIN)
  })
  it('refuse une qualité invalide', () => {
    expect(() => reviser(nouvelleCarte('q', J0), 6, J0)).toThrow()
  })
  it('dates : passage de mois et d’année', () => {
    expect(ajouterJours('2026-12-30', 3)).toBe('2027-01-02')
    expect(ajouterJours('2028-02-28', 1)).toBe('2028-02-29')
  })
  it('score → qualité', () => {
    expect(qualiteDepuisScore(0)).toBe(1)
    expect(qualiteDepuisScore(0.5)).toBe(3)
    expect(qualiteDepuisScore(1)).toBe(4)
    expect(qualiteDepuisScore(1, true)).toBe(5)
  })
})
