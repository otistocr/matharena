/**
 * Chapitre 1 — Géométrie du plan et de l'espace : gabarits de questions à variantes.
 * Chaque gabarit change les nombres, les noms (points, vecteurs, droites, paramètre) et la formulation.
 */
import type { Gabarit } from './types'
import {
  Frac,
  Rng,
  add,
  carre,
  col,
  cross,
  detailDot,
  dot,
  estNul,
  fl,
  lin,
  linAscii,
  noms,
  norme2,
  par,
  pgcdListe,
  racine,
  racineSur,
  scal,
  sub,
  tup,
  tupAscii,
  verifier,
} from './outils'
import { angleAscii, angleTex, cosT, remarquable } from './exact'

const T = String.raw
const XYZ = ['x', 'y', 'z', '']
const XY = ['x', 'y', '']

/** Divise une équation entière par le pgcd de ses coefficients et rend le 1er coefficient non nul positif. */
function normaliser(coefs: number[]): number[] {
  const g = pgcdListe(coefs)
  const s = (coefs.find((c) => c !== 0) ?? 1) < 0 ? -1 : 1
  return coefs.map((c) => (s * c) / g)
}
const eqTex = (coefs: number[], n = XYZ) => `${lin(coefs, n)} = 0`
const eqAscii = (coefs: number[], n = XYZ) => `${linAscii(coefs, n)} = 0`
const val = (coefs: number[], p: number[]) => coefs.slice(0, -1).reduce((s, c, i) => s + c * p[i], coefs.at(-1)!)

/** Deux vecteurs 3D entiers non colinéaires. */
function paireLibre(r: Rng, a = -4, b = 4): [number[], number[]] {
  for (;;) {
    const u = r.vec(3, a, b)
    const v = r.vec(3, a, b)
    if (!estNul(cross(u, v))) return [u, v]
  }
}

// =====================================================================================
// §1.1 Vecteurs, produit scalaire, projection
// =====================================================================================

/**
 * Vecteurs du plan à composantes « remarquables » : famille 45° (±m, ±m), famille 30°/60° (m, m√3),
 * axes. Chaque vecteur est R·(cos θ, sin θ) avec θ multiple de π/12 remarquable.
 */
function vecteurRemarquable(r: Rng): { t: number; comp: [string, string]; val: [number, number]; norme: string; n: number } {
  const t = r.pick([0, 2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22])
  const m = r.int(1, 3)
  const c = cosT(t)
  const s = cosT(6 - t)
  // coordonnée = R·cos : on choisit R pour que les coordonnées soient « jolies »
  let R: number
  let normeTex: string
  if (t % 6 === 0) {
    R = m
    normeTex = String(m)
  } else if (t % 3 === 0) {
    R = m * Math.SQRT2
    normeTex = m === 1 ? '\\sqrt2' : `${m}\\sqrt2`
  } else {
    R = 2 * m
    normeTex = String(2 * m)
  }
  const fmt = (e: ReturnType<typeof cosT>) => {
    const v = e.valeur() * R
    const entier = Math.round(v)
    if (Math.abs(v - entier) < 1e-9) return String(entier)
    const k = Math.round(v / Math.sqrt(3))
    return `${k < 0 ? '-' : ''}${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sqrt3`
  }
  return { t, comp: [fmt(c), fmt(s)], val: [c.valeur() * R, s.valeur() * R], norme: normeTex, n: R }
}

const angleVecteurs: Gabarit = {
  id: 'g1-angle',
  chapitre: 'ch1',
  section: 'ch1.s1',
  niveau: 1,
  titre: 'Angle entre deux vecteurs',
  source: 'TD1 ex 2',
  refCours: 'poly §1.1.4 p.7 et §1.2.3 p.12',
  indispensable: 1,
  generer(r) {
    let u: ReturnType<typeof vecteurRemarquable>, v: ReturnType<typeof vecteurRemarquable>, diff: number
    do {
      u = vecteurRemarquable(r)
      v = vecteurRemarquable(r)
      diff = Math.abs(u.t - v.t) % 24
      if (diff > 12) diff = 24 - diff
    } while (diff === 0 || !remarquable(diff))
    const N = noms(r)
    const [U, V] = [N.v(0), N.v(1)]
    const d = u.val[0] * v.val[0] + u.val[1] * v.val[1]
    const cosV = d / (u.n * v.n)
    const cosE = cosT(diff)
    verifier(Math.abs(cosV - cosE.valeur()) < 1e-9, 'angle')
    const dTex = (() => {
      const k = Math.round(d)
      if (Math.abs(d - k) < 1e-9) return String(k)
      const q = Math.round(d / Math.sqrt(3))
      return `${q < 0 ? '-' : ''}${Math.abs(q) === 1 ? '' : Math.abs(q)}\\sqrt3`
    })()
    return {
      type: 'num',
      enonce: r.bool()
        ? T`Dans une base orthonormée du plan, on donne $${U}=${col(u.comp)}$ et $${V}=${col(v.comp)}$. Donner l'angle **non orienté** $\theta\in[0,\pi]$ entre $${U}$ et $${V}$ (en radians).`
        : T`Quel est l'angle non orienté (en radians, dans $[0,\pi]$) entre les vecteurs $${U}=${col(u.comp)}$ et $${V}=${col(v.comp)}$ d'une base orthonormée ?`,
      reponse: angleAscii(diff),
      indice: T`Calcule $${U}\cdot${V}$ en composantes, puis les deux normes, et isole $\cos\theta$.`,
      explication: [
        T`[cours] **Énoncé indispensable 1** : $\cours{\vec u\cdot\vec v=\|\vec u\|\,\|\vec v\|\cos\theta}$, et en base orthonormée $\cours{\vec u\cdot\vec v=xx'+yy'}$ (Énoncé indispensable 4).`,
        T`[methode] Calculer le produit scalaire **de deux façons**, puis isoler $\cos\theta$.`,
        T`[calcul] $${U}\cdot${V}=(${u.comp[0]})(${v.comp[0]})+(${u.comp[1]})(${v.comp[1]})=\cle{${dTex}}$`,
        T`$\|${U}\|=\cle{${u.norme}}$ et $\|${V}\|=\cle{${v.norme}}$`,
        T`$$\cos\theta=\frac{${dTex}}{${u.norme}\times ${v.norme}}=${cosE.tex()}$$`,
        T`[resultat] $\ok{\theta=${angleTex(diff)}}$`,
        diff > 6
          ? T`[piege] Le cosinus est **négatif**, donc l'angle est **obtus** : ce n'est pas l'angle aigu $${angleTex(12 - diff)}$.`
          : T`[piege] L'angle est **non orienté**, donc dans $[0,\pi]$ : pas de réponse négative.`,
      ].join('\n'),
    }
  },
}

const produitScalaire: Gabarit = {
  id: 'g1-scalaire',
  chapitre: 'ch1',
  section: 'ch1.s1',
  niveau: 1,
  titre: 'Produit scalaire en composantes',
  source: 'TD1 ex 2',
  refCours: 'poly §1.2.3 p.12',
  indispensable: 4,
  generer(r) {
    const N = noms(r)
    const dim = r.pick([2, 3])
    const [A, B, C] = N.pts
    let u: number[], v: number[], enonce: string, nomU: string, nomV: string, etape: string
    if (r.bool()) {
      const a = r.vec(dim, -3, 3)
      u = r.vec(dim, -4, 4)
      v = r.vec(dim, -4, 4)
      nomU = fl(A, B)
      nomV = fl(A, C)
      enonce = T`Dans un repère orthonormé, $${A}=${tup(a)}$, $${B}=${tup(add(a, u))}$ et $${C}=${tup(add(a, v))}$. Calculer $${nomU}\cdot${nomV}$.`
      etape = T`[calcul] $${nomU}=${tup(u)}$ et $${nomV}=${tup(v)}$ (arrivée − départ)`
    } else {
      u = r.vec(dim, -5, 5)
      v = r.vec(dim, -5, 5)
      nomU = N.v(0)
      nomV = N.v(1)
      enonce = T`Dans une base orthonormée, calculer $${nomU}\cdot${nomV}$ pour $${nomU}=${col(u)}$ et $${nomV}=${col(v)}$.`
      etape = T`[calcul]`
    }
    const d = dot(u, v)
    return {
      type: 'num',
      enonce,
      reponse: d,
      explication: [
        T`[cours] **Énoncé indispensable 4** : en base orthonormée, $\cours{\vec u\cdot\vec u'=xx'+yy'${dim === 3 ? "+zz'" : ''}}$.`,
        etape,
        T`$$${nomU}\cdot${nomV}=${detailDot(u, v)}=\cle{${d}}$$`,
        T`[resultat] $\ok{${nomU}\cdot${nomV}=${d}}$${d === 0 ? ' : les vecteurs sont **orthogonaux**.' : d < 0 ? ' : négatif, donc angle **obtus**.' : ' : positif, donc angle **aigu**.'}`,
        T`[piege] Le produit scalaire est un **nombre**, pas un vecteur. Ne pas écrire $\ko{${tup(u.map((x, i) => x * v[i]))}}$.`,
      ].join('\n'),
    }
  },
}

