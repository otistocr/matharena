/**
 * Valeurs exactes de la forme (a + b√2 + c√3 + d√6)/n — tout ce qu'il faut pour les angles
 * remarquables et les formules d'addition — et trigonométrie exacte aux multiples de π/12.
 */
import { Frac } from './outils'

const RAD = [1, 2, 3, 6] as const
const RAD_TEX = ['', '\\sqrt2', '\\sqrt3', '\\sqrt6']
const RAD_ASCII = ['', 'sqrt(2)', 'sqrt(3)', 'sqrt(6)']
/** Produit de deux radicaux de la base : [facteur entier, index du radical]. */
const PROD: Record<string, [number, number]> = {
  '0,0': [1, 0], '0,1': [1, 1], '0,2': [1, 2], '0,3': [1, 3],
  '1,1': [2, 0], '1,2': [1, 3], '1,3': [2, 2],
  '2,2': [3, 0], '2,3': [3, 1],
  '3,3': [6, 0],
}

export class Ex {
  /** Coefficients rationnels de 1, √2, √3, √6. */
  readonly c: [Frac, Frac, Frac, Frac]
  constructor(c: (number | Frac)[]) {
    this.c = [0, 1, 2, 3].map((i) => Frac.of(c[i] ?? 0)) as [Frac, Frac, Frac, Frac]
  }
  static entier(n: number | Frac) {
    return new Ex([n])
  }
  static rac(r: 2 | 3 | 6, coef: number | Frac = 1) {
    const c: (number | Frac)[] = [0, 0, 0, 0]
    c[RAD.indexOf(r)] = coef
    return new Ex(c)
  }
  add(o: Ex) {
    return new Ex(this.c.map((x, i) => x.add(o.c[i])))
  }
  sub(o: Ex) {
    return this.add(o.neg())
  }
  neg() {
    return new Ex(this.c.map((x) => x.neg()))
  }
  scale(k: number | Frac) {
    return new Ex(this.c.map((x) => x.mul(k)))
  }
  mul(o: Ex) {
    const r = [new Frac(0), new Frac(0), new Frac(0), new Frac(0)]
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const [f, k] = PROD[`${Math.min(i, j)},${Math.max(i, j)}`]
        r[k] = r[k].add(this.c[i].mul(o.c[j]).mul(f))
      }
    return new Ex(r)
  }
  get zero() {
    return this.c.every((x) => x.zero)
  }
  valeur() {
    return this.c.reduce((s, x, i) => s + x.valeur() * Math.sqrt(RAD[i]), 0)
  }
  /** Rationnel si pas de radical. */
  get rationnel() {
    return this.c.slice(1).every((x) => x.zero)
  }
  private forme(): { den: number; num: number[] } {
    const lcm = (a: number, b: number) => {
      let x = a
      let y = b
      while (y) [x, y] = [y, x % y]
      return (a * b) / x
    }
    const den = this.c.reduce((d, x) => lcm(d, x.d), 1)
    return { den, num: this.c.map((x) => (x.n * den) / x.d) }
  }
  tex(): string {
    const { den, num } = this.forme()
    const termes = num
      .map((n, i) => ({ n, i }))
      .filter((t) => t.n !== 0)
      .sort((a, b) => (a.n < 0 ? 1 : 0) - (b.n < 0 ? 1 : 0))
    if (!termes.length) return '0'
    const terme = (n: number, i: number, premier: boolean) => {
      const a = Math.abs(n)
      const corps = i === 0 ? String(a) : `${a === 1 ? '' : a}${RAD_TEX[i]}`
      return premier ? (n < 0 ? '-' : '') + corps : (n < 0 ? ' - ' : ' + ') + corps
    }
    if (termes.length === 1 && den !== 1) {
      const { n, i } = termes[0]
      const a = Math.abs(n)
      const haut = i === 0 ? String(a) : `${a === 1 ? '' : a}${RAD_TEX[i]}`
      return `${n < 0 ? '-' : ''}\\frac{${haut}}{${den}}`
    }
    const s = termes.map((t, k) => terme(t.n, t.i, k === 0)).join('')
    return den === 1 ? s : `\\frac{${s}}{${den}}`
  }
  ascii(): string {
    const { den, num } = this.forme()
    const termes = num.map((n, i) => ({ n, i })).filter((t) => t.n !== 0)
    if (!termes.length) return '0'
    const s = termes
      .map(({ n, i }, k) => {
        const a = Math.abs(n)
        const corps = i === 0 ? String(a) : a === 1 ? RAD_ASCII[i] : `${a}*${RAD_ASCII[i]}`
        return (k === 0 ? (n < 0 ? '-' : '') : n < 0 ? '-' : '+') + corps
      })
      .join('')
    return den === 1 ? s : `(${s})/${den}`
  }
}

// ---------------------------------------------------------------- Trigonométrie exacte

/** Angle = t·π/12 (t entier). Premier quart : valeurs exactes de cos pour t = 0, 2, 3, 4, 6. */
const COS_Q1: Record<number, Ex> = {
  0: Ex.entier(1),
  2: Ex.rac(3, new Frac(1, 2)),
  3: Ex.rac(2, new Frac(1, 2)),
  4: Ex.entier(new Frac(1, 2)),
  6: Ex.entier(0),
}
const mod = (a: number, n: number) => ((a % n) + n) % n

/** Est-ce un angle remarquable (multiple de π/6 ou de π/4) ? */
export const remarquable = (t: number) => mod(t, 2) === 0 || mod(t, 3) === 0

export function cosT(t: number): Ex {
  let u = mod(t, 24)
  if (u > 12) u = 24 - u // parité
  if (u > 6) return cosT(12 - u).neg() // cos(π − x) = −cos x
  const v = COS_Q1[u]
  if (!v) throw new Error(`angle non remarquable : ${t}π/12`)
  return v
}
export const sinT = (t: number) => cosT(6 - t)

/** tan exacte, ou null si non définie. */
export function tanT(t: number): Ex | null {
  const u = mod(t, 12)
  const TAN: Record<number, Ex> = {
    0: Ex.entier(0),
    2: Ex.rac(3, new Frac(1, 3)),
    3: Ex.entier(1),
    4: Ex.rac(3),
  }
  if (u === 6) return null
  if (u < 6) return TAN[u]
  return TAN[12 - u].neg()
}

/** Écriture LaTeX de t·π/12 simplifiée : 8 → 2π/3, −6 → −π/2, 12 → π. */
export function angleTex(t: number): string {
  const f = new Frac(t, 12)
  if (f.zero) return '0'
  const s = f.n < 0 ? '-' : ''
  const n = Math.abs(f.n)
  const num = n === 1 ? '\\pi' : `${n}\\pi`
  return f.d === 1 ? `${s}${num}` : `${s}\\dfrac{${num}}{${f.d}}`
}
export function angleAscii(t: number): string {
  const f = new Frac(t, 12)
  if (f.zero) return '0'
  const n = Math.abs(f.n)
  return `${f.n < 0 ? '-' : ''}${n === 1 ? '' : n}pi${f.d === 1 ? '' : `/${f.d}`}`
}
/** Mesure principale dans ]−π, π] (en douzièmes de π). */
export function principal(t: number): number {
  const u = mod(t, 24)
  return u > 12 ? u - 24 : u
}
/** Quadrant (1..4) d'un angle non situé sur un axe. */
export function quadrant(t: number): 1 | 2 | 3 | 4 | 0 {
  const u = mod(t, 24)
  if (u % 6 === 0) return 0
  return (Math.floor(u / 6) + 1) as 1 | 2 | 3 | 4
}
