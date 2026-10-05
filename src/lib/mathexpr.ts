/**
 * Mini moteur d'expressions mathématiques (sur les complexes) pour corriger les réponses
 * numériques et courtes : parseur tolérant (syntaxe calculatrice, un peu de LaTeX, symboles
 * unicode), évaluation, comparaison numérique et aperçu LaTeX de la saisie.
 */

// ---------------------------------------------------------------- Complexes

export interface C {
  re: number
  im: number
}
export const c = (re: number, im = 0): C => ({ re, im })
const add = (a: C, b: C) => c(a.re + b.re, a.im + b.im)
const sub = (a: C, b: C) => c(a.re - b.re, a.im - b.im)
const mul = (a: C, b: C) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
const div = (a: C, b: C) => {
  const d = b.re * b.re + b.im * b.im
  return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}
export const cabs = (a: C) => Math.hypot(a.re, a.im)
const cexp = (a: C) => {
  const r = Math.exp(a.re)
  return c(r * Math.cos(a.im), r * Math.sin(a.im))
}
const clog = (a: C) => c(Math.log(cabs(a)), Math.atan2(a.im, a.re))
const isReal = (a: C) => Math.abs(a.im) < 1e-15 * Math.max(1, Math.abs(a.re))
function cpow(a: C, b: C): C {
  if (isReal(b) && Number.isInteger(b.re) && Math.abs(b.re) <= 64) {
    let n = Math.abs(b.re)
    let r = c(1)
    let base = a
    while (n > 0) {
      if (n & 1) r = mul(r, base)
      base = mul(base, base)
      n >>= 1
    }
    return b.re < 0 ? div(c(1), r) : r
  }
  if (isReal(a) && isReal(b) && a.re >= 0) return c(Math.pow(a.re, b.re))
  if (a.re === 0 && a.im === 0) return c(0)
  return cexp(mul(b, clog(a)))
}
const csqrt = (a: C) => {
  if (isReal(a) && a.re >= 0) return c(Math.sqrt(a.re))
  const r = cabs(a)
  const re = Math.sqrt((r + a.re) / 2)
  const im = Math.sign(a.im || 1) * Math.sqrt((r - a.re) / 2)
  return c(re, im)
}
const I = c(0, 1)
const csin = (a: C) => (isReal(a) ? c(Math.sin(a.re)) : div(sub(cexp(mul(I, a)), cexp(mul(c(0, -1), a))), c(0, 2)))
const ccos = (a: C) => (isReal(a) ? c(Math.cos(a.re)) : div(add(cexp(mul(I, a)), cexp(mul(c(0, -1), a))), c(2)))
const realOnly = (f: (x: number) => number) => (a: C) => (isReal(a) ? c(f(a.re)) : c(NaN, NaN))

const FUNCS: Record<string, (a: C) => C> = {
  sqrt: csqrt,
  exp: cexp,
  ln: clog,
  log: clog,
  sin: csin,
  cos: ccos,
  tan: (a) => div(csin(a), ccos(a)),
  cotan: (a) => div(ccos(a), csin(a)),
  arctan: realOnly(Math.atan),
  arcsin: realOnly(Math.asin),
  arccos: realOnly(Math.acos),
  sinh: realOnly(Math.sinh),
  cosh: realOnly(Math.cosh),
  tanh: realOnly(Math.tanh),
  abs: (a) => c(cabs(a)),
  conj: (a) => c(a.re, -a.im),
  re: (a) => c(a.re),
  im: (a) => c(a.im),
  arg: (a) => c(Math.atan2(a.im, a.re)),
}
const ALIASES: Record<string, string> = {
  atan: 'arctan', asin: 'arcsin', acos: 'arccos', sh: 'sinh', ch: 'cosh', th: 'tanh', racine: 'sqrt', rac: 'sqrt', cotg: 'cotan', tg: 'tan', Re: 're', Im: 'im', module: 'abs',
}
const CONSTS: Record<string, C> = { pi: c(Math.PI), e: c(Math.E), i: I }
const NAMES = [...Object.keys(FUNCS), ...Object.keys(ALIASES), ...Object.keys(CONSTS)].sort((a, b) => b.length - a.length)

// ---------------------------------------------------------------- Normalisation