const orthoParam: Gabarit = {
  id: 'g1-ortho-param',
  chapitre: 'ch1',
  section: 'ch1.s1',
  niveau: 1,
  titre: 'Paramètre pour l’orthogonalité',
  source: 'poly p.7–8',
  refCours: 'poly §1.1.4 p.8 et §1.2.3 p.12',
  generer(r) {
    const N = noms(r)
    const m = r.pick(['m', 'a', 'k'])
    let a: number, b: number, c: number, d: number
    do {
      a = r.nz(-4, 4)
      c = r.nz(-4, 4)
      b = r.nz(-4, 4)
      d = r.nz(-4, 4)
    } while (a + c === 0)
    const sol = new Frac(-b * d, a + c)
    verifier(sol.mul(a + c).add(b * d).zero, 'orthogonalité')
    return {
      type: 'num',
      enonce: T`Dans une base orthonormée de l'espace, pour quelle valeur du réel $${m}$ les vecteurs $${N.v(0)}=${col([m, a, b])}$ et $${N.v(1)}=${col([c, m, d])}$ sont-ils orthogonaux ?`,
      reponse: sol.ascii(),
      indice: T`Deux vecteurs sont orthogonaux si et seulement si leur produit scalaire est nul.`,
      explication: [
        T`[cours] Deux vecteurs sont **orthogonaux** $\iff$ $\cours{\vec u\cdot\vec v=0}$ (poly p.8). En base orthonormée : $\vec u\cdot\vec v=xx'+yy'+zz'$.`,
        T`[calcul] $$${N.v(0)}\cdot${N.v(1)}=${m}\times${par(c)}+${par(a)}\times ${m}+${par(b)}\times${par(d)}=${lin([a + c, b * d], [m, ''])}$$`,
        T`$$${lin([a + c, b * d], [m, ''])}=0\iff ${m}=\frac{${-b * d}}{${a + c}}$$`,
        T`[resultat] $\ok{${m}=${sol.tex()}}$`,
        T`[piege] Le paramètre $${m}$ apparaît **dans les deux vecteurs** : ne pas oublier le terme $${par(a)}\times ${m}$.`,
      ].join('\n'),
    }
  },
}

