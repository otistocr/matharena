/**
 * Chapitre 2 — Complexes et polynômes : gabarits de questions à variantes.
 * Inspirés de la feuille de TD 2 (2026) et du poly §2.1–2.3 (p.31–56).
 * (Formules d'Euler, Moivre et valeurs de e^{iθ} : voir aussi le chapitre Trigonométrie.)
 */
import type { Gabarit } from './types'
import type { Niveau } from '../data/schema'
import { Frac, Rng, lin, linAscii, par, pgcdListe, racine, verifier } from './outils'
import { Ex, angleAscii, angleTex, cosT, principal, remarquable, sinT } from './exact'

const T = String.raw
const OKVF = (b: boolean) => T`$\ok{\text{${b ? 'VRAI' : 'FAUX'}}}$`
const XN = (d: number) => Array.from({ length: d + 1 }, (_, i) => (d - i === 0 ? '' : d - i === 1 ? 'X' : `X^${d - i}`))
const ok = (s: string) => `$\\ok{${s.slice(1, -1)}}$`

const choixQcm = (r: Rng, bon: string, leurres: string[], n = 3) => {
  const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((l) => l !== bon)).slice(0, n)])
  return { choix, reponse: choix.indexOf(bon) }
}

type Vf = { e: string; rep: boolean; ex: string[] }
const vfPioche = (
  meta: { id: string; section: string; niveau?: Niveau; titre: string; source: string; refCours: string; indispensable?: number | true },
  pioche: (r: Rng) => Vf[],
): Gabarit => ({
  id: meta.id,
  chapitre: 'ch2',
  section: meta.section,
  niveau: meta.niveau ?? 1,
  titre: meta.titre,
  source: meta.source,
  refCours: meta.refCours,
  ...(meta.indispensable !== undefined ? { indispensable: meta.indispensable } : {}),
  generer(r) {
    const c = r.pick(pioche(r))
    return { type: 'vf', enonce: c.e, reponse: c.rep, explication: c.ex.join('\n') }
  },
})

// ---------------------------------------------------------------- Complexes à parties entières ou rationnelles

type Z = [number, number]
const zmul = (a: Z, b: Z): Z => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const zadd = (a: Z, b: Z): Z => [a[0] + b[0], a[1] + b[1]]
const zsub = (a: Z, b: Z): Z => [a[0] - b[0], a[1] - b[1]]
const zneg = (a: Z): Z => [-a[0], -a[1]]
const zconj = (a: Z): Z => [a[0], -a[1]]
const n2 = (a: Z) => a[0] * a[0] + a[1] * a[1]

/** a + ib en LaTeX (entiers ou fractions) : 3-2i, -i, \frac12+\frac32i. */
function texZ(re0: number | Frac, im0: number | Frac): string {
  const [re, im] = [Frac.of(re0), Frac.of(im0)]
  if (im.zero) return re.tex()
  const abs = im.valeur() < 0 ? im.neg() : im
  const imTex = abs.n === 1 && abs.d === 1 ? 'i' : `${abs.tex()}i`
  if (re.zero) return `${im.valeur() < 0 ? '-' : ''}${imTex}`
  return `${re.tex()}${im.valeur() < 0 ? '-' : '+'}${imTex}`
}
const tz = (z: Z) => texZ(z[0], z[1])
/** Entre parenthèses si la forme a deux termes ou commence par un signe moins. */
const pz = (z: Z) => (z[0] !== 0 && z[1] !== 0 ? `(${tz(z)})` : z[0] < 0 || z[1] < 0 ? `(${tz(z)})` : tz(z))
const ascZ = (re: number | Frac, im: number | Frac) => `(${Frac.of(re).ascii()})+(${Frac.of(im).ascii()})*i`
/** Terme « + c·suffixe » d'une somme : +(2-3i)z, -4z, +iz, +z. */
const terme = (c: Z, suf: string) => {
  if (c[0] !== 0 && c[1] !== 0) return `+(${tz(c)})${suf}`
  const t = tz(c)
  if (suf && (t === '1' || t === '-1')) return `${t === '1' ? '+' : '-'}${suf}`
  return `${t.startsWith('-') ? '' : '+'}${t}${suf}`
}
/** Complexe à parties entières non nulles. */
const zr = (r: Rng, m = 5): Z => [r.nz(-m, m), r.nz(-m, m)]

/** a + ib avec des valeurs exactes (radicaux). */
function texC(re: Ex, im: Ex): string {
  if (im.zero) return re.tex()
  const imAbs = im.valeur() < 0 ? im.neg() : im
  const imTex = imAbs.tex() === '1' ? 'i' : `${imAbs.tex()}\\,i`
  if (re.zero) return `${im.valeur() < 0 ? '-' : ''}${imTex}`
  return `${re.tex()}${im.valeur() < 0 ? '-' : '+'}${imTex}`
}
const expo = (t: number) => (t < 0 ? `-i${angleTex(-t).replace('\\dfrac', '\\frac')}` : `i${angleTex(t).replace('\\dfrac', '\\frac')}`)

/** Complexe « remarquable » R·e^{iθ}, θ = t·π/12 remarquable non nul modulo π si `nonReel`. */
function complexeRemarquable(r: Rng, nonReel = false) {
  let t: number
  do t = r.int(-11, 12)
  while (!remarquable(t) || (nonReel && t % 12 === 0))
  const m = r.int(1, 3)
  const R = t % 6 === 0 ? Ex.entier(m) : t % 3 === 0 ? Ex.rac(2, m) : Ex.entier(r.pick([1, 2, 3, 4]))
  const [re, im] = [R.mul(cosT(t)), R.mul(sinT(t))]
  return { t, R, re, im, tex: texC(re, im) }
}

// =====================================================================================
// §2.1.1–2.1.4 Forme algébrique, conjugué, module
// =====================================================================================

const produit: Gabarit = {
  id: 'g2-produit',
  chapitre: 'ch2',
  section: 'ch2.s1',
  niveau: 1,
  titre: 'Produit de deux complexes',
  source: 'TD2 ex 1.1',
  refCours: 'poly §2.1.1 p.31–32',
  indispensable: 11,
  generer(r) {
    const [a, b] = [zr(r), zr(r)]
    const p = zmul(a, b)
    return {
      type: 'num',
      enonce: r.bool() ? T`Calculer $(${tz(a)})(${tz(b)})$ sous forme algébrique $x+iy$.` : T`Donner l'écriture cartésienne de $z=(${tz(a)})(${tz(b)})$.`,
      reponse: ascZ(p[0], p[1]),
      explication: [
        T`[cours] **Énoncé indispensable 11** (p.32) : $\cours{(x_1+iy_1)(x_2+iy_2)=(x_1x_2-y_1y_2)+i(x_1y_2+y_1x_2)}$. On développe normalement, avec $\cours{i^2=-1}$.`,
        T`[calcul] $$${par(a[0])}\times${par(b[0])}+${par(a[0])}\times${par(b[1])}i+${par(a[1])}i\times${par(b[0])}+${par(a[1])}\times${par(b[1])}\,i^2$$`,
        T`$=${a[0] * b[0]}${a[0] * b[1] + a[1] * b[0] < 0 ? '' : '+'}${a[0] * b[1] + a[1] * b[0]}i${-a[1] * b[1] < 0 ? '' : '+'}${-a[1] * b[1]}$ (le terme en $i^2$ change de signe).`,
        T`[resultat] $\ok{${tz(p)}}$`,
        T`[piege] $i^2=-1$ : le produit des deux parties imaginaires arrive dans la **partie réelle**, avec un signe moins.`,
      ].join('\n'),
    }
  },
}

const quotient: Gabarit = {
  id: 'g2-quotient',
  chapitre: 'ch2',
  section: 'ch2.s1',
  niveau: 1,
  titre: 'Inverse et quotient (expression conjuguée)',
  source: 'TD2 ex 1.1 et 1.2',
  refCours: 'poly §2.1.3 p.34 (Déf. 2.7 et 2.9)',
  generer(r) {
    const inverse = r.bool(0.35)
    const a: Z = inverse ? [1, 0] : zr(r)
    const b = zr(r, 4)
    const num = zmul(a, zconj(b))
    const d = n2(b)
    const [re, im] = [new Frac(num[0], d), new Frac(num[1], d)]
    return {
      type: 'num',
      enonce: inverse ? T`Donner l'inverse de $z=${tz(b)}$ sous forme algébrique.` : T`Écrire $\dfrac{${tz(a)}}{${tz(b)}}$ sous forme algébrique $x+iy$.`,
      reponse: ascZ(re, im),
      indice: 'Multiplie en haut et en bas par le conjugué du dénominateur.',
      explication: [
        T`[cours] (§2.1.3, p.34) Pour $z\neq0$ : $\cours{\frac1z=\frac{\bar z}{|z|^2}}$, car $\cours{z\bar z=|z|^2}$ est un réel positif.`,
        T`[methode] On multiplie numérateur et dénominateur par le **conjugué du dénominateur**, $${tz(zconj(b))}$.`,
        T`[calcul] Dénominateur : $(${tz(b)})(${tz(zconj(b))})=${b[0] * b[0]}+${b[1] * b[1]}=\cle{${d}}$.`,
        inverse ? T`Numérateur : $${tz(zconj(b))}$.` : T`Numérateur : $(${tz(a)})(${tz(zconj(b))})=\cle{${tz(num)}}$.`,
        T`[resultat] $\ok{${texZ(re, im)}}$`,
        T`[piege] $\frac1{a+ib}\neq\frac1a+\frac1{ib}$. Et le conjugué change le signe de la partie **imaginaire** seulement.`,
      ].join('\n'),
    }
  },
}