/** Remplace \frac{a}{b}, \sqrt{x}, \dfrac… par une syntaxe calculatrice (accolades équilibrées). */
function delatex(s: string): string {
  const readGroup = (str: string, i: number): [string, number] => {
    while (str[i] === ' ') i++
    if (str[i] !== '{') return [str[i] ?? '', i + 1]
    let depth = 0
    for (let j = i; j < str.length; j++) {
      if (str[j] === '{') depth++
      else if (str[j] === '}' && --depth === 0) return [str.slice(i + 1, j), j + 1]
    }
    return [str.slice(i + 1), str.length]
  }
  let out = ''
  for (let i = 0; i < s.length; ) {
    const m = /^\\(d?t?frac|sqrt)/.exec(s.slice(i))
    if (m) {
      i += m[0].length
      if (m[1] === 'sqrt') {
        const [a, j] = readGroup(s, i)
        out += `sqrt(${delatex(a)})`
        i = j
      } else {
        const [a, j] = readGroup(s, i)
        const [b, k] = readGroup(s, j)
        out += `((${delatex(a)})/(${delatex(b)}))`
        i = k
      }
    } else {
      out += s[i++]
    }
  }
  return out
}

export function normalize(input: string): string {
  let s = input.trim()
  s = delatex(s)
  s = s
    .replace(/\\left|\\right|\\,|\\;|\\!|\\ /g, '')
    .replace(/\\(cdot|times)/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\pi/g, 'pi')
    .replace(/\\(ln|log|exp|sin|cos|tan|arctan|arcsin|arccos|sinh|cosh|tanh|operatorname)/g, '$1')
    .replace(/\\mathrm\{i\}|\\text\{i\}/g, 'i')
    .replace(/[{[]/g, '(')
    .replace(/[}\]]/g, ')')
    .replace(/[−–—]/g, '-')
    .replace(/[×·∙]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\*\*/g, '^')
  return s
}

// ---------------------------------------------------------------- Tokens & AST

type Tok =
  | { t: 'num'; v: number; raw: string }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }

export type Node =
  | { k: 'num'; v: number; raw: string }
  | { k: 'var'; name: string }
  | { k: 'const'; name: string }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^' | 'imp'; a: Node; b: Node }
  | { k: 'call'; f: string; a: Node }
  | { k: 'tuple'; items: Node[] }
  | { k: 'eq'; a: Node; b: Node }

export class ParseError extends Error {}

function tokenize(s: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    const num = /^(\d+(\.\d*)?|\.\d+)/.exec(s.slice(i))
    if (num) {
      toks.push({ t: 'num', v: parseFloat(num[0]), raw: num[0] })
      i += num[0].length
      continue
    }
    if (/[a-zA-Z]/.test(ch)) {
      const run = /^[a-zA-Z]+/.exec(s.slice(i))![0]
      // découpe "2xy" → x·y, "sinx" → sin x, "pi" → π
      let j = 0
      while (j < run.length) {
        const rest = run.slice(j)
        const name = NAMES.find((n) => rest.startsWith(n))
        if (name) {
          toks.push({ t: 'id', v: name })
          j += name.length
        } else {
          toks.push({ t: 'id', v: run[j] })
          j++
        }
      }
      i += run.length
      continue
    }
    if ('+-*/^(),=√'.includes(ch)) {
      toks.push({ t: 'op', v: ch })
      i++
      continue
    }
    throw new ParseError(`Caractère non reconnu : « ${ch} »`)
  }
  return toks
}