const projection: Gabarit = {
  id: 'g1-projection',
  chapitre: 'ch1',
  section: 'ch1.s1',
  niveau: 2,
  titre: 'Projeté orthogonal',
  source: 'poly §1.1.5',
  refCours: 'poly §1.1.5 p.8',
  generer(r) {
    const N = noms(r)
    let u: number[], d: number[]
    do {
      u = r.vec(2, -5, 5)
      d = r.vec(2, -3, 3)
    } while (dot(u, d) === 0)
    const ud = dot(u, d)
    const dd = norme2(d)
    const k = new Frac(ud, dd)
    const p = d.map((x) => k.mul(x))
    const reste = u.map((x, i) => Frac.of(x).sub(p[i]))
    verifier(reste.reduce((s, x, i) => s.add(x.mul(d[i])), new Frac(0)).zero, 'projection')
    const [U, D] = [N.v(0), N.v(1)]
    return {
      type: 'num',
      enonce: T`Dans une base orthonormée du plan, soit $${U}=${col(u)}$ et $${D}=${col(d)}$. Donner les composantes du projeté orthogonal de $${U}$ sur une droite de direction $${D}$, sous la forme $(a,b)$.`,
      reponse: tupAscii(p),
      indice: T`$\vec u'=\dfrac{\vec u\cdot\vec d}{\|\vec d\|^2}\,\vec d$. Attention, $${D}$ n'est pas forcément unitaire.`,
      explication: [
        T`[cours] **Poly §1.1.5** : projeté orthogonal de $\vec u$ sur une direction $\vec d$ non nulle : $$\cours{\vec u'=\frac{\vec u\cdot\vec d}{\|\vec d\|^2}\,\vec d}$$`,
        T`[calcul]`,
        T`- $${U}\cdot${D}=${detailDot(u, d)}=\cle{${ud}}$`,
        T`- $\|${D}\|^2=${d.map((x) => `${par(x)}^2`).join('+')}=\cle{${dd}}$`,
        T`$$${U}'=${k.tex()}\,${col(d)}$$`,
        T`[resultat] $\ok{${U}'=${tup(p)}}$`,
        T`[verif] $${U}-${U}'=${tup(reste)}$ doit être orthogonal à $${D}$ : $${reste.map((x, i) => `${par(x)}\\times${par(d[i])}`).join('+')}=0$ ✓`,
        dd !== 1 ? T`[piege] Oublier de diviser par $\|${D}\|^2=${dd}$ donne $\ko{${tup(d.map((x) => x * ud))}}$.` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
}

/** Pioche d'affirmations vrai/faux sur le produit scalaire (questions différentes, même notion). */
const vfScalaire: Gabarit = {
  id: 'g1-vf-scalaire',
  chapitre: 'ch1',
  section: 'ch1.s1',
  niveau: 1,
  titre: 'Vrai / faux : produit scalaire et normes',
  source: 'poly §1.1',
  refCours: 'poly §1.1.3–1.1.4 p.6–8 et §1.2.3 p.13',
  generer(r) {
    const N = noms(r)
    const [u, v] = [N.v(0), N.v(1)]
    const k = r.pick(['\\lambda', 'k', 'a'])
    const pioche: { e: string; rep: boolean; ex: string[] }[] = [
      {
        e: T`Pour tous vecteurs $${u},${v}$ : si $${u}\cdot${v}=0$, alors $${u}=\vec0$ ou $${v}=\vec0$.`,
        rep: false,
        ex: [
          T`[cours] Pour deux vecteurs non nuls, $\cours{\vec u\cdot\vec v=0\iff\vec u\perp\vec v}$ (poly p.8).`,
          T`[calcul] Contre-exemple : $${u}=\begin{pmatrix}1\\0\end{pmatrix}$, $${v}=\begin{pmatrix}0\\1\end{pmatrix}$ : $${u}\cdot${v}=0$ alors qu'aucun des deux n'est nul.`,
          T`[resultat] $\ok{\text{FAUX}}$ : produit scalaire nul signifie **orthogonaux**.`,
          T`[piege] Raisonner comme avec les réels ($ab=0\Rightarrow a=0$ ou $b=0$).`,
        ],
      },
      {
        e: T`Pour tout vecteur $${u}$ et tout réel $${k}$ : $\|${k}${u}\|=${k}\|${u}\|$.`,
        rep: false,
        ex: [
          T`[cours] Poly p.6 : $\cours{\|\lambda\vec u\|=|\lambda|\times\|\vec u\|}$, avec une **valeur absolue**.`,
          T`[calcul] Avec $${k}=-2$ : $\|-2${u}\|=2\|${u}\|$, alors que $-2\|${u}\|<0$ si $${u}\neq\vec0$. Une norme n'est jamais négative.`,
          T`[resultat] $\ok{\text{FAUX}}$ en général. C'est vrai seulement si $${k}\ge0$.`,
        ],
      },
      {
        e: T`Pour tout vecteur $${u}$ : $${u}\cdot${u}=\|${u}\|^2$.`,
        rep: true,
        ex: [
          T`[cours] Remarque 1.1 : l'angle entre $${u}$ et lui-même est $0$, et $\cos0=1$.`,
          T`[calcul] $${u}\cdot${u}=\|${u}\|\,\|${u}\|\cos0=\|${u}\|^2$`,
          T`[resultat] $\ok{\text{VRAI}}$ : c'est ainsi qu'on calcule une norme en composantes, $\|${u}\|=\sqrt{x^2+y^2}$.`,
        ],
      },
      {
        e: T`Pour tous vecteurs $${u},${v}$ : $(${u}+${v})\cdot(${u}-${v})=\|${u}\|^2-\|${v}\|^2$.`,
        rep: true,
        ex: [
          T`[cours] Énoncé indispensable 5 : le produit scalaire est **symétrique** et se **développe** comme un produit de nombres.`,
          T`[calcul] $$(${u}+${v})\cdot(${u}-${v})=${u}\cdot${u}-${u}\cdot${v}+${v}\cdot${u}-${v}\cdot${v}$$ Les deux termes du milieu s'annulent car $${u}\cdot${v}=${v}\cdot${u}$.`,
          T`[resultat] $\ok{\text{VRAI}}$ : il reste $\|${u}\|^2-\|${v}\|^2$.`,
        ],
      },
      {
        e: T`Pour tous vecteurs $${u},${v}$ : $\|${u}+${v}\|=\|${u}\|+\|${v}\|$.`,
        rep: false,
        ex: [
          T`[cours] En développant (Énoncé indispensable 5) : $\cours{\|\vec u+\vec v\|^2=\|\vec u\|^2+2\,\vec u\cdot\vec v+\|\vec v\|^2}$.`,
          T`[calcul] Contre-exemple : $${u}=\begin{pmatrix}1\\0\end{pmatrix}$, $${v}=\begin{pmatrix}0\\1\end{pmatrix}$ : $\|${u}+${v}\|=\sqrt2$ mais $\|${u}\|+\|${v}\|=2$.`,
          T`[resultat] $\ok{\text{FAUX}}$ : on a seulement l'inégalité $\le$. L'égalité n'a lieu que si les vecteurs sont colinéaires de même sens.`,
        ],
      },
      {
        e: T`Si $${u}\cdot${v}<0$, alors l'angle non orienté entre $${u}$ et $${v}$ est obtus.`,
        rep: true,
        ex: [
          T`[cours] $\cours{\vec u\cdot\vec v=\|\vec u\|\,\|\vec v\|\cos\theta}$ avec des normes positives : le signe du produit scalaire est celui de $\cos\theta$ (figure 1.3).`,
          T`[calcul] $${u}\cdot${v}<0\Rightarrow\cos\theta<0\Rightarrow\theta\in\left]\frac\pi2,\pi\right]$`,
          T`[resultat] $\ok{\text{VRAI}}$ (en comptant l'angle plat $\pi$ parmi les angles obtus au sens large).`,
        ],
      },
      {
        e: T`Pour tous vecteurs $${u},${v}$ et tout réel $${k}$ : $(${k}${u})\cdot${v}=${k}\,(${u}\cdot${v})$.`,
        rep: true,
        ex: [
          T`[cours] **Énoncé indispensable 5**, point 2 : $\cours{(\lambda\vec u)\cdot\vec v=\lambda(\vec u\cdot\vec v)}$.`,
          T`[calcul] En composantes : $(${k}x)x'+(${k}y)y'=${k}(xx'+yy')$`,
          T`[resultat] $\ok{\text{VRAI}}$ : pas de valeur absolue ici, contrairement à la norme.`,
        ],
      },
    ]
    const c = r.pick(pioche)
    return { type: 'vf', enonce: c.e, reponse: c.rep, explication: c.ex.join('\n') }
  },
}

// =====================================================================================
// §1.2 Bases, familles libres, composantes
// =====================================================================================

const composantes: Gabarit = {
  id: 'g1-composantes',
  chapitre: 'ch1',
  section: 'ch1.s2',
  niveau: 1,
  titre: 'Composantes d’un vecteur, point image',
  source: 'TD1 ex 2',
  refCours: 'poly §1.2.2 p.11–12',
  indispensable: 3,
  generer(r) {
    const N = noms(r)
    const [A, B] = N.pts
    const dim = r.pick([2, 3])
    const a = r.vec(dim, -5, 5)
    const u = r.vec(dim, -5, 5)
    const b = add(a, u)
    if (r.bool()) {
      return {
        type: 'num',
        enonce: T`Soit $${A}=${tup(a)}$ et $${B}=${tup(b)}$. Donner les composantes de $${fl(A, B)}$ sous la forme ${dim === 2 ? '$(x,y)$' : '$(x,y,z)$'}.`,
        reponse: tupAscii(u),
        explication: [
          T`[cours] **Énoncé indispensable 3** : $\overrightarrow{MM'}$ a pour composantes $\cours{x'-x}$, $\cours{y'-y}$${dim === 3 ? T`, $\cours{z'-z}$` : ''} : **arrivée moins départ** (Chasles : $\overrightarrow{MM'}=\overrightarrow{OM'}-\overrightarrow{OM}$).`,
          T`[calcul] $$${fl(A, B)}=${col(b.map((x, i) => `${x}-${par(a[i])}`))}$$`,
          T`[resultat] $\ok{${fl(A, B)}=${tup(u)}}$`,
          T`[piege] Faire départ − arrivée donne $\ko{${tup(u.map((x) => -x))}}$, c'est-à-dire $${fl(B, A)}$.`,
        ].join('\n'),
      }
    }
    const V = N.v(0)
    return {
      type: 'num',
      enonce: T`Soit $${A}=${tup(a)}$ et $${V}=${col(u)}$. Donner les coordonnées du point $${B}$ tel que $${fl(A, B)}=${V}$.`,
      reponse: tupAscii(b),
      explication: [
        T`[cours] **Énoncé indispensable 3** : les composantes de $${fl(A, B)}$ sont les coordonnées de $${B}$ **moins** celles de $${A}$. Donc $\cours{${B}=${A}+${V}}$ coordonnée par coordonnée.`,
        T`[calcul] $$${B}=${tup(a.map((x, i) => `${x}+${par(u[i])}`))}$$`,
        T`[resultat] $\ok{${B}=${tup(b)}}$`,
        T`[verif] $${fl(A, B)}=${tup(sub(b, a))}=${V}$ ✓`,
      ].join('\n'),
    }
  },
}

const baseEspace: Gabarit = {
  id: 'g1-base',
  chapitre: 'ch1',
  section: 'ch1.s2',
  niveau: 1,
  titre: 'Famille libre ou liée, base de l’espace',
  source: 'TD1 ex 7',
  refCours: 'poly §1.2.1 p.10 et §1.4.4 p.23',
  generer(r) {
    const N = noms(r)
    const [u, v] = paireLibre(r, -3, 3)
    const liee = r.bool()
    let w: number[]
    let alpha = 0
    let beta = 0
    if (liee) {
      alpha = r.nz(-2, 2)
      beta = r.nz(-2, 2)
      w = add(scal(alpha, u), scal(beta, v))
    } else {
      do w = r.vec(3, -3, 3)
      while (dot(cross(u, v), w) === 0)
    }
    const n = cross(u, v)
    const t = dot(n, w)
    verifier((t === 0) === liee, 'liée/libre')
    const [U, V, W] = [N.v(0), N.v(1), N.v(2)]
    const forme = r.pick(['base', 'libre', 'liee'] as const)
    const rep = forme === 'liee' ? liee : !liee
    const quoi = { base: 'est une base de l’espace', libre: 'est libre', liee: 'est liée' }[forme]
    return {
      type: 'vf',
      enonce: T`La famille $${U}=${col(u)},\ ${V}=${col(v)},\ ${W}=${col(w)}$ ${quoi}.`,
      reponse: rep,
      indice: T`Trois vecteurs sont liés ssi ils sont coplanaires, et $${W}$ est coplanaire à $${U},${V}$ ssi $${W}\perp${U}\wedge${V}$.`,
      explication: [
        T`[cours] **Définition 1.2** : $\{${U},${V},${W}\}$ est liée $\iff$ les trois vecteurs sont **coplanaires**. **Poly §1.4.4** : un vecteur est coplanaire à $${U},${V}$ (non colinéaires) $\iff$ il est orthogonal à $\cours{${U}\wedge${V}}$. **Proposition 1.3** : 3 vecteurs libres forment une base.`,
        T`[methode] Calculer $\vec n=${U}\wedge${V}$, puis tester si $\vec n\cdot${W}=0$.`,
        T`[calcul] $$\vec n=${U}\wedge${V}=${col(n)}$$ $$\vec n\cdot${W}=${detailDot(n, w)}=\cle{${t}}$$`,
        liee
          ? T`[resultat] $\vec n\cdot${W}=0$ : les vecteurs sont coplanaires, la famille est **liée**, donc pas une base. En effet $${W}=${lin([alpha, beta], [U, V])}$. Réponse : $\ok{\text{${rep ? 'VRAI' : 'FAUX'}}}$.`
          : T`[resultat] $\vec n\cdot${W}\neq0$ : les vecteurs ne sont pas coplanaires, la famille est **libre**, donc c'est une base de l'espace. Réponse : $\ok{\text{${rep ? 'VRAI' : 'FAUX'}}}$.`,
        T`[piege] Vérifier seulement que les vecteurs sont **deux à deux** non colinéaires ne suffit pas pour 3 vecteurs.`,
      ].join('\n'),
    }
  },
}

const colineaireParam: Gabarit = {
  id: 'g1-colineaire-param',
  chapitre: 'ch1',
  section: 'ch1.s2',
  niveau: 1,
  titre: 'Paramètre pour la colinéarité',
  source: 'TD1 ex 7',
  refCours: 'poly §1.1.3 p.6 et §1.2.1 p.10',
  generer(r) {
    const N = noms(r)
    const m = r.pick(['m', 'a', 'k'])
    const v = [r.nz(-3, 3), r.nz(-4, 4), r.nz(-3, 3)]
    const k = r.pick([-3, -2, 2, 3, 4])
    const u = scal(k, v)
    const pos = r.int(0, 2)
    const [U, V] = [N.v(0), N.v(1)]
    const uAff = u.map((x, i) => (i === pos ? m : x))
    const autre = [0, 1, 2].find((i) => i !== pos)!
    return {
      type: 'num',
      enonce: T`Pour quelle valeur de $${m}$ les vecteurs $${U}=${col(uAff)}$ et $${V}=${col(v)}$ sont-ils colinéaires ?`,
      reponse: u[pos],
      explication: [
        T`[cours] Deux vecteurs non nuls sont **colinéaires** $\iff$ il existe un réel $\lambda$ tel que $\cours{${U}=\lambda${V}}$ (poly §1.1.3).`,
        T`[methode] Trouver $\lambda$ avec une composante connue, le vérifier sur l'autre, puis en déduire $${m}$.`,
        T`[calcul] Composante ${autre + 1} : $${u[autre]}=\lambda\times${par(v[autre])}$, donc $\lambda=\cle{${k}}$.`,
        T`Composante ${pos + 1} : $${m}=\lambda\times${par(v[pos])}=${k}\times${par(v[pos])}$`,
        T`[resultat] $\ok{${m}=${u[pos]}}$`,
        T`[verif] Avec $${m}=${u[pos]}$, on a bien $${U}=${k}\,${V}$ sur les trois composantes ✓`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §1.3 Produit vectoriel
// =====================================================================================

const produitVectoriel: Gabarit = {
  id: 'g1-vectoriel',
  chapitre: 'ch1',
  section: 'ch1.s3',
  niveau: 1,
  titre: 'Calcul d’un produit vectoriel',
  source: 'TD1 ex 4',
  refCours: 'poly §1.3.2 p.15–17',
  indispensable: 6,
  generer(r) {
    const N = noms(r)
    const [u, v] = paireLibre(r)
    const w = cross(u, v)
    verifier(dot(w, u) === 0 && dot(w, v) === 0, 'orthogonalité du produit vectoriel')
    const [U, V] = [N.v(0), N.v(1)]
    const [x, y, z] = u
    const [x2, y2, z2] = v
    return {
      type: 'num',
      enonce: r.bool()
        ? T`Dans une base orthonormée directe, calculer $${U}\wedge${V}$ pour $${U}=${col(u)}$ et $${V}=${col(v)}$. Réponds sous la forme $(a,b,c)$.`
        : T`Soit $${U}=${col(u)}$ et $${V}=${col(v)}$ dans une base orthonormée directe. Donner les composantes du vecteur $${U}\wedge${V}$, sous la forme $(a,b,c)$.`,
      reponse: tupAscii(w),
      indice: T`$\begin{pmatrix}x\\y\\z\end{pmatrix}\wedge\begin{pmatrix}x'\\y'\\z'\end{pmatrix}=\begin{pmatrix}yz'-zy'\\zx'-xz'\\xy'-yx'\end{pmatrix}$`,
      explication: [
        T`[cours] **Énoncé indispensable 6** : $$\cours{\begin{pmatrix}x\\y\\z\end{pmatrix}\wedge\begin{pmatrix}x'\\y'\\z'\end{pmatrix}=\begin{pmatrix}yz'-zy'\\zx'-xz'\\xy'-yx'\end{pmatrix}}$$`,
        T`[calcul] $$\begin{aligned}yz'-zy'&=${par(y)}\times${par(z2)}-${par(z)}\times${par(y2)}=\cle{${w[0]}}\\zx'-xz'&=${par(z)}\times${par(x2)}-${par(x)}\times${par(z2)}=\cle{${w[1]}}\\xy'-yx'&=${par(x)}\times${par(y2)}-${par(y)}\times${par(x2)}=\cle{${w[2]}}\end{aligned}$$`,
        T`[resultat] $\ok{${U}\wedge${V}=${tup(w)}}$`,
        T`[verif] Il doit être orthogonal aux deux vecteurs :`,
        T`- $(${U}\wedge${V})\cdot${U}=${detailDot(w, u)}=0$ ✓`,
        T`- $(${U}\wedge${V})\cdot${V}=${detailDot(w, v)}=0$ ✓`,
        T`[piege] La 2e composante est $zx'-xz'$, dans cet ordre. Et $${V}\wedge${U}=-(${U}\wedge${V})$ : l'ordre des vecteurs compte.`,
      ].join('\n'),
    }
  },
}

const aire: Gabarit = {
  id: 'g1-aire',
  chapitre: 'ch1',
  section: 'ch1.s3',
  niveau: 2,
  titre: 'Aire d’un triangle ou d’un parallélogramme',
  source: 'poly Remarque 1.6',
  refCours: 'poly §1.3.1 p.15 (Remarque 1.6) et §1.3.4 p.17',
  generer(r) {
    const N = noms(r)
    const [A, B, C] = N.pts
    let a: number[], b: number[], c: number[], n: number[]
    do {
      a = r.vec(3, -3, 3)
      b = r.vec(3, -3, 3)
      c = r.vec(3, -3, 3)
      n = cross(sub(b, a), sub(c, a))
    } while (estNul(n))
    const triangle = r.bool()
    const N2 = norme2(n)
    const [rt, ra] = racine(N2)
    const [ht, ha] = racineSur(N2, 2)
    const figure = triangle ? T`du triangle $${A}${B}${C}$` : T`du parallélogramme construit sur $${fl(A, B)}$ et $${fl(A, C)}$`
    return {
      type: 'num',
      enonce: T`Dans un repère orthonormé direct de l'espace, $${A}=${tup(a)}$, $${B}=${tup(b)}$, $${C}=${tup(c)}$. Calculer l'**aire** ${figure}.`,
      reponse: triangle ? ha : ra,
      indice: T`$\|${fl(A, B)}\wedge${fl(A, C)}\|$ est l'aire du parallélogramme.`,
      explication: [
        T`[cours] **Remarque 1.6 (4)** : $\cours{\|\vec u\wedge\vec v\|}$ est l'**aire du parallélogramme** construit sur $\vec u,\vec v$. Un triangle en est la **moitié**.`,
        T`[calcul] $${fl(A, B)}=${tup(sub(b, a))}$ et $${fl(A, C)}=${tup(sub(c, a))}$`,
        T`$$${fl(A, B)}\wedge${fl(A, C)}=${col(n)}$$`,
        T`$$\|${fl(A, B)}\wedge${fl(A, C)}\|=\sqrt{${n.map((x) => `${par(x)}^2`).join('+')}}=\sqrt{${N2}}=\cle{${rt}}$$`,
        triangle ? T`[resultat] Aire du triangle $=\dfrac12\times${rt}=\ok{${ht}}$` : T`[resultat] Aire du parallélogramme $=\ok{${rt}}$`,
        triangle
          ? T`[piege] Oublier le $\frac12$ donne $\ko{${rt}}$ : c'est l'aire du **parallélogramme**.`
          : T`[piege] Ne pas diviser par 2 : ici on veut le parallélogramme, pas le triangle. Et ne pas confondre la norme avec $${N2}$, qui est son **carré**.`,
      ].join('\n'),
    }
  },
}

const colineairesVectoriel: Gabarit = {
  id: 'g1-colineaires-vect',
  chapitre: 'ch1',
  section: 'ch1.s3',
  niveau: 1,
  titre: 'Colinéarité par le produit vectoriel',
  source: 'poly §1.3.4',
  refCours: 'poly §1.3.1 (Remarque 1.6) et §1.3.4 p.17',
  generer(r) {
    const N = noms(r)
    const u = [r.nz(-3, 3), r.nz(-3, 3), r.int(-3, 3)]
    const k = r.pick([-3, -2, 2, 3])
    const v = scal(k, u)
    if (r.bool()) v[r.int(0, 2)] += r.pick([-1, 1])
    const w = cross(u, v)
    const coli = estNul(w)
    const [U, V] = [N.v(0), N.v(1)]
    return {
      type: 'vf',
      enonce: T`Les vecteurs $${U}=${col(u)}$ et $${V}=${col(v)}$ sont colinéaires.`,
      reponse: coli,
      explication: [
        T`[cours] **Remarque 1.6 (3)** : $\cours{\vec u\wedge\vec v=\vec0\iff\vec u,\vec v\text{ colinéaires}}$. C'est l'application n°1 du §1.3.4.`,
        T`[calcul] $$${U}\wedge${V}=${col(w)}$$`,
        coli
          ? T`[resultat] Le produit vectoriel est nul : $\ok{\text{VRAI}}$. D'ailleurs $${V}=${k}\,${U}$.`
          : T`[resultat] Le produit vectoriel n'est pas nul : $\ok{\text{FAUX}}$.`,
        coli
          ? T`[verif] Composante par composante : $${v.map((x, i) => `${x}=${k}\\times${par(u[i])}`).join(',\\ ')}$ ✓`
          : T`[piege] « Ça ressemble à ${k} fois ${U} » ne suffit pas : il faut que **toutes** les composantes soient dans le même rapport.`,
      ].join('\n'),
    }
  },
}

const vfVectoriel: Gabarit = {
  id: 'g1-vf-vectoriel',
  chapitre: 'ch1',
  section: 'ch1.s3',
  niveau: 1,
  titre: 'Vrai / faux : produit vectoriel',
  source: 'poly §1.3',
  refCours: 'poly §1.3 p.14–17',
  generer(r) {
    const N = noms(r)
    const [u, v, w] = [N.v(0), N.v(1), N.v(2)]
    const pioche: { e: string; rep: boolean; ex: string[] }[] = [
      {
        e: T`Pour tous vecteurs $${u},${v}$ de l'espace : $${u}\wedge${v}=${v}\wedge${u}$.`,
        rep: false,
        ex: [
          T`[cours] §1.3.3 : le produit vectoriel est **antisymétrique** : $\cours{\vec u\wedge\vec v=-\vec v\wedge\vec u}$.`,
          T`[calcul] $\vec\imath\wedge\vec\jmath=\vec k$ mais $\vec\jmath\wedge\vec\imath=-\vec k$.`,
          T`[resultat] $\ok{\text{FAUX}}$ (sauf si le résultat est nul, c'est-à-dire si les vecteurs sont colinéaires).`,
        ],
      },
      {
        e: T`Le produit vectoriel $${u}\wedge${v}$ est un nombre réel.`,
        rep: false,
        ex: [
          T`[cours] Définition 1.5 : $${u}\wedge${v}$ est un **vecteur** orthogonal à $${u}$ et à $${v}$ (Remarque 1.6 (2)).`,
          T`[resultat] $\ok{\text{FAUX}}$ : c'est le **produit scalaire** qui donne un nombre.`,
        ],
      },
      {
        e: T`Pour tous vecteurs $${u},${v}$ de l'espace : $(${u}\wedge${v})\cdot${u}=0$.`,
        rep: true,
        ex: [
          T`[cours] Définition 1.5 : $\cours{\vec u\wedge\vec v\perp\vec u}$ et $\cours{\vec u\wedge\vec v\perp\vec v}$.`,
          T`[resultat] $\ok{\text{VRAI}}$ : produit scalaire de deux vecteurs orthogonaux (et vrai aussi si $${u}\wedge${v}=\vec0$).`,
        ],
      },
      {
        e: T`$\|${u}\wedge${v}\|=\|${u}\|\,\|${v}\|\,|\cos\theta|$, où $\theta$ est l'angle entre $${u}$ et $${v}$.`,
        rep: false,
        ex: [
          T`[cours] Définition 1.5 : $\cours{\|\vec u\wedge\vec v\|=\|\vec u\|\,\|\vec v\|\sin\theta}$ (avec $\theta\in[0,\pi]$, donc $\sin\theta\ge0$).`,
          T`[resultat] $\ok{\text{FAUX}}$ : c'est un **sinus**. Le cosinus, c'est pour le produit scalaire.`,
          T`[verif] Deux vecteurs colinéaires ($\theta=0$) ont un produit vectoriel nul : $\sin0=0$, alors que $\cos0=1$.`,
        ],
      },
      {
        e: T`Si $${u}\wedge${v}=\vec 0$, alors $${u}$ et $${v}$ sont colinéaires.`,
        rep: true,
        ex: [
          T`[cours] Remarque 1.6 (3) : $\cours{\vec u\wedge\vec v=\vec0\iff\vec u,\vec v\text{ colinéaires}}$ (les angles de sinus nul sont $0$ et $\pi$).`,
          T`[resultat] $\ok{\text{VRAI}}$`,
        ],
      },
      {
        e: T`Pour tous vecteurs $${u},${v},${w}$ : $(${u}+${v})\wedge${w}=${u}\wedge${w}+${v}\wedge${w}$.`,
        rep: true,
        ex: [
          T`[cours] §1.3.3 : le produit vectoriel est **bilinéaire** : il se développe comme un produit.`,
          T`[resultat] $\ok{\text{VRAI}}$. Attention cependant à ne jamais échanger l'ordre des facteurs (antisymétrie).`,
        ],
      },
      {
        e: T`On peut définir le produit vectoriel de deux vecteurs du **plan** avec la même formule.`,
        rep: false,
        ex: [
          T`[cours] §1.3 : le produit vectoriel « ne concerne que les vecteurs de l'espace ». Il faut 3 composantes, et le résultat est orthogonal au plan de $${u},${v}$.`,
          T`[resultat] $\ok{\text{FAUX}}$. On peut plonger le plan dans l'espace ($z=0$), mais le résultat sort alors du plan : il est dirigé selon $\vec k$.`,
        ],
      },
    ]
    const c = r.pick(pioche)
    return { type: 'vf', enonce: c.e, reponse: c.rep, explication: c.ex.join('\n') }
  },
}

// =====================================================================================
// §1.4 Droites et plans
// =====================================================================================

const droiteCartesienne: Gabarit = {
  id: 'g1-droite-cart',
  chapitre: 'ch1',
  section: 'ch1.s4',
  niveau: 1,
  titre: 'Équation cartésienne d’une droite du plan',
  source: 'TD1 ex 3',
  refCours: 'poly §1.4.2 p.20–21',
  indispensable: 7,
  generer(r) {
    const N = noms(r)
    const [A, B] = N.pts
    const a = r.vec(2, -5, 5)
    const u = r.vec(2, -4, 4)
    const [s, t] = u
    const brut = [-t, s, t * a[0] - s * a[1]]
    const eq = normaliser(brut)
    const deuxPoints = r.bool()
    const b = add(a, u)
    verifier(val(eq, a) === 0 && val(eq, b) === 0, 'droite')
    const D = N.droite
    const V = N.v(0)
    const g = pgcdListe(brut) * ((brut.find((c) => c !== 0) ?? 1) < 0 ? -1 : 1)
    return {
      type: 'court',
      enonce: deuxPoints
        ? T`Dans un repère orthonormé du plan, donner une **équation cartésienne** de la droite $${D}$ passant par $${A}=${tup(a)}$ et $${B}=${tup(b)}$.`
        : T`Dans un repère orthonormé du plan, donner une **équation cartésienne** de la droite $${D}$ passant par $${A}=${tup(a)}$ et dirigée par $${V}=${col(u)}$.`,
      reponse: [eqAscii(eq, XY)],
      variables: ['x', 'y'],
      mode: 'equation',
      format: 'ax + by + c = 0 (toute équation équivalente est acceptée)',
      indice: T`$M\in ${D}\iff\overrightarrow{${A}M}\cdot\vec v'=0$ avec $\vec v'=\begin{pmatrix}-t\\s\end{pmatrix}$ orthogonal au vecteur directeur $\begin{pmatrix}s\\t\end{pmatrix}$.`,
      explication: [
        T`[cours] **Énoncé indispensable 7** : si la droite passe par $(a,b)$ et est dirigée par $\begin{pmatrix}s\\t\end{pmatrix}$, alors $$\cours{M=(x,y)\in D\iff -t(x-a)+s(y-b)=0}$$`,
        deuxPoints ? T`[calcul] Vecteur directeur : $${fl(A, B)}=${col(u)}$, donc $\cle{s=${s}}$ et $\cle{t=${t}}$.` : T`[calcul] $\cle{s=${s}}$, $\cle{t=${t}}$, $a=${a[0]}$, $b=${a[1]}$.`,
        T`$$${par(-t)}(x-${par(a[0])})+${par(s)}(y-${par(a[1])})=0$$`,
        T`$$\iff ${lin(brut, XY)}=0$$`,
        g !== 1 ? T`On simplifie en divisant par $${g}$.` : '',
        T`[resultat] $\ok{${eqTex(eq, XY)}}$`,
        T`[verif] $${A}$ : $${eq[0]}\times${par(a[0])}+${par(eq[1])}\times${par(a[1])}+${par(eq[2])}=0$ ✓${deuxPoints ? T` et $${B}$ vérifie aussi l'équation ✓` : ''}`,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
}

const paramVersCart: Gabarit = {
  id: 'g1-param-cart',
  chapitre: 'ch1',
  section: 'ch1.s4',
  niveau: 1,
  titre: 'Paramétrique → cartésienne (plan)',
  source: 'TD1 ex 5',
  refCours: 'poly §1.4.1–1.4.2 p.18–21',
  generer(r) {
    const N = noms(r)
    const a = r.vec(2, -5, 5)
    const u = [r.nz(-4, 4), r.nz(-4, 4)]
    const L = N.param
    const D = N.droite
    const brut = [-u[1], u[0], u[1] * a[0] - u[0] * a[1]]
    const eq = normaliser(brut)
    const p1 = add(a, u)
    verifier(val(eq, a) === 0 && val(eq, p1) === 0, 'param→cart')
    const px = lin([a[0], u[0]], ['', L])
    const py = lin([a[1], u[1]], ['', L])
    return {
      type: 'court',
      enonce: T`Soit $${D}=\{(${px},\ ${py})\mid ${L}\in\mathbb R\}$. Donner une **équation cartésienne** de $${D}$.`,
      reponse: [eqAscii(eq, XY)],
      variables: ['x', 'y'],
      mode: 'equation',
      format: 'ax + by + c = 0',
      indice: T`Lis un point et un vecteur directeur, ou isole $${L}$ dans une coordonnée et reporte-le dans l'autre.`,
      explication: [
        T`[cours] **Poly §1.4.1** : $\{(a+${L}c,\ b+${L}d)\}$ est la droite passant par $(a,b)$ dirigée par $\begin{pmatrix}c\\d\end{pmatrix}$. **Énoncé indispensable 7** : $\cours{-d(x-a)+c(y-b)=0}$.`,
        T`[methode] **Lire** le point $(${a[0]},${a[1]})$ (pour $${L}=0$) et le vecteur directeur $${col(u)}$ (les coefficients de $${L}$), puis appliquer l'Énoncé 7. Autre méthode : éliminer $${L}$ entre les deux coordonnées.`,
        T`[calcul] $$${par(-u[1])}(x-${par(a[0])})+${par(u[0])}(y-${par(a[1])})=0\iff ${lin(brut, XY)}=0$$`,
        T`[resultat] $\ok{${eqTex(eq, XY)}}$`,
        T`[verif] Avec $${L}=1$, le point $${tup(p1)}$ vérifie l'équation : $${val(eq, p1)}=0$ ✓`,
      ].join('\n'),
    }
  },
}

const appartientParam: Gabarit = {
  id: 'g1-appartient',
  chapitre: 'ch1',
  section: 'ch1.s4',
  niveau: 1,
  titre: 'Un point est-il sur la droite ? (paramétrique)',
  source: 'poly p.20 (Test)',
  refCours: 'poly §1.4.1 p.18–20',
  generer(r) {
    const N = noms(r)
    const a = r.vec(2, -5, 5)
    const u = [r.nz(-4, 4), r.nz(-4, 4)]
    const L = N.param
    const D = N.droite
    const l0 = r.nz(-3, 3)
    const p = add(a, scal(l0, u))
    if (r.bool()) p[r.int(0, 1)] += r.pick([-1, 1, 2])
    const l1 = new Frac(p[0] - a[0], u[0])
    const l2 = new Frac(p[1] - a[1], u[1])
    const sur = l1.sub(l2).zero
    const M = N.pts[0]
    return {
      type: 'vf',
      enonce: T`Soit $${D}=\{(${lin([a[0], u[0]], ['', L])},\ ${lin([a[1], u[1]], ['', L])})\mid ${L}\in\mathbb R\}$. Le point $${M}=${tup(p)}$ appartient à $${D}$.`,
      reponse: sur,
      explication: [
        T`[cours] **Poly §1.4.1** : $${M}\in ${D}$ $\iff$ il existe **un même** $${L}$ qui donne les deux coordonnées de $${M}$.`,
        T`[calcul] $$\begin{cases}${lin([a[0], u[0]], ['', L])}=${p[0]}\\${lin([a[1], u[1]], ['', L])}=${p[1]}\end{cases}\iff\begin{cases}${L}=${l1.tex()}\\${L}=${l2.tex()}\end{cases}$$`,
        sur
          ? T`[resultat] Les deux valeurs coïncident ($${L}=${l1.tex()}$) : $\ok{\text{VRAI}}$, $${M}\in ${D}$.`
          : T`[resultat] Deux valeurs **différentes** de $${L}$ : aucun paramètre ne convient, $\ok{\text{FAUX}}$.`,
        T`[piege] Ne vérifier qu'une seule coordonnée. On trouve **toujours** un $${L}$ pour une seule équation.`,
      ].join('\n'),
    }
  },
}

const planCartesien: Gabarit = {
  id: 'g1-plan-cart',
  chapitre: 'ch1',
  section: 'ch1.s4',
  niveau: 1,
  titre: 'Équation cartésienne d’un plan',
  source: 'TD1 ex 4',
  refCours: 'poly §1.4.4 p.23',
  indispensable: 8,
  generer(r) {
    const N = noms(r)
    const [A, B, C] = N.pts
    const a = r.vec(3, -4, 4)
    const [u, v] = paireLibre(r, -3, 3)
    const n = cross(u, v)
    const brut = [...n, -dot(n, a)]
    const eq = normaliser(brut)
    const P = N.plan
    const troisPoints = r.bool()
    const b = add(a, u)
    const c = add(a, v)
    verifier(val(eq, a) === 0 && val(eq, b) === 0 && val(eq, c) === 0, 'plan')
    const [U, V] = [N.v(0), N.v(1)]
    return {
      type: 'court',
      enonce: troisPoints
        ? T`Dans un repère orthonormé direct, donner une **équation cartésienne** du plan $${P}$ passant par $${A}=${tup(a)}$, $${B}=${tup(b)}$ et $${C}=${tup(c)}$.`
        : T`Dans un repère orthonormé direct, donner une **équation cartésienne** du plan $${P}$ passant par $${A}=${tup(a)}$ et dirigé par $${U}=${col(u)}$ et $${V}=${col(v)}$.`,
      reponse: [eqAscii(eq)],
      variables: ['x', 'y', 'z'],
      mode: 'equation',
      format: 'ax + by + cz + d = 0',
      indice: T`Un vecteur normal : le produit vectoriel des deux vecteurs directeurs.`,
      explication: [
        T`[cours] **Poly §1.4.4** : si $\vec n$ est orthogonal aux deux vecteurs directeurs, alors $\cours{M\in ${P}\iff\overrightarrow{${A}M}\cdot\vec n=0}$. On prend $\vec n=${troisPoints ? `${fl(A, B)}\\wedge${fl(A, C)}` : `${U}\\wedge${V}`}$.`,
        troisPoints ? T`[calcul] $${fl(A, B)}=${tup(u)}$ et $${fl(A, C)}=${tup(v)}$` : T`[calcul]`,
        T`$$\vec n=${col(n)}$$`,
        T`$$${n[0]}(x-${par(a[0])})+${par(n[1])}(y-${par(a[1])})+${par(n[2])}(z-${par(a[2])})=0$$`,
        T`$$\iff ${lin(brut, XYZ)}=0$$`,
        T`[resultat] $\ok{${eqTex(eq)}}$, ou toute équation proportionnelle.`,
        T`[verif] $${A}$ vérifie l'équation ✓ et $\vec n\cdot${troisPoints ? fl(A, B) : U}=${dot(n, u)}$ ✓`,
      ].join('\n'),
    }
  },
}

const normalPlan: Gabarit = {
  id: 'g1-normal',
  chapitre: 'ch1',
  section: 'ch1.s4',
  niveau: 1,
  titre: 'Vecteur normal à un plan',
  source: 'poly §1.4.4',
  refCours: 'poly §1.4.4 p.23',
  generer(r) {
    const N = noms(r)
    const n = [r.nz(-5, 5), r.nz(-5, 5), r.nz(-5, 5)]
    let d: number
    do d = r.nz(-6, 6)
    while (d === n[2] || d === n[1])
    const P = N.plan
    const bon = `$${tup(n)}$`
    const leurres = [tup([n[0], n[1], d]), tup([n[0], -n[1], n[2]]), tup([n[1], n[0], n[2]]), tup([n[0], n[2], d])].map((c) => `$${c}$`)
    const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((c) => c !== bon)).slice(0, 3)])
    return {
      type: 'qcm',
      enonce: T`Quel vecteur est **normal** (orthogonal) au plan $${P}$ d'équation $${lin([...n, d], XYZ)}=0$ ?`,
      choix,
      reponse: choix.indexOf(bon),
      explication: [
        T`[cours] **Poly §1.4.4** : l'équation $\overrightarrow{AM}\cdot\vec n=0$, développée, donne $\cours{ax+by+cz+d=0}$ où $\cours{(a,b,c)}$ sont les composantes de $\vec n$.`,
        T`[resultat] On lit les coefficients de $x$, $y$, $z$ : $\ok{\vec n=${tup(n)}}$ (ou tout multiple non nul).`,
        T`[piege] La constante $${d}$ ne fait **pas** partie du vecteur normal. Et attention aux signes et à l'ordre $x,y,z$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §1.5 Cercle
// =====================================================================================

const TRIPLETS = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [0, 1, 1],
  [0, 2, 2],
  [0, 3, 3],
  [0, 4, 4],
  [0, 5, 5],
]

const cercleEquation: Gabarit = {
  id: 'g1-cercle-eq',
  chapitre: 'ch1',
  section: 'ch1.s5',
  niveau: 1,
  titre: 'Équation d’un cercle',
  source: 'TD1 ex 6',
  refCours: 'poly §1.5 p.24',
  indispensable: 9,
  generer(r) {
    const N = noms(r)
    const c = r.vec(2, -5, 5)
    const rad2 = r.pick([1, 2, 3, 4, 5, 8, 9, 16, 25])
    const [rt] = racine(rad2)
    const A = N.pts[0]
    const C = N.cercle
    return {
      type: 'court',
      enonce: T`Dans un repère orthonormé, donner une équation du cercle $${C}$ de centre $${A}=${tup(c)}$ et de rayon $${rt}$.`,
      reponse: [`(x - (${c[0]}))^2 + (y - (${c[1]}))^2 = ${rad2}`],
      variables: ['x', 'y'],
      mode: 'equation',
      format: 'forme (x−a)² + (y−b)² = r² ou développée',
      explication: [
        T`[cours] **Énoncé indispensable 9** : $\cours{M=(x,y)\in ${C}\iff(x-a)^2+(y-b)^2=r^2}$, car la distance au centre vaut $r$.`,
        T`[calcul] $a=${c[0]}$, $b=${c[1]}$, $r^2=(${rt})^2=\cle{${rad2}}$`,
        T`[resultat] $\ok{${carre('x', c[0])}+${carre('y', c[1])}=${rad2}}$`,
        T`[piege]`,
        T`- Écrire $\ko{r}$ au lieu de $r^2$ à droite.`,
        T`- Se tromper de signe : un centre d'abscisse $${c[0]}$ donne $${carre('x', c[0])}$.`,
      ].join('\n'),
    }
  },
}

const cercleCentre: Gabarit = {
  id: 'g1-cercle-centre',
  chapitre: 'ch1',
  section: 'ch1.s5',
  niveau: 1,
  titre: 'Centre et rayon (compléter les carrés)',
  source: 'TD1 ex 6',
  refCours: 'poly §1.5 p.24',
  indispensable: 9,
  generer(r) {
    let a: number, b: number
    do {
      a = r.int(-5, 5)
      b = r.int(-5, 5)
    } while (a === 0 || b === 0)
    const rad = r.int(2, 6)
    const cst = a * a + b * b - rad * rad
    const C = noms(r).cercle
    const f = (c: [number, number], rr: number) => T`centre $(${c[0]},${c[1]})$, rayon $${rr}$`
    const bon = f([a, b], rad)
    const leurres = [f([-a, -b], rad), f([a, b], rad * rad), f([2 * a, 2 * b], rad), f([-a, b], rad), f([a, -b], rad)]
    const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((x) => x !== bon)).slice(0, 3)])
    return {
      type: 'qcm',
      enonce: T`Dans un repère orthonormé, l'ensemble $${C}$ des points tels que $${lin([1, -2 * a, 1, -2 * b, cst], ['x^2', 'x', 'y^2', 'y', ''])}=0$ est un cercle de :`,
      choix,
      reponse: choix.indexOf(bon),
      explication: [
        T`[cours] **Énoncé indispensable 9** : $\cours{(x-a)^2+(y-b)^2=r^2}$ est le cercle de centre $(a,b)$ et de rayon $r$.`,
        T`[methode] **Compléter les carrés** : $x^2-2px=(x-p)^2-p^2$.`,
        T`[calcul] $$\begin{aligned}${lin([1, -2 * a], ['x^2', 'x'])}&=${carre('x', a)}-${a * a}\\${lin([1, -2 * b], ['y^2', 'y'])}&=${carre('y', b)}-${b * b}\end{aligned}$$`,
        T`$$${carre('x', a)}+${carre('y', b)}=${a * a}+${b * b}${cst > 0 ? `-${cst}` : cst < 0 ? `+${-cst}` : ''}=\cle{${rad * rad}}$$`,
        T`[resultat] $\ok{\text{centre }(${a},${b})}$, $\ok{\text{rayon }${rad}}$`,
        T`[piege] Le coefficient de $x$ est $-2a$ : il faut le **diviser par $-2$**. Et le membre de droite vaut $r^2$, pas $r$.`,
      ].join('\n'),
    }
  },
}

const surCercle: Gabarit = {
  id: 'g1-sur-cercle',
  chapitre: 'ch1',
  section: 'ch1.s5',
  niveau: 1,
  titre: 'Un point est-il sur le cercle ?',
  source: 'poly §1.5',
  refCours: 'poly §1.5 p.24',
  indispensable: 9,
  generer(r) {
    const N = noms(r)
    const c = r.vec(2, -4, 4)
    const [p, q, rad] = r.pick(TRIPLETS)
    const off = r.shuffle([p * r.pick([-1, 1]), q * r.pick([-1, 1])])
    const m = add(c, off)
    if (r.bool()) m[r.int(0, 1)] += r.pick([-1, 1])
    const dx = m[0] - c[0]
    const dy = m[1] - c[1]
    const d2 = dx * dx + dy * dy
    const sur = d2 === rad * rad
    const [M, A] = N.pts
    return {
      type: 'vf',
      enonce: T`Le point $${M}=${tup(m)}$ appartient au cercle de centre $${A}=${tup(c)}$ et de rayon $${rad}$.`,
      reponse: sur,
      explication: [
        T`[cours] **Énoncé indispensable 9** : $\cours{M\in\mathcal C\iff(x-a)^2+(y-b)^2=r^2}$.`,
        T`[calcul] $$(${m[0]}-${par(c[0])})^2+(${m[1]}-${par(c[1])})^2=${par(dx)}^2+${par(dy)}^2=\cle{${d2}}\quad\text{et}\quad r^2=${rad * rad}$$`,
        T`[resultat] $${d2}${sur ? '=' : '\\neq'}${rad * rad}$ : $\ok{\text{${sur ? 'VRAI' : 'FAUX'}}}$`,
        T`[piege] Comparer à $r=${rad}$ au lieu de $r^2=${rad * rad}$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §1.6 Transformations du plan
// =====================================================================================

const symetrieProjection: Gabarit = {
  id: 'g1-sym-proj',
  chapitre: 'ch1',
  section: 'ch1.s6',
  niveau: 2,
  titre: 'Symétrie / projection dans une base (e₁, e₂)',
  source: 'poly §1.6.4–1.6.5',
  refCours: 'poly §1.6.4–1.6.5 p.27–28',
  generer(r) {
    let e1: number[], e2: number[]
    do {
      e1 = r.vec(2, -2, 2)
      e2 = r.vec(2, -2, 2)
    } while (e1[0] * e2[1] - e1[1] * e2[0] === 0 || dot(e1, e2) === 0)
    const x1 = r.nz(-3, 3)
    const x2 = r.nz(-3, 3)
    const u = add(scal(x1, e1), scal(x2, e2))
    const t = r.pick(['S1', 'S2', 'p1', 'p2'] as const)
    const res = { S1: sub(scal(x1, e1), scal(x2, e2)), S2: sub(scal(x2, e2), scal(x1, e1)), p1: scal(x1, e1), p2: scal(x2, e2) }[t]
    const nom = { S1: 'S_1', S2: 'S_2', p1: 'p_1', p2: 'p_2' }[t]
    const def = {
      S1: T`S_1(x_1\vec e_1+x_2\vec e_2)=x_1\vec e_1-x_2\vec e_2`,
      S2: T`S_2(x_1\vec e_1+x_2\vec e_2)=-x_1\vec e_1+x_2\vec e_2`,
      p1: T`p_1(x_1\vec e_1+x_2\vec e_2)=x_1\vec e_1`,
      p2: T`p_2(x_1\vec e_1+x_2\vec e_2)=x_2\vec e_2`,
    }[t]
    const quoi = {
      S1: T`la symétrie $S_1$ sur $D(\vec e_1)$ parallèlement à $D(\vec e_2)$`,
      S2: T`la symétrie $S_2$ sur $D(\vec e_2)$ parallèlement à $D(\vec e_1)$`,
      p1: T`la projection $p_1$ sur $D(\vec e_1)$ parallèlement à $D(\vec e_2)$`,
      p2: T`la projection $p_2$ sur $D(\vec e_2)$ parallèlement à $D(\vec e_1)$`,
    }[t]
    const formule = { S1: T`${x1}\vec e_1-${par(x2)}\vec e_2`, S2: T`-${par(x1)}\vec e_1+${par(x2)}\vec e_2`, p1: T`${x1}\vec e_1`, p2: T`${x2}\vec e_2` }[t]
    const U = noms(r).v(0)
    return {
      type: 'num',
      enonce: T`Dans la base canonique, soit $\vec e_1=${col(e1)}$, $\vec e_2=${col(e2)}$ et $${U}=${col(u)}$. On note ${quoi}. Donner les composantes (dans la base canonique) de $${nom}(${U})$, sous la forme $(a,b)$.`,
      reponse: tupAscii(res),
      indice: T`Écrire d'abord $${U}=x_1\vec e_1+x_2\vec e_2$ (système 2×2).`,
      explication: [
        T`[cours] **Poly §1.6.4–1.6.5** : pour $\vec u=x_1\vec e_1+x_2\vec e_2$, $\cours{${def}}$.`,
        T`[methode] 1) Décomposer $${U}$ dans la base $(\vec e_1,\vec e_2)$. 2) Appliquer la définition. 3) Revenir aux composantes canoniques.`,
        T`[calcul] On résout $x_1${col(e1)}+x_2${col(e2)}=${col(u)}$ : $$\begin{cases}${lin([e1[0], e2[0]], ['x_1', 'x_2'])}=${u[0]}\\${lin([e1[1], e2[1]], ['x_1', 'x_2'])}=${u[1]}\end{cases}\iff x_1=\cle{${x1}},\ x_2=\cle{${x2}}$$`,
        T`$$${nom}(${U})=${formule}$$`,
        T`[resultat] $\ok{${nom}(${U})=${tup(res)}}$`,
        T`[piege] Ici la base n'est **pas orthonormée** : on ne peut pas « lire » $x_1,x_2$ directement sur les composantes de $${U}$, il faut résoudre le système.`,
      ].join('\n'),
    }
  },
}

const transformations: Gabarit = {
  id: 'g1-transfo',
  chapitre: 'ch1',
  section: 'ch1.s6',
  niveau: 1,
  titre: 'Translation, homothétie, rotation d’un quart de tour',
  source: 'poly §1.6.1–1.6.3',
  refCours: 'poly §1.6.1–1.6.3 p.26–27',
  generer(r) {
    const N = noms(r)
    const [U, V, W] = [N.v(0), N.v(1), N.v(2)]
    const u = r.vec(2, -5, 5)
    const cas = r.pick(['homothetie', 'translation', 'rot90', 'rot180'] as const)
    if (cas === 'homothetie') {
      const a = r.pick([-3, -2, 2, 3])
      const B = r.pick([new Frac(-2), new Frac(2), new Frac(3), new Frac(1, 2)])
      const k = B.mul(a)
      const res = u.map((x) => k.mul(x))
      return {
        type: 'num',
        enonce: T`Pour $${U}=${col(u)}$, calculer $H_{${a}}\big(H_{${B.tex()}}(${U})\big)$, où $H_k$ désigne l'homothétie de rapport $k$. Réponse sous la forme $(a,b)$.`,
        reponse: tupAscii(res),
        explication: [
          T`[cours] **Poly §1.6.2** : $\cours{H_k(\vec u)=k\vec u}$, et $\cours{H_aH_b=H_{ab}}$ (Test p.26).`,
          T`[calcul] $H_{${a}}H_{${B.tex()}}=H_{${k.tex()}}$, donc on multiplie $${U}$ par $\cle{${k.tex()}}$.`,
          T`[resultat] $\ok{${tup(res)}}$`,
          T`[piege] Ce sont les rapports qui se **multiplient**, ils ne s'additionnent pas.`,
        ].join('\n'),
      }
    }
    if (cas === 'translation') {
      const v = r.vec(2, -5, 5)
      const w = r.vec(2, -5, 5)
      const res = add(add(w, u), v)
      return {
        type: 'num',
        enonce: T`Soit $${U}=${col(u)}$, $${V}=${col(v)}$, $${W}=${col(w)}$. Calculer $T_{${U}}\big(T_{${V}}(${W})\big)$, où $T_{\vec a}$ est la translation par $\vec a$. Réponse sous la forme $(a,b)$.`,
        reponse: tupAscii(res),
        explication: [
          T`[cours] **Poly §1.6.1** : $\cours{T_{\vec a}(\vec x)=\vec x+\vec a}$ et $\cours{T_{\vec u}T_{\vec v}=T_{\vec u+\vec v}}$.`,
          T`[calcul] $$${W}+${V}+${U}=${col(res)}$$`,
          T`[resultat] $\ok{${tup(res)}}$`,
          T`[piege] Une translation n'est **pas linéaire** (Test p.26) : $T_{\vec a}(2\vec x)\neq2T_{\vec a}(\vec x)$.`,
        ].join('\n'),
      }
    }
    const res = cas === 'rot90' ? [-u[1], u[0]] : [-u[0], -u[1]]
    verifier(dot(res, res) === dot(u, u), 'rotation')
    const ang = cas === 'rot90' ? T`\frac{\pi}{2}` : T`\pi`
    return {
      type: 'num',
      enonce: T`Dans une base orthonormée directe, donner les composantes de $R_{${ang}}(${U})$ pour $${U}=${col(u)}$, où $R_\theta$ est la rotation d'angle $\theta$. Réponse sous la forme $(a,b)$.`,
      reponse: tupAscii(res),
      explication: [
        T`[cours] **Poly §1.6.3** : $R_\theta(\vec u)$ a la **même norme** que $\vec u$ et fait un angle $\theta$ avec lui.`,
        cas === 'rot90'
          ? T`[calcul] Pour $\theta=\frac\pi2$ : le vecteur $\begin{pmatrix}-y\\x\end{pmatrix}$ est orthogonal à $\begin{pmatrix}x\\y\end{pmatrix}$ (Test p.14), de même norme, et tourné dans le sens direct. Donc $\cle{R_{\pi/2}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}-y\\x\end{pmatrix}}$.`
          : T`[calcul] Pour $\theta=\pi$ : demi-tour, $\cle{R_\pi(\vec u)=-\vec u}$.`,
        T`[resultat] $\ok{${tup(res)}}$`,
        cas === 'rot90' ? T`[verif] Produit scalaire nul et même norme ✓` : T`[verif] Même norme, angle $\pi$ ✓`,
        cas === 'rot90' ? T`[piege] $\ko{(y,-x)}$ correspond à $R_{-\pi/2}$, le sens indirect.` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
}

export const GABARITS_CH1: Gabarit[] = [
  angleVecteurs,
  produitScalaire,
  orthoParam,
  projection,
  vfScalaire,
  composantes,
  baseEspace,
  colineaireParam,
  produitVectoriel,
  aire,
  colineairesVectoriel,
  vfVectoriel,
  droiteCartesienne,
  paramVersCart,
  appartientParam,
  planCartesien,
  normalPlan,
  cercleEquation,
  cercleCentre,
  surCercle,
  symetrieProjection,
  transformations,
]