const moduleZ: Gabarit = {
  id: 'g2-module',
  chapitre: 'ch2',
  section: 'ch2.s1',
  niveau: 1,
  titre: 'Module, conjugué',
  source: 'TD2 ex 1.1',
  refCours: 'poly §2.1.4 p.35–36',
  indispensable: 12,
  generer(r) {
    const cas = r.int(0, 2)
    const a = zr(r, 7)
    const b = zr(r, 4)
    if (cas === 0) {
      const [tex, asc] = racine(n2(a))
      return {
        type: 'num',
        enonce: T`Calculer le module de $z=${tz(a)}$ (valeur exacte).`,
        reponse: asc,
        explication: [
          T`[cours] (Déf. 2.11, p.35) $\cours{|x+iy|=\sqrt{x^2+y^2}}$ : c'est la norme du vecteur $(x,y)$.`,
          T`[calcul] $|z|=\sqrt{${par(a[0])}^2+${par(a[1])}^2}=\sqrt{${n2(a)}}$`,
          T`[resultat] $\ok{${tex}}$`,
          T`[piege] Pas de $i$ sous la racine : c'est $y^2$, pas $(iy)^2$. Un module est toujours un réel **positif**.`,
        ].join('\n'),
      }
    }
    if (cas === 1)
      return {
        type: 'num',
        enonce: T`Soit $z=${tz(a)}$. Calculer $z\bar z$.`,
        reponse: n2(a),
        explication: [
          T`[cours] $\cours{z\bar z=|z|^2=x^2+y^2}$ (§2.1.4, p.35) : toujours un **réel positif**.`,
          T`[calcul] $(${tz(a)})(${tz(zconj(a))})=${par(a[0])}^2+${par(a[1])}^2$`,
          T`[resultat] $\ok{${n2(a)}}$`,
          T`[piege] $z\bar z$ n'est pas $z^2$ : $z^2=${tz(zmul(a, a))}$.`,
        ].join('\n'),
      }
    const [tex, asc] = racine(n2(a) * n2(b))
    return {
      type: 'num',
      enonce: T`Calculer le module de $(${tz(a)})(${tz(b)})$ (valeur exacte).`,
      reponse: asc,
      explication: [
        T`[cours] **Énoncé indispensable 12** (p.36) : $\cours{|z_1z_2|=|z_1|\,|z_2|}$. Inutile de développer le produit.`,
        T`[calcul] $|${tz(a)}|=\sqrt{${n2(a)}}$ et $|${tz(b)}|=\sqrt{${n2(b)}}$, donc le module vaut $\sqrt{${n2(a)}\times${n2(b)}}=\sqrt{${n2(a) * n2(b)}}$.`,
        T`[resultat] $\ok{${tex}}$`,
        T`[piege] Cette règle est fausse pour la somme : $|z_1+z_2|\le|z_1|+|z_2|$ seulement (inégalité triangulaire, Énoncé indispensable 13).`,
      ].join('\n'),
    }
  },
}