export function parse(input: string): Node {
  if (input.length > 400) throw new ParseError('Expression trop longue')
  const toks = tokenize(normalize(input))
  let p = 0
  const peek = () => toks[p]
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v
  const expect = (v: string) => {
    if (!isOp(v)) throw new ParseError(`« ${v} » attendu`)
    p++
  }
  const startsAtom = () => {
    const t = peek()
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && (t.v === '(' || t.v === '√')))
  }

  function parseTop(): Node {
    const a = parseTupleLevel()
    if (isOp('=')) {
      p++
      const b = parseTupleLevel()
      return { k: 'eq', a, b }
    }
    return a
  }
  function parseTupleLevel(): Node {
    const first = parseSum()
    if (!isOp(',')) return first
    const items = [first]
    while (isOp(',')) {
      p++
      items.push(parseSum())
    }
    return { k: 'tuple', items }
  }
  function parseSum(): Node {
    let a = parseProduct()
    while (isOp('+') || isOp('-')) {
      const op = (toks[p++] as { v: string }).v as '+' | '-'
      a = { k: 'bin', op, a, b: parseProduct() }
    }
    return a
  }
  function parseProduct(): Node {
    let a = parseUnary()
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = (toks[p++] as { v: string }).v as '*' | '/'
        a = { k: 'bin', op, a, b: parseUnary() }
      } else if (startsAtom()) {
        a = { k: 'bin', op: 'imp', a, b: parsePower() }
      } else return a
    }
  }
  function parseUnary(): Node {
    if (isOp('-')) {
      p++
      return { k: 'neg', a: parseUnary() }
    }
    if (isOp('+')) {
      p++
      return parseUnary()
    }
    return parsePower()
  }
  function parsePower(): Node {
    const base = parseAtom()
    if (isOp('^')) {
      p++
      return { k: 'bin', op: '^', a: base, b: parseUnary() }
    }
    return base
  }
  function parseAtom(): Node {
    const t = peek()
    if (!t) throw new ParseError('Expression incomplète')
    if (t.t === 'num') {
      p++
      return { k: 'num', v: t.v, raw: t.raw }
    }
    if (t.t === 'op' && t.v === '(') {
      p++
      const inner = parseTupleLevel()
      expect(')')
      return inner
    }
    if (t.t === 'op' && t.v === '√') {
      p++
      return { k: 'call', f: 'sqrt', a: parsePower() }
    }
    if (t.t === 'id') {
      p++
      const name = ALIASES[t.v] ?? t.v
      if (name in FUNCS) {
        // sin^2(x) → (sin x)^2
        let power: Node | null = null
        if (isOp('^')) {
          p++
          power = parseAtom()
        }
        const arg = isOp('(') ? parseAtom() : parsePower()
        const call: Node = { k: 'call', f: name, a: arg }
        return power ? { k: 'bin', op: '^', a: call, b: power } : call
      }
      if (name in CONSTS) return { k: 'const', name }
      if (name.length === 1) return { k: 'var', name }
      throw new ParseError(`Nom inconnu : ${t.v}`)
    }
    throw new ParseError(`« ${(t as { v: string }).v} » inattendu`)
  }

  if (toks.length === 0) throw new ParseError('Réponse vide')
  const node = parseTop()
  if (p < toks.length) throw new ParseError(`« ${(toks[p] as { v: string | number }).v} » inattendu`)
  return node
}

// ---------------------------------------------------------------- Évaluation

export type Value = C | C[]
export type Env = Record<string, C>

export function evaluate(n: Node, env: Env = {}): Value {
  switch (n.k) {
    case 'num':
      return c(n.v)
    case 'const':
      return CONSTS[n.name]
    case 'var': {
      const v = env[n.name]
      if (!v) throw new ParseError(`Variable inattendue : ${n.name}`)
      return v
    }
    case 'neg':
      return scalar(evaluate(n.a, env), (a) => c(-a.re, -a.im))
    case 'call':
      return scalar(evaluate(n.a, env), FUNCS[n.f])
    case 'tuple':
      return n.items.map((it) => {
        const v = evaluate(it, env)
        if (Array.isArray(v)) throw new ParseError('n-uplets imbriqués non pris en charge')
        return v
      })
    case 'eq':
      throw new ParseError('Équation inattendue ici')
    case 'bin': {
      const a = evaluate(n.a, env)
      const b = evaluate(n.b, env)
      const op = n.op === 'imp' ? '*' : n.op
      const f = { '+': add, '-': sub, '*': mul, '/': div, '^': cpow }[op]
      if (Array.isArray(a) || Array.isArray(b)) {
        // opérations composante par composante (λ·(x,y), (a,b)+(c,d))
        if (Array.isArray(a) && Array.isArray(b)) {
          if (a.length !== b.length || (op !== '+' && op !== '-')) throw new ParseError('Opération sur n-uplets invalide')
          return a.map((x, i) => f(x, b[i]))
        }
        if (Array.isArray(a)) return a.map((x) => f(x, b as C))
        return (b as C[]).map((y) => f(a as C, y))
      }
      return f(a, b)
    }
  }
}
function scalar(v: Value, f: (a: C) => C): Value {
  return Array.isArray(v) ? v.map(f) : f(v)
}

/** Variables libres d'une expression. */
export function freeVars(n: Node, acc = new Set<string>()): Set<string> {
  switch (n.k) {
    case 'var':
      acc.add(n.name)
      break
    case 'neg':
    case 'call':
      freeVars(n.a, acc)
      break
    case 'bin':
    case 'eq':
      freeVars(n.a, acc)
      freeVars(n.b, acc)
      break
    case 'tuple':
      n.items.forEach((it) => freeVars(it, acc))
      break
  }
  return acc
}

