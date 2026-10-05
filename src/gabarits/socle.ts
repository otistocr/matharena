/**
 * Le Socle — les bases de calcul du lycée indispensables en L1 (cours perso « LE SOCLE », vérifié).
 * Fractions, puissances, racines, calcul littéral, pourcentages, équations, second degré,
 * inéquations, valeur absolue, exp/ln, limites, dérivation, fonctions.
 */
import type { Gabarit } from './types'
import { Frac, Rng, lin, linAscii, par, pgcdListe, racineParts, verifier, proche } from './outils'
import { c as cplx, evaluate, parse, type C } from '../lib/mathexpr'

const T = String.raw
const X2 = ['x^2', 'x', '']
const X3 = ['x^3', 'x^2', 'x', '']
const REF = 'cours perso « LE SOCLE »'

const ppcm = (a: number, b: number) => Math.abs(a * b) / pgcdListe([a, b])
const f = (n: number, d = 1) => new Frac(n, d)
const inf = T`+\infty`
const minf = T`-\infty`
/** Intervalle LaTeX. */
const iv = (a: string, b: string, ferméG: boolean, ferméD: boolean) =>
  `${ferméG ? '\\left[' : '\\left]'}${a},\\ ${b}${ferméD ? '\\right]' : '\\right['}`
const choixQcm = (r: Rng, bon: string, leurres: string[], n = 3) => {
  const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((l) => l !== bon)).slice(0, n)])
  return { choix, reponse: choix.indexOf(bon) }
}
/** Évalue une expression (syntaxe calculatrice) en x réel. */
const evalX = (expr: string, x: number, v = 'x') => (evaluate(parse(expr), { [v]: cplx(x) }) as C).re

// =====================================================================================
// s1 — Fractions
// =====================================================================================

const DENOMS = [2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 18, 20]

const fracSomme: Gabarit = {
  id: 'sc-frac-somme',
  chapitre: 'socle',
  section: 'socle.s1',
  niveau: 1,
  titre: 'Somme de fractions (dénominateur commun)',
  source: `${REF}, ch. 1`,
  refCours: `${REF}, ch. 1 Fractions`,
  generer(r) {
    let b: number, d: number
    do {
      b = r.pick(DENOMS)
      d = r.pick(DENOMS)
    } while (b === d)
    const a = r.nz(-9, 9)
    const c = r.nz(1, 9)
    const s = r.pick([1, -1])
    const m = ppcm(b, d)
    const res = f(a, b).add(f(s * c, d))
    const [A, Cc] = [(a * m) / b, (c * m) / d]
    return {
      type: 'num',
      enonce: T`Calculer $\dfrac{${a}}{${b}}${s > 0 ? '+' : '-'}\dfrac{${c}}{${d}}$ (fraction irréductible).`,
      reponse: res.ascii(),
      explication: [
        T`[cours] On n'additionne que des parts de **même taille** : $\cours{\frac ab+\frac cd=\frac{ad+bc}{bd}}$, et mieux, on prend le **plus petit** dénominateur commun (PPCM).`,
        T`[calcul] PPCM$(${b},${d})=\cle{${m}}$ : $$\frac{${a}}{${b}}${s > 0 ? '+' : '-'}\frac{${c}}{${d}}=\frac{${A}}{${m}}${s > 0 ? '+' : '-'}\frac{${Cc}}{${m}}=\frac{${A + s * Cc}}{${m}}$$`,
        T`[resultat] $\ok{${res.tex()}}$${res.d !== m ? ' (après simplification)' : ''}`,
        T`[piege] $\ko{\frac{a}{b}+\frac{c}{d}=\frac{a+c}{b+d}}$ est faux : $\frac12+\frac12$ ferait $\frac24=\frac12$ au lieu de $1$.`,
      ].join('\n'),
    }
  },
}

const fracProduit: Gabarit = {
  id: 'sc-frac-produit',
  chapitre: 'socle',
  section: 'socle.s1',
  niveau: 1,
  titre: 'Produit et quotient de fractions',
  source: `${REF}, ch. 1`,
  refCours: `${REF}, ch. 1 Fractions`,
  generer(r) {
    const [a, b, c, d] = [r.nz(-9, 9), r.int(2, 12), r.int(1, 12), r.int(2, 12)]
    const div = r.bool()
    const res = div ? f(a, b).div(f(c, d)) : f(a, b).mul(f(c, d))
    return {
      type: 'num',
      enonce: div
        ? T`Calculer $\dfrac{\ \frac{${a}}{${b}}\ }{\ \frac{${c}}{${d}}\ }$ (fraction irréductible).`
        : T`Calculer $\dfrac{${a}}{${b}}\times\dfrac{${c}}{${d}}$ (fraction irréductible).`,
      reponse: res.ascii(),
      explication: [
        div
          ? T`[cours] **Diviser par une fraction, c'est multiplier par son inverse** : $\cours{\frac ab\div\frac cd=\frac ab\times\frac dc}$, car $\frac cd\times\frac dc=1$.`
          : T`[cours] $\cours{\frac ab\times\frac cd=\frac{ac}{bd}}$ : numérateurs entre eux, dénominateurs entre eux (pas de dénominateur commun !).`,
        div
          ? T`[calcul] $$\frac{${a}}{${b}}\times\frac{${d}}{${c}}=\frac{${a * d}}{${b * c}}$$`
          : T`[calcul] $$\frac{${a}\times${c}}{${b}\times${d}}=\frac{${a * c}}{${b * d}}$$`,
        T`[resultat] $\ok{${res.tex()}}$`,
        div ? T`[piege] Inverser la **mauvaise** fraction : c'est celle du **dénominateur** qu'on retourne.` : T`[piege] Simplifier avant de multiplier évite les gros nombres.`,
      ].join('\n'),
    }
  },
}

const fracSimplifier: Gabarit = {
  id: 'sc-frac-simplifier',
  chapitre: 'socle',
  section: 'socle.s1',
  niveau: 1,
  titre: 'Simplifier une fraction',
  source: `${REF}, ch. 1 (1.C)`,
  refCours: `${REF}, ch. 1 Fractions`,
  generer(r) {
    let p: number, q: number
    do {
      p = r.int(1, 15)
      q = r.int(2, 16)
    } while (pgcdListe([p, q]) !== 1 || p === q)
    const g = r.pick([6, 12, 14, 15, 18, 21, 24, 28, 35, 42])
    const res = f(p, q)
    return {
      type: 'num',
      enonce: T`Écrire $\dfrac{${p * g}}{${q * g}}$ sous forme irréductible.`,
      reponse: res.ascii(),
      explication: [
        T`[cours] On ne simplifie que par un **facteur commun** : $\cours{\frac{ka}{kb}=\frac ab}$. Le plus rapide : diviser par le PGCD.`,
        T`[calcul] PGCD$(${p * g},${q * g})=\cle{${g}}$ : $${p * g}=${g}\times${p}$ et $${q * g}=${g}\times${q}$.`,
        T`[resultat] $\ok{${res.tex()}}$`,
        T`[piege] On ne simplifie jamais des **termes** : $\ko{\frac{x+3}{3}=x+1}$ est faux (essayer $x=3$).`,
      ].join('\n'),
    }
  },
}

type Vf = { e: string; rep: boolean; ex: string[] }
const vfPioche = (id: string, section: string, titre: string, pioche: (r: Rng) => Vf[], refCours: string): Gabarit => ({
  id,
  chapitre: 'socle',
  section,
  niveau: 1,
  titre,
  source: REF,
  refCours,
  generer(r) {
    const c = r.pick(pioche(r))
    return { type: 'vf', enonce: c.e, reponse: c.rep, explication: c.ex.join('\n') }
  },
})

