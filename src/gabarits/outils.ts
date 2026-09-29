/**
 * Boîte à outils des gabarits : hasard reproductible, fractions exactes, mise en forme LaTeX,
 * et noms interchangeables (points, vecteurs, droites…) pour que chaque variante soit différente.
 */

// ---------------------------------------------------------------- Hasard reproductible

export class Rng {
  private s: number
  constructor(seed: number) {
    this.s = seed | 0 || 1
  }
  /** Réel dans [0, 1[. */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  /** Entier dans [a, b]. */
  int(a: number, b: number): number {
    return a + Math.floor(this.next() * (b - a + 1))
  }
  /** Entier non nul dans [a, b]. */
  nz(a: number, b: number): number {
    for (;;) {
      const x = this.int(a, b)
      if (x !== 0) return x
    }
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }
  bool(p = 0.5): boolean {
    return this.next() < p
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  /** Vecteur d'entiers dans [a, b], non nul. */
  vec(n: number, a = -4, b = 4): number[] {
    for (;;) {
      const v = Array.from({ length: n }, () => this.int(a, b))
      if (v.some((x) => x !== 0)) return v
    }
  }
}

// ---------------------------------------------------------------- Fractions exactes

const pgcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}
export const pgcdListe = (xs: number[]) => xs.reduce((g, x) => pgcd(g, x), 0) || 1

export class Frac {
  readonly n: number
  readonly d: number
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('division par zéro')
    const g = pgcd(n, d)
    const s = d < 0 ? -1 : 1
    this.n = (s * n) / g
    this.d = (s * d) / g
  }
  static of(x: number | Frac) {
    return x instanceof Frac ? x : new Frac(x)
  }
  add(o: number | Frac) {
    const b = Frac.of(o)
    return new Frac(this.n * b.d + b.n * this.d, this.d * b.d)
  }
  sub(o: number | Frac) {
    const b = Frac.of(o)
    return new Frac(this.n * b.d - b.n * this.d, this.d * b.d)
  }
  mul(o: number | Frac) {
    const b = Frac.of(o)
    return new Frac(this.n * b.n, this.d * b.d)
  }
  div(o: number | Frac) {
    const b = Frac.of(o)
    return new Frac(this.n * b.d, this.d * b.n)
  }
  neg() {
    return new Frac(-this.n, this.d)
  }
  get zero() {
    return this.n === 0
  }
  get entier() {
    return this.d === 1
  }
  valeur() {
    return this.n / this.d
  }
  tex(): string {
    if (this.d === 1) return String(this.n)
    return `${this.n < 0 ? '-' : ''}\\frac{${Math.abs(this.n)}}{${this.d}}`
  }
  ascii(): string {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`
  }
}

// ---------------------------------------------------------------- Mise en forme

type Nb = number | Frac
/** Composante affichable : nombre, fraction ou expression déjà en LaTeX ("m", "1+\\sqrt3"). */
type Aff = Nb | string
const texNb = (x: Aff) => (x instanceof Frac ? x.tex() : String(x))
const asciiNb = (x: Nb) => (x instanceof Frac ? x.ascii() : String(x))
/** Nombre entre parenthèses s'il est négatif : (-3). */
export const par = (x: Nb) => (Frac.of(x).valeur() < 0 ? `(${texNb(x)})` : texNb(x))

/** Vecteur colonne LaTeX. */
export const col = (v: Aff[]) => `\\begin{pmatrix}${v.map(texNb).join('\\\\')}\\end{pmatrix}`
/** n-uplet LaTeX : (1, -2, 3). */
export const tup = (v: Aff[]) => `(${v.map(texNb).join(',\\,')})`
/** (x−a)² lisible : a=0 → x², a=−3 → (x+3)². */
export const carre = (v: string, a: number) => (a === 0 ? `${v}^2` : `(${v}${a < 0 ? '+' : '-'}${Math.abs(a)})^2`)

/** Garde-fou : un gabarit qui produirait une variante fausse lève une erreur (attrapée par les tests). */
export function verifier(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Variante incohérente : ${msg}`)
}
export const proche = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b))
/** n-uplet pour la réponse attendue (syntaxe calculatrice). */
export const tupAscii = (v: Nb[]) => `(${v.map(asciiNb).join(',')})`

/**
 * Combinaison linéaire lisible : lin([2,-1,0,1], ['x','y','z','']) → "2x - y + 1".
 * Le dernier nom vide = constante.
 */