// ---------------------------------------------------------------- Comparaisons

const close = (a: C, b: C, tol?: number) => {
  const d = cabs(sub(a, b))
  if (tol !== undefined) return d <= tol
  return d <= 1e-6 * Math.max(1, cabs(b))
}
const finite = (v: Value) => (Array.isArray(v) ? v : [v]).every((x) => Number.isFinite(x.re) && Number.isFinite(x.im))

function sameValue(a: Value, b: Value, tol?: number): boolean {
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => close(x, b[i], tol))
  return close(a as C, b as C, tol)
}

/** Prépare une saisie de réponse numérique : "0,5" → "0.5" (seulement s'il n'y a pas de n-uplet). */
function numericInput(s: string) {
  return /^[^(),]*\d,\d[^(),]*$/.test(s.trim()) ? s.replace(/(\d),(\d)/, '$1.$2') : s
}

/** Réponse numérique : "1/2" = "0.5" = "0,5", "sqrt(2)/2" ≈ 0.7071…, "e^(i pi/3)" = "1/2 + i sqrt(3)/2". */
export function checkNumeric(input: string, expected: number | string, tolerance?: number): boolean {
  try {
    const got = evaluate(parse(numericInput(input)))
    const want = typeof expected === 'number' ? c(expected) : evaluate(parse(expected))
    return finite(got) && sameValue(got, want, tolerance)
  } catch {
    return false
  }
}

// PRNG déterministe : les points de test sont les mêmes à chaque correction.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function samplePoints(vars: string[], n = 12): Env[] {
  const rnd = mulberry32(42)
  return Array.from({ length: n }, () => Object.fromEntries(vars.map((v) => [v, c(0.3 + rnd() * 2.4)])))
}

const asEquationDiff = (n: Node): Node => (n.k === 'eq' ? { k: 'bin', op: '-', a: n.a, b: n.b } : n)

/**
 * Réponse courte : compare la saisie à chaque forme acceptée par évaluation numérique
 * en des points aléatoires (x, y, … ∈ ]0.3 ; 2.7[).
 * - mode "expression" : f(P) = g(P) en tout point ;
 * - mode "equation"   : (G−D)_saisie = k·(G−D)_attendu avec k ≠ 0 constant.
 */
export function checkExpression(
  input: string,
  accepted: string[],
  vars: string[] = [],
  mode: 'expression' | 'equation' = 'expression',
): boolean {
  let got: Node
  try {
    got = parse(input)
  } catch {
    return false
  }
  const allowed = new Set(vars)
  for (const v of freeVars(got)) if (!allowed.has(v)) return false
  const pts = samplePoints(vars)

  return accepted.some((acc) => {
    let want: Node
    try {
      want = parse(acc)
    } catch {
      return false
    }
    try {
      if (mode === 'expression') {
        if (got.k === 'eq' || want.k === 'eq') {
          // "y = 2x+1" attendu, "y=2x+1" saisi : on compare membre à membre
          if (got.k !== 'eq' || want.k !== 'eq') return false
          return pts.every((P) => sameValue(evaluate(got.a, P), evaluate(want.a, P)) && sameValue(evaluate(got.b, P), evaluate(want.b, P)))
        }
        let valid = 0
        for (const P of pts) {
          const a = evaluate(got, P)
          const b = evaluate(want, P)
          if (!finite(b)) continue
          if (!finite(a) || !sameValue(a, b)) return false
          valid++
        }
        return valid >= 4
      }
      // mode équation
      const dg = asEquationDiff(got)
      const dw = asEquationDiff(want)
      let k: C | null = null
      let valid = 0
      for (const P of pts) {
        const a = evaluate(dg, P)
        const b = evaluate(dw, P)
        if (Array.isArray(a) || Array.isArray(b) || !finite(a) || !finite(b)) continue
        valid++
        if (cabs(b) < 1e-9) {
          if (cabs(a) > 1e-7) return false
          continue
        }
        const ratio = div(a, b)
        if (k === null) {
          if (cabs(ratio) < 1e-9) return false
          k = ratio
        } else if (!close(ratio, k)) return false
      }
      return valid >= 4 && k !== null
    } catch {
      return false
    }
  })
}

// ---------------------------------------------------------------- Aperçu LaTeX