const fracVf = vfPioche(
  'sc-frac-vf',
  'socle.s1',
  'Vrai / faux : pièges des fractions',
  (r) => {
    const [a, b, c] = [r.int(2, 9), r.int(2, 9), r.int(2, 9)]
    const x = r.pick(['x', 't', 'a'])
    return [
      { e: T`$\dfrac{${a}}{${b}+${c}}=\dfrac{${a}}{${b}}+\dfrac{${a}}{${c}}$`, rep: false, ex: [T`[cours] La barre de fraction ne se distribue **que depuis le numérateur** : $\cours{\frac{b+c}{a}=\frac ba+\frac ca}$, jamais l'inverse.`, T`[calcul] $\frac{${a}}{${b + c}}\approx${(a / (b + c)).toFixed(2)}$ mais $\frac{${a}}{${b}}+\frac{${a}}{${c}}\approx${(a / b + a / c).toFixed(2)}$.`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`$\dfrac{${b}+${c}}{${a}}=\dfrac{${b}}{${a}}+\dfrac{${c}}{${a}}$`, rep: true, ex: [T`[cours] $\cours{\frac{b+c}{a}=\frac ba+\frac ca}$ : c'est la distributivité de la multiplication par $\frac1a$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`Pour tout $${x}\neq0$ : $\dfrac{${x}+${a}}{${a}}=${x}+1$.`, rep: false, ex: [T`[cours] On ne simplifie que des **facteurs**, jamais des **termes**.`, T`[calcul] Avec $${x}=${a}$ : $\frac{${2 * a}}{${a}}=2$ mais $${a}+1=${a + 1}$.`, T`[resultat] $\ok{\text{FAUX}}$ : la bonne écriture est $\frac{${x}}{${a}}+1$.`] },
      { e: T`$\dfrac{${a}${x}}{${a}}=${x}$`, rep: true, ex: [T`[cours] Ici $${a}$ est un **facteur** du numérateur : on peut simplifier.`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`$\dfrac{\frac{${a}}{${b}}}{${c}}=\dfrac{${a}${c}}{${b}}$`, rep: false, ex: [T`[cours] Repérer QUI est le dénominateur principal : $\cours{\frac{a/b}{c}=\frac{a}{bc}}$ alors que $\frac{a}{b/c}=\frac{ac}{b}$.`, T`[resultat] $\ok{\text{FAUX}}$ : $\frac{${a}/${b}}{${c}}=\frac{${a}}{${b * c}}$.`] },
      { e: T`$-\dfrac{${a}}{${b}}=\dfrac{-${a}}{${b}}=\dfrac{${a}}{-${b}}$`, rep: true, ex: [T`[cours] Le signe « $-$ » peut se placer n'importe où **une seule fois** : $\cours{-\frac ab=\frac{-a}b=\frac a{-b}}$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
    ]
  },
  `${REF}, ch. 1 Fractions`,
)

// =====================================================================================
// s2 — Puissances
// =====================================================================================

const puissancesBase: Gabarit = {
  id: 'sc-puiss-base',
  chapitre: 'socle',
  section: 'socle.s2',
  niveau: 1,
  titre: 'Règles des puissances (tout en base 2 ou 3)',
  source: `${REF}, ch. 2 (2.A)`,
  refCours: `${REF}, ch. 2 Puissances et racines`,
  generer(r) {
    const base = r.pick([2, 3])
    const pw = base === 2 ? [2, 4, 8, 16] : [3, 9, 27]
    const [b1, b2, b3] = [r.pick(pw), r.pick(pw), r.pick(pw)]
    const [m, n, p] = [r.int(2, 5), r.int(2, 4), r.int(2, 4)]
    const e = (b: number) => Math.round(Math.log(b) / Math.log(base))
    const k = e(b1) * m + e(b2) * n - e(b3) * p
    return {
      type: 'num',
      enonce: T`Écrire $\dfrac{${b1}^{${m}}\times${b2}^{${n}}}{${b3}^{${p}}}$ sous la forme $${base}^k$. Donner $k$.`,
      reponse: k,
      explication: [
        T`[cours] $\cours{a^ma^n=a^{m+n}}$, $\cours{\frac{a^m}{a^n}=a^{m-n}}$, $\cours{(a^m)^n=a^{mn}}$ : on écrit tout dans la **même base**.`,
        T`[calcul] $${b1}=${base}^{${e(b1)}}$, $${b2}=${base}^{${e(b2)}}$, $${b3}=${base}^{${e(b3)}}$ : $$\frac{${base}^{${e(b1) * m}}\times${base}^{${e(b2) * n}}}{${base}^{${e(b3) * p}}}=${base}^{${e(b1) * m}+${e(b2) * n}-${e(b3) * p}}$$`,
        T`[resultat] $\ok{k=${k}}$`,
        T`[piege] $(${base}^{a})^{b}=${base}^{ab}$ : on **multiplie** les exposants ici (et on ne les additionne pas).`,
      ].join('\n'),
    }
  },
}

const puissancesLettres: Gabarit = {
  id: 'sc-puiss-lettres',
  chapitre: 'socle',
  section: 'socle.s2',
  niveau: 1,
  titre: 'Puissances avec des lettres, exposants négatifs',
  source: `${REF}, ch. 2 (2.B)`,
  refCours: `${REF}, ch. 2 Puissances et racines`,
  generer(r) {
    const [a, b] = r.pick([
      ['a', 'b'],
      ['x', 'y'],
      ['p', 'q'],
    ])
    const [m, n, p, q] = [r.int(-3, 5), r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)]
    const e = (x: number) => (x < 0 ? `{${x}}` : String(x))
    return {
      type: 'num',
      enonce: T`Pour $${a},${b}>0$, on écrit $\dfrac{${a}^{${m}}\,${b}^{${n}}}{${a}^{${p}}\,${b}^{${q}}}=${a}^{\alpha}\,${b}^{\beta}$. Donner $(\alpha,\beta)$.`,
      reponse: `(${m - p},${n - q})`,
      explication: [
        T`[cours] $\cours{\frac{a^m}{a^p}=a^{m-p}}$ (vrai aussi avec des exposants négatifs : $a^{-k}=\frac{1}{a^k}$).`,
        T`[calcul] $\alpha=${m}-${par(p)}=\cle{${m - p}}$ et $\beta=${n}-${par(q)}=\cle{${n - q}}$.`,
        T`[resultat] $\ok{${a}^{${e(m - p)}}\,${b}^{${e(n - q)}}}$`,
        T`[piege] Soustraire un exposant **négatif** : $m-(-3)=m+3$.`,
      ].join('\n'),
    }
  },
}

const puissVf = vfPioche(
  'sc-puiss-vf',
  'socle.s2',
  'Vrai / faux : pièges des puissances',
  (r) => {
    const n = r.int(2, 5)
    const a = r.int(2, 5)
    return [
      { e: T`$-${a}^2=${a * a}$`, rep: false, ex: [T`[cours] La puissance est **prioritaire** sur le signe : $\cours{-a^2=-(a^2)}$.`, T`[calcul] $-${a}^2=-${a * a}$ alors que $(-${a})^2=${a * a}$.`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`$(2^{${n}})^2=2^{(${n}^2)}$`, rep: false, ex: [T`[cours] $\cours{(a^m)^n=a^{mn}}$, alors que $a^{(m^n)}$ est tout autre chose.`, T`[calcul] $(2^{${n}})^2=2^{${2 * n}}$ mais $2^{(${n}^2)}=2^{${n * n}}$.`, T`[resultat] $\ok{\text{FAUX}}$ ${n === 2 ? '(coïncidence pour n = 2 seulement !)' : ''}`] },
      { e: T`Pour tout entier $n$ : $2^{n+1}=2\times2^n$.`, rep: true, ex: [T`[cours] $\cours{a^{n+1}=a^n\times a}$.`, T`[resultat] $\ok{\text{VRAI}}$, et surtout pas $2^n+2$.`] },
      { e: T`$${a}^{0}=0$`, rep: false, ex: [T`[cours] Pour $a\neq0$ : $\cours{a^0=1}$ (produit vide), pour que $a^m\times a^0=a^{m+0}$ reste vrai.`, T`[resultat] $\ok{\text{FAUX}}$ : $${a}^0=1$.`] },
      { e: T`$2^{${n}}+2^{${n}}=2^{${n + 1}}$`, rep: true, ex: [T`[cours] $\cours{2^n+2^n=2\times2^n=2^{n+1}}$.`, T`[resultat] $\ok{\text{VRAI}}$ (mais attention : $2^n+2^m\neq2^{n+m}$ en général).`] },
      { e: T`$${a}^{-2}=-${a * a}$`, rep: false, ex: [T`[cours] $\cours{a^{-n}=\frac1{a^n}}$ : un exposant négatif donne un **inverse**, pas un nombre négatif.`, T`[resultat] $\ok{\text{FAUX}}$ : $${a}^{-2}=\frac1{${a * a}}$.`] },
      { e: T`$(${a}\times3)^2=${a}^2\times3^2$`, rep: true, ex: [T`[cours] $\cours{(ab)^m=a^mb^m}$ : la puissance traverse un **produit**…`, T`[resultat] $\ok{\text{VRAI}}$ … mais pas une somme : $(a+b)^2\neq a^2+b^2$.`] },
    ]
  },
  `${REF}, ch. 2 Puissances et racines`,
)

// =====================================================================================
// s3 — Racines carrées
// =====================================================================================

const racineSimplifier: Gabarit = {
  id: 'sc-rac-simplifier',
  chapitre: 'socle',
  section: 'socle.s3',
  niveau: 1,
  titre: 'Simplifier √n en a√b',
  source: `${REF}, ch. 2`,
  refCours: `${REF}, ch. 2 Puissances et racines`,
  generer(r) {
    const m = r.pick([2, 3, 5, 6, 7, 10, 11])
    const k = r.int(2, 9)
    const N = k * k * m
    const [kk, mm] = racineParts(N)
    verifier(kk === k && mm === m, 'racine')
    return {
      type: 'num',
      enonce: T`Écrire $\sqrt{${N}}$ sous la forme $a\sqrt b$ avec $b$ entier le plus petit possible. Donner $(a,b)$.`,
      reponse: `(${k},${m})`,
      explication: [
        T`[cours] Pour $a,b\ge0$ : $\cours{\sqrt{ab}=\sqrt a\,\sqrt b}$. On fait sortir le **plus grand carré parfait**.`,
        T`[calcul] $${N}=${k * k}\times${m}$ et $${k * k}=${k}^2$ : $$\sqrt{${N}}=\sqrt{${k * k}}\times\sqrt{${m}}=${k}\sqrt{${m}}$$`,
        T`[resultat] $\ok{\sqrt{${N}}=${k}\sqrt{${m}}}$, donc $(a,b)=(${k},${m})$.`,
        T`[piege] S'arrêter trop tôt, par exemple $\sqrt{${N}}=\sqrt{4}\sqrt{${N / 4}}$ quand $${N / 4}$ contient encore un carré.`,
      ].join('\n'),
    }
  },
}

const racineSomme: Gabarit = {
  id: 'sc-rac-somme',
  chapitre: 'socle',
  section: 'socle.s3',
  niveau: 1,
  titre: 'Somme de racines (réduire à k√m)',
  source: `${REF}, ch. 2 (2.C)`,
  refCours: `${REF}, ch. 2 Puissances et racines`,
  generer(r) {
    const m = r.pick([2, 3, 5, 7])
    const ks = [r.int(1, 6), r.int(1, 6), r.int(1, 6)]
    const sg = [1, r.pick([1, -1]), r.pick([1, -1])]
    const k = ks.reduce((s, x, i) => s + sg[i] * x, 0)
    const termes = ks.map((x, i) => `${i === 0 ? '' : sg[i] > 0 ? '+' : '-'}\\sqrt{${x * x * m}}`).join('')
    return {
      type: 'num',
      enonce: T`Écrire $${termes}$ sous la forme $k\sqrt{${m}}$. Donner $k$.`,
      reponse: k,
      explication: [
        T`[cours] $\cours{\sqrt{a^2b}=a\sqrt b}$ pour $a,b\ge0$ : on ramène chaque racine à $\sqrt{${m}}$, puis on additionne comme des « paquets de $\sqrt{${m}}$ ».`,
        T`[calcul] $$${ks.map((x) => `\\sqrt{${x * x * m}}=${x === 1 ? '' : x}\\sqrt{${m}}`).join(',\\quad ')}$$`,
        T`$$${ks.map((x, i) => `${i === 0 ? '' : sg[i] > 0 ? '+' : '-'}${x === 1 ? '' : x}\\sqrt{${m}}`).join('')}=${k}\sqrt{${m}}$$`,
        T`[resultat] $\ok{k=${k}}$`,
        T`[piege] $\ko{\sqrt a+\sqrt b=\sqrt{a+b}}$ : la racine ne traverse pas une somme.`,
      ].join('\n'),
    }
  },
}

const racineConjugue: Gabarit = {
  id: 'sc-rac-conjugue',
  chapitre: 'socle',
  section: 'socle.s3',
  niveau: 2,
  titre: 'Rendre un dénominateur rationnel',
  source: `${REF}, ch. 2 (2.D)`,
  refCours: `${REF}, ch. 2 Puissances et racines`,
  generer(r) {
    let b: number, c: number
    do {
      b = r.pick([2, 3, 5, 6, 7, 10])
      c = r.int(1, 4)
    } while (b === c * c)
    const a = r.int(1, 9)
    const s = r.pick([1, -1]) // √b − c (s=-1) ou √b + c (s=1)
    const A = a === 1 ? '' : String(a)
    const den = b - c * c
    const conj = s < 0 ? '+' : '-'
    const bon = T`$\dfrac{${A}(\sqrt{${b}}${conj}${c})}{${den}}$`
    const leurres = [
      T`$\dfrac{${A}(\sqrt{${b}}${s < 0 ? '-' : '+'}${c})}{${den}}$`,
      T`$\dfrac{${A}(\sqrt{${b}}${conj}${c})}{${-den}}$`,
      T`$\dfrac{${A}(\sqrt{${b}}${conj}${c})}{${b + c * c}}$`,
      T`$\dfrac{\sqrt{${b}}${conj}${c}}{${den}}$`,
      T`$\dfrac{${A}(\sqrt{${b}}${conj}${c})}{${b - c}}$`,
    ]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    const val = a / (Math.sqrt(b) + s * c)
    verifier(proche(val, (a * (Math.sqrt(b) - s * c)) / den), 'conjugué')
    return {
      type: 'qcm',
      enonce: T`$\dfrac{${a}}{\sqrt{${b}}${s < 0 ? '-' : '+'}${c}}=$`,
      choix,
      reponse,
      explication: [
        T`[cours] On multiplie en haut et en bas par la **quantité conjuguée**, grâce à $\cours{(a-b)(a+b)=a^2-b^2}$ qui fait disparaître la racine.`,
        T`[calcul] $$\frac{${a}}{\sqrt{${b}}${s < 0 ? '-' : '+'}${c}}\times\frac{\sqrt{${b}}${conj}${c}}{\sqrt{${b}}${conj}${c}}=\frac{${A}(\sqrt{${b}}${conj}${c})}{(\sqrt{${b}})^2-${c}^2}=\frac{${A}(\sqrt{${b}}${conj}${c})}{${den}}$$`,
        T`[resultat] ${bon.replace(/^\$/, '$\\ok{').replace(/\$$/, '}$')}`,
        T`[piege] Au dénominateur : $(\sqrt{${b}})^2-${c}^2=${b}-${c * c}$, et non $${b}-${c}$. Et ne pas oublier de multiplier le **numérateur** aussi.`,
      ].join('\n'),
    }
  },
}

const racineVf = vfPioche(
  'sc-rac-vf',
  'socle.s3',
  'Vrai / faux : racines carrées',
  (r) => {
    const [a, b] = [r.pick([9, 16, 25, 36]), r.pick([9, 16, 49, 64])]
    const x = r.pick(['x', 'a', 't'])
    return [
      { e: T`$\sqrt{${a}+${b}}=\sqrt{${a}}+\sqrt{${b}}$`, rep: false, ex: [T`[cours] La racine traverse les **produits** ($\sqrt{ab}=\sqrt a\sqrt b$), jamais les **sommes**.`, T`[calcul] $\sqrt{${a + b}}\approx${Math.sqrt(a + b).toFixed(2)}$ alors que $${Math.sqrt(a)}+${Math.sqrt(b)}=${Math.sqrt(a) + Math.sqrt(b)}$.`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`Pour tout réel $${x}$ : $\sqrt{${x}^2}=${x}$.`, rep: false, ex: [T`[cours] $\cours{\sqrt{${x}^2}=|${x}|}$ : une racine carrée est toujours **positive**.`, T`[calcul] Avec $${x}=-3$ : $\sqrt{9}=3=|-3|\neq-3$.`, T`[resultat] $\ok{\text{FAUX}}$ (vrai seulement si $${x}\ge0$).`] },
      { e: T`$\sqrt{${a}\times${b}}=\sqrt{${a}}\times\sqrt{${b}}$`, rep: true, ex: [T`[cours] Pour $a,b\ge0$ : $\cours{\sqrt{ab}=\sqrt a\sqrt b}$.`, T`[resultat] $\ok{\text{VRAI}}$ : $\sqrt{${a * b}}=${Math.sqrt(a * b)}=${Math.sqrt(a)}\times${Math.sqrt(b)}$.`] },
      { e: T`Pour tout $${x}\ge0$ : $(\sqrt{${x}})^2=${x}$.`, rep: true, ex: [T`[cours] Par définition, $\sqrt{${x}}$ est le nombre positif dont le carré vaut $${x}$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`$(\sqrt{2}+\sqrt{3})^2=5$`, rep: false, ex: [T`[cours] Identité remarquable : $\cours{(a+b)^2=a^2+2ab+b^2}$ : le double produit n'est pas optionnel.`, T`[calcul] $(\sqrt2+\sqrt3)^2=2+2\sqrt6+3=5+2\sqrt6$`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`$\sqrt{\dfrac{${a}}{${b}}}=\dfrac{${Math.sqrt(a)}}{${Math.sqrt(b)}}$`, rep: true, ex: [T`[cours] Pour $a\ge0$, $b>0$ : $\cours{\sqrt{\frac ab}=\frac{\sqrt a}{\sqrt b}}$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
    ]
  },
  `${REF}, ch. 2 Puissances et racines`,
)

// =====================================================================================
// s4 — Développer, factoriser
// =====================================================================================

/** Coefficients [x², x, 1] de (ax+b)(cx+d). */
const produit = (a: number, b: number, c: number, d: number) => [a * c, a * d + b * c, b * d]
const lx = (a: number, b: number) => lin([a, b], ['x', ''])

const developper: Gabarit = {
  id: 'sc-developper',
  chapitre: 'socle',
  section: 'socle.s4',
  niveau: 1,
  titre: 'Développer et réduire',
  source: `${REF}, ch. 3 (3.A)`,
  refCours: `${REF}, ch. 3 Calcul littéral`,
  generer(r) {
    const cas = r.pick(['produit', 'carre', 'difference'] as const)
    const [a, b, c, d] = [r.nz(-4, 5), r.nz(-6, 6), r.nz(-4, 5), r.nz(-6, 6)]
    let enonce: string, coefs: number[], etapes: string[]
    if (cas === 'produit') {
      coefs = produit(a, b, c, d)
      enonce = T`(${lx(a, b)})(${lx(c, d)})`
      etapes = [T`$$(${lx(a, b)})(${lx(c, d)})=${lin([a * c], ['x^2'])}${a * d >= 0 ? '+' : ''}${a * d}x${b * c >= 0 ? '+' : ''}${b * c}x${b * d >= 0 ? '+' : ''}${b * d}$$`]
    } else if (cas === 'carre') {
      coefs = produit(a, b, a, b)
      enonce = T`(${lx(a, b)})^2`
      etapes = [T`$$(${lx(a, b)})^2=(${lin([a], ['x'])})^2+2\times(${lin([a], ['x'])})\times${par(b)}+${par(b)}^2$$`]
    } else {
      const [e, g] = [r.nz(-3, 3), r.nz(-5, 5)]
      const p1 = produit(a, b, a, b)
      const p2 = produit(c, d, e, g)
      coefs = p1.map((x, i) => x - p2[i])
      enonce = T`(${lx(a, b)})^2-(${lx(c, d)})(${lx(e, g)})`
      etapes = [T`$$(${lx(a, b)})^2=${lin(p1, X2)}\qquad(${lx(c, d)})(${lx(e, g)})=${lin(p2, X2)}$$`, T`On soustrait **tout** le second produit (parenthèses !).`]
    }
    return {
      type: 'court',
      enonce: T`Développer et réduire $${enonce}$.`,
      reponse: [linAscii(coefs, X2)],
      variables: ['x'],
      mode: 'expression',
      forme: 'developpee',
      format: 'forme ax² + bx + c',
      explication: [
        T`[cours] **Double distributivité** : $\cours{(a+b)(c+d)=ac+ad+bc+bd}$. **Identités** : $\cours{(a+b)^2=a^2+2ab+b^2}$, $\cours{(a-b)^2=a^2-2ab+b^2}$.`,
        T`[calcul]`,
        ...etapes,
        T`[resultat] $\ok{${lin(coefs, X2)}}$`,
        T`[verif] En $x=1$ : l'expression de départ et le résultat valent tous deux $${coefs.reduce((s, v) => s + v, 0)}$ ✓`,
        cas === 'carre' ? T`[piege] $\ko{(a+b)^2=a^2+b^2}$ : l'erreur la plus fréquente, il manque le double produit $2ab$.` : T`[piege] Un « $-$ » devant une parenthèse change **tous** les signes à l'intérieur.`,
      ].join('\n'),
    }
  },
}

const factoriser: Gabarit = {
  id: 'sc-factoriser',
  chapitre: 'socle',
  section: 'socle.s4',
  niveau: 1,
  titre: 'Factoriser',
  source: `${REF}, ch. 3 (3.B, 3.C)`,
  refCours: `${REF}, ch. 3 Calcul littéral`,
  generer(r) {
    const cas = r.pick(['difference', 'carre', 'commun', 'racines'] as const)
    let coefs: number[], rep: string, repTex: string, methode: string
    if (cas === 'difference') {
      const [k, m] = [r.int(1, 5), r.int(1, 9)]
      coefs = [k * k, 0, -m * m]
      rep = `(${k}x-${m})(${k}x+${m})`
      repTex = `(${lx(k, -m)})(${lx(k, m)})`
      methode = T`Identité **$a^2-b^2=(a-b)(a+b)$** avec $a=${k === 1 ? '' : k}x$ et $b=${m}$.`
    } else if (cas === 'carre') {
      const [k, m] = [r.int(1, 3), r.nz(-6, 6)]
      coefs = produit(k, m, k, m)
      rep = `(${k}x+(${m}))^2`
      repTex = `(${lx(k, m)})^2`
      methode = T`On reconnaît **$(a${m > 0 ? '+' : '-'}b)^2=a^2${m > 0 ? '+' : '-'}2ab+b^2$** : $${coefs[0]}x^2=(${k === 1 ? '' : k}x)^2$, $${coefs[2]}=${Math.abs(m)}^2$ et $2\times${k === 1 ? '' : k}x\times${Math.abs(m)}=${Math.abs(coefs[1])}x$.`
    } else if (cas === 'commun') {
      const [k, a, b] = [r.int(1, 5), r.nz(-5, 5), r.nz(-7, 7)]
      coefs = [k * a, k * b, 0]
      rep = `${k}x(${a}x+(${b}))`
      repTex = `${k === 1 ? '' : k}x(${lx(a, b)})`
      methode = T`**Facteur commun d'abord, toujours** : $${k === 1 ? '' : k}x$ est dans les deux termes.`
    } else {
      let r1: number, r2: number
      do {
        r1 = r.int(-6, 6)
        r2 = r.int(-6, 6)
      } while (r1 === r2 || r1 === 0 || r2 === 0)
      const a = r.pick([1, 1, 2, -1])
      coefs = [a, -a * (r1 + r2), a * r1 * r2]
      rep = `${a}(x-(${r1}))(x-(${r2}))`
      repTex = `${a === 1 ? '' : a === -1 ? '-' : a}(${lx(1, -r1)})(${lx(1, -r2)})`
      methode = T`Trinôme : $\Delta=${coefs[1] ** 2 - 4 * a * coefs[2]}$, racines $x_1=${Math.min(r1, r2)}$ et $x_2=${Math.max(r1, r2)}$, et **$ax^2+bx+c=a(x-x_1)(x-x_2)$**.`
    }
    return {
      type: 'court',
      enonce: T`Factoriser $${lin(coefs, X2)}$.`,
      reponse: [rep],
      variables: ['x'],
      mode: 'expression',
      forme: 'factorisee',
      format: 'un produit de facteurs',
      explication: [
        T`[cours] Les trois gestes, **dans l'ordre** : (1) facteur commun ; (2) identité remarquable ; (3) regroupement, ou racines du trinôme.`,
        T`[methode] ${methode}`,
        T`[resultat] $\ok{${lin(coefs, X2)}=${repTex}}$`,
        T`[verif] Redévelopper doit redonner l'expression de départ ✓`,
        T`[piege] Une forme factorisée est un **produit** : $x(x+1)+2$ n'est pas factorisée.`,
      ].join('\n'),
    }
  },
}

const identitesQcm: Gabarit = {
  id: 'sc-identites',
  chapitre: 'socle',
  section: 'socle.s4',
  niveau: 1,
  titre: 'Identités remarquables',
  source: `${REF}, ch. 3`,
  refCours: `${REF}, ch. 3 Calcul littéral`,
  generer(r) {
    const [a, b] = r.pick([
      ['a', 'b'],
      ['x', 'y'],
      ['u', 'v'],
    ])
    const pioche: { q: string; bon: string; faux: string[] }[] = [
      { q: T`(${a}+${b})^2`, bon: T`${a}^2+2${a}${b}+${b}^2`, faux: [T`${a}^2+${b}^2`, T`${a}^2+${a}${b}+${b}^2`, T`2${a}+2${b}`] },
      { q: T`(${a}-${b})^2`, bon: T`${a}^2-2${a}${b}+${b}^2`, faux: [T`${a}^2-${b}^2`, T`${a}^2+2${a}${b}-${b}^2`, T`${a}^2-2${a}${b}-${b}^2`] },
      { q: T`${a}^2-${b}^2`, bon: T`(${a}-${b})(${a}+${b})`, faux: [T`(${a}-${b})^2`, T`(${a}+${b})^2`, T`(${a}-${b})(${b}-${a})`] },
      { q: T`${a}^3-${b}^3`, bon: T`(${a}-${b})(${a}^2+${a}${b}+${b}^2)`, faux: [T`(${a}-${b})^3`, T`(${a}-${b})(${a}^2-${a}${b}+${b}^2)`, T`(${a}-${b})(${a}+${b})^2`] },
      { q: T`(${a}+${b})^3`, bon: T`${a}^3+3${a}^2${b}+3${a}${b}^2+${b}^3`, faux: [T`${a}^3+${b}^3`, T`${a}^3+3${a}${b}+${b}^3`, T`${a}^3+2${a}^2${b}+2${a}${b}^2+${b}^3`] },
    ]
    const c = r.pick(pioche)
    const { choix, reponse } = choixQcm(r, `$${c.bon}$`, c.faux.map((x) => `$${x}$`))
    return {
      type: 'qcm',
      enonce: T`$${c.q}=$`,
      choix,
      reponse,
      explication: [
        T`[cours] $\cours{(a\pm b)^2=a^2\pm2ab+b^2}$, $\cours{a^2-b^2=(a-b)(a+b)}$, $\cours{a^3-b^3=(a-b)(a^2+ab+b^2)}$, $\cours{(a+b)^3=a^3+3a^2b+3ab^2+b^3}$.`,
        T`[resultat] $\ok{${c.q}=${c.bon}}$`,
        T`[verif] Tester avec $${a}=1$, $${b}=1$ (ou $2$ et $1$) élimine vite les mauvaises formules.`,
        T`[piege] $(a+b)^2\neq a^2+b^2$ : $(3+4)^2=49$ mais $9+16=25$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s5 — Pourcentages
// =====================================================================================

const pourcentages: Gabarit = {
  id: 'sc-pourcent',
  chapitre: 'socle',
  section: 'socle.s5',
  niveau: 1,
  titre: 'Pourcentages et évolutions',
  source: `${REF}, ch. 4`,
  refCours: `${REF}, ch. 4 Proportionnalité et pourcentages`,
  generer(r) {
    const cas = r.pick(['successives', 'reciproque', 'initiale', 'taux'] as const)
    const pc = (x: number) => x.toFixed(2).replace(/\.?0+$/, '').replace('.', ',')
    if (cas === 'successives') {
      const [t1, t2] = [r.pick([10, 20, 25, 30, 40, 50]), r.pick([-10, -20, -25, -30, 10, 20])]
      const g = ((1 + t1 / 100) * (1 + t2 / 100) - 1) * 100
      return {
        type: 'num',
        enonce: T`Un prix augmente de $${t1}\,\%$ puis ${t2 > 0 ? 'augmente' : 'baisse'} de $${Math.abs(t2)}\,\%$. Quelle est l'évolution globale, en % ? (négative si c'est une baisse)`,
        reponse: Number(g.toFixed(4)),
        tolerance: 0.01,
        unite: '%',
        explication: [
          T`[cours] Augmenter de $t\,\%$, c'est **multiplier** par $1+\frac{t}{100}$. Des évolutions successives se composent en **multipliant** les coefficients.`,
          T`[calcul] $$${pc(1 + t1 / 100)}\times${pc(1 + t2 / 100)}=${pc((1 + t1 / 100) * (1 + t2 / 100))}$$`,
          T`[resultat] Évolution globale : $\ok{${g > 0 ? '+' : ''}${pc(g)}\,\%}$`,
          T`[piege] Additionner les pourcentages : $\ko{${t1 + t2 > 0 ? '+' : ''}${t1 + t2}\,\%}$ est faux.`,
        ].join('\n'),
      }
    }
    if (cas === 'reciproque') {
      const t = r.pick([20, 25, 50, 60, 100])
      const g = (1 / (1 + t / 100) - 1) * 100
      return {
        type: 'num',
        enonce: T`Après une hausse de $${t}\,\%$, quelle évolution (en %) faut-il pour revenir au prix de départ ?`,
        reponse: Number(g.toFixed(4)),
        tolerance: 0.01,
        unite: '%',
        explication: [
          T`[cours] On cherche le coefficient $c$ tel que $\cours{${pc(1 + t / 100)}\times c=1}$.`,
          T`[calcul] $c=\dfrac{1}{${pc(1 + t / 100)}}\approx${pc(1 / (1 + t / 100))}$`,
          T`[resultat] $\ok{${pc(g)}\,\%}$`,
          T`[piege] Répondre $\ko{-${t}\,\%}$ : la baisse porte sur un prix **plus grand**, elle doit donc être plus petite en pourcentage.`,
        ].join('\n'),
      }
    }
    if (cas === 'initiale') {
      const t = r.pick([5, 10, 12, 20, 25, 40])
      const v0 = r.int(4, 40) * 25
      const v1 = (v0 * (100 + t)) / 100
      return {
        type: 'num',
        enonce: T`Après une hausse de $${t}\,\%$, un loyer vaut $${pc(v1)}$ €. Que valait-il avant ?`,
        reponse: v0,
        tolerance: 0.01,
        unite: '€',
        explication: [
          T`[cours] $V_1=V_0\times\left(1+\frac{t}{100}\right)$, donc $\cours{V_0=\frac{V_1}{1+t/100}}$.`,
          T`[calcul] $V_0=\dfrac{${pc(v1)}}{${pc(1 + t / 100)}}=${v0}$`,
          T`[resultat] $\ok{${v0}}$ €`,
          T`[piege] Retirer $${t}\,\%$ de $${pc(v1)}$ donne $\ko{${pc(v1 * (1 - t / 100))}}$ : faux, le pourcentage portait sur l'**ancien** prix.`,
        ].join('\n'),
      }
    }
    const a = r.int(4, 40) * 5
    const b = a + r.nz(-3, 6) * 5
    const g = ((b - a) / a) * 100
    return {
      type: 'num',
      enonce: T`Un prix passe de $${a}$ € à $${b}$ €. Quel est le taux d'évolution, en % ?`,
      reponse: Number(g.toFixed(4)),
      tolerance: 0.01,
      unite: '%',
      explication: [
        T`[cours] $\cours{\text{taux}=\frac{V_{\text{arrivée}}-V_{\text{départ}}}{V_{\text{départ}}}\times100}$`,
        T`[calcul] $\dfrac{${b}-${a}}{${a}}\times100=${pc(g)}$`,
        T`[resultat] $\ok{${g > 0 ? '+' : ''}${pc(g)}\,\%}$`,
        T`[piege] Diviser par la valeur d'**arrivée** au lieu de celle de départ.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s6 — Équations du premier degré, produit nul, systèmes
// =====================================================================================

const equationLineaire: Gabarit = {
  id: 'sc-eq-lineaire',
  chapitre: 'socle',
  section: 'socle.s6',
  niveau: 1,
  titre: 'Équation du premier degré',
  source: `${REF}, ch. 5`,
  refCours: `${REF}, ch. 5 Équations du premier degré`,
  generer(r) {
    let a: number, b: number, c: number, d: number
    do {
      ;[a, b, c, d] = [r.nz(-7, 7), r.int(-9, 9), r.nz(-7, 7), r.int(-9, 9)]
    } while (a === c)
    const x = f(d - b, a - c)
    return {
      type: 'num',
      enonce: T`Résoudre $${lx(a, b)}=${lx(c, d)}$.`,
      reponse: x.ascii(),
      explication: [
        T`[cours] On applique aux deux membres une opération **réversible** (ajouter, multiplier par un nombre **non nul**) : on se ramène à $\cours{ax=b}$, d'où $x=\frac ba$ si $a\neq0$.`,
        T`[calcul] $$${lx(a, b)}=${lx(c, d)}\iff ${lin([a], ['x'])}-${par(c)}x=${d}-${par(b)}\iff ${lin([a - c], ['x'])}=${d - b}$$`,
        T`[resultat] $\ok{x=${x.tex()}}$`,
        T`[verif] $${a}\times${par(x)}+${par(b)}=${x.mul(a).add(b).tex()}$ et $${c}\times${par(x)}+${par(d)}=${x.mul(c).add(d).tex()}$ ✓`,
        T`[piege] Changer de membre, c'est changer de **signe** : $${lx(c, 0)}$ passe à gauche en $${lx(-c, 0)}$.`,
      ].join('\n'),
    }
  },
}

const produitNul: Gabarit = {
  id: 'sc-produit-nul',
  chapitre: 'socle',
  section: 'socle.s6',
  niveau: 1,
  titre: 'Équation produit nul',
  source: `${REF}, ch. 5 (5.B)`,
  refCours: `${REF}, ch. 5 Équations du premier degré`,
  generer(r) {
    let a: number, b: number, c: number, d: number, x1: Frac, x2: Frac
    do {
      ;[a, b, c, d] = [r.nz(-5, 5), r.int(-9, 9), r.nz(-5, 5), r.int(-9, 9)]
      x1 = f(-b, a)
      x2 = f(-d, c)
    } while (x1.sub(x2).zero)
    const [p, q] = x1.valeur() < x2.valeur() ? [x1, x2] : [x2, x1]
    return {
      type: 'num',
      enonce: T`Résoudre $(${lx(a, b)})(${lx(c, d)})=0$. Donne les solutions **dans l'ordre croissant**, sous la forme $(x_1,x_2)$.`,
      reponse: `(${p.ascii()},${q.ascii()})`,
      explication: [
        T`[cours] **Produit nul** : $\cours{A\times B=0\iff A=0\ \text{ou}\ B=0}$. C'est LA raison d'être de la factorisation.`,
        T`[calcul] $${lx(a, b)}=0\iff x=${x1.tex()}$ ; $\quad${lx(c, d)}=0\iff x=${x2.tex()}$`,
        T`[resultat] $\ok{S=\left\{${p.tex()},\ ${q.tex()}\right\}}$`,
        T`[piege] Développer d'abord : on se retrouve avec un trinôme inutilement.`,
      ].join('\n'),
    }
  },
}

const systeme: Gabarit = {
  id: 'sc-systeme',
  chapitre: 'socle',
  section: 'socle.s6',
  niveau: 1,
  titre: 'Système 2×2',
  source: `${REF}, ch. 5 (5.D)`,
  refCours: `${REF}, ch. 5 Équations du premier degré`,
  generer(r) {
    const [x, y] = [r.int(-5, 5), r.int(-5, 5)]
    let a: number, b: number, c: number, d: number
    do {
      ;[a, b, c, d] = [r.nz(-4, 4), r.nz(-4, 4), r.nz(-4, 4), r.nz(-4, 4)]
    } while (a * d - b * c === 0)
    const [e, g] = [a * x + b * y, c * x + d * y]
    const [X, Y] = r.pick([
      ['x', 'y'],
      ['a', 'b'],
      ['u', 'v'],
    ])
    return {
      type: 'num',
      enonce: T`Résoudre $\begin{cases}${lin([a, b], [X, Y])}=${e}\\${lin([c, d], [X, Y])}=${g}\end{cases}$ Réponse sous la forme $(${X},${Y})$.`,
      reponse: `(${x},${y})`,
      explication: [
        T`[cours] **Combinaison** : on ajoute des multiples des lignes pour **éliminer** une inconnue (ou **substitution** : isoler une inconnue et la réinjecter).`,
        T`[calcul] $${c}L_1-${par(a)}L_2$ élimine $${X}$ : $$(${c}\times${par(b)}-${par(a)}\times${par(d)})${Y}=${c}\times${par(e)}-${par(a)}\times${par(g)}\iff ${b * c - a * d}${Y}=${c * e - a * g}\iff ${Y}=\cle{${y}}$$`,
        T`Puis dans $L_1$ : $${a}${X}+${par(b)}\times${par(y)}=${e}\iff ${X}=\cle{${x}}$`,
        T`[resultat] $\ok{(${X},${Y})=(${x},${y})}$`,
        T`[verif] $L_2$ : $${c}\times${par(x)}+${par(d)}\times${par(y)}=${g}$ ✓`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s7 — Second degré
// =====================================================================================

/** Trinôme a(x−r1)(x−r2) à coefficients entiers. */
function trinome(r: Rng, racinesDistinctes = true) {
  let r1: number, r2: number
  do {
    r1 = r.int(-6, 6)
    r2 = r.int(-6, 6)
  } while (racinesDistinctes && r1 === r2)
  const a = r.pick([1, 1, 2, -1, 3, -2])
  return { a, b: -a * (r1 + r2), c: a * r1 * r2, r1: Math.min(r1, r2), r2: Math.max(r1, r2) }
}

const racinesTrinome: Gabarit = {
  id: 'sc-racines',
  chapitre: 'socle',
  section: 'socle.s7',
  niveau: 1,
  titre: 'Racines d’un trinôme (discriminant)',
  source: `${REF}, ch. 6 (6.A)`,
  refCours: `${REF}, ch. 6 Second degré · poly Énoncé indispensable 18`,
  generer(r) {
    const { a, b, c, r1, r2 } = trinome(r)
    const D = b * b - 4 * a * c
    const sd = Math.sqrt(D)
    return {
      type: 'num',
      enonce: T`Résoudre $${lin([a, b, c], X2)}=0$. Solutions **dans l'ordre croissant**, sous la forme $(x_1,x_2)$.`,
      reponse: `(${r1},${r2})`,
      explication: [
        T`[cours] $\cours{\Delta=b^2-4ac}$. Si $\Delta>0$ : $\cours{x_{1,2}=\frac{-b\pm\sqrt\Delta}{2a}}$ (le $-b$ et le $2a$ **entiers**).`,
        T`[calcul] $$\Delta=${par(b)}^2-4\times${par(a)}\times${par(c)}=\cle{${D}}\quad\Rightarrow\quad\sqrt\Delta=${sd}$$`,
        T`$$x=\frac{${-b}\pm${sd}}{${2 * a}}\quad\Rightarrow\quad x_1=${r1},\ x_2=${r2}$$`,
        T`[resultat] $\ok{S=\{${r1},\ ${r2}\}}$`,
        T`[verif] Somme et produit : $x_1+x_2=${r1 + r2}=-\frac ba$ et $x_1x_2=${r1 * r2}=\frac ca$ ✓`,
        T`[piege] Diviser par $x$ pour « simplifier » fait perdre la solution $x=0$ : on **factorise** toujours.`,
      ].join('\n'),
    }
  },
}

const discriminant: Gabarit = {
  id: 'sc-discriminant',
  chapitre: 'socle',
  section: 'socle.s7',
  niveau: 1,
  titre: 'Discriminant et nombre de racines',
  source: `${REF}, ch. 6`,
  refCours: `${REF}, ch. 6 Second degré`,
  generer(r) {
    const a = r.nz(-4, 4)
    const b = r.int(-8, 8)
    const c = r.int(-9, 9)
    const D = b * b - 4 * a * c
    const nb = D > 0 ? '2 racines réelles distinctes' : D === 0 ? '1 racine réelle double' : 'aucune racine réelle'
    const { choix, reponse } = choixQcm(r, nb, ['2 racines réelles distinctes', '1 racine réelle double', 'aucune racine réelle', '3 racines réelles'], 3)
    return {
      type: 'qcm',
      enonce: T`Combien de racines réelles a $${lin([a, b, c], X2)}$ ?`,
      choix,
      reponse,
      explication: [
        T`[cours] **Tout découle de $\Delta=b^2-4ac$** : $\Delta>0$ deux racines, $\Delta=0$ une racine double $-\frac{b}{2a}$, $\Delta<0$ aucune racine réelle (deux complexes conjuguées).`,
        T`[calcul] $$\Delta=${par(b)}^2-4\times${par(a)}\times${par(c)}=${b * b}${-4 * a * c >= 0 ? '+' : ''}${-4 * a * c}=\cle{${D}}$$`,
        T`[resultat] $\Delta${D > 0 ? '>' : D === 0 ? '=' : '<'}0$ : $\ok{\text{${nb}}}$`,
        T`[piege] Le signe de $-4ac$ : si $a$ et $c$ sont de signes contraires, $\Delta>0$ forcément.`,
      ].join('\n'),
    }
  },
}

const sommet: Gabarit = {
  id: 'sc-canonique',
  chapitre: 'socle',
  section: 'socle.s7',
  niveau: 2,
  titre: 'Forme canonique, sommet de la parabole',
  source: `${REF}, ch. 6 (6.D)`,
  refCours: `${REF}, ch. 6 Second degré`,
  generer(r) {
    const a = r.pick([1, -1, 2, -2])
    const al = r.int(-5, 5)
    const be = r.int(-9, 9)
    const [b, c] = [-2 * a * al, a * al * al + be]
    return {
      type: 'num',
      enonce: T`Donner les coordonnées du sommet de la parabole $y=${lin([a, b, c], X2)}$, sous la forme $(x,y)$.`,
      reponse: `(${al},${be})`,
      explication: [
        T`[cours] **Forme canonique** : $\cours{ax^2+bx+c=a\left(x+\frac{b}{2a}\right)^2-\frac{\Delta}{4a}}$ ; le sommet est en $\cours{x=-\frac{b}{2a}}$.`,
        T`[calcul] $x_S=-\dfrac{${b}}{2\times${par(a)}}=\cle{${al}}$, puis $y_S=f(${al})=${a}\times${par(al)}^2+${par(b)}\times${par(al)}+${par(c)}=\cle{${be}}$`,
        T`[resultat] $\ok{S=(${al},\ ${be})}$ : la forme canonique est $${a === 1 ? '' : a === -1 ? '-' : a}(x${al > 0 ? '-' : '+'}${Math.abs(al)})^2${be >= 0 ? '+' : ''}${be}$.`,
        T`[piege] $x_S=-\frac{b}{2a}$ : ne pas oublier le signe « $-$ ».`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s8 — Inéquations, tableaux de signes
// =====================================================================================

const inequationLineaire: Gabarit = {
  id: 'sc-ineq-lineaire',
  chapitre: 'socle',
  section: 'socle.s8',
  niveau: 1,
  titre: 'Inéquation du premier degré',
  source: `${REF}, ch. 7 (7.A)`,
  refCours: `${REF}, ch. 7 Inéquations`,
  generer(r) {
    const a = r.nz(-6, 6)
    const b = r.int(-9, 9)
    const c = r.int(-9, 9)
    const op = r.pick(['<', '\\le', '>', '\\ge'] as const)
    const v = f(c - b, a)
    const strict = op === '<' || op === '>'
    const versPlus = (op === '>' || op === '\\ge') !== a < 0
    const bon = versPlus ? `$${iv(v.tex(), inf, !strict, false)}$` : `$${iv(minf, v.tex(), false, !strict)}$`
    const leurres = [
      versPlus ? `$${iv(minf, v.tex(), false, !strict)}$` : `$${iv(v.tex(), inf, !strict, false)}$`,
      versPlus ? `$${iv(v.tex(), inf, strict, false)}$` : `$${iv(minf, v.tex(), false, strict)}$`,
      `$${versPlus ? iv(v.neg().tex(), inf, !strict, false) : iv(minf, v.neg().tex(), false, !strict)}$`,
    ]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    const sensTex = { '<': '<', '\\le': '\\le', '>': '>', '\\ge': '\\ge' }
    const inverse = { '<': '>', '\\le': '\\ge', '>': '<', '\\ge': '\\le' }
    const opFinal = a < 0 ? inverse[op] : sensTex[op]
    return {
      type: 'qcm',
      enonce: T`Résoudre $${lx(a, b)}${op}${c}$.`,
      choix,
      reponse,
      explication: [
        T`[cours] Une inégalité se manipule comme une équation, **sauf** : $\cours{\text{multiplier ou diviser par un négatif renverse le sens}}$.`,
        T`[calcul] $${lx(a, 0)}${op}${c}-${par(b)}=${c - b}$, puis on divise par $${a}$${a < 0 ? ' (**négatif** : le sens change !)' : ''} : $x${opFinal}${v.tex()}$.`,
        T`[resultat] $\ok{S=}$ ${bon}`,
        T`[piege] ${a < 0 ? 'Oublier de retourner l’inégalité en divisant par un nombre négatif.' : 'Crochet ouvert pour une inégalité stricte, fermé pour une inégalité large.'}`,
      ].join('\n'),
    }
  },
}

const signeTrinome: Gabarit = {
  id: 'sc-signe-trinome',
  chapitre: 'socle',
  section: 'socle.s8',
  niveau: 2,
  titre: 'Signe d’un trinôme, inéquation du 2d degré',
  source: `${REF}, ch. 7 (7.B)`,
  refCours: `${REF}, ch. 6–7 Second degré, tableaux de signes`,
  generer(r) {
    const { a, b, c, r1, r2 } = trinome(r)
    const op = r.pick(['<', '\\le', '>', '\\ge'] as const)
    const strict = op === '<' || op === '>'
    const veutPositif = op === '>' || op === '\\ge'
    const interieurPositif = a < 0
    const interieur = `$${iv(String(r1), String(r2), !strict, !strict)}$`
    const exterieur = T`$${iv(minf, String(r1), false, !strict)}\cup${iv(String(r2), inf, !strict, false)}$`
    const bon = veutPositif === interieurPositif ? interieur : exterieur
    const autre = bon === interieur ? exterieur : interieur
    const leurres = [autre, `$${iv(String(r1), String(r2), strict, strict)}$`, T`$${iv(minf, String(r1), false, strict)}\cup${iv(String(r2), inf, strict, false)}$`, `$${iv(String(-r2), String(-r1), !strict, !strict)}$`]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    return {
      type: 'qcm',
      enonce: T`Résoudre $${lin([a, b, c], X2)}${op}0$.`,
      choix,
      reponse,
      explication: [
        T`[cours] Un trinôme est **du signe de $a$ à l'extérieur des racines** et du signe de $-a$ **entre** elles.`,
        T`[calcul] Racines : $x_1=${r1}$, $x_2=${r2}$ ($\Delta=${b * b - 4 * a * c}$). Ici $a=${a}${a > 0 ? '>' : '<'}0$ : le trinôme est **${interieurPositif ? 'positif' : 'négatif'} entre** les racines et ${interieurPositif ? 'négatif' : 'positif'} à l'extérieur.`,
        T`[resultat] $\ok{S=}$ ${bon}`,
        T`[piege] $x^2\le9$ ne donne pas « $x\le3$ » mais $-3\le x\le3$ : on étudie un **signe**, on ne « prend pas la racine ».`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s9 — Valeur absolue
// =====================================================================================

const absEquation: Gabarit = {
  id: 'sc-abs-eq',
  chapitre: 'socle',
  section: 'socle.s9',
  niveau: 1,
  titre: 'Équation avec valeur absolue',
  source: `${REF}, ch. 8 (8.A)`,
  refCours: `${REF}, ch. 8 Valeur absolue`,
  generer(r) {
    const a = r.int(-9, 9)
    const h = r.int(1, 9)
    const x = r.pick(['x', 't'])
    return {
      type: 'num',
      enonce: T`Résoudre $|${lin([1, -a], [x, ''])}|=${h}$. Solutions dans l'ordre croissant, sous la forme $(${x}_1,${x}_2)$.`,
      reponse: `(${a - h},${a + h})`,
      explication: [
        T`[cours] $|${x}-a|$ est la **distance** de $${x}$ à $a$ : $\cours{|${x}-a|=h\iff ${x}=a-h\ \text{ou}\ ${x}=a+h}$ (pour $h>0$).`,
        T`[calcul] Ici $a=${a}$ : les points à distance $${h}$ de $${a}$ sont $${a}-${h}$ et $${a}+${h}$.`,
        T`[resultat] $\ok{S=\{${a - h},\ ${a + h}\}}$`,
        T`[piege] $|${x}+3|$ s'écrit $|${x}-(-3)|$ : la distance est prise à $-3$, pas à $3$.`,
      ].join('\n'),
    }
  },
}

const absInequation: Gabarit = {
  id: 'sc-abs-ineq',
  chapitre: 'socle',
  section: 'socle.s9',
  niveau: 1,
  titre: 'Inéquation avec valeur absolue',
  source: `${REF}, ch. 8 (8.B, 8.C)`,
  refCours: `${REF}, ch. 8 Valeur absolue`,
  generer(r) {
    const a = r.int(-8, 8)
    const h = r.int(1, 7)
    const op = r.pick(['<', '\\le', '>', '\\ge'] as const)
    const strict = op === '<' || op === '>'
    const dedans = op === '<' || op === '\\le'
    const [g, d] = [String(a - h), String(a + h)]
    const seg = `$${iv(g, d, !strict, !strict)}$`
    const ext = T`$${iv(minf, g, false, !strict)}\cup${iv(d, inf, !strict, false)}$`
    const bon = dedans ? seg : ext
    const leurres = [dedans ? ext : seg, `$${iv(String(-a - h), String(-a + h), !strict, !strict)}$`, `$${iv(g, d, strict, strict)}$`, `$${iv(minf, d, false, !strict)}$`]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    return {
      type: 'qcm',
      enonce: T`Résoudre $|${lin([1, -a], ['x', ''])}|${op}${h}$.`,
      choix,
      reponse,
      explication: [
        T`[cours] **Lire avant de calculer** : $\cours{|x-a|\le h\iff a-h\le x\le a+h}$ (dans le segment centré en $a$ de rayon $h$) ; $\cours{|x-a|\ge h}$ : **hors** de ce segment.`,
        T`[calcul] Centre $a=${a}$, rayon $h=${h}$ : segment $[${g},\ ${d}]$. On veut être ${dedans ? '**dedans**' : '**dehors**'}.`,
        T`[resultat] $\ok{S=}$ ${bon}`,
        T`[piege] Le signe dans la valeur absolue : $|x${a >= 0 ? '-' : '+'}${Math.abs(a)}|$ est centré en $${a}$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s10 — Exponentielle et logarithme
// =====================================================================================

const lnSimplifier: Gabarit = {
  id: 'sc-ln',
  chapitre: 'socle',
  section: 'socle.s10',
  niveau: 1,
  titre: 'Règles du logarithme',
  source: `${REF}, ch. 10 (10.A)`,
  refCours: `${REF}, ch. 10 · poly §4.5.2`,
  generer(r) {
    const [a, b] = [r.int(2, 12), r.int(2, 9)]
    let c: number
    do c = r.int(2, 12)
    while ((a * b) % c !== 0 || (a * b) / c === 1)
    const k = (a * b) / c
    return {
      type: 'num',
      enonce: T`Écrire $\ln ${a}+\ln ${b}-\ln ${c}$ sous la forme $\ln k$. Donner $k$.`,
      reponse: k,
      explication: [
        T`[cours] Pour $a,b>0$ : $\cours{\ln(ab)=\ln a+\ln b}$ et $\cours{\ln\frac ab=\ln a-\ln b}$ : le ln transforme les **produits en sommes**.`,
        T`[calcul] $$\ln ${a}+\ln ${b}-\ln ${c}=\ln\frac{${a}\times${b}}{${c}}=\ln\frac{${a * b}}{${c}}$$`,
        T`[resultat] $\ok{k=${k}}$`,
        T`[piege] $\ko{\ln(a+b)=\ln a+\ln b}$ est faux : c'est le **produit** qui devient une somme.`,
      ].join('\n'),
    }
  },
}

const expEquation: Gabarit = {
  id: 'sc-exp-eq',
  chapitre: 'socle',
  section: 'socle.s10',
  niveau: 1,
  titre: 'Équation exponentielle',
  source: `${REF}, ch. 10 (10.B)`,
  refCours: `${REF}, ch. 10 · poly §4.5.2`,
  generer(r) {
    const a = r.nz(-4, 4)
    const b = r.int(-5, 5)
    const c = r.pick([2, 3, 5, 7, 10])
    const rep = `(ln(${c})-(${b}))/(${a})`
    const haut = b === 0 ? `\\ln ${c}` : `\\ln ${c}${b > 0 ? '-' : '+'}${Math.abs(b)}`
    const sol = a === 1 ? haut : a === -1 ? `-(${haut})` : `\\dfrac{${haut}}{${a}}`
    return {
      type: 'num',
      enonce: T`Résoudre $e^{${lx(a, b)}}=${c}$.`,
      reponse: rep,
      indice: T`$e^X=c\iff X=\ln c$ (pour $c>0$).`,
      explication: [
        T`[cours] L'équivalence reine : $\cours{e^X=c\iff X=\ln c}$ pour $c>0$ (ln est la réciproque de exp).`,
        T`[calcul] $$${lx(a, b)}=\ln ${c}\iff x=${sol}$$`,
        T`[resultat] $\ok{x=${sol}\approx${((Math.log(c) - b) / a).toFixed(3).replace('.', ',')}}$`,
        T`[piege] Si le membre de droite était **négatif ou nul**, il n'y aurait **aucune** solution : $e^X>0$ toujours.`,
      ].join('\n'),
    }
  },
}

const expLnVf = vfPioche(
  'sc-expln-vf',
  'socle.s10',
  'Vrai / faux : exp et ln',
  (r) => {
    const [a, b] = [r.int(2, 9), r.int(2, 9)]
    return [
      { e: T`$\ln(${a}+${b})=\ln ${a}+\ln ${b}$`, rep: false, ex: [T`[cours] $\cours{\ln(ab)=\ln a+\ln b}$ : c'est le **produit** qui se transforme.`, T`[resultat] $\ok{\text{FAUX}}$ : $\ln ${a}+\ln ${b}=\ln ${a * b}$.`] },
      { e: T`Pour tous réels $a,b$ : $e^{a+b}=e^a\,e^b$.`, rep: true, ex: [T`[cours] L'exponentielle transforme les **sommes en produits** : $\cours{e^{a+b}=e^ae^b}$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`Pour tout réel $x$ : $e^x>0$.`, rep: true, ex: [T`[cours] $\cours{e^x>0}$ pour tout $x$ (poly §4.5.2) : la courbe reste au-dessus de l'axe.`, T`[resultat] $\ok{\text{VRAI}}$ : une équation $e^X=-2$ n'a donc pas de solution.`] },
      { e: T`$\ln(${a}^{${b}})=${b}\ln ${a}$`, rep: true, ex: [T`[cours] $\cours{\ln(a^n)=n\ln a}$ pour $a>0$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`$\ln 1=1$`, rep: false, ex: [T`[cours] $\cours{\ln1=0}$ et $\cours{\ln e=1}$ (car $e^0=1$ et $e^1=e$).`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`Pour $0<x<1$ : $\ln x<0$.`, rep: true, ex: [T`[cours] ln est strictement croissante et $\ln1=0$ : $\cours{0<x<1\Rightarrow\ln x<\ln1=0}$.`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`$\ln(${a}\times${b})=\ln ${a}\times\ln ${b}$`, rep: false, ex: [T`[cours] $\cours{\ln(ab)=\ln a+\ln b}$ : une **somme**, pas un produit.`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`La fonction $\ln$ est définie sur $\mathbb R$.`, rep: false, ex: [T`[cours] $\cours{\ln:\ ]0,+\infty[\to\mathbb R}$ : dans un ln, il faut **strictement positif**.`, T`[resultat] $\ok{\text{FAUX}}$`] },
    ]
  },
  `${REF}, ch. 10 · poly §4.5.2`,
)

// =====================================================================================
// s11 — Limites
// =====================================================================================

const limiteRationnelle: Gabarit = {
  id: 'sc-lim-inf',
  chapitre: 'socle',
  section: 'socle.s11',
  niveau: 1,
  titre: 'Limite en +∞ d’une fraction rationnelle',
  source: `${REF}, ch. 11 (11.A)`,
  refCours: `${REF}, ch. 11 Limites`,
  generer(r) {
    const p = r.int(1, 3)
    const q = r.int(1, 3)
    const a = r.nz(-6, 6)
    const b = r.nz(-6, 6)
    const nomDeg = (d: number) => (d === 0 ? '' : d === 1 ? 'x' : `x^${d}`)
    /** polynôme de degré d : terme dominant + un terme de degré inférieur + constante */
    const poly = (lead: number, d: number) => {
      const bas = d >= 2 ? d - 1 : 0
      return d === 0 ? lin([lead], ['']) : lin([lead, r.int(-5, 5), ...(bas > 0 ? [r.int(-5, 5)] : [])], [nomDeg(d), nomDeg(bas), ...(bas > 0 ? [''] : [])])
    }
    const N = poly(a, p)
    const D = poly(b, q)
    const lim = p === q ? `$${f(a, b).tex()}$` : p < q ? '$0$' : a / b > 0 ? T`$+\infty$` : T`$-\infty$`
    const leurres = [`$${f(a, b).tex()}$`, '$0$', T`$+\infty$`, T`$-\infty$`, '$1$']
    const { choix, reponse } = choixQcm(r, lim, leurres)
    return {
      type: 'qcm',
      enonce: T`$\displaystyle\lim_{x\to+\infty}\frac{${N}}{${D}}=$`,
      choix,
      reponse,
      explication: [
        T`[cours] **À l'infini, un polynôme se comporte comme son terme de plus haut degré** : on met ce terme en facteur en haut et en bas.`,
        T`[calcul] $$\frac{${N}}{${D}}\ \sim\ \frac{${lin([a], [nomDeg(p)])}}{${lin([b], [nomDeg(q)])}}=${f(a, b).tex()}${p === q ? '' : `\\,x^{${p - q}}`}$$`,
        T`[resultat] ${p === q ? 'Degrés égaux : quotient des coefficients dominants' : p < q ? 'Degré du bas plus grand : tend vers 0' : 'Degré du haut plus grand : tend vers l’infini, du signe de ' + f(a, b).tex()} : ${lim.replace(/^\$/, '$\\ok{').replace(/\$$/, '}$')}`,
        T`[piege] « $\frac{\infty}{\infty}$ » est une **forme indéterminée** : on ne conclut pas sans factoriser.`,
      ].join('\n'),
    }
  },
}

const limite00: Gabarit = {
  id: 'sc-lim-00',
  chapitre: 'socle',
  section: 'socle.s11',
  niveau: 1,
  titre: 'Forme 0/0 : factoriser et simplifier',
  source: `${REF}, ch. 11 (11.B)`,
  refCours: `${REF}, ch. 11 Limites`,
  generer(r) {
    let a: number, s: number
    do {
      a = r.int(-6, 6)
      s = r.int(-6, 6)
    } while (a === s)
    // (x−a)(x−s)/(x−a) → a − s quand x → a
    const coefs = [1, -(a + s), a * s]
    return {
      type: 'num',
      enonce: T`Calculer $\displaystyle\lim_{x\to${a}}\frac{${lin(coefs, X2)}}{${lx(1, -a)}}$.`,
      reponse: a - s,
      explication: [
        T`[cours] Une forme $\cours{\frac00}$ en $a$ signifie que $(x-a)$ est **facteur** en haut et en bas : on factorise, on simplifie, puis on remplace.`,
        T`[calcul] En $x=${a}$ : numérateur $=0$ et dénominateur $=0$. Or $${lin(coefs, X2)}=(${lx(1, -a)})(${lx(1, -s)})$, donc pour $x\neq${a}$ : $$\frac{(${lx(1, -a)})(${lx(1, -s)})}{${lx(1, -a)}}=${lx(1, -s)}\ \xrightarrow[x\to${a}]{}\ ${a}${-s >= 0 ? '+' : ''}${-s}$$`,
        T`[resultat] $\ok{${a - s}}$`,
        T`[piege] Conclure « $\frac00$ n'existe pas » : c'est une forme **indéterminée**, pas une impossibilité.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s12 — Dérivation
// =====================================================================================

function fonctionDerivable(r: Rng) {
  const a = r.nz(-5, 5)
  const b = r.int(-6, 6)
  const n = r.int(2, 5)
  const cas = r.int(0, 6)
  const poly = [r.nz(-4, 4), r.int(-5, 5), r.int(-5, 5), r.int(-6, 6)]
  const L = [
    {
      tex: lin(poly, X3),
      f: linAscii(poly, X3),
      d: linAscii([3 * poly[0], 2 * poly[1], poly[2]], X2),
      dTex: lin([3 * poly[0], 2 * poly[1], poly[2]], X2),
      regle: T`$\cours{(x^n)'=nx^{n-1}}$ terme à terme (la constante disparaît).`,
    },
    { tex: T`x^2e^x`, f: 'x^2*exp(x)', d: `(2x+x^2)*exp(x)`, dTex: T`(x^2+2x)e^x`, regle: T`Produit : $\cours{(uv)'=u'v+uv'}$ avec $u=x^2$, $v=e^x$.` },
    { tex: T`\dfrac{\ln x}{x}`, f: 'ln(x)/x', d: `(1-ln(x))/x^2`, dTex: T`\dfrac{1-\ln x}{x^2}`, regle: T`Quotient : $\cours{\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}}$ avec $u=\ln x$, $v=x$.` },
    { tex: T`\sqrt{x^2+${Math.abs(b) + 1}}`, f: `sqrt(x^2+${Math.abs(b) + 1})`, d: `x/sqrt(x^2+${Math.abs(b) + 1})`, dTex: T`\dfrac{x}{\sqrt{x^2+${Math.abs(b) + 1}}}`, regle: T`Chaîne : $\cours{(\sqrt u)'=\frac{u'}{2\sqrt u}}$ avec $u=x^2+${Math.abs(b) + 1}$, $u'=2x$.` },
    { tex: T`(${lx(a, b)})^{${n}}`, f: `(${linAscii([a, b], ['x', ''])})^${n}`, d: `${n * a}*(${linAscii([a, b], ['x', ''])})^${n - 1}`, dTex: T`${n * a}(${lx(a, b)})^{${n - 1}}`, regle: T`Chaîne : $\cours{(u^n)'=nu'u^{n-1}}$ avec $u=${lx(a, b)}$, $u'=${a}$.` },
    { tex: T`e^{${lx(a, b)}}`, f: `exp(${linAscii([a, b], ['x', ''])})`, d: `${a}*exp(${linAscii([a, b], ['x', ''])})`, dTex: T`${a === 1 ? '' : a === -1 ? '-' : a}e^{${lx(a, b)}}`, regle: T`Chaîne : $\cours{(e^u)'=u'e^u}$ avec $u'=${a}$.` },
    { tex: T`\ln(${lx(1, Math.abs(b) + 1)})`, f: `ln(x+${Math.abs(b) + 1})`, d: `1/(x+${Math.abs(b) + 1})`, dTex: T`\dfrac{1}{${lx(1, Math.abs(b) + 1)}}`, regle: T`Chaîne : $\cours{(\ln u)'=\frac{u'}{u}}$.` },
  ]
  return L[cas]
}

const derivee: Gabarit = {
  id: 'sc-derivee',
  chapitre: 'socle',
  section: 'socle.s12',
  niveau: 1,
  titre: 'Dériver (formulaire, produit, quotient, chaîne)',
  source: `${REF}, ch. 12`,
  refCours: `${REF}, ch. 12 Dérivation · poly §4.2.2`,
  indispensable: true,
  generer(r) {
    const fn = fonctionDerivable(r)
    const fx = fn.f
    // contrôle numérique f' ≈ (f(x+h) − f(x−h)) / 2h
    for (const x0 of [0.7, 1.3, 2.1]) {
      const h = 1e-5
      const num = (evalX(fx, x0 + h) - evalX(fx, x0 - h)) / (2 * h)
      verifier(Math.abs(num - evalX(fn.d, x0)) < 1e-3 * Math.max(1, Math.abs(num)), `dérivée ${fn.tex}`)
    }
    return {
      type: 'court',
      enonce: T`Dériver $f(x)=${fn.tex}$.`,
      reponse: [fn.d],
      variables: ['x'],
      mode: 'expression',
      format: "f'(x) = … (écris seulement l'expression)",
      explication: [
        T`[cours] Formulaire : $(x^n)'=nx^{n-1}$, $(e^x)'=e^x$, $(\ln x)'=\frac1x$, $(\sqrt x)'=\frac1{2\sqrt x}$ ; règles : somme, produit, quotient, et la **chaîne** $\cours{(g\circ u)'=u'\times g'\circ u}$.`,
        T`[methode] ${fn.regle}`,
        T`[resultat] $\ok{f'(x)=${fn.dTex}}$`,
        T`[piege] Oublier le facteur $u'$ de la règle de la chaîne.`,
      ].join('\n'),
    }
  },
}

const tangente: Gabarit = {
  id: 'sc-tangente',
  chapitre: 'socle',
  section: 'socle.s12',
  niveau: 1,
  titre: 'Équation d’une tangente',
  source: `${REF}, ch. 12 (12.D)`,
  refCours: `${REF}, ch. 12 Dérivation`,
  generer(r) {
    const [p, q, s] = [r.nz(-3, 3), r.int(-5, 5), r.int(-6, 6)]
    const a0 = r.int(-3, 3)
    const fa = p * a0 * a0 + q * a0 + s
    const da = 2 * p * a0 + q
    const ord = fa - da * a0
    return {
      type: 'court',
      enonce: T`Donner l'équation de la tangente à la courbe de $f(x)=${lin([p, q, s], X2)}$ au point d'abscisse $${a0}$.`,
      reponse: [`y = ${da}*x + (${ord})`],
      variables: ['x', 'y'],
      mode: 'equation',
      format: 'y = mx + p',
      explication: [
        T`[cours] $\cours{y=f(a)+f'(a)(x-a)}$ : la pente de la tangente est le nombre dérivé.`,
        T`[calcul] $f'(x)=${lin([2 * p, q], ['x', ''])}$, donc $f'(${a0})=\cle{${da}}$ et $f(${a0})=\cle{${fa}}$.`,
        T`$$y=${fa}+${par(da)}(x-${par(a0)})$$`,
        T`[resultat] $\ok{y=${lin([da, ord], ['x', ''])}}$`,
        T`[piege] Utiliser $f'(x)$ au lieu du **nombre** $f'(${a0})$ : une tangente est une **droite**.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s13 — Fonctions : domaine, parité, composition
// =====================================================================================

const domaine: Gabarit = {
  id: 'sc-domaine',
  chapitre: 'socle',
  section: 'socle.s13',
  niveau: 1,
  titre: 'Domaine de définition',
  source: `${REF}, ch. 9 (9.A)`,
  refCours: `${REF}, ch. 9 Généralités sur les fonctions`,
  generer(r) {
    const a = r.int(-6, 6)
    const b = a + r.int(1, 5)
    const A = String(a)
    const B = String(b)
    const cas = r.int(0, 4)
    const L = [
      { f: T`\sqrt{${lx(1, -a)}}`, bon: `$${iv(A, inf, true, false)}$`, raison: T`sous une racine, il faut $x${a >= 0 ? '-' : '+'}${Math.abs(a)}\ge0$` },
      { f: T`\dfrac{1}{${lx(1, -a)}}`, bon: T`$\mathbb R\setminus\{${a}\}$`, raison: T`le dénominateur ne doit pas s'annuler : $x\neq${a}$` },
      { f: T`\ln(${lx(1, -a)})`, bon: `$${iv(A, inf, false, false)}$`, raison: T`dans un ln, il faut **strictement** positif : $x>${a}$` },
      { f: T`\ln(${lx(-1, a)})`, bon: `$${iv(minf, A, false, false)}$`, raison: T`dans un ln, il faut $${a}-x>0$, soit $x<${a}$` },
      { f: T`\dfrac{\sqrt{${lx(1, -a)}}}{${lx(1, -b)}}`, bon: T`$${iv(A, B, true, false)}\cup${iv(B, inf, false, false)}$`, raison: T`il faut $x\ge${a}$ (racine) **et** $x\neq${b}$ (dénominateur)` },
    ]
    const c = L[cas]
    const leurres = [`$${iv(A, inf, true, false)}$`, `$${iv(A, inf, false, false)}$`, T`$\mathbb R\setminus\{${a}\}$`, `$${iv(minf, A, false, false)}$`, `$\\mathbb R$`, T`$${iv(A, inf, true, false)}\setminus\{${b}\}$`.replace('\\setminus', '\\setminus')]
    const { choix, reponse } = choixQcm(r, c.bon, leurres)
    return {
      type: 'qcm',
      enonce: T`Quel est le domaine de définition de $f(x)=${c.f}$ ?`,
      choix,
      reponse,
      explication: [
        T`[cours] Les **trois interdits** : diviser par $0$ ; racine d'un **négatif** ; ln d'un nombre **négatif ou nul**.`,
        T`[calcul] Ici, ${c.raison}.`,
        T`[resultat] $\ok{D_f=}$ ${c.bon}`,
        T`[piege] Crochet **fermé** pour une racine ($\ge0$), **ouvert** pour un ln ($>0$) et pour une valeur interdite.`,
      ].join('\n'),
    }
  },
}

const parite: Gabarit = {
  id: 'sc-parite',
  chapitre: 'socle',
  section: 'socle.s13',
  niveau: 1,
  titre: 'Paire, impaire, ou ni l’un ni l’autre ?',
  source: `${REF}, ch. 9 (9.B)`,
  refCours: `${REF}, ch. 9 · poly §4.1.3`,
  generer(r) {
    const p = r.int(1, 5)
    let q: number
    do q = r.int(0, 4)
    while (q === p)
    const [a, b] = [r.nz(-5, 5), r.nz(-5, 5)]
    const pair = (n: number) => n % 2 === 0
    const nature = pair(p) && pair(q) ? 'paire' : !pair(p) && !pair(q) ? 'impaire' : 'ni paire ni impaire'
    const mon = (c: number, n: number) => lin([c], [n === 0 ? '' : n === 1 ? 'x' : `x^{${n}}`])
    const expr = `${mon(a, p)}${b > 0 ? '+' : ''}${mon(b, q)}`
    const moins = (c: number, n: number) => (pair(n) ? c : -c)
    const exprMoins = `${mon(moins(a, p), p)}${moins(b, q) > 0 ? '+' : ''}${mon(moins(b, q), q)}`
    const { choix, reponse } = choixQcm(r, nature, ['paire', 'impaire', 'ni paire ni impaire'], 2)
    return {
      type: 'qcm',
      enonce: T`La fonction $f(x)=${expr}$ (définie sur $\mathbb R$) est :`,
      choix,
      reponse,
      explication: [
        T`[cours] $f$ est **paire** si $\cours{f(-x)=f(x)}$, **impaire** si $\cours{f(-x)=-f(x)}$ (domaine symétrique). $(-x)^n=x^n$ si $n$ est pair, $-x^n$ si $n$ est impair.`,
        T`[calcul] $f(-x)=${exprMoins}$`,
        T`[resultat] $\ok{f\ \text{est ${nature}}}$${nature === 'ni paire ni impaire' ? ' : un terme de degré pair et un de degré impair se « contrarient ».' : ''}`,
        T`[piege] Une constante (degré $0$) est un terme **pair** : $x^3+1$ n'est pas impaire.`,
      ].join('\n'),
    }
  },
}

const composition: Gabarit = {
  id: 'sc-composee',
  chapitre: 'socle',
  section: 'socle.s13',
  niveau: 1,
  titre: 'Composer deux fonctions',
  source: `${REF}, ch. 9`,
  refCours: `${REF}, ch. 9 · poly §4.3`,
  generer(r) {
    const [a, b] = [r.nz(-4, 4), r.int(-5, 5)]
    const g = r.pick([
      { tex: 'x^2', app: (u: string) => `(${u})^2`, appTex: (u: string) => `(${u})^2` },
      { tex: '\\dfrac1x', app: (u: string) => `1/(${u})`, appTex: (u: string) => `\\dfrac{1}{${u}}` },
      { tex: '\\sqrt x', app: (u: string) => `sqrt(${u})`, appTex: (u: string) => `\\sqrt{${u}}` },
    ])
    const fTex = lx(a, b)
    const fAscii = linAscii([a, b], ['x', ''])
    const gof = r.bool()
    const rep = gof ? g.app(fAscii) : `${a}*${g.app('x')}+(${b})`
    const repTex = gof ? g.appTex(fTex) : `${a === 1 ? '' : a === -1 ? '-' : a}${g.appTex('x')}${b >= 0 ? '+' : ''}${b}`
    return {
      type: 'court',
      enonce: T`Avec $f(x)=${fTex}$ et $g(x)=${g.tex}$, exprimer $(${gof ? 'g\\circ f' : 'f\\circ g'})(x)$.`,
      reponse: [rep],
      variables: ['x'],
      mode: 'expression',
      explication: [
        T`[cours] $\cours{(g\circ f)(x)=g(f(x))}$ : on branche la **sortie de $f$** sur l'entrée de $g$. L'ordre compte !`,
        gof ? T`[calcul] On remplace $x$ par $f(x)=${fTex}$ **dans** $g$.` : T`[calcul] On remplace $x$ par $g(x)=${g.tex}$ **dans** $f$.`,
        T`[resultat] $\ok{(${gof ? 'g\\circ f' : 'f\\circ g'})(x)=${repTex}}$`,
        T`[piege] $g\circ f\neq f\circ g$ en général : $(${gof ? 'f\\circ g' : 'g\\circ f'})(x)=${gof ? `${a === 1 ? '' : a === -1 ? '-' : a}${g.appTex('x')}${b >= 0 ? '+' : ''}${b}` : g.appTex(fTex)}$.`,
      ].join('\n'),
    }
  },
}

export const GABARITS_SOCLE: Gabarit[] = [
  fracSomme,
  fracProduit,
  fracSimplifier,
  fracVf,
  puissancesBase,
  puissancesLettres,
  puissVf,
  racineSimplifier,
  racineSomme,
  racineConjugue,
  racineVf,
  developper,
  factoriser,
  identitesQcm,
  pourcentages,
  equationLineaire,
  produitNul,
  systeme,
  racinesTrinome,
  discriminant,
  sommet,
  inequationLineaire,
  signeTrinome,
  absEquation,
  absInequation,
  lnSimplifier,
  expEquation,
  expLnVf,
  limiteRationnelle,
  limite00,
  derivee,
  tangente,
  domaine,
  parite,
  composition,
]
