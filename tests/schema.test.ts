import { describe, expect, it } from 'vitest'
import { Question } from '../src/data/schema'

const ok = {
  id: 'ch1-999', chapitre: 'ch1', section: 'ch1.s1', type: 'vf', niveau: 1,
  enonce: 'Énoncé de test', reponse: true,
  explication: 'Une explication suffisamment longue.', source: 'créée', origine: 'créée', refCours: 'poly p.7',
}

describe('schéma des questions', () => {
  it('accepte une question complète', () => {
    expect(Question.safeParse(ok).success).toBe(true)
  })
  it('refuse une question sans réponse', () => {
    const { reponse: _, ...q } = ok
    expect(Question.safeParse(q).success).toBe(false)
  })
  it('refuse une question sans explication ou avec une explication vide', () => {
    const { explication: _, ...q } = ok
    expect(Question.safeParse(q).success).toBe(false)
    expect(Question.safeParse({ ...ok, explication: '' }).success).toBe(false)
  })
  it('refuse un QCM dont la réponse est hors des choix', () => {
    expect(Question.safeParse({ ...ok, type: 'qcm', choix: ['a', 'b'], reponse: 2 }).success).toBe(false)
  })
  it('refuse une section hors du chapitre', () => {
    expect(Question.safeParse({ ...ok, section: 'ch2.s1' }).success).toBe(false)
  })
})
