import { describe, expect, it } from 'vitest'
import { checkNumeric, checkExpression, parse, toLatex } from '../src/lib/mathexpr'

describe('réponses numériques', () => {
  it('formes équivalentes simples', () => {
    expect(checkNumeric('1/2', 0.5)).toBe(true)
    expect(checkNumeric('0.5', '1/2')).toBe(true)
    expect(checkNumeric('0,5', '1/2')).toBe(true)
    expect(checkNumeric('2/4', '1/2')).toBe(true)
    expect(checkNumeric('-3', -3)).toBe(true)
    expect(checkNumeric('1/3', 0.5)).toBe(false)
  })
  it('racines, π, puissances, unicode et LaTeX', () => {
    expect(checkNumeric('sqrt(2)/2', Math.SQRT1_2)).toBe(true)
    expect(checkNumeric('√2/2', '1/sqrt(2)')).toBe(true)
    expect(checkNumeric('\\frac{\\sqrt{3}}{2}', 'sqrt(3)/2')).toBe(true)
    expect(checkNumeric('3π/4', '3pi/4')).toBe(true)
    expect(checkNumeric('2^10', 1024)).toBe(true)
    expect(checkNumeric('2²', 4)).toBe(true)
    expect(checkNumeric('−1', -1)).toBe(true)
  })
  it('tolérance', () => {
    expect(checkNumeric('0.707', 'sqrt(2)/2')).toBe(false)
    expect(checkNumeric('0.707', 'sqrt(2)/2', 0.001)).toBe(true)
    expect(checkNumeric('3.14', 'pi', 0.01)).toBe(true)
    expect(checkNumeric('3.1', 'pi', 0.01)).toBe(false)
  })
  it('complexes', () => {
    expect(checkNumeric('e^(i pi/3)', '1/2 + i sqrt(3)/2')).toBe(true)
    expect(checkNumeric('(1+i)^2', '2i')).toBe(true)
    expect(checkNumeric('1/i', '-i')).toBe(true)
    expect(checkNumeric('abs(3+4i)', 5)).toBe(true)
  })
  it('n-uplets (coordonnées de vecteurs)', () => {
    expect(checkNumeric('(-7, 4, 6)', '(-7,4,6)')).toBe(true)
    expect(checkNumeric('(1,5)', '(1,5)')).toBe(true)
    expect(checkNumeric('(1,5)', 1.5)).toBe(false)
    expect(checkNumeric('(1, 2)', '(2, 1)')).toBe(false)
  })
  it('saisie invalide = faux, sans exception', () => {
    expect(checkNumeric('', 1)).toBe(false)
    expect(checkNumeric('2+', 2)).toBe(false)
    expect(checkNumeric('x', 1)).toBe(false)
    expect(checkNumeric('1/0', 1)).toBe(false)
  })
})

describe('réponses courtes (expressions)', () => {
  it('égalité de fonctions', () => {
    expect(checkExpression('2x+2', ['2(x+1)'], ['x'])).toBe(true)
    expect(checkExpression('(x+1)^2', ['x^2+2x+1'], ['x'])).toBe(true)
    expect(checkExpression('x^2+x+1', ['x^2+2x+1'], ['x'])).toBe(false)
    expect(checkExpression('\\frac{1}{x}', ['x^(-1)'], ['x'])).toBe(true)
    expect(checkExpression('sin(2x)', ['2sin(x)cos(x)'], ['x'])).toBe(true)
  })
  it('refuse une variable inattendue', () => {
    expect(checkExpression('2y', ['2x'], ['x'])).toBe(false)
  })
  it('équations : à un facteur non nul près', () => {
    const acc = ['x - 2y + 1 = 0']
    expect(checkExpression('x-2y+1=0', acc, ['x', 'y'], 'equation')).toBe(true)
    expect(checkExpression('-2x + 4y - 2 = 0', acc, ['x', 'y'], 'equation')).toBe(true)
    expect(checkExpression('x + 1 = 2y', acc, ['x', 'y'], 'equation')).toBe(true)
    expect(checkExpression('x - 2y = 0', acc, ['x', 'y'], 'equation')).toBe(false)
    expect(checkExpression('0 = 0', acc, ['x', 'y'], 'equation')).toBe(false)
  })
  it('équation de cercle', () => {
    const acc = ['(x-2)^2 + (y-1)^2 = 4']
    expect(checkExpression('x^2 - 4x + y^2 - 2y + 1 = 0', acc, ['x', 'y'], 'equation')).toBe(true)
    expect(checkExpression('(x-2)^2 + (y-1)^2 = 2', acc, ['x', 'y'], 'equation')).toBe(false)
  })
})

describe('parseur et aperçu', () => {
  it('priorités usuelles', () => {
    expect(checkNumeric('-2^2', -4)).toBe(true)
    expect(checkNumeric('2^-1', 0.5)).toBe(true)
    expect(checkNumeric('2^3^2', 512)).toBe(true)
    expect(checkNumeric('6/2(1+2)', 9)).toBe(true)
  })
  it('multiplication implicite', () => {
    expect(() => parse('2xy')).not.toThrow()
    expect(checkExpression('2xy', ['2*x*y'], ['x', 'y'])).toBe(true)
    expect(checkExpression('sin^2 x + cos^2 x', ['1'], ['x'])).toBe(true)
  })
  it('aperçu LaTeX', () => {
    expect(toLatex('sqrt(3)/2')).toBe('\\frac{\\sqrt{3}}{2}')
    expect(toLatex('x^2+1')).toBe('{x}^{2} + 1')
    expect(toLatex('2+')).toBeNull()
  })
})
