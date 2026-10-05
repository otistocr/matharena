/**
 * Le Socle, suite — algèbre et arithmétique de base : priorités et signes, isoler une inconnue,
 * inégalités et encadrements, sommes Σ, factorielles, binôme, divisibilité, suites, mises en équation.
 * Thèmes repris des listes de prérequis d'entrée en L1 / prépa et du « GMAT Math Cheat Sheet »
 * (arithmétique, théorie des nombres, problèmes) ; contenu vérifié et rédigé pour l'appli.
 */
import type { Gabarit } from './types'
import { Frac, Rng, lin, linAscii, par, pgcdListe, verifier } from './outils'

const T = String.raw
const SRC_P = 'prérequis de calcul L1 (créée)'
const SRC_G = 'GMAT Math Cheat Sheet (S. Blackman Consulting)'
const OKVF = (b: boolean) => T`$\ok{\text{${b ? 'VRAI' : 'FAUX'}}}$`
const ok = (s: string) => `$\\ok{${s.slice(1, -1)}}$`
const lx = (p: number) => lin([1, p], ['x', ''])
const choixQcm = (r: Rng, bon: string, leurres: string[], n = 3) => {
  const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((l) => l !== bon)).slice(0, n)])
  return { choix, reponse: choix.indexOf(bon) }
}

type Vf = { e: string; rep: boolean; ex: string[] }
const vfPioche = (id: string, section: string, titre: string, source: string, refCours: string, pioche: (r: Rng) => Vf[]): Gabarit => ({
  id,
  chapitre: 'socle',
  section,
  niveau: 1,
  titre,
  source,
  refCours,
  generer(r) {
    const c = r.pick(pioche(r))
    return { type: 'vf', enonce: c.e, reponse: c.rep, explication: c.ex.join('\n') }
  },
})

/** Décomposition en facteurs premiers : 360 → [[2,3],[3,2],[5,1]]. */
function facteurs(n: number): [number, number][] {
  const out: [number, number][] = []
  for (let p = 2; p * p <= n; p++) {
    let e = 0
    while (n % p === 0) {
      n /= p
      e++
    }
    if (e) out.push([p, e])
  }
  if (n > 1) out.push([n, 1])
  return out
}
const texFact = (n: number) => facteurs(n).map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(T`\times`)
const binom = (n: number, k: number) => {
  let c = 1
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
  return Math.round(c)
}
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1))

// =====================================================================================
// s1 (suite) — Fractions littérales
// =====================================================================================