const PREC: Record<string, number> = { eq: 0, tuple: 1, '+': 2, '-': 2, '*': 3, '/': 3, imp: 3, neg: 4, '^': 5 }
const TEXNAMES: Record<string, string> = {
  sqrt: '\\sqrt', exp: '\\exp', ln: '\\ln', log: '\\ln', sin: '\\sin', cos: '\\cos', tan: '\\tan', cotan: '\\cot',
  arctan: '\\arctan', arcsin: '\\arcsin', arccos: '\\arccos', sinh: '\\operatorname{sh}', cosh: '\\operatorname{ch}',
  tanh: '\\operatorname{th}', conj: '\\overline', re: '\\operatorname{Re}', im: '\\operatorname{Im}', arg: '\\arg',
}

/** Transforme une saisie en LaTeX pour l'aperçu en direct (renvoie null si non analysable). */
export function toLatex(input: string): string | null {
  try {
    return tex(parse(input))
  } catch {
    return null
  }
}
function tex(n: Node, parent = 0): string {
  const wrap = (s: string, prec: number) => (prec < parent ? `\\left(${s}\\right)` : s)
  switch (n.k) {
    case 'num':
      return n.raw
    case 'var':
      return n.name
    case 'const':
      return n.name === 'pi' ? '\\pi' : n.name === 'i' ? '\\mathrm{i}' : 'e'
    case 'neg':
      return wrap(`-${tex(n.a, PREC.neg)}`, PREC.neg)
    case 'tuple':
      return `\\left(${n.items.map((x) => tex(x)).join(',\\ ')}\\right)`
    case 'eq':
      return `${tex(n.a)} = ${tex(n.b)}`
    case 'call':
      if (n.f === 'sqrt') return `\\sqrt{${tex(n.a)}}`
      if (n.f === 'abs') return `\\left|${tex(n.a)}\\right|`
      if (n.f === 'conj') return `\\overline{${tex(n.a)}}`
      if (n.f === 'exp') return `e^{${tex(n.a)}}`
      return `${TEXNAMES[n.f] ?? n.f}\\left(${tex(n.a)}\\right)`
    case 'bin': {
      const pr = PREC[n.op]
      if (n.op === '/') return wrap(`\\frac{${tex(n.a)}}{${tex(n.b)}}`, pr)
      if (n.op === '^') return wrap(`{${tex(n.a, pr + 1)}}^{${tex(n.b)}}`, pr)
      if (n.op === '*') return wrap(`${tex(n.a, pr)} \\times ${tex(n.b, pr + 1)}`, pr)
      if (n.op === 'imp') {
        const needDot = n.b.k === 'num'
        return wrap(`${tex(n.a, pr)}${needDot ? ' \\cdot ' : ' '}${tex(n.b, pr + 1)}`, pr)
      }
      return wrap(`${tex(n.a, pr)} ${n.op} ${tex(n.b, pr + 1)}`, pr)
    }
  }
}

// ---------------------------------------------------------------- Forme exigée

const estSomme = (n: Node): boolean => (n.k === 'bin' && (n.op === '+' || n.op === '-')) || (n.k === 'neg' && estSomme(n.a))
function produitDeSomme(n: Node): boolean {
  switch (n.k) {
    case 'bin':
      if ((n.op === '*' || n.op === 'imp' || n.op === '^' || n.op === '/') && (estSomme(n.a) || estSomme(n.b))) return true
      return produitDeSomme(n.a) || produitDeSomme(n.b)
    case 'neg':
      return estSomme(n.a) || produitDeSomme(n.a)
    case 'call':
      return produitDeSomme(n.a)
    case 'eq':
      return produitDeSomme(n.a) || produitDeSomme(n.b)
    default:
      return false
  }
}
function estProduit(n: Node): boolean {
  if (n.k === 'neg') return estProduit(n.a)
  return n.k === 'bin' && (n.op === '*' || n.op === 'imp' || n.op === '^')
}

/**
 * Vérifie la FORME d'une réponse (en plus de sa valeur) :
 * - "developpee" : plus aucun produit ou puissance d'une somme ;
 * - "factorisee" : l'expression est un produit (ou une puissance) au premier niveau.
 */
export function respecteForme(input: string, forme: 'developpee' | 'factorisee'): boolean {
  try {
    const n = parse(input)
    return forme === 'developpee' ? !produitDeSomme(n) : estProduit(n)
  } catch {
    return false
  }
}