export function lin(coefs: Nb[], noms: string[]): string {
  let s = ''
  coefs.forEach((c0, i) => {
    const c = Frac.of(c0)
    if (c.zero) return
    const nom = noms[i]
    const abs = c.valeur() < 0 ? c.neg() : c
    const corps = nom ? (abs.n === 1 && abs.d === 1 ? nom : `${abs.tex()}${nom}`) : abs.tex()
    if (!s) s = (c.valeur() < 0 ? '-' : '') + corps
    else s += (c.valeur() < 0 ? ' - ' : ' + ') + corps
  })
  return s || '0'
}
export function linAscii(coefs: number[], noms: string[]): string {
  return lin(coefs, noms).replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
}

export const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)
export const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const sub = (a: number[], b: number[]) => a.map((x, i) => x - b[i])
export const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i])
export const scal = (k: number, a: number[]) => a.map((x) => k * x)
export const norme2 = (a: number[]) => dot(a, a)
export const estNul = (a: number[]) => a.every((x) => x === 0)

/** √n = k√m avec m sans facteur carré. */
export function racineParts(n: number): [number, number] {
  let k = 1
  let m = n
  for (let p = 2; p * p <= m; p++) while (m % (p * p) === 0) {
    m /= p * p
    k *= p
  }
  return [k, m]
}

/** (k/d)·√m en LaTeX et en syntaxe calculatrice, simplifié. */
export function racineSur(n: number, d: number): [string, string] {
  const [k, m] = racineParts(n)
  const f = new Frac(k, d)
  const rt = m === 1 ? '' : `\\sqrt{${m}}`
  const ra = m === 1 ? '' : `sqrt(${m})`
  if (m === 1) return [f.tex(), f.ascii()]
  const num = f.n === 1 ? rt : `${f.n}${rt}`
  const numA = f.n === 1 ? ra : `${f.n}*${ra}`
  return f.d === 1 ? [num, numA] : [`\\dfrac{${num}}{${f.d}}`, `(${numA})/${f.d}`]
}

/** √n simplifié : 12 → 2\sqrt{3} ; 49 → 7. Renvoie [tex, ascii]. */
export function racine(n: number): [string, string] {
  let k = 1
  let m = n
  for (let p = 2; p * p <= m; p++) while (m % (p * p) === 0) {
    m /= p * p
    k *= p
  }
  if (m === 1) return [String(k), String(k)]
  return [k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`, k === 1 ? `sqrt(${m})` : `${k}sqrt(${m})`]
}

/** Détail d'un produit scalaire : "2\times3 + (-1)\times4 = 2". */
export const detailDot = (a: Nb[], b: Nb[]) => a.map((x, i) => `${par(x)}\\times${par(b[i])}`).join(' + ')

// ---------------------------------------------------------------- Noms interchangeables

const POINTS = [
  ['A', 'B', 'C', 'D'],
  ['P', 'Q', 'R', 'S'],
  ['E', 'F', 'G', 'H'],
  ['M', 'N', 'K', 'L'],
  ['I', 'J', 'K', 'L'],
] as const
const VECTEURS = [
  ['u', 'v', 'w'],
  ['a', 'b', 'c'],
  ['p', 'q', 'r'],
  ['e', 'f', 'g'],
  ['u_1', 'u_2', 'u_3'],
] as const
const DROITES = ['D', '\\Delta', '\\mathcal{D}', 'L', 'd'] as const
const PLANS = ['P', '\\Pi', '\\mathcal{P}', 'Q'] as const
const PARAMS = ['\\lambda', 't', 's', '\\mu', 'k'] as const
const CERCLES = ['\\mathcal{C}', '\\Gamma', 'C'] as const

export interface Noms {
  pts: readonly string[]
  vec: readonly string[]
  /** \vec{u} prêt à l'emploi. */
  v: (i: number) => string
  droite: string
  plan: string
  param: string
  cercle: string
}

export function noms(r: Rng): Noms {
  const vec = r.pick(VECTEURS)
  const pts = r.pick(POINTS)
  // une droite, un plan ou un cercle ne porte jamais le nom d'un point de la même question
  const libre = <T extends string>(liste: readonly T[]) => r.pick(liste.filter((n) => !pts.includes(n as never)))
  return {
    pts,
    vec,
    v: (i) => `\\vec ${vec[i].length > 1 ? `{${vec[i]}}` : vec[i]}`,
    droite: libre(DROITES),
    plan: libre(PLANS),
    param: r.pick(PARAMS),
    cercle: libre(CERCLES),
  }
}

/** \overrightarrow{AB} */
export const fl = (a: string, b: string) => `\\overrightarrow{${a}${b}}`