const fractionLitterale: Gabarit = {
  id: 'sc-frac-litterale',
  chapitre: 'socle',
  section: 'socle.s1',
  niveau: 1,
  titre: 'Additionner deux fractions littérales',
  source: SRC_P,
  refCours: 'fiche Socle : Fractions',
  generer(r) {
    let a: number, b: number, p: number, q: number
    do {
      ;[a, b, p, q] = [r.nz(-4, 4), r.nz(-4, 4), r.int(-5, 5), r.int(-5, 5)]
    } while (a + b === 0 || a === b || p === q || a * q + b * p === 0)
    const D = `(${lx(p)})(${lx(q)})`
    const fr = (num: string, den: string) => T`$\dfrac{${num}}{${den}}$`
    const bon = fr(lin([a + b, a * q + b * p], ['x', '']), D)
    const leurres = [fr(`${a + b}`, lin([2, p + q], ['x', ''])), fr(`${a + b}`, D), fr(lin([a + b, a * p + b * q], ['x', '']), D)]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    const x0 = 7
    verifier(Math.abs(a / (x0 + p) + b / (x0 + q) - ((a + b) * x0 + a * q + b * p) / ((x0 + p) * (x0 + q))) < 1e-9, 'fraction littérale')
    return {
      type: 'qcm',
      enonce: T`Mettre au même dénominateur : $\dfrac{${a}}{${lx(p)}}${b < 0 ? '-' : '+'}\dfrac{${Math.abs(b)}}{${lx(q)}}$.`,
      choix,
      reponse,
      explication: [
        T`[cours] $\cours{\frac ab+\frac cd=\frac{ad+bc}{bd}}$ : on multiplie **chaque numérateur** par le dénominateur de l'autre. Les règles sont les mêmes avec des lettres.`,
        T`[calcul] Dénominateur commun : $${D}$. Numérateur : $${a}(${lx(q)})${b < 0 ? '-' : '+'}${Math.abs(b)}(${lx(p)})=${lin([a, a * q], ['x', ''])}${b < 0 ? ' - ' : ' + '}${b < 0 ? `(${lin([-b, -b * p], ['x', ''])})` : lin([b, b * p], ['x', ''])}$.`,
        T`[resultat] ${ok(bon)}`,
        T`[piege] On n'additionne **jamais** les dénominateurs : $\ko{\frac{${a + b}}{${lin([2, p + q], ['x', ''])}}}$. Et chaque numérateur est multiplié par le dénominateur **de l'autre** fraction.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s14 — Priorités, signes, isoler une inconnue, mise en équation
// =====================================================================================

const priorites: Gabarit = {
  id: 'sc-priorites',
  chapitre: 'socle',
  section: 'socle.s14',
  niveau: 1,
  titre: 'Priorités opératoires et signes',
  source: SRC_G,
  refCours: 'fiche Socle : Priorités et signes',
  generer(r) {
    const [a, b, c, d] = [r.int(2, 9), r.int(2, 9), r.int(2, 6), r.int(2, 5)]
    const L: { tex: string; val: number; etapes: string; piege: string }[] = [
      { tex: T`${a}-${b}\times${c}`, val: a - b * c, etapes: T`$${a}-\cle{${b * c}}$`, piege: T`Faire $${a}-${b}$ d'abord : $\ko{${(a - b) * c}}$.` },
      { tex: T`-${a}^2+${b}`, val: -a * a + b, etapes: T`$-\cle{${a * a}}+${b}$ (le carré ne porte que sur $${a}$)`, piege: T`Confondre $-${a}^2=-${a * a}$ et $(-${a})^2=${a * a}$.` },
      { tex: T`(-${a})^2-${b}\times${c}`, val: a * a - b * c, etapes: T`$\cle{${a * a}}-\cle{${b * c}}$`, piege: T`$(-${a})^2$ est **positif** : les parenthèses mettent le signe sous le carré.` },
      { tex: T`${a}-(${b}-${c})\times${d}`, val: a - (b - c) * d, etapes: T`$${a}-${par(b - c)}\times${d}=${a}-${par((b - c) * d)}$`, piege: T`Les parenthèses d'abord, puis la multiplication, **puis** la soustraction.` },
      { tex: T`${a}+${b}\times${c}^2`, val: a + b * c * c, etapes: T`$${a}+${b}\times\cle{${c * c}}=${a}+${b * c * c}$`, piege: T`Calculer $(${b}\times${c})^2$ : la puissance passe **avant** la multiplication.` },
      { tex: T`${a}-${b}-(${c}-${d})`, val: a - b - c + d, etapes: T`$${a}-${b}-${c}+${d}$ (le moins devant la parenthèse change **tous** les signes)`, piege: T`Écrire $-(${c}-${d})=-${c}-${d}$.` },
      { tex: T`-${a}-(-${b})\times(-${c})`, val: -a - b * c, etapes: T`$(-${b})\times(-${c})=\cle{${b * c}}$, puis $-${a}-${b * c}$`, piege: T`Moins par moins donne plus **pour le produit**, mais il reste le signe moins devant.` },
      { tex: T`${a * d}\div${d}\times${c}`, val: a * c, etapes: T`de gauche à droite : $\cle{${a}}\times${c}$`, piege: T`Multiplication et division ont la **même priorité** : on calcule de gauche à droite, pas $${a * d}\div(${d}\times${c})$.` },
    ]
    const it = r.pick(L)
    return {
      type: 'num',
      enonce: T`Calculer $${it.tex}$.`,
      reponse: it.val,
      explication: [
        T`[cours] **Ordre des opérations** : $\cours{\text{parenthèses}\to\text{puissances}\to\times\text{ et }\div\to+\text{ et }-}$, et de gauche à droite à priorité égale. Signes : $(-)\times(-)=(+)$, $(-)\times(+)=(-)$.`,
        T`[calcul] ${it.etapes}`,
        T`[resultat] $\ok{${it.val}}$`,
        T`[piege] ${it.piege}`,
      ].join('\n'),
    }
  },
}

const isoler: Gabarit = {
  id: 'sc-isoler',
  chapitre: 'socle',
  section: 'socle.s14',
  niveau: 1,
  titre: 'Isoler une variable dans une formule',
  source: SRC_P,
  refCours: 'fiche Socle : Isoler une inconnue',
  generer(r) {
    const d = (s: string) => `$${s}$`
    const L: { f: string; v: string; bon: string; leurres: string[]; calc: string }[] = [
      { f: T`v=\dfrac dt`, v: 't', bon: T`t=\dfrac dv`, leurres: ['t=dv', T`t=\dfrac vd`, 't=v-d'], calc: T`On multiplie par $t$ : $vt=d$, puis on divise par $v$.` },
      { f: 'U=RI', v: 'I', bon: T`I=\dfrac UR`, leurres: ['I=UR', T`I=\dfrac RU`, 'I=U-R'], calc: T`On divise les deux membres par $R$.` },
      { f: 'y=ax+b', v: 'x', bon: T`x=\dfrac{y-b}a`, leurres: [T`x=\dfrac ya-b`, T`x=\dfrac{y+b}a`, 'x=a(y-b)'], calc: T`On retranche $b$ : $y-b=ax$, puis on divise **tout le membre** par $a$.` },
      { f: T`\dfrac1f=\dfrac1a+\dfrac1b`, v: 'f', bon: T`f=\dfrac{ab}{a+b}`, leurres: ['f=a+b', T`f=\dfrac{a+b}{ab}`, T`f=\dfrac1{a+b}`], calc: T`Même dénominateur : $\frac1f=\frac{a+b}{ab}$, puis on **inverse** les deux membres.` },
      { f: T`A=\pi r^2\ (r>0)`, v: 'r', bon: T`r=\sqrt{\dfrac A\pi}`, leurres: [T`r=\dfrac{\sqrt A}{\pi}`, T`r=\dfrac A{2\pi}`, T`r=\sqrt{A\pi}`], calc: T`On divise par $\pi$ : $r^2=\frac A\pi$, puis racine carrée (avec $r>0$).` },
      { f: T`E=\dfrac12mv^2\ (v>0)`, v: 'v', bon: T`v=\sqrt{\dfrac{2E}m}`, leurres: [T`v=\sqrt{\dfrac E{2m}}`, T`v=\dfrac{2E}m`, T`v=\dfrac{\sqrt{2E}}m`], calc: T`On multiplie par $2$ et on divise par $m$ : $v^2=\frac{2E}m$, puis racine carrée.` },
      { f: 'PV=nRT', v: 'T', bon: T`T=\dfrac{PV}{nR}`, leurres: [T`T=\dfrac{nR}{PV}`, 'T=PV-nR', 'T=PVnR'], calc: T`On divise les deux membres par $nR$.` },
      { f: T`C=\dfrac59(F-32)`, v: 'F', bon: T`F=\dfrac95C+32`, leurres: [T`F=\dfrac59C+32`, T`F=\dfrac95(C+32)`, T`F=\dfrac95C-32`], calc: T`On multiplie par $\frac95$ : $\frac95C=F-32$, puis on ajoute $32$.` },
      { f: T`S=\dfrac{a+b}2`, v: 'b', bon: 'b=2S-a', leurres: [T`b=\dfrac S2-a`, 'b=2(S-a)', 'b=2S+a'], calc: T`On multiplie par $2$ : $2S=a+b$, puis on retranche $a$.` },
      { f: T`y=\dfrac{x}{x+1}`, v: 'x', bon: T`x=\dfrac{y}{1-y}`, leurres: [T`x=\dfrac{y}{1+y}`, T`x=\dfrac{1-y}{y}`, 'x=y-1'], calc: T`$y(x+1)=x$, soit $yx+y=x$. On **regroupe** les $x$ : $y=x-yx=x(1-y)$, puis on divise par $1-y$.` },
    ]
    const it = r.pick(L)
    const { choix, reponse } = choixQcm(r, d(it.bon), it.leurres.map(d))
    return {
      type: 'qcm',
      enonce: r.bool() ? T`On donne la formule $${it.f}$. Exprimer $${it.v}$ en fonction des autres grandeurs.` : T`Isoler $${it.v}$ dans la relation $${it.f}$.`,
      choix,
      reponse,
      explication: [
        T`[cours] On a le droit de faire **la même opération des deux côtés** : $\cours{A=B\iff A+c=B+c}$ et, pour $c\neq0$, $\cours{A=B\iff cA=cB}$. On « défait » les opérations dans l'ordre inverse.`,
        T`[calcul] ${it.calc}`,
        T`[resultat] ${ok(d(it.bon))}`,
        T`[piege] Une opération s'applique à **tout le membre**, pas à un seul terme. Si l'inconnue apparaît deux fois, on la regroupe et on **factorise**.`,
      ].join('\n'),
    }
  },
}

const produitEnCroix: Gabarit = {
  id: 'sc-croix',
  chapitre: 'socle',
  section: 'socle.s14',
  niveau: 1,
  titre: 'Équation à fractions : produit en croix',
  source: SRC_G,
  refCours: 'fiche Socle : Isoler une inconnue',
  generer(r) {
    for (;;) {
      const [a, b, c, d, x0] = [r.nz(-4, 4), r.int(-6, 6), r.nz(-4, 4), r.int(-6, 6), r.int(-6, 6)]
      if (a * d - b * c === 0 || c * x0 + d === 0 || a * x0 + b === 0) continue
      const f = new Frac(a * x0 + b, c * x0 + d)
      const [p, q] = [f.n, f.d]
      const k = a * q - c * p
      if (k === 0) continue
      verifier(k * x0 === p * d - b * q, 'produit en croix')
      const N = lin([a, b], ['x', ''])
      const D = lin([c, d], ['x', ''])
      return {
        type: 'num',
        enonce: T`Résoudre l'équation $\dfrac{${N}}{${D}}=${f.tex()}$.`,
        reponse: x0,
        explication: [
          T`[cours] **Produit en croix** : pour $b\neq0$ et $d\neq0$, $\cours{\frac ab=\frac cd\iff ad=bc}$.`,
          T`[calcul] Condition : $${D}\neq0$. Puis $${q === 1 ? '' : q}(${N})=${p}(${D})$, soit $${lin([a * q, b * q], ['x', ''])}=${lin([c * p, d * p], ['x', ''])}$, donc $${lin([k], ['x'])}=${p * d - b * q}$.`,
          T`[resultat] $\ok{x=${x0}}$`,
          T`[verif] Pour $x=${x0}$ : $\frac{${a * x0 + b}}{${c * x0 + d}}=${f.tex()}$, et le dénominateur n'est pas nul.`,
          T`[piege] Toujours vérifier que la solution n'annule pas un **dénominateur**.`,
        ].join('\n'),
      }
    }
  },
}

const problemes: Gabarit = {
  id: 'sc-problemes',
  chapitre: 'socle',
  section: 'socle.s14',
  niveau: 2,
  titre: 'Mise en équation : vitesse, travail, partage',
  source: SRC_G,
  refCours: 'fiche Socle : Mise en équation',
  generer(r) {
    const cas = r.int(0, 3)
    if (cas === 0) {
      const [a, b, t] = r.pick([[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [20, 30, 12], [6, 3, 2], [12, 6, 4], [15, 10, 6], [4, 4, 2], [10, 40, 8]])
      return {
        type: 'num',
        enonce: T`Un robinet remplit une cuve en $${a}$ heures, un autre en $${b}$ heures. En combien d'heures la remplissent-ils **ensemble** ?`,
        reponse: t,
        unite: 'h',
        explication: [
          T`[cours] $\cours{\text{travail}=\text{débit}\times\text{temps}}$, et les **débits s'additionnent** (pas les durées).`,
          T`[calcul] Débits : $\frac1{${a}}$ et $\frac1{${b}}$ cuve par heure. Ensemble : $\frac1{${a}}+\frac1{${b}}=\frac{${a + b}}{${a * b}}=\frac1{${t}}$ cuve par heure.`,
          T`[resultat] $\ok{${t}\text{ heures}}$`,
          T`[piege] Ni $${a}+${b}$, ni la moyenne $${new Frac(a + b, 2).tex()}$ : à deux, on va **plus vite** que le plus rapide seul.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const [v1, v2, vm] = r.pick([[40, 60, 48], [30, 60, 40], [20, 30, 24], [60, 90, 72], [10, 15, 12], [60, 120, 80], [45, 90, 60]])
      return {
        type: 'num',
        enonce: T`On fait un trajet aller à $${v1}$ km/h et le retour, par la même route, à $${v2}$ km/h. Quelle est la vitesse moyenne sur l'aller-retour (en km/h) ?`,
        reponse: vm,
        unite: 'km/h',
        explication: [
          T`[cours] $\cours{\text{vitesse moyenne}=\frac{\text{distance totale}}{\text{durée totale}}}$, avec $d=v\times t$.`,
          T`[calcul] Pour un aller de longueur $d$ : durée $\frac d{${v1}}+\frac d{${v2}}=d\times\frac{${v1 + v2}}{${v1 * v2}}$. Vitesse moyenne : $\frac{2d}{d\times\frac{${v1 + v2}}{${v1 * v2}}}=\frac{2\times${v1 * v2}}{${v1 + v2}}$.`,
          T`[resultat] $\ok{${vm}\text{ km/h}}$`,
          T`[piege] Ce n'est **pas** la moyenne $\ko{${(v1 + v2) / 2}}$ : on passe plus de **temps** à la vitesse la plus lente.`,
        ].join('\n'),
      }
    }
    if (cas === 2) {
      const [p, q] = r.pick([[2, 3], [1, 4], [3, 5], [2, 5], [3, 4], [1, 2], [5, 7]])
      const u = r.int(3, 12) * 10
      const total = u * (p + q)
      const grand = r.bool()
      return {
        type: 'num',
        enonce: T`On partage $${total}$ € entre deux personnes dans le rapport $${p}:${q}$. Combien reçoit celle qui a la ${grand ? 'plus grande' : 'plus petite'} part (en €) ?`,
        reponse: grand ? q * u : p * u,
        unite: '€',
        explication: [
          T`[cours] Un partage dans le rapport $\cours{p:q}$ se fait en $p+q$ **parts égales** : l'un reçoit $p$ parts, l'autre $q$.`,
          T`[calcul] $${p}+${q}=${p + q}$ parts, donc une part vaut $\frac{${total}}{${p + q}}=\cle{${u}}$ €. Les parts sont $${p}\times${u}=${p * u}$ € et $${q}\times${u}=${q * u}$ €.`,
          T`[resultat] $\ok{${grand ? q * u : p * u}\text{ €}}$`,
          T`[piege] Diviser le total par $${p}$ ou par $${q}$ au lieu de $${p + q}$.`,
        ].join('\n'),
      }
    }
    let v: number, min: number
    do {
      v = r.pick([60, 80, 90, 120])
      min = r.pick([15, 20, 30, 40, 45, 50])
    } while ((v * min) % 60 !== 0)
    const dist = (v * min) / 60
    return {
      type: 'num',
      enonce: T`Une voiture roule à $${v}$ km/h pendant $${min}$ minutes. Quelle distance parcourt-elle (en km) ?`,
      reponse: dist,
      unite: 'km',
      explication: [
        T`[cours] $\cours{d=v\times t}$, à condition d'utiliser des **unités cohérentes** (ici des heures).`,
        T`[calcul] $${min}\text{ min}=\frac{${min}}{60}\text{ h}=${new Frac(min, 60).tex()}$ h, donc $d=${v}\times${new Frac(min, 60).tex()}$.`,
        T`[resultat] $\ok{${dist}\text{ km}}$`,
        T`[piege] Multiplier des km/h par des **minutes** sans convertir.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s15 — Inégalités, encadrements, intervalles
// =====================================================================================

const encadrement: Gabarit = {
  id: 'sc-encadrement',
  chapitre: 'socle',
  section: 'socle.s15',
  niveau: 1,
  titre: 'Encadrer une expression',
  source: SRC_P,
  refCours: 'fiche Socle : Inégalités et encadrements',
  generer(r) {
    const ph = (L: string | number, f: string, U: string | number) => T`$${L}\le ${f}\le ${U}$`
    const cas = r.int(0, 2)
    if (cas === 0) {
      const a = r.int(-5, 3)
      const b = a + r.int(1, 5)
      const k = r.int(2, 5)
      const c = r.nz(-6, 6)
      const f = lin([-k, c], ['x', ''])
      const bon = ph(-k * b + c, f, -k * a + c)
      const { choix, reponse } = choixQcm(r, bon, [ph(-k * a + c, f, -k * b + c), ph(k * a + c, f, k * b + c), ph(-k * b - c, f, -k * a - c)])
      return {
        type: 'qcm',
        enonce: T`On sait que $${a}\le x\le${b}$. Quel encadrement en déduit-on pour $${f}$ ?`,
        choix,
        reponse,
        explication: [
          T`[cours] Multiplier une inégalité par un nombre **négatif** en **change le sens** : si $c<0$, $\cours{a\le b\Rightarrow ca\ge cb}$. Ajouter un nombre ne change rien.`,
          T`[calcul] On multiplie par $-${k}$ : $${-k * b}\le-${k}x\le${-k * a}$ (les bornes s'échangent). On ajoute $${c}$.`,
          T`[resultat] ${ok(bon)}`,
          T`[piege] Oublier de **retourner** l'encadrement : la plus grande valeur de $x$ donne la plus petite valeur de $-${k}x$.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const a = r.int(2, 5)
      const b = a + r.int(1, 5)
      const [ia, ib] = [T`\frac1{${a}}`, T`\frac1{${b}}`]
      const f = T`\dfrac1x`
      const bon = ph(ib, f, ia)
      const { choix, reponse } = choixQcm(r, bon, [ph(ia, f, ib), ph(`-${ia}`, f, `-${ib}`), ph(a, f, b)])
      return {
        type: 'qcm',
        enonce: T`On sait que $${a}\le x\le${b}$. Quel encadrement en déduit-on pour $${f}$ ?`,
        choix,
        reponse,
        explication: [
          T`[cours] La fonction inverse est **décroissante** sur $]0,+\infty[$ : pour $0<a\le b$, $\cours{\frac1b\le\frac1a}$. Passer à l'inverse **change le sens** (entre nombres de même signe).`,
          T`[calcul] $0<${a}\le x\le${b}$ donne $\frac1{${b}}\le\frac1x\le\frac1{${a}}$.`,
          T`[resultat] ${ok(bon)}`,
          T`[piege] Cette règle exige des nombres **de même signe** : on ne peut rien dire de $\frac1x$ si $x$ peut changer de signe.`,
        ].join('\n'),
      }
    }
    const a = r.int(1, 6)
    let b: number
    do b = r.int(1, 6)
    while (b === a)
    const M = Math.max(a, b) ** 2
    const m = Math.min(a, b) ** 2
    const bon = ph(0, 'x^2', M)
    const { choix, reponse } = choixQcm(r, bon, [ph(m, 'x^2', M), ph(-(a * a), 'x^2', b * b), ph(0, 'x^2', m)])
    return {
      type: 'qcm',
      enonce: T`On sait que $-${a}\le x\le${b}$. Quel est le meilleur encadrement de $x^2$ ?`,
      choix,
      reponse,
      explication: [
        T`[cours] La fonction carré est **décroissante sur $]-\infty,0]$** et croissante sur $[0,+\infty[$ : on ne peut élever un encadrement au carré que si tout est **positif**. Sinon, $\cours{x^2=|x|^2}$ et on encadre $|x|$.`,
        T`[calcul] $-${a}\le x\le${b}$ donne $0\le|x|\le${Math.max(a, b)}$ (la valeur $0$ est atteinte), donc $0\le x^2\le${M}$.`,
        T`[resultat] ${ok(bon)}`,
        T`[piege] Élever les bornes au carré sans réfléchir : l'intervalle contient $0$, donc le minimum de $x^2$ est $0$.`,
      ].join('\n'),
    }
  },
}

const intervalles: Gabarit = {
  id: 'sc-intervalles',
  chapitre: 'socle',
  section: 'socle.s15',
  niveau: 1,
  titre: 'Intersection et réunion d’intervalles',
  source: SRC_P,
  refCours: 'fiche Socle : Inégalités et encadrements · poly §3.2.4',
  generer(r) {
    const a = r.int(-8, 2)
    const c = a + r.int(1, 4)
    const b = c + r.int(1, 4)
    const d = b + r.int(1, 4)
    const [f1, f2, f3, f4] = [r.bool(), r.bool(), r.bool(), r.bool()] // true = borne fermée
    const iv = (l: number, u: number, lf: boolean, uf: boolean) => T`$${lf ? '[' : ']'}${l},\ ${u}${uf ? ']' : '['}$`
    const I = iv(a, b, f1, f2)
    const J = iv(c, d, f3, f4)
    const inter = r.bool()
    const bon = inter ? iv(c, b, f3, f2) : iv(a, d, f1, f4)
    const leurres = inter ? [iv(c, b, !f3, f2), iv(c, b, f3, !f2), iv(a, d, f1, f4), iv(a, c, f1, !f3)] : [iv(a, d, !f1, f4), iv(a, d, f1, !f4), iv(c, b, f3, f2), iv(a, c, f1, f3)]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    return {
      type: 'qcm',
      enonce: T`Soient $I=${I.slice(1, -1)}$ et $J=${J.slice(1, -1)}$. Déterminer $I${inter ? T`\cap ` : T`\cup `}J$.`,
      choix,
      reponse,
      explication: [
        T`[cours] $\cours{I\cap J}$ : les réels qui sont dans $I$ **et** dans $J$ ; $\cours{I\cup J}$ : dans $I$ **ou** dans $J$. Crochet tourné vers l'intérieur = borne **incluse**.`,
        T`[methode] Placer les quatre bornes sur une droite graduée : $${a}<${c}<${b}<${d}$. L'intersection est la zone couverte **deux fois**, la réunion la zone couverte **au moins une fois**.`,
        inter
          ? T`[calcul] La zone commune va de $${c}$ (borne de $J$, ${f3 ? 'incluse' : 'exclue'}) à $${b}$ (borne de $I$, ${f2 ? 'incluse' : 'exclue'}).`
          : T`[calcul] Les deux intervalles se chevauchent : la réunion va de $${a}$ (borne de $I$, ${f1 ? 'incluse' : 'exclue'}) à $${d}$ (borne de $J$, ${f4 ? 'incluse' : 'exclue'}).`,
        T`[resultat] ${ok(bon)}`,
        T`[piege] Chaque borne garde le crochet de l'intervalle **dont elle vient**.`,
      ].join('\n'),
    }
  },
}

const inegalitesVf = vfPioche('sc-ineg-vf', 'socle.s15', 'Vrai / faux : règles sur les inégalités', SRC_G, 'fiche Socle : Inégalités et encadrements', (r) => {
  const k = r.int(2, 9)
  const C = T`[cours] On peut **ajouter** un même nombre aux deux membres ; **multiplier** par un positif garde le sens, par un négatif le **change** ; on peut **additionner** deux inégalités de même sens, jamais les soustraire.`
  return [
    { e: T`Pour tous réels $a,b,c$ : si $a<b$, alors $a+c<b+c$.`, rep: true, ex: [C, T`[resultat] ${OKVF(true)}`] },
    { e: T`Pour tous réels $a,b,c$ : si $a<b$, alors $ac<bc$.`, rep: false, ex: [C, T`[calcul] $1<2$ mais, avec $c=-1$ : $-1>-2$. (Et avec $c=0$ : $0=0$.)`, T`[resultat] ${OKVF(false)} Vrai seulement si $c>0$.`] },
    { e: T`Si $a<b$ et $c<d$, alors $a+c<b+d$.`, rep: true, ex: [C, T`[calcul] $a+c<b+c<b+d$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Si $a<b$ et $c<d$, alors $a-c<b-d$.`, rep: false, ex: [C, T`[calcul] $1<2$ et $0<${k}$, mais $1-0=1$ n'est pas inférieur à $2-${k}=${2 - k}$.`, T`[resultat] ${OKVF(false)} On ne soustrait pas des inégalités.`] },
    { e: T`Si $0<a<b$, alors $\dfrac1a>\dfrac1b$.`, rep: true, ex: [T`[cours] La fonction inverse est **décroissante** sur $]0,+\infty[$ : $\cours{0<a<b\Rightarrow\frac1b<\frac1a}$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Pour tous réels $a,b$ : si $a<b$, alors $a^2<b^2$.`, rep: false, ex: [T`[cours] La fonction carré n'est croissante que sur $[0,+\infty[$ : $\cours{0\le a<b\Rightarrow a^2<b^2}$.`, T`[calcul] $-${k}<1$ mais $${k * k}>1$.`, T`[resultat] ${OKVF(false)}`] },
    { e: T`Si $0\le a<b$, alors $a^2<b^2$.`, rep: true, ex: [T`[cours] La fonction carré est strictement croissante sur $[0,+\infty[$.`, T`[calcul] $b^2-a^2=(b-a)(b+a)>0$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Si $a<b$, alors $-a>-b$.`, rep: true, ex: [C, T`[calcul] On multiplie par $-1<0$ : le sens change.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Pour des réels **positifs** : si $a<b$ et $c<d$, alors $ac<bd$.`, rep: true, ex: [C, T`[calcul] $ac\le bc<bd$ (on multiplie par $c\ge0$, puis par $b>0$).`, T`[resultat] ${OKVF(true)} C'est faux sans l'hypothèse de positivité.`] },
    { e: T`Pour tout réel $x$ : $x^2\le${k * k}\iff-${k}\le x\le${k}$.`, rep: true, ex: [T`[cours] $\cours{x^2\le k^2\iff|x|\le k\iff-k\le x\le k}$ pour $k\ge0$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Pour tout réel $x$ : $x^2>${k * k}\iff x>${k}$.`, rep: false, ex: [T`[cours] $\cours{x^2>k^2\iff|x|>k\iff x>k\ \text{ou}\ x<-k}$.`, T`[calcul] $x=-${k + 1}$ vérifie $x^2=${(k + 1) ** 2}>${k * k}$ sans vérifier $x>${k}$.`, T`[resultat] ${OKVF(false)} On oublie la branche $x<-${k}$.`] },
    { e: T`Pour tout réel $x$ : $\dfrac1x<${k}\iff x>\dfrac1{${k}}$.`, rep: false, ex: [T`[cours] On ne multiplie une inégalité par $x$ que si l'on connaît son **signe**.`, T`[calcul] $x=-1$ vérifie $\frac1x=-1<${k}$ sans vérifier $x>\frac1{${k}}$.`, T`[resultat] ${OKVF(false)} Les solutions sont $x<0$ ou $x>\frac1{${k}}$.`] },
    { e: T`Si $a\le b$ et $b\le a$, alors $a=b$.`, rep: true, ex: [T`[cours] C'est l'**antisymétrie** de $\le$ : une méthode classique pour prouver une égalité est la **double inégalité**.`, T`[resultat] ${OKVF(true)}`] },
  ]
})

// =====================================================================================
// s16 — Sommes Σ, factorielles, binôme
// =====================================================================================

const sigma: Gabarit = {
  id: 'sc-sigma',
  chapitre: 'socle',
  section: 'socle.s16',
  niveau: 1,
  titre: 'Calculer une somme écrite avec Σ',
  source: SRC_P,
  refCours: 'fiche Socle : Sommes Σ · poly p.88 (récurrence)',
  generer(r) {
    const cas = r.int(0, 3)
    if (cas === 0) {
      const n = r.int(4, 12)
      const [a, b] = [r.int(1, 5), r.nz(-6, 6)]
      const val = (a * n * (n + 1)) / 2 + b * n
      let s = 0
      for (let k = 1; k <= n; k++) s += a * k + b
      verifier(s === val, 'somme affine')
      return {
        type: 'num',
        enonce: T`Calculer $\displaystyle\sum_{k=1}^{${n}}(${lin([a, b], ['k', ''])})$.`,
        reponse: val,
        explication: [
          T`[cours] La somme est **linéaire** : $\cours{\sum(au_k+b)=a\sum u_k+\sum b}$, avec $\cours{\sum_{k=1}^nk=\frac{n(n+1)}2}$ et $\cours{\sum_{k=1}^nb=nb}$ (on ajoute $n$ fois $b$).`,
          T`[calcul] $${a}\times\frac{${n}\times${n + 1}}2+${n}\times${par(b)}=${(a * n * (n + 1)) / 2}${b * n < 0 ? '' : '+'}${b * n}$`,
          T`[resultat] $\ok{${val}}$`,
          T`[piege] $\sum_{k=1}^{${n}}${par(b)}$ vaut $${n}\times${par(b)}$, pas $${b}$ : la constante est comptée **à chaque terme**.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const m = r.int(2, 9)
      const n = m + r.int(3, 20)
      return {
        type: 'num',
        enonce: T`Combien de termes comporte la somme $\displaystyle\sum_{k=${m}}^{${n}}u_k$ ?`,
        reponse: n - m + 1,
        explication: [
          T`[cours] De $k=m$ à $k=n$, il y a $\cours{n-m+1}$ termes (les deux bornes sont **incluses**).`,
          T`[calcul] $${n}-${m}+1=${n - m + 1}$`,
          T`[resultat] $\ok{${n - m + 1}}$`,
          T`[piege] L'erreur « des piquets et des intervalles » : $${n}-${m}=${n - m}$ oublie un terme.`,
        ].join('\n'),
      }
    }
    if (cas === 2) {
      const q = r.pick([2, 3])
      const n = r.int(3, q === 2 ? 9 : 5)
      const val = (q ** (n + 1) - 1) / (q - 1)
      return {
        type: 'num',
        enonce: T`Calculer $\displaystyle\sum_{k=0}^{${n}}${q}^k=1+${q}+${q}^2+\dots+${q}^{${n}}$.`,
        reponse: val,
        explication: [
          T`[cours] **Somme géométrique** : pour $q\neq1$, $\cours{\sum_{k=0}^nq^k=\frac{q^{n+1}-1}{q-1}}$ (poly Lemme 2.28).`,
          T`[calcul] $\frac{${q}^{${n + 1}}-1}{${q}-1}=\frac{${q ** (n + 1)}-1}{${q - 1}}$`,
          T`[resultat] $\ok{${val}}$`,
          T`[piege] L'exposant est $n+1$ (le **nombre de termes**), pas $n$.`,
        ].join('\n'),
      }
    }
    const n = r.int(3, 30)
    return {
      type: 'num',
      enonce: T`Calculer $\displaystyle\sum_{k=1}^{${n}}\left(\frac1k-\frac1{k+1}\right)$ (fraction irréductible).`,
      reponse: new Frac(n, n + 1).ascii(),
      explication: [
        T`[cours] **Somme télescopique** : $\cours{\sum_{k=1}^n(a_k-a_{k+1})=a_1-a_{n+1}}$ : les termes intermédiaires se simplifient deux à deux.`,
        T`[calcul] $\left(1-\frac12\right)+\left(\frac12-\frac13\right)+\dots+\left(\frac1{${n}}-\frac1{${n + 1}}\right)=1-\frac1{${n + 1}}$`,
        T`[resultat] $\ok{${new Frac(n, n + 1).tex()}}$`,
        T`[piege] Il reste le **premier** et le **dernier** terme, avec leurs signes.`,
      ].join('\n'),
    }
  },
}

const factorielle: Gabarit = {
  id: 'sc-factorielle',
  chapitre: 'socle',
  section: 'socle.s16',
  niveau: 1,
  titre: 'Factorielles et coefficients binomiaux',
  source: SRC_G,
  refCours: 'fiche Socle : Factorielles et binôme',
  generer(r) {
    const cas = r.int(0, 3)
    const n = r.int(5, 12)
    if (cas === 0) {
      const j = r.int(1, 3)
      let val = 1
      for (let i = 0; i < j; i++) val *= n - i
      return {
        type: 'num',
        enonce: T`Simplifier $\dfrac{${n}!}{${n - j}!}$.`,
        reponse: val,
        explication: [
          T`[cours] $\cours{n!=n\times(n-1)\times\dots\times2\times1}$, donc $\cours{n!=n\times(n-1)!}$ et $0!=1$.`,
          T`[calcul] $${n}!=${Array.from({ length: j }, (_, i) => n - i).join(T`\times`)}\times${n - j}!$ : le $${n - j}!$ se simplifie.`,
          T`[resultat] $\ok{${val}}$`,
          T`[piege] $\frac{${n}!}{${n - j}!}$ n'est pas $\left(\frac{${n}}{${n - j}}\right)!$ : on ne « simplifie » pas à l'intérieur d'une factorielle.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const k = r.int(2, 3)
      const m = r.int(4, 9)
      return {
        type: 'num',
        enonce: T`Calculer le coefficient binomial $\dbinom{${m}}{${k}}$.`,
        reponse: binom(m, k),
        explication: [
          T`[cours] $\cours{\binom nk=\frac{n!}{k!\,(n-k)!}=\frac{n(n-1)\cdots(n-k+1)}{k!}}$ : le nombre de façons de choisir $k$ objets parmi $n$.`,
          T`[calcul] $\frac{${Array.from({ length: k }, (_, i) => m - i).join(T`\times`)}}{${k}!}=\frac{${Array.from({ length: k }, (_, i) => m - i).reduce((s, x) => s * x, 1)}}{${fact(k)}}$`,
          T`[resultat] $\ok{${binom(m, k)}}$`,
          T`[piege] Ne pas oublier de diviser par $k!$ : l'ordre du choix ne compte pas.`,
        ].join('\n'),
      }
    }
    if (cas === 2) {
      const m = r.int(6, 15)
      const k = r.int(1, 2)
      return {
        type: 'num',
        enonce: T`Calculer $\dbinom{${m}}{${m - k}}$.`,
        reponse: binom(m, k),
        explication: [
          T`[cours] **Symétrie** : $\cours{\binom nk=\binom n{n-k}}$ (choisir $k$ objets, c'est choisir les $n-k$ qu'on laisse). Et $\binom n0=1$, $\binom n1=n$, $\binom n2=\frac{n(n-1)}2$.`,
          T`[calcul] $\binom{${m}}{${m - k}}=\binom{${m}}{${k}}=${k === 1 ? m : T`\frac{${m}\times${m - 1}}2`}$`,
          T`[resultat] $\ok{${binom(m, k)}}$`,
          T`[piege] Se lancer dans le calcul de $${m}!$ : la symétrie évite tout calcul lourd.`,
        ].join('\n'),
      }
    }
    return {
      type: 'num',
      enonce: T`Simplifier $\dfrac{(n+1)!}{(n-1)!}$ pour $n=${n}$.`,
      reponse: (n + 1) * n,
      explication: [
        T`[cours] $\cours{(n+1)!=(n+1)\times n\times(n-1)!}$.`,
        T`[calcul] $\frac{(n+1)!}{(n-1)!}=(n+1)\,n=${n + 1}\times${n}$`,
        T`[resultat] $\ok{${(n + 1) * n}}$`,
        T`[piege] $(n+1)!\neq n!+1$ : la factorielle n'est pas « linéaire ».`,
      ].join('\n'),
    }
  },
}

const binome: Gabarit = {
  id: 'sc-binome',
  chapitre: 'socle',
  section: 'socle.s16',
  niveau: 2,
  titre: 'Binôme de Newton, cube d’une somme',
  source: SRC_P,
  refCours: 'fiche Socle : Factorielles et binôme',
  generer(r) {
    const a = r.nz(-3, 3)
    if (r.bool(0.45)) {
      const m = r.pick([1, 1, 2])
      const c = [m ** 3, 3 * m * m * a, 3 * m * a * a, a ** 3]
      return {
        type: 'court',
        enonce: T`Développer $(${lin([m, a], ['x', ''])})^3$.`,
        reponse: [linAscii(c, ['x^3', 'x^2', 'x', ''])],
        variables: ['x'],
        mode: 'expression',
        forme: 'developpee',
        format: 'forme développée et réduite',
        explication: [
          T`[cours] $\cours{(a+b)^3=a^3+3a^2b+3ab^2+b^3}$ : les coefficients $1,3,3,1$ sont ceux de la ligne 3 du triangle de Pascal.`,
          T`[calcul] Avec $a=${lin([m], ['x'])}$ et $b=${a}$ : $${m === 1 ? 'x^3' : `(${m}x)^3`}+3${m === 1 ? 'x^2' : `(${m}x)^2`}${par(a)}+3(${lin([m], ['x'])})${par(a)}^2+${par(a)}^3$`,
          T`[resultat] $\ok{${lin(c, ['x^3', 'x^2', 'x', ''])}}$`,
          T`[piege] $(a+b)^3\neq a^3+b^3$ : il y a **deux** termes croisés, et leurs signes dépendent du signe de $b$.`,
        ].join('\n'),
      }
    }
    const n = r.int(3, 6)
    const k = r.int(1, n - 1)
    const val = binom(n, k) * a ** (n - k)
    const xk = k === 1 ? 'x' : `x^{${k}}`
    return {
      type: 'num',
      enonce: T`Quel est le coefficient de $${xk}$ dans le développement de $(${lx(a)})^{${n}}$ ?`,
      reponse: val,
      explication: [
        T`[cours] **Binôme de Newton** : $\cours{(a+b)^n=\sum_{k=0}^n\binom nka^kb^{n-k}}$.`,
        T`[calcul] Le terme en $${xk}$ est $\binom{${n}}{${k}}${xk}\times${par(a)}^{${n - k}}=${binom(n, k)}\times${par(a ** (n - k))}\,${xk}$.`,
        T`[resultat] $\ok{${val}}$`,
        T`[piege] Ne pas oublier la puissance $${par(a)}^{${n - k}}$ : les deux exposants ont pour somme $${n}$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s17 — Arithmétique : divisibilité, PGCD, nombres premiers
// =====================================================================================

const pgcdPpcm: Gabarit = {
  id: 'sc-pgcd',
  chapitre: 'socle',
  section: 'socle.s17',
  niveau: 1,
  titre: 'Facteurs premiers, PGCD, PPCM, nombre de diviseurs',
  source: SRC_G,
  refCours: 'fiche Socle : Arithmétique',
  generer(r) {
    const cas = r.int(0, 2)
    if (cas === 2) {
      const [e2, e3, e5] = [r.int(1, 4), r.int(0, 3), r.int(0, 2)]
      const N = 2 ** e2 * 3 ** e3 * 5 ** e5
      const val = (e2 + 1) * (e3 + 1) * (e5 + 1)
      let cnt = 0
      for (let d = 1; d <= N; d++) if (N % d === 0) cnt++
      verifier(cnt === val, 'nombre de diviseurs')
      return {
        type: 'num',
        enonce: T`Combien l'entier $${N}$ a-t-il de diviseurs positifs ?`,
        reponse: val,
        explication: [
          T`[cours] Si $\cours{N=p_1^{a_1}\cdots p_r^{a_r}}$ (décomposition en facteurs premiers, **unique**), ses diviseurs sont les $p_1^{b_1}\cdots p_r^{b_r}$ avec $0\le b_i\le a_i$ : il y en a $\cours{(a_1+1)\cdots(a_r+1)}$.`,
          T`[calcul] $${N}=${texFact(N)}$, donc $${facteurs(N).map(([, e]) => `(${e}+1)`).join(T`\times`)}$ diviseurs.`,
          T`[resultat] $\ok{${val}}$`,
          T`[piege] Ne pas oublier $1$ et $${N}$ lui-même (c'est le « $+1$ » : l'exposant $0$ est permis).`,
        ].join('\n'),
      }
    }
    let g: number, u: number, v: number
    do {
      g = r.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15])
      u = r.int(2, 9)
      v = r.int(2, 9)
    } while (u === v || pgcdListe([u, v]) !== 1)
    const [a, b] = [g * u, g * v]
    const ppcm = g * u * v
    const val = cas === 0 ? g : ppcm
    return {
      type: 'num',
      enonce: cas === 0 ? T`Calculer le PGCD de $${a}$ et $${b}$.` : T`Calculer le PPCM de $${a}$ et $${b}$.`,
      reponse: val,
      explication: [
        T`[cours] On décompose en **facteurs premiers**. Le **PGCD** prend chaque premier avec le **plus petit** exposant ; le **PPCM** avec le **plus grand**. De plus $\cours{\operatorname{pgcd}(a,b)\times\operatorname{ppcm}(a,b)=ab}$.`,
        T`[calcul] $${a}=${texFact(a)}$ et $${b}=${texFact(b)}$. PGCD $=${texFact(g)}=\cle{${g}}$ ; PPCM $=\frac{${a}\times${b}}{${g}}=\cle{${ppcm}}$.`,
        T`[resultat] $\ok{${val}}$`,
        cas === 0 ? T`[piege] Le PGCD **divise** les deux nombres : il ne peut pas dépasser le plus petit.` : T`[piege] Le PPCM n'est pas toujours le produit $${a}\times${b}=${a * b}$ : seulement si les nombres sont premiers entre eux.`,
      ].join('\n'),
    }
  },
}

const divisionEuclidienne: Gabarit = {
  id: 'sc-division',
  chapitre: 'socle',
  section: 'socle.s17',
  niveau: 1,
  titre: 'Division euclidienne, restes, cycles de puissances',
  source: SRC_G,
  refCours: 'fiche Socle : Arithmétique',
  generer(r) {
    const cas = r.int(0, 3)
    const DE = T`[cours] **Division euclidienne** de $a$ par $b>0$ : il existe un unique couple $(q,r)$ d'entiers tel que $\cours{a=bq+r\ \text{ et }\ 0\le r<b}$.`
    if (cas <= 1) {
      const b = r.int(3, 12)
      const neg = cas === 1
      let a: number
      do a = r.int(20, 150) * (neg ? -1 : 1)
      while (a % b === 0)
      const q = Math.floor(a / b)
      const rest = a - b * q
      const demandeQ = r.bool(0.4)
      return {
        type: 'num',
        enonce: T`Dans la division euclidienne de $${a}$ par $${b}$, quel est le **${demandeQ ? 'quotient' : 'reste'}** ?`,
        reponse: demandeQ ? q : rest,
        explication: [
          DE,
          T`[calcul] $${a}=${b}\times${par(q)}+${rest}$ avec $0\le${rest}<${b}$.`,
          T`[resultat] ${demandeQ ? 'Quotient' : 'Reste'} : $\ok{${demandeQ ? q : rest}}$`,
          neg ? T`[piege] Le reste est toujours **positif** : pour un nombre négatif, le quotient est $${q}$ et non $${q + 1}$ (sinon le reste serait $${rest - b}<0$).` : T`[piege] Le reste doit être **strictement inférieur** au diviseur.`,
        ].join('\n'),
      }
    }
    const [base, m] = cas === 2 ? [r.pick([2, 3, 7, 8, 9, 13]), 10] : r.pick([[2, 7], [3, 5], [2, 5], [3, 7], [5, 7], [4, 9], [2, 9]])
    const n = r.int(15, 80)
    const cycle: number[] = []
    let x = base % m
    while (!cycle.includes(x)) {
      cycle.push(x)
      x = (x * base) % m
    }
    const L = cycle.length
    const val = cycle[(n - 1) % L]
    let chk = 1
    for (let i = 0; i < n; i++) chk = (chk * base) % m
    verifier(chk === val, 'cycle de puissances')
    return {
      type: 'num',
      enonce: cas === 2 ? T`Quel est le chiffre des unités de $${base}^{${n}}$ ?` : T`Quel est le reste de la division euclidienne de $${base}^{${n}}$ par $${m}$ ?`,
      reponse: val,
      indice: 'Calcule les premières puissances : les restes reviennent périodiquement.',
      explication: [
        T`[cours] Les restes sont **compatibles avec le produit** : le reste de $ab$ ne dépend que des restes de $a$ et de $b$. Les restes des puissances successives forment donc un **cycle**.`,
        T`[calcul] Restes de $${base}^1,${base}^2,\dots$ ${cas === 2 ? 'par $10$ (chiffres des unités)' : `par $${m}$`} : $${cycle.join(',\\ ')}$, puis ça recommence (période $${L}$).`,
        T`$${n}=${L}\times${Math.floor((n - 1) / L)}+${((n - 1) % L) + 1}$ : $${base}^{${n}}$ a le même reste que $${base}^{${((n - 1) % L) + 1}}$.`,
        T`[resultat] $\ok{${val}}$`,
        T`[piege] Inutile (et impossible) de calculer $${base}^{${n}}$ : on ne suit que les **restes**.`,
      ].join('\n'),
    }
  },
}

const arithmetiqueVf = vfPioche('sc-arith-vf', 'socle.s17', 'Vrai / faux : divisibilité, parité, nombres premiers', SRC_G, 'fiche Socle : Arithmétique', (r) => {
  const N = r.int(1000, 99999)
  const ch = String(N).split('').map(Number)
  const som = ch.reduce((s, x) => s + x, 0)
  const d2 = N % 100
  const [p, q] = r.pick([[7, 13], [7, 11], [3, 17], [7, 17], [11, 13], [3, 29], [7, 19]])
  const CR = T`[cours] **Critères de divisibilité** : par 2 (dernier chiffre pair), par 5 (finit par 0 ou 5), par 3 ou 9 (**somme des chiffres** divisible par 3 ou 9), par 4 (nombre formé par les **deux derniers chiffres** divisible par 4).`
  const PA = T`[cours] Un entier pair s'écrit $\cours{2k}$, un impair $\cours{2k+1}$. Pair ± pair = pair, impair ± impair = **pair**, pair ± impair = impair ; un produit est impair seulement si **tous** les facteurs le sont.`
  const PR = T`[cours] Un nombre **premier** est un entier $\ge2$ dont les seuls diviseurs positifs sont $1$ et lui-même. Pour tester $n$, il suffit d'essayer les premiers $\le\sqrt n$.`
  return [
    { e: T`Le nombre $${N}$ est divisible par $3$.`, rep: N % 3 === 0, ex: [CR, T`[calcul] Somme des chiffres : $${ch.join('+')}=${som}$, ${som % 3 === 0 ? 'divisible' : 'non divisible'} par $3$.`, T`[resultat] ${OKVF(N % 3 === 0)}`] },
    { e: T`Le nombre $${N}$ est divisible par $9$.`, rep: N % 9 === 0, ex: [CR, T`[calcul] Somme des chiffres : $${ch.join('+')}=${som}$, ${som % 9 === 0 ? 'divisible' : 'non divisible'} par $9$.`, T`[resultat] ${OKVF(N % 9 === 0)}`] },
    { e: T`Le nombre $${N}$ est divisible par $4$.`, rep: N % 4 === 0, ex: [CR, T`[calcul] Deux derniers chiffres : $${d2}$, ${d2 % 4 === 0 ? 'divisible' : 'non divisible'} par $4$.`, T`[resultat] ${OKVF(N % 4 === 0)}`] },
    { e: T`La somme de deux entiers impairs est toujours paire.`, rep: true, ex: [PA, T`[calcul] $(2k+1)+(2k'+1)=2(k+k'+1)$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Le produit de deux entiers consécutifs est toujours pair.`, rep: true, ex: [PA, T`[calcul] Parmi $n$ et $n+1$, l'un des deux est pair.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Si $n^2$ est pair, alors $n$ est pair.`, rep: true, ex: [PA, T`[calcul] Par contraposée : si $n=2k+1$ est impair, $n^2=2(2k^2+2k)+1$ est impair.`, T`[resultat] ${OKVF(true)} (poly p.86)`] },
    { e: T`Le nombre $1$ est premier.`, rep: false, ex: [PR, T`[resultat] ${OKVF(false)} Par convention $1$ n'est pas premier (sinon la décomposition en facteurs premiers ne serait plus unique).`] },
    { e: T`Le nombre $0$ est pair.`, rep: true, ex: [PA, T`[calcul] $0=2\times0$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Tous les nombres premiers sont impairs.`, rep: false, ex: [PR, T`[resultat] ${OKVF(false)} $2$ est premier : c'est le seul premier pair.`] },
    { e: T`Si $a$ divise $b$ et $a$ divise $c$, alors $a$ divise $b+c$.`, rep: true, ex: [T`[cours] $a$ divise $b$ signifie $\cours{b=ak}$ avec $k$ entier. Multiple ± multiple = multiple.`, T`[calcul] $b+c=ak+ak'=a(k+k')$.`, T`[resultat] ${OKVF(true)}`] },
    { e: T`Si $a$ divise le produit $bc$, alors $a$ divise $b$ ou $a$ divise $c$.`, rep: false, ex: [T`[cours] Cette propriété est vraie quand $a$ est **premier** (lemme d'Euclide), pas en général.`, T`[calcul] $4$ divise $2\times6=12$, mais $4$ ne divise ni $2$ ni $6$.`, T`[resultat] ${OKVF(false)}`] },
    { e: T`Le nombre $${p * q}$ est premier.`, rep: false, ex: [PR, T`[calcul] $${p * q}=${p}\times${q}$.`, T`[resultat] ${OKVF(false)}`] },
    { e: T`Parmi trois entiers consécutifs, il y a toujours un multiple de $3$.`, rep: true, ex: [T`[cours] Toute liste de $N$ entiers consécutifs contient exactement un multiple de $N$ (les restes par $N$ prennent toutes les valeurs $0,\dots,N-1$).`, T`[resultat] ${OKVF(true)}`] },
  ]
})

// =====================================================================================
// s18 — Suites arithmétiques et géométriques
// =====================================================================================

const suites: Gabarit = {
  id: 'sc-suites',
  chapitre: 'socle',
  section: 'socle.s18',
  niveau: 1,
  titre: 'Suites arithmétiques et géométriques',
  source: SRC_P,
  refCours: 'fiche Socle : Suites · poly §2.1.8 (suites géométriques)',
  generer(r) {
    const cas = r.int(0, 4)
    const u0 = r.nz(-6, 9)
    const rr = r.nz(-5, 6)
    const n = r.int(6, 25)
    const AR = T`[cours] **Suite arithmétique** de raison $r$ : $\cours{u_{n+1}=u_n+r}$, donc $\cours{u_n=u_0+nr}$ et plus généralement $u_n=u_p+(n-p)r$.`
    const GE = T`[cours] **Suite géométrique** de raison $q$ : $\cours{u_{n+1}=q\,u_n}$, donc $\cours{u_n=u_0\,q^n}$.`
    if (cas === 0)
      return {
        type: 'num',
        enonce: T`$(u_n)$ est arithmétique de premier terme $u_0=${u0}$ et de raison $${rr}$. Calculer $u_{${n}}$.`,
        reponse: u0 + n * rr,
        explication: [AR, T`[calcul] $u_{${n}}=${u0}+${n}\times${par(rr)}$`, T`[resultat] $\ok{${u0 + n * rr}}$`, T`[piege] Partant de $u_0$, on ajoute la raison $${n}$ fois (et non $${n - 1}$).`].join('\n'),
      }
    if (cas === 1) {
      const p = r.int(2, 6)
      const m = p + r.int(2, 8)
      const up = u0 + p * rr
      const um = u0 + m * rr
      return {
        type: 'num',
        enonce: T`$(u_n)$ est arithmétique avec $u_{${p}}=${up}$ et $u_{${m}}=${um}$. Quelle est sa raison ?`,
        reponse: rr,
        explication: [AR, T`[calcul] $u_{${m}}-u_{${p}}=(${m}-${p})\,r$, soit $${um - up}=${m - p}\,r$.`, T`[resultat] $\ok{r=${rr}}$`, T`[piege] Diviser par le **nombre de pas** $${m}-${p}=${m - p}$, pas par $${m}$.`].join('\n'),
      }
    }
    if (cas === 2) {
      const N = r.int(5, 20)
      const last = u0 + N * rr
      const val = ((N + 1) * (u0 + last)) / 2
      return {
        type: 'num',
        enonce: T`$(u_n)$ est arithmétique de premier terme $u_0=${u0}$ et de raison $${rr}$. Calculer $u_0+u_1+\dots+u_{${N}}$.`,
        reponse: val,
        explication: [
          T`[cours] Somme de termes consécutifs d'une suite arithmétique : $\cours{\text{nombre de termes}\times\frac{\text{premier}+\text{dernier}}2}$.`,
          T`[calcul] $u_{${N}}=${u0}+${N}\times${par(rr)}=${last}$ ; il y a $${N + 1}$ termes : $${N + 1}\times\frac{${u0}+${par(last)}}2$.`,
          T`[resultat] $\ok{${val}}$`,
          T`[piege] De $u_0$ à $u_{${N}}$ il y a $${N + 1}$ termes.`,
        ].join('\n'),
      }
    }
    const q = r.pick([2, 3, -2, 10])
    const v0 = r.int(1, 5)
    if (cas === 3) {
      const k = r.int(3, q === 10 ? 5 : 7)
      return {
        type: 'num',
        enonce: T`$(u_n)$ est géométrique de premier terme $u_0=${v0}$ et de raison $${q}$. Calculer $u_{${k}}$.`,
        reponse: v0 * q ** k,
        explication: [GE, T`[calcul] $u_{${k}}=${v0}\times${par(q)}^{${k}}=${v0}\times${par(q ** k)}$`, T`[resultat] $\ok{${v0 * q ** k}}$`, T`[piege] On **multiplie** par la raison à chaque étape : ce n'est pas $${v0}+${k}\times${par(q)}$.`].join('\n'),
      }
    }
    const [a1, a2] = [v0 * q ** 2, v0 * q ** 3]
    return {
      type: 'num',
      enonce: T`$(u_n)$ est géométrique avec $u_2=${a1}$ et $u_3=${a2}$. Calculer $u_0$.`,
      reponse: v0,
      explication: [GE, T`[calcul] Raison : $q=\frac{u_3}{u_2}=\frac{${a2}}{${a1}}=\cle{${q}}$. Puis $u_2=u_0q^2$, donc $u_0=\frac{${a1}}{${q * q}}$.`, T`[resultat] $\ok{u_0=${v0}}$`, T`[piege] La raison est le **quotient** de deux termes consécutifs, pas leur différence.`].join('\n'),
    }
  },
}

export const GABARITS_SOCLE2: Gabarit[] = [
  fractionLitterale,
  priorites,
  isoler,
  produitEnCroix,
  problemes,
  encadrement,
  intervalles,
  inegalitesVf,
  sigma,
  factorielle,
  binome,
  pgcdPpcm,
  divisionEuclidienne,
  arithmetiqueVf,
  suites,
]