const algebreVf = vfPioche(
  { id: 'g2-alg-vf', section: 'ch2.s1', titre: 'Vrai / faux : conjugué, module, parties réelle et imaginaire', source: 'TD2 ex 1 et 2', refCours: 'poly §2.1.2–2.1.4 p.33–36' },
  (r) => {
    const n = r.int(5, 40)
    const IN = ['1', 'i', '-1', '-i']
    const faux = r.int(1, 3)
    const CJ = T`[cours] (Déf. 2.7, p.34) $\cours{\overline{x+iy}=x-iy}$ ; le conjugué est compatible avec la somme et le produit : $\overline{z_1+z_2}=\bar z_1+\bar z_2$, $\overline{z_1z_2}=\bar z_1\,\bar z_2$.`
    const MO = T`[cours] (§2.1.4, p.35–36) $\cours{|z|^2=z\bar z}$, $\cours{|z_1z_2|=|z_1||z_2|}$ (Énoncé indispensable 12) et $\cours{|z_1+z_2|\le|z_1|+|z_2|}$ (Énoncé indispensable 13).`
    const RI = T`[cours] (Déf. 2.5, p.33) Pour $z=x+iy$ : $\Re(z)=x$ et $\Im(z)=y$ sont des **réels**, et $\cours{\Re(z)=\frac{z+\bar z}2}$, $\cours{\Im(z)=\frac{z-\bar z}{2i}}$.`
    return [
      { e: T`Pour tous complexes $z_1,z_2$ : $\overline{z_1z_2}=\bar z_1\,\bar z_2$.`, rep: true, ex: [CJ, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tous complexes $z_1,z_2$ : $|z_1+z_2|=|z_1|+|z_2|$.`, rep: false, ex: [MO, T`[calcul] $z_1=1$, $z_2=-1$ : $|z_1+z_2|=0$ mais $|z_1|+|z_2|=2$.`, T`[resultat] ${OKVF(false)} On a seulement l'**inégalité triangulaire**.`] },
      { e: T`Pour tous complexes $z_1,z_2$ : $|z_1+z_2|\le|z_1|+|z_2|$.`, rep: true, ex: [MO, T`[resultat] ${OKVF(true)} Un côté d'un triangle est plus court que la somme des deux autres.`] },
      { e: T`Pour tout complexe $z$ : $z+\bar z=2\,\Re(z)$.`, rep: true, ex: [RI, T`[calcul] $(x+iy)+(x-iy)=2x$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout complexe $z$ : $z-\bar z=2\,\Im(z)$.`, rep: false, ex: [RI, T`[calcul] $(x+iy)-(x-iy)=2iy=2i\,\Im(z)$.`, T`[resultat] ${OKVF(false)} Il manque le facteur $i$.`] },
      { e: T`Pour tout complexe $z\neq0$ : $\dfrac1z=\dfrac{\bar z}{|z|^2}$.`, rep: true, ex: [MO, T`[calcul] $z\times\frac{\bar z}{|z|^2}=\frac{|z|^2}{|z|^2}=1$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tous complexes $z_1,z_2$ : $\Re(z_1z_2)=\Re(z_1)\,\Re(z_2)$.`, rep: false, ex: [T`[cours] **Énoncé indispensable 11** : $\cours{\Re(z_1z_2)=x_1x_2-y_1y_2}$.`, T`[calcul] $z_1=z_2=i$ : $\Re(i^2)=-1$ mais $\Re(i)\Re(i)=0$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Un complexe $z$ est réel si et seulement si $z=\bar z$.`, rep: true, ex: [RI, T`[calcul] $z=\bar z\iff z-\bar z=2i\,\Im(z)=0\iff\Im(z)=0$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`$\dfrac1i=-i$.`, rep: true, ex: [T`[cours] $\cours{i^2=-1}$, donc $i\times(-i)=1$ (poly, exercice 2.10 p.34).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`$i^{${n}}=${IN[n % 4]}$.`, rep: true, ex: [T`[cours] $\cours{i^4=1}$ : les puissances de $i$ sont **périodiques de période 4** ($1,\ i,\ -1,\ -i$).`, T`[calcul] $${n}=4\times${Math.floor(n / 4)}+${n % 4}$, donc $i^{${n}}=i^{${n % 4}}=${IN[n % 4]}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`$i^{${n}}=${IN[(n + faux) % 4]}$.`, rep: false, ex: [T`[cours] $\cours{i^4=1}$ : les puissances de $i$ sont **périodiques de période 4** ($1,\ i,\ -1,\ -i$).`, T`[calcul] $${n}=4\times${Math.floor(n / 4)}+${n % 4}$, donc $i^{${n}}=i^{${n % 4}}=${IN[n % 4]}$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour tous complexes $z_1,z_2$ : $|z_1-z_2|^2+|z_1+z_2|^2=2\left(|z_1|^2+|z_2|^2\right)$.`, rep: true, ex: [MO, T`[calcul] $|z_1\pm z_2|^2=(z_1\pm z_2)(\bar z_1\pm\bar z_2)=|z_1|^2\pm(z_1\bar z_2+\bar z_1z_2)+|z_2|^2$ : en additionnant, les termes croisés s'annulent.`, T`[resultat] ${OKVF(true)} C'est l'**identité du parallélogramme** (TD2 ex 2).`] },
      { e: T`Pour tout complexe $z$ : $|\bar z|=|z|$.`, rep: true, ex: [T`[cours] $\cours{|x+iy|=\sqrt{x^2+y^2}}$ : changer $y$ en $-y$ ne change rien (symétrie par rapport à l'axe réel).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout complexe $z$ : $z^2=|z|^2$.`, rep: false, ex: [MO, T`[calcul] $z=i$ : $z^2=-1$ mais $|z|^2=1$.`, T`[resultat] ${OKVF(false)} C'est $z\bar z$ qui vaut $|z|^2$.`] },
    ]
  },
)

const impedance: Gabarit = {
  id: 'g2-impedance',
  chapitre: 'ch2',
  section: 'ch2.s1',
  niveau: 2,
  titre: 'Application : impédance d’un circuit RLC',
  source: 'TD2 ex 14',
  refCours: 'poly §2.1.2–2.1.5 p.33–38',
  generer(r) {
    const [R, x, m] = r.pick([
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [12, 5, 13],
      [6, 8, 10],
      [8, 6, 10],
      [8, 15, 17],
    ])
    const X = r.bool() ? x : -x
    const XC = X + 1 > 0 ? r.int(1, 9) : -X + r.int(1, 5)
    const xl = X + XC
    const cas = r.int(0, 2)
    const intro = T`Un circuit RLC série a pour impédance complexe $Z=R+iL\omega+\dfrac1{iC\omega}$. On donne $R=${R}\ \Omega$, $L\omega=${xl}\ \Omega$ et $\dfrac1{C\omega}=${XC}\ \Omega$.`
    const L = [
      { q: T`Calculer le module $|Z|$ (en ohms).`, rep: String(m), res: T`|Z|=\sqrt{${R}^2+${par(X)}^2}=${m}` },
      { q: T`Donner la partie imaginaire de $Z$.`, rep: String(X), res: T`\Im(Z)=${xl}-${XC}=${X}` },
      { q: T`Le déphasage $\varphi$ est un argument de $Z$. Calculer $\tan\varphi$.`, rep: new Frac(X, R).ascii(), res: T`\tan\varphi=\frac{\Im(Z)}{\Re(Z)}=${new Frac(X, R).tex()}` },
    ][cas]
    return {
      type: 'num',
      enonce: `${intro} ${L.q}`,
      reponse: L.rep,
      explication: [
        T`[cours] $\cours{\frac1i=-i}$, donc $\frac1{iC\omega}=-\frac{i}{C\omega}$. Puis $|x+iy|=\sqrt{x^2+y^2}$ et, pour $x>0$, $\tan(\arg z)=\frac yx$ (§2.1.5).`,
        T`[calcul] $Z=R+i\left(L\omega-\frac1{C\omega}\right)=${R}+i(${xl}-${XC})=\cle{${texZ(R, X)}}$ : partie réelle $${R}$, partie imaginaire $${X}$.`,
        T`[resultat] $\ok{${L.res}}$`,
        T`[piege] $\frac1i=-i$ et non $i$ : la capacité **retranche** à la partie imaginaire.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §2.1.5–2.1.6 Forme trigonométrique, exponentielle complexe
// =====================================================================================

const formeTrigo: Gabarit = {
  id: 'g2-forme-trigo',
  chapitre: 'ch2',
  section: 'ch2.s2',
  niveau: 1,
  titre: 'Module et argument (forme trigonométrique)',
  source: 'TD2 ex 1.3 et 5.1',
  refCours: 'poly §2.1.5 p.36–38 (Prop. 2.17, Déf. 2.18)',
  indispensable: 14,
  generer(r) {
    const z = complexeRemarquable(r)
    const demandeArg = r.bool(0.65)
    return {
      type: 'num',
      enonce: demandeArg
        ? T`Donner l'argument de $z=${z.tex}$ qui appartient à $]-\pi,\pi]$.`
        : T`Donner le module de $z=${z.tex}$.`,
      reponse: demandeArg ? angleAscii(z.t) : z.R.ascii(),
      indice: T`Calcule $|z|$, mets-le en facteur, puis reconnais $\cos\theta$ et $\sin\theta$.`,
      explication: [
        T`[cours] (Prop. 2.17, p.38) Tout $z\neq0$ s'écrit de façon unique $\cours{z=\rho\,e^{i\theta}=\rho(\cos\theta+i\sin\theta)}$ avec $\rho=|z|>0$ et $\theta$ défini modulo $2\pi$ (**Énoncé indispensable 14** : $e^{i\theta}=\cos\theta+i\sin\theta$).`,
        T`[methode] (1) $\rho=|z|$ ; (2) factoriser par $\rho$ ; (3) reconnaître un angle dont on connaît le cosinus **et** le sinus.`,
        T`[calcul] $|z|=\sqrt{${z.re.mul(z.re).tex()}+${z.im.mul(z.im).tex()}}=\cle{${z.R.tex()}}$, puis $\cos\theta=${cosT(z.t).tex()}$ et $\sin\theta=${sinT(z.t).tex()}$.`,
        T`[resultat] ${demandeArg ? T`$\ok{\theta=${angleTex(z.t)}}$` : T`$\ok{|z|=${z.R.tex()}}$`}, soit $z=${z.R.tex() === '1' ? '' : z.R.tex() + T`\,`}e^{${expo(z.t) === 'i0' ? '0' : expo(z.t)}}$.`,
        T`[piege] Le **signe** du cosinus et celui du sinus donnent le quadrant : $\tan\theta$ seul ne suffit pas.`,
      ].join('\n'),
    }
  },
}

const produitTrigo: Gabarit = {
  id: 'g2-produit-trigo',
  chapitre: 'ch2',
  section: 'ch2.s2',
  niveau: 1,
  titre: 'Produit, quotient, puissance sous forme exponentielle',
  source: 'TD2 ex 1.3',
  refCours: 'poly §2.1.5 p.39 (produit sous forme trigonométrique)',
  indispensable: true,
  generer(r) {
    const pick = () => {
      let t: number
      do t = r.int(-11, 12)
      while (!remarquable(t) || t === 0)
      return t
    }
    const [t1, t2] = [pick(), pick()]
    const [r1, r2] = [r.int(2, 5), r.int(2, 5)]
    const n = r.int(2, 5)
    const op = r.int(0, 2)
    const z = (ro: number, t: number) => T`${ro}\,e^{${expo(t)}}`
    const O = [
      { nom: 'z_1z_2', mod: new Frac(r1 * r2), ang: t1 + t2, regle: T`on **multiplie** les modules et on **additionne** les arguments`, calc: T`${r1}\times${r2}` },
      { nom: T`\dfrac{z_1}{z_2}`, mod: new Frac(r1, r2), ang: t1 - t2, regle: T`on **divise** les modules et on **soustrait** les arguments`, calc: T`\frac{${r1}}{${r2}}` },
      { nom: `z_1^{${n}}`, mod: new Frac(r1 ** n), ang: n * t1, regle: T`le module est élevé à la puissance $${n}$ et l'argument est **multiplié** par $${n}$`, calc: T`${r1}^{${n}}` },
    ][op]
    const p = principal(O.ang)
    const demandeArg = r.bool(0.6)
    return {
      type: 'num',
      enonce: T`Soient $z_1=${z(r1, t1)}$ et $z_2=${z(r2, t2)}$. Donner ${demandeArg ? T`l'argument de $${O.nom}$ situé dans $]-\pi,\pi]$` : T`le module de $${O.nom}$`}.`,
      reponse: demandeArg ? angleAscii(p) : O.mod.ascii(),
      explication: [
        T`[cours] **Énoncé indispensable** (p.39) : $\cours{(\rho_1e^{i\theta_1})(\rho_2e^{i\theta_2})=\rho_1\rho_2\,e^{i(\theta_1+\theta_2)}}$. On **multiplie les modules** et on **additionne les arguments**.`,
        T`[methode] Pour $${O.nom}$ : ${O.regle}.`,
        T`[calcul] Module : $${O.calc}=\cle{${O.mod.tex()}}$. Argument : $${angleTex(O.ang)}$${p !== O.ang ? T`, ramené dans $]-\pi,\pi]$ en ajoutant un multiple de $2\pi$ : $\cle{${angleTex(p)}}$` : ''}.`,
        T`[resultat] ${demandeArg ? T`$\ok{${angleTex(p)}}$` : T`$\ok{${O.mod.tex()}}$`}`,
        T`[piege] Les arguments ne sont définis que **modulo $2\pi$** (Énoncé indispensable 16) ; et on n'additionne jamais les modules.`,
      ].join('\n'),
    }
  },
}

const puissanceReelle: Gabarit = {
  id: 'g2-puissance-reelle',
  chapitre: 'ch2',
  section: 'ch2.s2',
  niveau: 3,
  titre: 'Quand une puissance est-elle réelle ?',
  source: 'TD2 ex 18',
  refCours: 'poly §2.1.5 p.38–39',
  generer(r) {
    const z = complexeRemarquable(r, true)
    const n = 12 / pgcdListe([Math.abs(z.t), 12])
    verifier((n * z.t) % 12 === 0, 'puissance réelle')
    const at = z.t < 0 ? T`\left(${angleTex(z.t)}\right)` : angleTex(z.t)
    return {
      type: 'num',
      enonce: T`Soit $z=${z.tex}$. Quel est le plus petit entier $n\ge1$ tel que $z^n$ soit un nombre **réel** ?`,
      reponse: n,
      indice: 'Un complexe non nul est réel quand son argument est un multiple de π.',
      explication: [
        T`[cours] $\cours{z^n=\rho^ne^{in\theta}}$, et un complexe non nul est **réel** si et seulement si son argument est un multiple de $\pi$.`,
        T`[calcul] $z=${z.R.tex() === '1' ? '' : z.R.tex() + T`\,`}e^{${expo(z.t)}}$, donc $\arg(z^n)=n\times${at}$. Il faut $n\times${at}\in\pi\mathbb Z$.`,
        T`[resultat] Le plus petit $n$ est $\ok{${n}}$ : $z^{${n}}$ a pour argument $${angleTex(n * z.t)}$. Les solutions sont tous les multiples de $${n}$.`,
        T`[piege] Réel ne veut pas dire positif : un argument égal à $\pi$ convient aussi.`,
      ].join('\n'),
    }
  },
}

const expComplexe: Gabarit = {
  id: 'g2-exp-complexe',
  chapitre: 'ch2',
  section: 'ch2.s2',
  niveau: 2,
  titre: 'Exponentielle complexe',
  source: 'TD2 ex 19',
  refCours: 'poly §2.1.6 p.41 (Déf. 2.23)',
  generer(r) {
    const a = r.int(1, 5)
    const cas = r.int(0, 2)
    const C = T`[cours] (Déf. 2.23, p.41) Pour $z=x+iy$ : $\cours{e^z=e^xe^{iy}}$. C'est le complexe de **module $e^x$** et d'**argument $y$**. En particulier $e^z\neq0$.`
    if (cas === 0) {
      let t: number
      do t = r.int(-11, 12)
      while (!remarquable(t) || t === 0)
      return {
        type: 'num',
        enonce: T`Donner le module de $e^{${a}${t < 0 ? '-' : '+'}${expo(Math.abs(t))}}$ (valeur exacte).`,
        reponse: `exp(${a})`,
        explication: [C, T`[calcul] $x=${a}$ et $y=${angleTex(t)}$ : $|e^z|=e^{${a}}\times|e^{iy}|=e^{${a}}\times1$.`, T`[resultat] $\ok{e^{${a}}}$`, T`[piege] La partie imaginaire de $z$ ne joue **aucun rôle** dans le module.`].join('\n'),
      }
    }
    if (cas === 1) {
      const t = r.pick([13, 14, 15, 16, 18, 20, 21, 22, 26, 27, 28, 30, 32, 33, 34, -14, -15, -16, -18, -20, -21, -22])
      const p = principal(t)
      return {
        type: 'num',
        enonce: T`Donner l'argument de $e^{${a}${t < 0 ? '-' : '+'}${expo(Math.abs(t))}}$ situé dans $]-\pi,\pi]$.`,
        reponse: angleAscii(p),
        explication: [C, T`[calcul] Un argument est $y=${angleTex(t)}$ ; on le ramène dans $]-\pi,\pi]$ en ${t > 0 ? 'retirant' : 'ajoutant'} $2\pi$.`, T`[resultat] $\ok{${angleTex(p)}}$`, T`[piege] Les arguments sont définis **modulo $2\pi$** : $e^{i\alpha}=e^{i\beta}\iff\alpha\equiv\beta\ [2\pi]$ (Énoncé indispensable 16).`].join('\n'),
      }
    }
    const [bTex, mult, rep] = r.pick([
      [T`i\pi`, '-1', `-exp(${a})`],
      [T`i\frac\pi2`, 'i', `i*exp(${a})`],
      [T`2i\pi`, '1', `exp(${a})`],
      [T`3i\frac\pi2`, '-i', `-i*exp(${a})`],
    ])
    return {
      type: 'num',
      enonce: T`Écrire $e^{${a}+${bTex}}$ sous forme algébrique (valeur exacte).`,
      reponse: rep,
      explication: [C, T`[calcul] $e^{${a}+${bTex}}=e^{${a}}\times e^{${bTex}}$ et $e^{${bTex}}=\cle{${mult}}$ (cercle trigonométrique).`, T`[resultat] $\ok{${mult === '1' ? '' : mult === '-1' ? '-' : mult + T`\,`}e^{${a}}}$`, T`[piege] $e^{i\pi}=-1$ : une exponentielle **complexe** peut être négative, contrairement à l'exponentielle réelle.`].join('\n'),
    }
  },
}

const expVf = vfPioche(
  { id: 'g2-exp-vf', section: 'ch2.s2', titre: 'Vrai / faux : forme exponentielle, Euler, racines de l’unité', source: 'TD2 ex 3, 7 et 13', refCours: 'poly §2.1.5–2.1.8 p.36–43' },
  (r) => {
    const n = r.int(3, 9)
    const EU = T`[cours] **Énoncé indispensable 15**, formules d'Euler (p.38) : $\cours{\cos\theta=\frac{e^{i\theta}+e^{-i\theta}}2}$ et $\cours{\sin\theta=\frac{e^{i\theta}-e^{-i\theta}}{2i}}$.`
    const J = T`[cours] (Prop. 2.26, p.41) Les solutions de $z^3=1$ sont $1$, $\cours{j=e^{2i\pi/3}=-\frac12+i\frac{\sqrt3}2}$ et $j^2=e^{4i\pi/3}=\bar j$.`
    const SG = T`[cours] (Lemme 2.27, p.42) La suite $(z^n)$ tend vers $0$ **si et seulement si** $\cours{|z|<1}$.`
    return [
      { e: T`$e^{i\alpha}=e^{i\beta}$ si et seulement si il existe $k\in\mathbb Z$ tel que $\alpha=\beta+2k\pi$.`, rep: true, ex: [T`[cours] **Énoncé indispensable 16** (p.38) : $\cours{e^{i\alpha}=e^{i\beta}\iff\alpha\equiv\beta\ [2\pi]}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout réel $\theta$ : $|e^{i\theta}|=1$.`, rep: true, ex: [T`[cours] **Énoncé indispensable 14** (p.37) : $\cours{e^{i\theta}=\cos\theta+i\sin\theta}$, point du cercle trigonométrique.`, T`[calcul] $|e^{i\theta}|^2=\cos^2\theta+\sin^2\theta=1$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout réel $\theta$ : $\sin\theta=\dfrac{e^{i\theta}-e^{-i\theta}}2$.`, rep: false, ex: [EU, T`[resultat] ${OKVF(false)} Il faut diviser par $2i$ : $e^{i\theta}-e^{-i\theta}=2i\sin\theta$ (TD2 ex 13.1).`] },
      { e: T`Pour tout réel $t$ : $\cos^2t=\dfrac{1+\cos(2t)}2$.`, rep: true, ex: [EU, T`[calcul] $\cos^2t=\frac{(e^{it}+e^{-it})^2}4=\frac{e^{2it}+2+e^{-2it}}4=\frac{2\cos(2t)+2}4$.`, T`[resultat] ${OKVF(true)} (TD2 ex 13.2)`] },
      { e: T`Pour tout réel $t$ : $\sin^2t=\dfrac{1+\cos(2t)}2$.`, rep: false, ex: [EU, T`[calcul] $\sin^2t=\frac{(e^{it}-e^{-it})^2}{(2i)^2}=\frac{e^{2it}-2+e^{-2it}}{-4}=\frac{1-\cos(2t)}2$.`, T`[resultat] ${OKVF(false)} C'est $\frac{1-\cos(2t)}2$ (TD2 ex 13.2).`] },
      { e: T`Pour tout réel $x$ : $1-e^{ix}=-2i\sin\left(\frac x2\right)e^{ix/2}$.`, rep: true, ex: [EU, T`[calcul] On factorise par l'**angle moitié** : $1-e^{ix}=e^{ix/2}\left(e^{-ix/2}-e^{ix/2}\right)=e^{ix/2}\times\left(-2i\sin\frac x2\right)$.`, T`[resultat] ${OKVF(true)} (TD2 ex 13.3)`] },
      { e: T`$1+j+j^2=0$, où $j=e^{2i\pi/3}$.`, rep: true, ex: [J, T`[calcul] Somme géométrique (Lemme 2.28) : $1+j+j^2=\frac{1-j^3}{1-j}=0$ car $j^3=1$.`, T`[resultat] ${OKVF(true)} (TD2 ex 3.2)`] },
      { e: T`$j^2=\bar j$, où $j=e^{2i\pi/3}$.`, rep: true, ex: [J, T`[calcul] $j^2=e^{4i\pi/3}=e^{-2i\pi/3}=\overline{e^{2i\pi/3}}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`L'équation $z^{${n}}=1$ a exactement $${n}$ solutions dans $\mathbb C$.`, rep: true, ex: [T`[cours] **Prop. 2.26** (p.41) : $z^n=1$ admet $n$ solutions **distinctes**, $\cours{\omega_k=e^{2ik\pi/n}}$, $0\le k\le n-1$.`, T`[resultat] ${OKVF(true)} Elles forment un polygone régulier sur le cercle unité.`] },
      { e: T`La somme des $${n}$ racines $${n}$-ièmes de l'unité vaut $1$.`, rep: false, ex: [T`[cours] Somme géométrique (Lemme 2.28, p.42) : pour $z\neq1$, $\cours{1+z+\dots+z^{n}=\frac{1-z^{n+1}}{1-z}}$.`, T`[calcul] Avec $\omega=e^{2i\pi/${n}}$ : $1+\omega+\dots+\omega^{${n - 1}}=\frac{1-\omega^{${n}}}{1-\omega}=0$.`, T`[resultat] ${OKVF(false)} Elle vaut $0$.`] },
      { e: T`$e^{i\pi}=1$.`, rep: false, ex: [T`[cours] $\cours{e^{i\theta}=\cos\theta+i\sin\theta}$ (Énoncé indispensable 14).`, T`[calcul] $e^{i\pi}=\cos\pi+i\sin\pi=-1$.`, T`[resultat] ${OKVF(false)} C'est $e^{2i\pi}$ qui vaut $1$.`] },
      { e: T`La suite $\left(\left(\frac i2\right)^n\right)_n$ tend vers $0$.`, rep: true, ex: [SG, T`[calcul] $\left|\frac i2\right|=\frac12<1$.`, T`[resultat] ${OKVF(true)} (TD2 ex 7.3)`] },
      { e: T`La suite $(i^n)_n$ converge.`, rep: false, ex: [SG, T`[calcul] $|i|=1$ et la suite prend indéfiniment les valeurs $1,\ i,\ -1,\ -i$.`, T`[resultat] ${OKVF(false)} Elle est périodique de période 4 (TD2 ex 7.4).`] },
      { e: T`La suite $\left((1+i)^n\right)_n$ tend vers $0$.`, rep: false, ex: [SG, T`[calcul] $|1+i|=\sqrt2>1$ : le module $\sqrt2^{\,n}$ tend vers $+\infty$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour tous complexes non nuls $z_1,z_2$ : $\arg(z_1z_2)\equiv\arg(z_1)+\arg(z_2)\ [2\pi]$.`, rep: true, ex: [T`[cours] **Énoncé indispensable** (p.39) : $\cours{(\rho_1e^{i\theta_1})(\rho_2e^{i\theta_2})=\rho_1\rho_2e^{i(\theta_1+\theta_2)}}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout complexe $z$ : $e^z\neq0$.`, rep: true, ex: [T`[cours] (Déf. 2.23, p.41) $\cours{e^{x+iy}=e^xe^{iy}}$ a pour module $e^x>0$.`, T`[resultat] ${OKVF(true)}`] },
    ]
  },
)

// =====================================================================================
// §2.1.7–2.1.8 Racines n-ièmes, sommes géométriques
// =====================================================================================

/** f·π en LaTeX. */
const piTex = (f: Frac) => {
  if (f.zero) return '0'
  const a = Math.abs(f.n)
  const num = a === 1 ? T`\pi` : T`${a}\pi`
  return `${f.n < 0 ? '-' : ''}${f.d === 1 ? num : `\\frac{${num}}{${f.d}}`}`
}

const racinesNiemes: Gabarit = {
  id: 'g2-racines-n',
  chapitre: 'ch2',
  section: 'ch2.s3',
  niveau: 1,
  titre: 'Racines n-ièmes d’un complexe',
  source: 'TD2 ex 3, 5 et 6',
  refCours: 'poly §2.1.7 p.41 (Prop. 2.26)',
  generer(r) {
    type It = { w: string; n: number; rho: string; rhoN: string; rhoV: number; phi: number }
    const speciaux: It[] = [
      { w: '2-2i', n: 3, rho: T`\sqrt2`, rhoN: T`2\sqrt2`, rhoV: Math.SQRT2, phi: -3 },
      { w: T`1+i\sqrt3`, n: 2, rho: T`\sqrt2`, rhoN: '2', rhoV: Math.SQRT2, phi: 4 },
      { w: T`-8+8i\sqrt3`, n: 4, rho: '2', rhoN: '16', rhoV: 2, phi: 8 },
      { w: T`4\sqrt2\,(1+i)`, n: 3, rho: '2', rhoN: '8', rhoV: 2, phi: 3 },
    ]
    let it: It
    if (r.bool(0.3)) it = r.pick(speciaux)
    else {
      const n = r.int(2, 4)
      const ro = r.int(2, 3)
      const phi = r.pick([0, 6, 12, -6])
      const v = ro ** n
      it = { w: { 0: `${v}`, 6: `${v}i`, 12: `${-v}`, [-6]: `${-v}i` }[phi]!, n, rho: `${ro}`, rhoN: `${v}`, rhoV: ro, phi }
    }
    const { n, phi } = it
    /** Ensemble d'angles (départ + k·pas), ramenés dans [0, 2π[ et triés. */
    const angles = (depart: Frac, pas: Frac) => {
      const xs = Array.from({ length: n }, (_, k) => {
        const f = depart.add(pas.mul(k))
        const m = ((f.n % (2 * f.d)) + 2 * f.d) % (2 * f.d)
        return new Frac(m, f.d)
      }).sort((a, b) => a.valeur() - b.valeur())
      return xs.map(piTex).join(',\\ ')
    }
    const base = new Frac(phi, 12 * n)
    const tour = new Frac(2, n)
    const phrase = (rho: string, set: string) => T`$z=${rho}\,e^{i\theta}$ avec $\theta\in\left\{${set}\right\}$`
    const bonSet = angles(base, tour)
    const bon = phrase(it.rho, bonSet)
    const leurres = [
      phrase(it.rhoN, bonSet),
      phrase(it.rho, angles(base, new Frac(1, n))),
      phrase(it.rho, angles(base.add(new Frac(1, n)), tour)),
      ...(phi !== 0 ? [phrase(it.rho, angles(new Frac(phi, 12), tour))] : []),
    ]
    // contrôle : chaque racine élevée à la puissance n redonne w
    for (let k = 0; k < n; k++) {
      const th = base.add(tour.mul(k)).valeur() * Math.PI
      verifier(Math.abs(Math.cos(n * th) - Math.cos((phi * Math.PI) / 12)) < 1e-9 && Math.abs(Math.sin(n * th) - Math.sin((phi * Math.PI) / 12)) < 1e-9, 'racine n-ième')
    }
    const { choix, reponse } = choixQcm(r, bon, leurres)
    const argW = piTex(new Frac(phi, 12))
    return {
      type: 'qcm',
      enonce: T`Résoudre dans $\mathbb C$ l'équation $z^{${n}}=${it.w}$ (angles donnés dans $[0,2\pi[$).`,
      choix,
      reponse,
      indice: T`Écris $${it.w}$ sous forme exponentielle, puis cherche $z=\rho e^{i\theta}$.`,
      explication: [
        T`[cours] On cherche $z=\rho e^{i\theta}$ : $\cours{z^n=\rho^ne^{in\theta}}$. Deux complexes non nuls sont égaux si et seulement s'ils ont le même module et des arguments égaux **modulo $2\pi$** (Énoncé indispensable 16 ; méthode de la Prop. 2.26, p.41).`,
        T`[calcul] $${it.w}=${it.rhoN}\,e^{i\,${argW === '0' ? '0' : argW}}$. Donc $\rho^{${n}}=${it.rhoN}$, soit $\rho=\cle{${it.rho}}$, et $${n}\theta\equiv${argW}\ [2\pi]$, soit $$\theta=${base.zero ? '' : piTex(base) + '+'}k\times${piTex(tour)},\quad k=0,\dots,${n - 1}.$$`,
        T`[resultat] $${n}$ solutions : ${ok(bon.split(' avec ')[0])} avec $\ok{\theta\in\left\{${bonSet}\right\}}$`,
        T`[piege] Le module est la racine $${n}$-ième de $${it.rhoN}$ (pas $${it.rhoN}$), l'argument est **divisé** par $${n}$, et les solutions sont espacées de $${piTex(tour)}$ : il y en a toujours $${n}$.`,
      ].join('\n'),
    }
  },
}

const sommeGeo: Gabarit = {
  id: 'g2-somme-geo',
  chapitre: 'ch2',
  section: 'ch2.s3',
  niveau: 2,
  titre: 'Sommes et suites géométriques complexes',
  source: 'TD2 ex 7',
  refCours: 'poly §2.1.8 p.42 (Lemmes 2.27 et 2.28)',
  generer(r) {
    const n = r.int(5, 40)
    const cas = r.int(0, 2)
    const IN = ['1', 'i', '-1', '-i']
    const SG = T`[cours] **Somme géométrique** (Lemme 2.28, p.42) : pour $z\neq1$, $$\cours{1+z+\dots+z^{n}=\frac{1-z^{n+1}}{1-z}}$$ Et $\cours{i^4=1}$ : les puissances de $i$ sont périodiques de période 4.`
    if (cas === 0) {
      const S: Z[] = [[1, 0], [1, 1], [0, 1], [0, 0]]
      const s = S[n % 4]
      let acc: Z = [0, 0]
      let p: Z = [1, 0]
      for (let k = 0; k <= n; k++) {
        acc = zadd(acc, p)
        p = zmul(p, [0, 1])
      }
      verifier(acc[0] === s[0] && acc[1] === s[1], 'somme des i^k')
      return {
        type: 'num',
        enonce: T`Calculer $\displaystyle\sum_{k=0}^{${n}}i^k=1+i+i^2+\dots+i^{${n}}$.`,
        reponse: ascZ(s[0], s[1]),
        explication: [
          SG,
          T`[calcul] $\displaystyle\sum_{k=0}^{${n}}i^k=\frac{1-i^{${n + 1}}}{1-i}$ et $${n + 1}=4\times${Math.floor((n + 1) / 4)}+${(n + 1) % 4}$, donc $i^{${n + 1}}=${IN[(n + 1) % 4]}$.`,
          T`Autre vue : quatre termes consécutifs $1+i-1-i$ ont une somme **nulle** ; il reste les ${(n + 1) % 4 === 0 ? 'zéro' : (n + 1) % 4} dernier(s) terme(s).`,
          T`[resultat] $\ok{${tz(s)}}$`,
          T`[piege] La somme va de $k=0$ à $${n}$ : elle a $${n + 1}$ termes, d'où l'exposant $${n + 1}$.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const V: Z[] = [[0, 0], [0, 1], [-1, 1], [-1, 0]]
      let z: Z = [0, 0]
      for (let k = 0; k < n; k++) z = zadd(zmul([0, 1], z), [0, 1])
      verifier(z[0] === V[n % 4][0] && z[1] === V[n % 4][1], 'suite z_n')
      return {
        type: 'num',
        enonce: T`On définit la suite $(z_n)$ par $z_0=0$ et $z_{n+1}=i\,z_n+i$. Calculer $z_{${n}}$.`,
        reponse: ascZ(z[0], z[1]),
        indice: T`Calcule $z_1,z_2,z_3,z_4$ : que remarques-tu ?`,
        explication: [
          T`[cours] TD2 ex 7 : pour $z_{n+1}=\lambda z_n+i$ avec $z_0=0$ et $\lambda\neq1$, $\cours{z_n=\frac{\lambda^n-1}{\lambda-1}\,i}$ (récurrence). Avec $\lambda=i$ et $i^4=1$, la suite est **périodique de période 4**.`,
          T`[calcul] $z_1=i$, $z_2=i\cdot i+i=-1+i$, $z_3=i(-1+i)+i=-1$, $z_4=-i+i=0=z_0$. Donc $z_{n+4}=z_n$.`,
          T`$${n}=4\times${Math.floor(n / 4)}+${n % 4}$, donc $z_{${n}}=z_{${n % 4}}$.`,
          T`[resultat] $\ok{${tz(z)}}$`,
          T`[piege] La suite ne converge pas : elle tourne indéfiniment sur quatre valeurs (TD2 ex 7.4).`,
        ].join('\n'),
      }
    }
    const m = r.int(3, 12)
    return {
      type: 'num',
      enonce: T`Soit $\omega=e^{2i\pi/${m}}$. Calculer $1+\omega+\omega^2+\dots+\omega^{${m - 1}}$.`,
      reponse: 0,
      explication: [
        SG,
        T`[calcul] $\omega\neq1$ et $\omega^{${m}}=e^{2i\pi}=1$, donc la somme vaut $\frac{1-\omega^{${m}}}{1-\omega}=\frac{0}{1-\omega}$.`,
        T`[resultat] $\ok{0}$ : la somme des racines $${m}$-ièmes de l'unité est nulle (cas des racines cubiques : $1+j+j^2=0$, TD2 ex 3.2).`,
        T`[piege] La formule exige $z\neq1$ ; pour $z=1$ la somme vaudrait simplement le nombre de termes.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §2.1.9 Racines carrées, second degré
// =====================================================================================

const racineCarree: Gabarit = {
  id: 'g2-racine-carree',
  chapitre: 'ch2',
  section: 'ch2.s4',
  niveau: 1,
  titre: 'Racines carrées d’un complexe',
  source: 'TD2 ex 4',
  refCours: 'poly §2.1.9 p.43',
  indispensable: 17,
  generer(r) {
    const x = r.int(1, 5)
    let y: number
    do y = r.nz(-5, 5)
    while (Math.abs(y) === x)
    const [a, b] = [x * x - y * y, 2 * x * y]
    const m = x * x + y * y
    verifier(zmul([x, y], [x, y])[0] === a && zmul([x, y], [x, y])[1] === b, 'racine carrée')
    return {
      type: 'num',
      enonce: T`Déterminer la racine carrée complexe de $${texZ(a, b)}$ dont la **partie réelle est positive**.`,
      reponse: ascZ(x, y),
      indice: 'Trois équations : partie réelle, partie imaginaire, et le module.',
      explication: [
        T`[cours] **Énoncé indispensable 17** (p.43) : pour trouver $\pm(x+iy)$ tels que $(x+iy)^2=a+ib$, développer et penser « **le module me donnera une équation supplémentaire** ».`,
        T`[methode] $(x+iy)^2=x^2-y^2+2ixy$ et $|x+iy|^2=|a+ib|$ donnent : $$x^2-y^2=${a},\qquad2xy=${b},\qquad x^2+y^2=\sqrt{${par(a)}^2+${par(b)}^2}=${m}.$$`,
        T`[calcul] Somme et différence de la 1re et de la 3e : $2x^2=${m + a}$ et $2y^2=${m - a}$, soit $x=\pm${x}$ et $y=\pm${Math.abs(y)}$. Le signe de $2xy=${b}$ dit que $x$ et $y$ sont de ${b > 0 ? '**même signe**' : '**signes contraires**'}.`,
        T`[resultat] Les racines carrées sont $\pm(${texZ(x, y)})$ ; celle de partie réelle positive est $\ok{${texZ(x, y)}}$.`,
        T`[verif] $(${texZ(x, y)})^2=${x * x}-${y * y}${b < 0 ? '-' : '+'}${Math.abs(b)}i=${texZ(a, b)}$.`,
        T`[piege] Dans $\mathbb C$, pas de symbole $\sqrt{\ }$ : un complexe non nul a **deux** racines carrées opposées, aucune n'est « la positive ».`,
      ].join('\n'),
    }
  },
}

const secondDegre: Gabarit = {
  id: 'g2-second-degre',
  chapitre: 'ch2',
  section: 'ch2.s4',
  niveau: 1,
  titre: 'Second degré à coefficients réels, Δ < 0',
  source: 'TD2 ex 10.1 et 15',
  refCours: 'poly §2.1.9 p.44',
  indispensable: 18,
  generer(r) {
    const p = r.int(-5, 5)
    const q = r.int(1, 6)
    const [b, c] = [-2 * p, p * p + q * q]
    const delta = b * b - 4 * c
    return {
      type: 'num',
      enonce: T`Résoudre dans $\mathbb C$ l'équation $${lin([1, b, c], ['z^2', 'z', ''])}=0$ et donner la solution dont la **partie imaginaire est positive**.`,
      reponse: ascZ(p, q),
      explication: [
        T`[cours] **Énoncé indispensable 18** (p.44) : $az^2+bz+c=0$ a pour discriminant $\cours{\Delta=b^2-4ac}$ ; si $\pm\delta$ sont les racines carrées complexes de $\Delta$, les solutions sont $\cours{\frac{-b\pm\delta}{2a}}$.`,
        T`[calcul] Discriminant : $\Delta=${par(b)}^2-4\times${c}=\cle{${delta}}<0$. Ses racines carrées complexes sont $\pm${2 * q}i$, car $(${2 * q}i)^2=${delta}$.`,
        T`$$z=\frac{${-b}\pm${2 * q}i}{2}=${texZ(p, q)}\ \text{ ou }\ ${texZ(p, -q)}$$`,
        T`[resultat] $\ok{${texZ(p, q)}}$ (l'autre solution est son **conjugué** $${texZ(p, -q)}$).`,
        T`[piege] « $\Delta<0$ donc pas de solution » n'est vrai que dans $\mathbb R$. Dans $\mathbb C$, un trinôme réel à $\Delta<0$ a deux racines **conjuguées** (TD2 ex 15).`,
      ].join('\n'),
    }
  },
}

const trinomeComplexe: Gabarit = {
  id: 'g2-trinome-complexe',
  chapitre: 'ch2',
  section: 'ch2.s4',
  niveau: 2,
  titre: 'Second degré à coefficients complexes',
  source: 'TD2 ex 10.2 et 10.3',
  refCours: 'poly §2.1.9 p.43–44',
  indispensable: 18,
  generer(r) {
    for (;;) {
      const z1 = zr(r, 4)
      const z2: Z = [r.int(-4, 4), r.int(-4, 4)]
      const paire = (a: Z, b: Z) => T`$${tz(a)}$ et $${tz(b)}$`
      const cle = (a: Z, b: Z) => [tz(a), tz(b)].sort().join('|')
      const sets: [Z, Z][] = [[z1, z2], [zneg(z1), zneg(z2)], [zconj(z1), zconj(z2)], [z1, zneg(z2)]]
      if (new Set(sets.map(([a, b]) => cle(a, b))).size < 4) continue
      const S = zadd(z1, z2)
      const P = zmul(z1, z2)
      if ((S[0] === 0 && S[1] === 0) || (P[0] === 0 && P[1] === 0)) continue
      const d = zsub(z1, z2)
      const D = zmul(d, d)
      const eq = `z^2${terme(zneg(S), 'z')}${terme(P, '')}`
      const choix = r.shuffle(sets.map(([a, b]) => paire(a, b)))
      return {
        type: 'qcm',
        enonce: T`Quelles sont les solutions dans $\mathbb C$ de l'équation $$${eq}=0\ ?$$`,
        choix,
        reponse: choix.indexOf(paire(z1, z2)),
        indice: 'Calcule Δ, puis cherche une racine carrée complexe δ de Δ.',
        explication: [
          T`[cours] **Énoncé indispensable 18** (p.44) : $\cours{\Delta=b^2-4ac}$, puis $\cours{z=\frac{-b\pm\delta}{2a}}$ où $\delta$ est **une racine carrée complexe** de $\Delta$ (méthode de l'Énoncé indispensable 17).`,
          T`[calcul] Ici $a=1$, $b=${tz(zneg(S))}$, $c=${tz(P)}$ : $\Delta=${pz(zneg(S))}^2-4\times${pz(P)}=\cle{${tz(D)}}$.`,
          T`Une racine carrée de $\Delta$ est $\delta=\cle{${tz(d)}}$ (vérification : $${pz(d)}^2=${tz(D)}$).`,
          T`$$z=\frac{-b\pm\delta}2=\frac{${tz(S)}\pm${pz(d)}}2$$`,
          T`[resultat] $\ok{${tz(z1)}\ \text{ et }\ ${tz(z2)}}$`,
          T`[verif] Somme des racines $=${tz(S)}=-b$ et produit $=${tz(P)}=c$.`,
          T`[piege] Avec des coefficients **complexes**, les deux solutions ne sont en général **pas conjuguées**.`,
        ].join('\n'),
      }
    }
  },
}

// =====================================================================================
// §2.2 Polynômes : opérations, degré
// =====================================================================================

const degre: Gabarit = {
  id: 'g2-degre',
  chapitre: 'ch2',
  section: 'ch2.s5',
  niveau: 1,
  titre: 'Degré, coefficients, polynôme dérivé',
  source: 'poly §2.2 (exemples)',
  refCours: 'poly §2.2.1–2.2.2 p.45–48 (Déf. 2.34 à 2.38)',
  generer(r) {
    const cas = r.int(0, 3)
    const DEG = T`[cours] (Déf. 2.38, p.46) Le **degré** est le plus grand exposant dont le coefficient est non nul. $\cours{\deg(PQ)=\deg P+\deg Q}$ et $\cours{\deg(P+Q)\le\max(\deg P,\deg Q)}$.`
    if (cas === 0) {
      const [p, q] = [r.int(2, 7), r.int(2, 7)]
      return {
        type: 'num',
        enonce: T`$P$ est un polynôme de degré $${p}$ et $Q$ un polynôme de degré $${q}$. Quel est le degré de $PQ$ ?`,
        reponse: p + q,
        explication: [DEG, T`[calcul] Le terme dominant de $PQ$ est le produit des termes dominants : $a_{${p}}X^{${p}}\times b_{${q}}X^{${q}}=a_{${p}}b_{${q}}X^{${p + q}}$, non nul.`, T`[resultat] $\ok{${p + q}}$`, T`[piege] Les degrés s'**additionnent**, ils ne se multiplient pas.`].join('\n'),
      }
    }
    if (cas === 1) {
      const d = r.int(2, 4)
      const a = r.nz(-5, 5)
      const annule = r.bool(0.6)
      const P = [a, ...Array.from({ length: d }, () => r.int(-5, 5))]
      const Q = [annule ? -a : r.nz(-5, 5), ...Array.from({ length: d }, () => r.int(-5, 5))]
      if (!annule && Q[0] === -a) Q[0] = a
      if (annule && P[1] + Q[1] === 0) Q[1] += 1
      const somme = P.map((x, i) => x + Q[i])
      const deg = d - somme.findIndex((x) => x !== 0)
      return {
        type: 'num',
        enonce: T`Soient $P=${lin(P, XN(d))}$ et $Q=${lin(Q, XN(d))}$. Quel est le degré de $P+Q$ ?`,
        reponse: deg,
        explication: [
          DEG,
          T`[calcul] On additionne coefficient par coefficient (Déf. 2.34) : $P+Q=${lin(somme, XN(d))}$.`,
          T`[resultat] $\ok{${deg}}$`,
          annule ? T`[piege] Les termes dominants **se compensent** : le degré de la somme peut être strictement plus petit que $${d}$.` : T`[piege] Ce n'est pas $${d}+${d}$ : pour une somme, le degré ne dépasse pas le plus grand des deux.`,
        ].join('\n'),
      }
    }
    if (cas === 2) {
      const [a, b, c, d, e] = [r.nz(-4, 4), r.nz(-5, 5), r.nz(-5, 5), r.nz(-4, 4), r.nz(-5, 5)]
      const k = r.int(1, 2)
      const val = k === 2 ? a * e + b * d : b * e + c * d
      return {
        type: 'num',
        enonce: T`Quel est le coefficient de $${k === 2 ? 'X^2' : 'X'}$ dans le produit $(${lin([a, b, c], XN(2))})(${lin([d, e], XN(1))})$ ?`,
        reponse: val,
        explication: [
          T`[cours] (Déf. 2.36, p.46) Dans un produit, le coefficient de $X^k$ est $\cours{c_k=\sum_{i+j=k}a_ib_j}$ : on rassemble **tous** les produits de termes dont les degrés s'additionnent à $k$.`,
          k === 2
            ? T`[calcul] $X^2\times1$ et $X\times X$ : $${par(a)}\times${par(e)}+${par(b)}\times${par(d)}=${val}$`
            : T`[calcul] $X\times1$ et $1\times X$ : $${par(b)}\times${par(e)}+${par(c)}\times${par(d)}=${val}$`,
          T`[resultat] $\ok{${val}}$`,
          T`[piege] Oublier l'un des deux produits croisés.`,
        ].join('\n'),
      }
    }
    const n = r.int(3, 6)
    const P = [r.nz(-5, 5), ...Array.from({ length: n }, () => r.int(-4, 4))]
    return {
      type: 'num',
      enonce: T`Soit $P=${lin(P, XN(n))}$. Quel est le coefficient dominant du polynôme dérivé $P'$ ?`,
      reponse: n * P[0],
      explication: [
        T`[cours] (Déf. 2.57, p.52) $\cours{P'=na_nX^{n-1}+\dots+2a_2X+a_1}$ : si $\deg P=n\ge1$, alors $\deg P'=n-1$.`,
        T`[calcul] Le terme dominant $${lin([P[0]], [`X^${n}`])}$ se dérive en $${n}\times${par(P[0])}\,X^{${n - 1}}$.`,
        T`[resultat] $\ok{${n * P[0]}}$ (et $P'$ est de degré $${n - 1}$).`,
        T`[piege] On multiplie par l'**exposant**, puis l'exposant baisse de 1.`,
      ].join('\n'),
    }
  },
}

const equationPolynome: Gabarit = {
  id: 'g2-eq-polynome',
  chapitre: 'ch2',
  section: 'ch2.s5',
  niveau: 2,
  titre: 'Équation d’inconnue un polynôme',
  source: 'TD2 ex 8 et 9',
  refCours: 'poly §2.2.1–2.2.2 p.45–48',
  generer(r) {
    const a = r.int(1, 4)
    const b = r.nz(-5, 5)
    const X2 = ['x^2', 'x', '']
    if (r.bool()) {
      const D = [a * a, 2 * a * b + a, b * b + b]
      return {
        type: 'court',
        enonce: T`Déterminer le polynôme $P$, de **coefficient dominant positif**, tel que $$P(x)^2+P(x)=${lin(D, X2)}.$$`,
        reponse: [linAscii([a, b], ['x', ''])],
        variables: ['x'],
        mode: 'expression',
        format: 'P(x) = … (expression en x)',
        indice: 'Commence par le degré : quel est le degré de P² + P ?',
        explication: [
          T`[cours] $\cours{\deg(P^2)=2\deg P}$ : on raisonne **d'abord sur le degré**, puis on **identifie les coefficients** (deux polynômes sont égaux si et seulement s'ils ont les mêmes coefficients).`,
          T`[methode] Si $\deg P=d\ge1$, alors $\deg(P^2+P)=2d=2$, donc $d=1$ : on pose $P=ax+b$.`,
          T`[calcul] $P^2+P=a^2x^2+(2ab+a)x+(b^2+b)$. Identification : $a^2=${D[0]}$, donc $a=\pm${a}$ ; avec $a=${a}$ : $${2 * a}b+${a}=${D[1]}$, soit $b=\cle{${b}}$, et on vérifie $b^2+b=${D[2]}$.`,
          T`[resultat] $\ok{P(x)=${lin([a, b], ['x', ''])}}$ (l'autre solution est $P(x)=${lin([-a, -b - 1], ['x', ''])}$, de coefficient dominant négatif).`,
          T`[piege] Ne pas oublier la **deuxième** solution $a=-${a}$ (TD2 ex 8), ni de vérifier le terme constant.`,
        ].join('\n'),
      }
    }
    const D = [a, b, a]
    return {
      type: 'court',
      enonce: T`Déterminer le polynôme $P$ à coefficients réels tel que $$P'(x)+x\,P(x)=${lin(D, X2)}.$$`,
      reponse: [linAscii([a, b], ['x', ''])],
      variables: ['x'],
      mode: 'expression',
      format: 'P(x) = … (expression en x)',
      indice: 'Quel est le degré de xP ? Et celui de P′ ?',
      explication: [
        T`[cours] $\cours{\deg(XP)=\deg P+1}$ et $\cours{\deg P'=\deg P-1}$ (Déf. 2.57) : c'est $XP$ qui donne le degré.`,
        T`[methode] $\deg(P'+XP)=\deg P+1=2$, donc $\deg P=1$ : on pose $P=ax+b$, d'où $P'=a$.`,
        T`[calcul] $P'+xP=ax^2+bx+a$. Identification : $a=\cle{${a}}$, $b=\cle{${b}}$, et le terme constant vaut bien $a=${a}$.`,
        T`[resultat] $\ok{P(x)=${lin([a, b], ['x', ''])}}$`,
        T`[piege] Le terme constant doit être **compatible** : si la constante de droite ne valait pas $a$, il n'y aurait aucune solution (TD2 ex 9).`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §2.3 Racines d'un polynôme
// =====================================================================================

const racinesCubique: Gabarit = {
  id: 'g2-racines-cubique',
  chapitre: 'ch2',
  section: 'ch2.s6',
  niveau: 1,
  titre: 'Racine évidente et factorisation d’un polynôme de degré 3',
  source: 'TD2 ex 10.4',
  refCours: 'poly §2.3 p.48–51 (Prop. 2.45 et Cor. 2.50)',
  generer(r) {
    const r1 = r.pick([-1, 1])
    let r2: number, r3: number
    do {
      r2 = r.int(-6, 6)
      r3 = r.int(-6, 6)
    } while (r2 >= r3 || r2 === r1 || r3 === r1)
    const P = [1, -(r1 + r2 + r3), r1 * r2 + r1 * r3 + r2 * r3, -r1 * r2 * r3]
    const Q = [1, -(r2 + r3), r2 * r3]
    const grande = r.bool()
    const rac = [r1, r2, r3].sort((a, b) => a - b)
    const f = (x: number) => (x === 0 ? 'Z' : x > 0 ? `(Z-${x})` : `(Z+${-x})`)
    const ZN = ['Z^3', 'Z^2', 'Z', '']
    return {
      type: 'num',
      enonce: T`Soit $P(Z)=${lin(P, ZN)}$. Trouver ses trois racines (commencer par tester $-1$, $0$ et $1$) et donner la **plus ${grande ? 'grande' : 'petite'}**.`,
      reponse: grande ? rac[2] : rac[0],
      explication: [
        T`[cours] **Prop. 2.45** (p.49) : si $\alpha$ est racine de $P$, alors $\cours{P=(X-\alpha)Q}$. **Cor. 2.50** : un polynôme de degré $n$ a exactement $n$ racines complexes (comptées avec multiplicité) et $\cours{P=a(X-\alpha_1)\cdots(X-\alpha_n)}$.`,
        T`[methode] (1) Trouver une racine évidente ; (2) factoriser par $(Z-\alpha)$ en identifiant les coefficients ; (3) résoudre le trinôme restant.`,
        T`[calcul] $P(${r1})=0$, donc $P(Z)=${f(r1)}(${lin(Q, ['Z^2', 'Z', ''])})$. Le trinôme a pour discriminant $\Delta=${Q[1] * Q[1] - 4 * Q[2]}$ et pour racines $\cle{${r2}}$ et $\cle{${r3}}$.`,
        T`[resultat] $P(Z)=${[r1, r2, r3].map(f).join('')}$ ; racines $${rac.join(',\\ ')}$, toutes simples. La plus ${grande ? 'grande' : 'petite'} est $\ok{${grande ? rac[2] : rac[0]}}$.`,
        T`[verif] Somme des racines : $${rac.join('+').replace(/\+-/g, '-')}=${-P[1]}$, l'opposé du coefficient de $Z^2$.`,
      ].join('\n'),
    }
  },
}

const multiplicite: Gabarit = {
  id: 'g2-multiplicite',
  chapitre: 'ch2',
  section: 'ch2.s6',
  niveau: 2,
  titre: 'Multiplicité d’une racine (dérivées successives)',
  source: 'TD2 ex 12',
  refCours: 'poly §2.3.3 p.52–53 (Déf. 2.56, Prop. 2.59)',
  generer(r) {
    const a = r.nz(-3, 3)
    const cas = r.int(0, 3)
    const C = T`[cours] **Prop. 2.59** (p.53) : $a$ est racine de multiplicité $m$ de $P$ si et seulement si $$\cours{P(a)=P'(a)=\dots=P^{(m-1)}(a)=0\ \text{ et }\ P^{(m)}(a)\neq0.}$$`
    if (cas === 3) {
      const m = r.int(2, 5)
      return {
        type: 'num',
        enonce: T`Un polynôme $P$ vérifie $${Array.from({ length: m }, (_, k) => (k === 0 ? `P(${a})` : k === 1 ? `P'(${a})` : k === 2 ? `P''(${a})` : `P^{(${k})}(${a})`)).join('=')}=0$ et $${m === 2 ? `P''(${a})` : `P^{(${m})}(${a})`}\neq0$. Quelle est la multiplicité de la racine $${a}$ ?`,
        reponse: m,
        explication: [C, T`[calcul] $P$ et ses $${m - 1}$ premières dérivées s'annulent en $${a}$, pas la dérivée d'ordre $${m}$.`, T`[resultat] Multiplicité $\ok{${m}}$ : $P=(X${a < 0 ? '+' : '-'}${Math.abs(a)})^{${m}}Q$ avec $Q(${a})\neq0$ (Déf. 2.56).`, T`[piege] La multiplicité est l'ordre de la **première dérivée non nulle**, pas le nombre de dérivées nulles moins un.`].join('\n'),
      }
    }
    const L = [
      { P: [1, 0, -3 * a * a, 2 * a ** 3], d: 3, m: 2, fact: T`(X${a < 0 ? '+' : '-'}${Math.abs(a)})^2(X${a < 0 ? '-' : '+'}${2 * Math.abs(a)})` },
      { P: [1, -3 * a, 3 * a * a, -(a ** 3)], d: 3, m: 3, fact: T`(X${a < 0 ? '+' : '-'}${Math.abs(a)})^3` },
      { P: [1, 0, 0, -4 * a ** 3, 3 * a ** 4], d: 4, m: 2, fact: T`(X${a < 0 ? '+' : '-'}${Math.abs(a)})^2(${lin([1, 2 * a, 3 * a * a], XN(2))})` },
    ][cas]
    const ev = (c: number[], x: number) => c.reduce((s, k) => s * x + k, 0)
    const deriv = (c: number[]) => c.slice(0, -1).map((k, i) => k * (c.length - 1 - i))
    const d1 = deriv(L.P)
    const d2 = deriv(d1)
    const d3 = deriv(d2)
    verifier(ev(L.P, a) === 0 && ev(d1, a) === 0 && (L.m === 2 ? ev(d2, a) !== 0 : ev(d2, a) === 0 && ev(d3, a) !== 0), 'multiplicité')
    return {
      type: 'num',
      enonce: T`Le nombre $${a}$ est racine de $P=${lin(L.P, XN(L.d))}$. Quelle est sa multiplicité ?`,
      reponse: L.m,
      indice: T`Calcule $P'(${a})$, puis $P''(${a})$…`,
      explication: [
        C,
        T`[calcul] $P(${a})=0$. $P'=${lin(d1, XN(L.d - 1))}$, donc $P'(${a})=\cle{0}$. $P''=${lin(d2, XN(L.d - 2))}$, donc $P''(${a})=\cle{${ev(d2, a)}}$${L.m === 3 ? T`. $P^{(3)}=${ev(d3, a)}\neq0$` : T`$\neq0$`}.`,
        T`[resultat] Multiplicité $\ok{${L.m}}$ : $P=${L.fact}$.`,
        T`[piege] Vérifier $P(a)=0$ ne dit que « racine » ; c'est $P'(a)=0$ qui révèle une racine **multiple**.`,
      ].join('\n'),
    }
  },
}

const polynomesVf = vfPioche(
  { id: 'g2-poly-vf', section: 'ch2.s6', titre: 'Vrai / faux : polynômes et racines', source: 'TD2 ex 10, 11 et 15', refCours: 'poly §2.2–2.3 p.44–54' },
  (r) => {
    const n = r.int(3, 9)
    const DA = T`[cours] **Théorème de d'Alembert-Gauss** (Thm. 2.48, p.50) : tout polynôme complexe de degré $\ge1$ a une racine dans $\mathbb C$. **Cor. 2.50** : un polynôme de degré $n\ge1$ a exactement $n$ racines complexes **comptées avec multiplicité**, et $\cours{P=a(X-\alpha_1)\cdots(X-\alpha_n)}$.`
    const FA = T`[cours] **Prop. 2.45** (p.49) : $\alpha$ est racine de $P$ si et seulement si $\cours{P=(X-\alpha)Q}$, c'est-à-dire $(X-\alpha)$ divise $P$.`
    return [
      { e: T`Tout polynôme à coefficients complexes de degré $${n}$ a exactement $${n}$ racines dans $\mathbb C$, comptées avec leur multiplicité.`, rep: true, ex: [DA, T`[resultat] ${OKVF(true)}`] },
      { e: T`Tout polynôme à coefficients réels de degré $${n}$ a exactement $${n}$ racines **réelles**.`, rep: false, ex: [DA, T`[calcul] $X^2+1$ est de degré 2 et n'a aucune racine réelle ; ses racines sont $i$ et $-i$.`, T`[resultat] ${OKVF(false)} Le compte n'est juste que dans $\mathbb C$.`] },
      { e: T`Le polynôme $X^2+1$ n'a pas de racine dans $\mathbb C$.`, rep: false, ex: [DA, T`[calcul] $i^2+1=0$ : $X^2+1=(X-i)(X+i)$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Si $P$ est à coefficients **réels** et si $z\in\mathbb C$ est racine de $P$, alors $\bar z$ est aussi racine de $P$.`, rep: true, ex: [T`[cours] Le conjugué est compatible avec somme et produit, et $\cours{\bar a=a}$ pour $a$ réel.`, T`[calcul] $P(\bar z)=\overline{P(z)}=\bar0=0$.`, T`[resultat] ${OKVF(true)} Les racines non réelles vont par **paires conjuguées** (TD2 ex 15).`] },
      { e: T`Un trinôme $Z^2+aZ+b$ à coefficients réels, de racines non réelles $z$ et $\bar z$, vérifie $a=-2\Re(z)$ et $b=|z|^2$.`, rep: true, ex: [T`[cours] $\cours{(Z-z)(Z-\bar z)=Z^2-(z+\bar z)Z+z\bar z}$, avec $z+\bar z=2\Re(z)$ et $z\bar z=|z|^2$.`, T`[resultat] ${OKVF(true)} (TD2 ex 15.2)`] },
      { e: T`Si $\deg P=\deg Q=${n}$, alors $\deg(P+Q)=${n}$.`, rep: false, ex: [T`[cours] $\cours{\deg(P+Q)\le\max(\deg P,\deg Q)}$ : les termes dominants peuvent se compenser.`, T`[calcul] $P=X^{${n}}$ et $Q=-X^{${n}}+1$ : $P+Q=1$, de degré $0$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour tous polynômes non nuls $P,Q$ : $\deg(PQ)=\deg P+\deg Q$.`, rep: true, ex: [T`[cours] (§2.2.2, p.46–47) Le terme dominant de $PQ$ est le **produit des termes dominants**, non nul.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`$\alpha$ est racine de $P$ si et seulement si $(X-\alpha)$ divise $P$.`, rep: true, ex: [FA, T`[resultat] ${OKVF(true)}`] },
      { e: T`Un polynôme de degré au plus $${n}$ qui a $${n + 1}$ racines distinctes est le polynôme nul.`, rep: true, ex: [T`[cours] **Prop. 2.53** (p.51) : « seul le polynôme nul a trop de racines ». Si $\alpha_1,\dots,\alpha_r$ sont des racines distinctes, $(X-\alpha_1)\cdots(X-\alpha_r)$ divise $P$ (Prop. 2.52).`, T`[calcul] Un produit de $${n + 1}$ facteurs de degré 1 ne peut pas diviser un polynôme non nul de degré $\le${n}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`$a$ est racine **double** de $P$ si et seulement si $P(a)=P'(a)=0$ et $P''(a)\neq0$.`, rep: true, ex: [T`[cours] **Prop. 2.59** (p.53) avec $m=2$ : $\cours{P(a)=P'(a)=0\ \text{et}\ P''(a)\neq0}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`$X^2+X+1=(X-j)(X-j^2)$, où $j=e^{2i\pi/3}$.`, rep: true, ex: [T`[cours] $\cours{X^3-1=(X-1)(X^2+X+1)}$ et les racines de $X^3-1$ sont $1,j,j^2$ (Prop. 2.26).`, T`[resultat] ${OKVF(true)} (TD2 ex 11.1)`] },
      { e: T`$j=e^{2i\pi/3}$ est racine du polynôme $(X+1)^7-X^7-1$.`, rep: true, ex: [T`[cours] $\cours{1+j+j^2=0}$ et $\cours{j^3=1}$ (TD2 ex 3).`, T`[calcul] $j+1=-j^2$, donc $(j+1)^7=-j^{14}=-j^2$ ; et $j^7=j$. D'où $-j^2-j-1=0$.`, T`[resultat] ${OKVF(true)} De même pour $j^2$ : $X^2+X+1$ divise ce polynôme (TD2 ex 11).`] },
      { e: T`Tout polynôme de degré 3 à coefficients réels a au moins une racine réelle.`, rep: true, ex: [DA, T`[calcul] Il a 3 racines complexes ; les non réelles vont par paires conjuguées, donc en nombre **pair** : il en reste au moins une réelle.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Si $\deg P=${n}$, alors le polynôme dérivé $P'$ est de degré $${n}$.`, rep: false, ex: [T`[cours] (Déf. 2.57, p.52) $\cours{P'=na_nX^{n-1}+\dots+a_1}$ est de degré $n-1$.`, T`[resultat] ${OKVF(false)} $\deg P'=${n - 1}$.`] },
    ]
  },
)

export const GABARITS_CH2: Gabarit[] = [
  produit,
  quotient,
  moduleZ,
  algebreVf,
  impedance,
  formeTrigo,
  produitTrigo,
  puissanceReelle,
  expComplexe,
  expVf,
  racinesNiemes,
  sommeGeo,
  racineCarree,
  secondDegre,
  trinomeComplexe,
  degre,
  equationPolynome,
  racinesCubique,
  multiplicite,
  polynomesVf,
]
