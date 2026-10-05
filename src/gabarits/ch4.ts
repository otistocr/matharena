/**
 * Chapitre 4 — Études de fonctions : gabarits de questions à variantes.
 * Inspirés de la feuille de TD 4 (2026) et du poly §4.1–4.5. Les numéros d'énoncés (Prop. 4.x)
 * sont les mêmes dans les deux versions du poly (Modules 1-4 et Modules 2-3) ; les pages ne sont
 * citées que jusqu'au §4.2, où elles coïncident.
 */
import type { Gabarit } from './types'
import type { Niveau } from '../data/schema'
import { Frac, Rng, lin, verifier } from './outils'
import { c as cplx, evaluate, parse, type C } from '../lib/mathexpr'
import { angleAscii, angleTex, cosT, principal, remarquable, sinT, tanT } from './exact'

const T = String.raw
const X2 = ['x^2', 'x', '']
const OKVF = (b: boolean) => T`$\ok{\text{${b ? 'VRAI' : 'FAUX'}}}$`
const lx = (a: number, b: number) => lin([a, b], ['x', ''])
/** Facteur (x − p) : p = 0 → x, sinon (x - p) entre parenthèses. */
const fx = (p: number) => (p === 0 ? 'x' : `(${lin([1, -p], ['x', ''])})`)
const mod = (a: number, n: number) => ((a % n) + n) % n
const RR = T`$\mathbb R$`
const VIDE = T`$\varnothing$`
/** Entoure une réponse « $…$ » par \ok{…}. */
const ok = (s: string) => `$\\ok{${s.slice(1, -1)}}$`
/** Évalue une expression (syntaxe calculatrice) en x réel. */
const evalX = (expr: string, x: number) => (evaluate(parse(expr), { x: cplx(x) }) as C).re

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
  chapitre: 'ch4',
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

// =====================================================================================
// §4.1 Vocabulaire : inégalités, graphes, parité, domaine, limites
// =====================================================================================

const inegAbs: Gabarit = {
  id: 'g4-ineg-abs',
  chapitre: 'ch4',
  section: 'ch4.s1',
  niveau: 1,
  titre: 'Inégalité avec x|x|',
  source: 'TD4 ex 1.1',
  refCours: 'poly §4.1.1 p.93 (variations) · Socle : valeur absolue',
  generer(r) {
    const k = r.int(1, 7)
    const cas = r.int(0, 3)
    const I = {
      a: T`$]-\infty,\ ${k}[$`,
      b: T`$]${k},\ +\infty[$`,
      c: T`$]-\infty,\ -${k}[$`,
      d: T`$]-${k},\ +\infty[$`,
      e: T`$]-${k},\ ${k}[$`,
      f: T`$]-\infty,\ -${k}[\ \cup\ ]${k},\ +\infty[$`,
    }
    const [droite, signe, bon, borne] = (
      [
        [k * k, '<', I.a, k],
        [k * k, '>', I.b, k],
        [-k * k, '<', I.c, -k],
        [-k * k, '>', I.d, -k],
      ] as const
    )[cas]
    const { choix, reponse } = choixQcm(r, bon, Object.values(I))
    return {
      type: 'qcm',
      enonce: T`Résoudre dans $\mathbb R$ l'inégalité $x|x|${signe}${droite}$.`,
      choix,
      reponse,
      indice: 'Sépare x ≥ 0 et x < 0 : que vaut x|x| dans chaque cas ?',
      explication: [
        T`[cours] $\cours{x|x|=x^2\text{ si }x\ge0,\quad x|x|=-x^2\text{ si }x\le0}$. La fonction $x\mapsto x|x|$ est donc **strictement croissante** sur $\mathbb R$ et du **signe de $x$**.`,
        T`[methode] Une fonction strictement croissante **conserve le sens** des inégalités : il suffit de trouver où elle vaut $${droite}$.`,
        T`[calcul] $x|x|=${droite}\iff x=\cle{${borne}}$ (car $${borne}\times|${borne}|=${droite}$). Par stricte croissance : $x|x|${signe}${droite}\iff x${signe}${borne}$.`,
        T`[resultat] ${ok(bon)}`,
        T`[piege] Ce n'est **pas** $x^2${signe}${droite}$ : pour $x<0$, $x|x|$ est négatif. Ne pas répondre $${I.e.slice(1, -1)}$ ou une réunion par réflexe.`,
      ].join('\n'),
    }
  },
}

const inegRacine: Gabarit = {
  id: 'g4-ineg-racine',
  chapitre: 'ch4',
  section: 'ch4.s1',
  niveau: 2,
  titre: 'Inégalité avec une racine carrée',
  source: 'TD4 ex 1.3 et 1.4',
  refCours: 'poly §4.5.1 (Prop. 4.35, racine carrée) · Socle : inéquations',
  generer(r) {
    const cas = r.int(0, 3)
    if (cas < 2) {
      const a = r.int(1, 9)
      const inf = cas === 0
      const { choix, reponse } = choixQcm(r, inf ? VIDE : RR, [VIDE, RR, T`$]0,\ +\infty[$`, T`$]\sqrt{${a}},\ +\infty[$`, T`$]-\infty,\ 0[$`])
      return {
        type: 'qcm',
        enonce: T`Résoudre dans $\mathbb R$ l'inégalité $\sqrt{x^2+${a}}${inf ? '<' : '>'}x$.`,
        choix,
        reponse,
        explication: [
          T`[cours] La racine carrée est **strictement croissante** sur $[0,+\infty[$ et $\cours{\sqrt{x^2}=|x|}$.`,
          T`[calcul] $x^2+${a}>x^2$, donc $\sqrt{x^2+${a}}>\sqrt{x^2}=|x|\ge x$ pour **tout** réel $x$.`,
          T`[resultat] ${inf ? T`L'inégalité n'est jamais vraie : ${ok(VIDE)}` : T`L'inégalité est toujours vraie : ${ok(RR)}`}`,
          T`[piege] Élever au carré sans précaution : $x^2+${a}<x^2$ n'a de sens comme équivalence que si les deux membres sont **positifs**.`,
        ].join('\n'),
      }
    }
    const p = r.int(-4, 3)
    const q = p + r.int(1, 5)
    const tri = lin([1, -(p + q), p * q], X2)
    const dr = lx(1, -p)
    const inf = cas === 2
    const bon = inf ? T`$[${q},\ +\infty[$` : T`$]-\infty,\ ${p}[$`
    const { choix, reponse } = choixQcm(r, bon, [T`$[${q},\ +\infty[$`, T`$]-\infty,\ ${p}[$`, T`$]${p},\ +\infty[$`, T`$]-\infty,\ ${p}]\cup[${q},\ +\infty[$`, VIDE, T`$[${p},\ ${q}]$`])
    return {
      type: 'qcm',
      enonce: T`Résoudre dans $\mathbb R$ l'inégalité $\sqrt{${tri}}${inf ? '<' : '>'}${dr}$.`,
      choix,
      reponse,
      indice: 'D’abord le domaine de la racine, puis le signe du membre de droite, et seulement ensuite le carré.',
      explication: [
        T`[cours] Pour $u,v\ge0$ : $\cours{u<v\iff u^2<v^2}$. On ne peut élever au carré que si les **deux membres sont positifs**.`,
        T`[methode] (1) Domaine : $${tri}=${fx(p)}${fx(q)}\ge0\iff x\le${p}$ ou $x\ge${q}$. (2) Signe de $${dr}$. (3) Carré.`,
        inf
          ? T`[calcul] Il faut $${dr}>0$, donc $x>${p}$ : avec le domaine, $x\ge${q}$. Alors $$${fx(p)}${fx(q)}<${fx(p)}^2\iff ${lx(1, -q)}<${lx(1, -p)},$$ ce qui est toujours vrai.`
          : T`[calcul] Si $x<${p}$ : $${dr}<0\le\sqrt{\ }$, l'inégalité est vraie. Si $x=${p}$ : $0>0$ est faux. Si $x\ge${q}$ : les deux membres sont positifs et $${fx(p)}${fx(q)}>${fx(p)}^2\iff ${lx(1, -q)}>${lx(1, -p)}$, impossible.`,
        T`[resultat] ${ok(bon)}`,
        T`[piege] Oublier le **domaine** de la racine ou le **signe** de $${dr}$ avant d'élever au carré.`,
      ].join('\n'),
    }
  },
}

const graphes: Gabarit = {
  id: 'g4-graphes',
  chapitre: 'ch4',
  section: 'ch4.s1',
  niveau: 1,
  titre: 'Reconnaître une fonction à son graphe',
  source: 'TD4 ex 2',
  refCours: 'poly §4.1 p.98 (Test : identification de graphes) et §4.5 (répertoire)',
  generer(r) {
    const F = [
      { f: T`x\mapsto\sqrt x`, d: T`défini seulement sur $[0,+\infty[$, part de l'origine avec une tangente **verticale**, croissant, et monte de plus en plus lentement`, cle: T`C'est la seule fonction de la liste définie en $0$ mais pas à gauche de $0$.` },
      { f: T`x\mapsto\ln(x)`, d: T`défini seulement sur $]0,+\infty[$, plonge vers $-\infty$ près de $0$ (asymptote verticale), coupe l'axe des abscisses en $x=1$, croissant`, cle: T`$\ln1=0$ et $\lim_{x\to0^+}\ln x=-\infty$.` },
      { f: T`x\mapsto\exp(x)`, d: T`défini sur $\mathbb R$, toujours **strictement au-dessus** de l'axe des abscisses, passe par $(0,1)$, s'écrase sur l'axe en $-\infty$ et explose en $+\infty$`, cle: T`$e^0=1$, $e^x>0$ et $\lim_{x\to-\infty}e^x=0$.` },
      { f: T`x\mapsto x`, d: T`une **droite** passant par l'origine, de pente $1$`, cle: T`C'est la première bissectrice.` },
      { f: T`x\mapsto\cos(x)`, d: T`une courbe qui oscille entre $-1$ et $1$, symétrique par rapport à l'axe des ordonnées, qui vaut $1$ en $x=0$`, cle: T`$\cos0=1$ et $\cos$ est paire.` },
      { f: T`x\mapsto\sin(x)`, d: T`une courbe qui oscille entre $-1$ et $1$, symétrique par rapport à l'origine, qui passe par l'origine en montant`, cle: T`$\sin0=0$ et $\sin$ est impaire.` },
      { f: T`x\mapsto|x|`, d: T`deux demi-droites formant un « V » de sommet l'origine, symétrique par rapport à l'axe des ordonnées, avec un **point anguleux** en $0$`, cle: T`$|x|=x$ si $x\ge0$ et $-x$ sinon : pas de tangente en $0$.` },
      { f: T`x\mapsto x^2`, d: T`une courbe symétrique par rapport à l'axe des ordonnées, de minimum $0$ atteint en $0$ avec une tangente **horizontale**`, cle: T`C'est la parabole : lisse en $0$, contrairement à $|x|$.` },
      { f: T`x\mapsto\dfrac1x`, d: T`deux branches séparées, non défini en $0$, symétrique par rapport à l'origine, avec les deux axes pour asymptotes`, cle: T`C'est l'hyperbole : $\lim_{x\to0^\pm}\frac1x=\pm\infty$ et $\lim_{x\to\pm\infty}\frac1x=0$.` },
      { f: T`x\mapsto x^3`, d: T`une courbe définie sur $\mathbb R$, symétrique par rapport à l'origine, strictement croissante, avec une tangente **horizontale** à l'origine`, cle: T`Impaire comme $x\mapsto x$, mais aplatie en $0$ (dérivée $3x^2$ nulle en $0$).` },
    ]
    const k = r.int(0, F.length - 1)
    const { choix, reponse } = choixQcm(r, `$${F[k].f}$`, F.map((x) => `$${x.f}$`))
    return {
      type: 'qcm',
      enonce: T`Un graphe a l'allure suivante : ${F[k].d}. De quelle fonction s'agit-il ?`,
      choix,
      reponse,
      explication: [
        T`[cours] Les **fonctions du répertoire** (poly §4.5) : il faut connaître par cœur leur domaine, leur parité, leurs limites et l'allure de leur graphe.`,
        T`[methode] Regarder dans l'ordre : le **domaine**, les **symétries** (paire : axe des ordonnées ; impaire : origine), les valeurs en $0$ et $1$, les asymptotes.`,
        T`[resultat] $\ok{${F[k].f}}$. ${F[k].cle}`,
      ].join('\n'),
    }
  },
}

const PARITES = ['paire', 'impaire', 'ni paire ni impaire']

const parite: Gabarit = {
  id: 'g4-parite',
  chapitre: 'ch4',
  section: 'ch4.s1',
  niveau: 1,
  titre: 'Parité des fonctions du répertoire',
  source: 'TD4 ex 3',
  refCours: 'poly §4.1.3 p.97 (Déf. 4.11)',
  generer(r) {
    const n = r.int(1, 6)
    const a = r.nz(-5, 5)
    const xn = n === 1 ? 'x' : `x^{${n}}`
    const sg = n % 2 ? '-' : ''
    const items: { f: string; t: number; calc: string }[] = [
      { f: T`\sin(|x|)`, t: 0, calc: T`$|-x|=|x|$, donc $f(-x)=\sin(|x|)=f(x)$` },
      { f: T`\exp(-x^{${2 * n}})`, t: 0, calc: T`$(-x)^{${2 * n}}=x^{${2 * n}}$, donc $f(-x)=f(x)$` },
      { f: T`\exp(\cos x)`, t: 0, calc: T`$\cos(-x)=\cos x$, donc $f(-x)=f(x)$` },
      { f: T`${xn}\cos x`, t: n % 2, calc: T`$(-x)^{${n}}=${sg}${xn}$ et $\cos(-x)=\cos x$, donc $f(-x)=${sg}f(x)$` },
      { f: T`${xn}\sin x`, t: (n + 1) % 2, calc: T`$(-x)^{${n}}=${sg}${xn}$ et $\sin(-x)=-\sin x$, donc $f(-x)=${n % 2 ? '' : '-'}f(x)$` },
      { f: lin([1, a], ['x^2', 'x']), t: 2, calc: T`$f(1)=${1 + a}$ et $f(-1)=${1 - a}$ : ni égaux, ni opposés` },
      { f: T`\ln(|x|)`, t: 0, calc: T`$|-x|=|x|$, donc $f(-x)=f(x)$ (sur $\mathbb R^*$, domaine symétrique)` },
      { f: T`\arctan(x)`, t: 1, calc: T`$\tan$ est impaire, donc sa réciproque aussi : $\arctan(-x)=-\arctan(x)$` },
      { f: T`\arctan(${lx(1, a)})`, t: 2, calc: T`$f(${-a})=\arctan0=0$ mais $f(${a})=\arctan(${2 * a})\neq0$ : ni égaux, ni opposés` },
      { f: T`\tan(x)`, t: 1, calc: T`$\tan(-x)=\frac{\sin(-x)}{\cos(-x)}=\frac{-\sin x}{\cos x}=-\tan x$` },
      { f: T`\operatorname{ch}(x)=\dfrac{e^x+e^{-x}}2`, t: 0, calc: T`échanger $x$ et $-x$ échange les deux termes de la somme : $f(-x)=f(x)$` },
      { f: T`\operatorname{sh}(x)=\dfrac{e^x-e^{-x}}2`, t: 1, calc: T`échanger $x$ et $-x$ change le signe de la différence : $f(-x)=-f(x)$` },
      { f: T`x|x|`, t: 1, calc: T`$f(-x)=(-x)|-x|=-x|x|=-f(x)$` },
      { f: T`e^{${lin([a], ['x'])}}`, t: 2, calc: T`$f(1)=e^{${a}}$ et $f(-1)=e^{${-a}}$ : ni égaux, ni opposés (une exponentielle est $>0$)` },
      { f: T`\dfrac{\sin x}{x}`, t: 0, calc: T`$f(-x)=\frac{-\sin x}{-x}=f(x)$ (sur $\mathbb R^*$)` },
    ]
    const it = r.pick(items)
    const choix = r.shuffle(PARITES)
    return {
      type: 'qcm',
      enonce: T`La fonction $f(x)=${it.f}$ est :`,
      choix,
      reponse: choix.indexOf(PARITES[it.t]),
      explication: [
        T`[cours] (Déf. 4.11, p.97) Sur un domaine **symétrique** par rapport à $0$ : $f$ est **paire** si $\cours{f(-x)=f(x)}$ (graphe symétrique par rapport à l'axe des ordonnées), **impaire** si $\cours{f(-x)=-f(x)}$ (symétrique par rapport à l'origine).`,
        T`[calcul] ${it.calc}.`,
        T`[resultat] $f$ est $\ok{\text{${PARITES[it.t]}}}$.`,
        it.t === 2 ? T`[piege] Pour montrer qu'une fonction n'est **ni paire ni impaire**, un contre-exemple numérique suffit.` : T`[piege] La parité se teste pour **tout** $x$ du domaine, pas sur une seule valeur.`,
      ].join('\n'),
    }
  },
}

const domaine: Gabarit = {
  id: 'g4-domaine',
  chapitre: 'ch4',
  section: 'ch4.s1',
  niveau: 1,
  titre: 'Domaine de définition',
  source: 'TD4 ex 3',
  refCours: 'poly §4 p.91 (Déf. 4.1) et §4.5 (répertoire)',
  generer(r) {
    const cas = r.int(0, 6)
    const sauf = (xs: (number | string)[]) => T`$\mathbb R\setminus\{${xs.join(',\\ ')}\}$`
    let f: string, bon: string, leurres: string[], calc: string, piege: string
    if (cas <= 1) {
      const a = r.int(-5, 5)
      let b: number
      do b = r.int(-5, 5)
      while (b === a)
      const [m, M] = [Math.min(a, b), Math.max(a, b)]
      f = T`\dfrac{${lx(1, -a)}}{${lin([1, -(a + b), a * b], X2)}}`
      bon = sauf([m, M])
      leurres = [sauf([b]), RR, sauf([a]), T`$]${m},\ ${M}[$`]
      calc = T`$${lin([1, -(a + b), a * b], X2)}=${fx(a)}${fx(b)}$ s'annule en $\cle{${m}}$ et en $\cle{${M}}$.`
      piege = T`Après simplification $f(x)=\frac1{${lx(1, -b)}}$, mais **seulement pour $x\neq${a}$** : la valeur $${a}$ reste interdite (TD4 ex 3.5).`
    } else if (cas <= 3) {
      const p = r.int(-5, 3)
      const q = p + r.int(1, 5)
      f = T`\sqrt{${lin([1, -(p + q), p * q], X2)}}`
      bon = T`$]-\infty,\ ${p}]\cup[${q},\ +\infty[$`
      leurres = [T`$[${p},\ ${q}]$`, T`$]-\infty,\ ${p}[\ \cup\ ]${q},\ +\infty[$`, RR, T`$[${q},\ +\infty[$`]
      calc = T`$${lin([1, -(p + q), p * q], X2)}=${fx(p)}${fx(q)}\ge0$ : un trinôme de coefficient dominant positif est positif **à l'extérieur** de ses racines $\cle{${p}}$ et $\cle{${q}}$.`
      piege = T`Sous une racine il faut $\ge0$ (bornes **incluses**), et pas seulement $>0$.`
    } else if (cas <= 5) {
      const a = r.nz(-4, 4)
      const b = r.nz(-6, 6)
      const x0 = new Frac(-b, a).tex()
      f = T`\ln(${lx(a, b)})`
      bon = a > 0 ? T`$\left]${x0},\ +\infty\right[$` : T`$\left]-\infty,\ ${x0}\right[$`
      leurres = [T`$\left]${x0},\ +\infty\right[$`, T`$\left]-\infty,\ ${x0}\right[$`, a > 0 ? T`$\left[${x0},\ +\infty\right[$` : T`$\left]-\infty,\ ${x0}\right]$`, sauf([x0]), RR]
      calc = T`$${lx(a, b)}>0\iff ${lin([a], ['x'])}>${-b}\iff x${a > 0 ? '>' : '<'}\cle{${x0}}$${a < 0 ? T` (on divise par $${a}<0$ : le sens **change**)` : ''}.`
      piege = T`Dans un logarithme il faut **strictement** positif : la borne est exclue.`
    } else {
      const g = r.pick([T`x^{\pi}`, T`\ln\left(\dfrac1x\right)`, T`x^{\sqrt2}`])
      f = g
      bon = T`$]0,\ +\infty[$`
      leurres = [RR, T`$[0,\ +\infty[$`, T`$\mathbb R^*$`]
      calc = g.includes('ln')
        ? T`Il faut $x\neq0$ et $\frac1x>0$, soit $\cle{x>0}$. (Alors $\ln\frac1x=-\ln x$.)`
        : T`Une puissance **réelle** est définie par $x^a=\exp(a\ln x)$ (Déf. 4.42) : il faut $\cle{x>0}$.`
      piege = g.includes('ln')
        ? T`$\mathbb R^*$ ne suffit pas : pour $x<0$, $\frac1x<0$ et le logarithme n'existe pas.`
        : T`$x^2$ ou $x^{-3}$ sont définies pour $x<0$, mais **pas** une puissance d'exposant non entier.`
    }
    const { choix, reponse } = choixQcm(r, bon, leurres)
    return {
      type: 'qcm',
      enonce: T`Quel est le domaine de définition de $f(x)=${f}$ ?`,
      choix,
      reponse,
      explication: [
        T`[cours] Trois interdits : $\cours{\text{diviser par }0}$, $\cours{\sqrt{\ }\text{ d'un négatif}}$, $\cours{\ln\text{ d'un nombre}\le0}$. Le domaine se lit sur l'expression **telle qu'elle est donnée**.`,
        T`[calcul] ${calc}`,
        T`[resultat] $D_f=$ ${ok(bon)}`,
        T`[piege] ${piege}`,
      ].join('\n'),
    }
  },
}

const nomDeg = (d: number) => (d === 0 ? '' : d === 1 ? 'x' : `x^${d}`)

const limiteRationnelle: Gabarit = {
  id: 'g4-lim-rat',
  chapitre: 'ch4',
  section: 'ch4.s1',
  niveau: 1,
  titre: 'Limite en ±∞ d’un quotient de polynômes',
  source: 'TD4 ex 5.1–5.3 et ex 14',
  refCours: 'poly §4.5.1 (Prop. 4.34)',
  generer(r) {
    const [p, q] = [r.int(1, 4), r.int(1, 4)]
    const [a, b] = [r.nz(-6, 6), r.nz(-6, 6)]
    const plus = r.bool()
    const poly = (lead: number, d: number) => lin([lead, ...Array.from({ length: d }, () => r.int(-5, 5))], Array.from({ length: d + 1 }, (_, i) => nomDeg(d - i)))
    const [N, D] = [poly(a, p), poly(b, q)]
    const quot = new Frac(a, b)
    const INF = [T`$+\infty$`, T`$-\infty$`]
    const signe = Math.sign(a / b) * (plus || (p - q) % 2 === 0 ? 1 : -1)
    const lim = p === q ? `$${quot.tex()}$` : p < q ? '$0$' : INF[signe > 0 ? 0 : 1]
    const { choix, reponse } = choixQcm(r, lim, [`$${quot.tex()}$`, '$0$', ...INF, '$1$'])
    const ou = plus ? T`+\infty` : T`-\infty`
    return {
      type: 'qcm',
      enonce: T`$\displaystyle\lim_{x\to${ou}}\frac{${N}}{${D}}=$`,
      choix,
      reponse,
      explication: [
        T`[cours] **Prop. 4.34** : en $\pm\infty$, un quotient de polynômes a la même limite que le **quotient des termes de plus haut degré**, $\cours{\frac{a_nx^n}{b_mx^m}}$.`,
        T`[calcul] $$\frac{${N}}{${D}}\ \text{se comporte comme}\ \frac{${lin([a], [nomDeg(p)])}}{${lin([b], [nomDeg(q)])}}=${quot.tex()}${p === q ? '' : p - q === 1 ? 'x' : `\\,x^{${p - q}}`}$$`,
        p === q
          ? T`[resultat] Degrés égaux : la limite est le quotient des coefficients dominants, ${ok(lim)}`
          : p < q
            ? T`[resultat] Le degré du dénominateur l'emporte : ${ok(lim)}`
            : T`[resultat] $x^{${p - q}}$ tend vers $${plus || (p - q) % 2 === 0 ? '+' : '-'}\infty$ quand $x\to${ou}$, multiplié par $${quot.tex()}$ : ${ok(lim)}`,
        p > q && !plus ? T`[piege] En $-\infty$, le signe dépend de la **parité** de l'exposant : $x^{${p - q}}$ est ${(p - q) % 2 ? 'négatif' : 'positif'}.` : T`[piege] « $\frac\infty\infty$ » est une forme indéterminée : seuls les termes dominants comptent.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §4.2 Continuité et dérivabilité
// =====================================================================================

const analyseVf = vfPioche(
  { id: 'g4-analyse-vf', section: 'ch4.s2', titre: 'Vrai / faux : limites, continuité, dérivabilité', source: 'TD4 ex 7 à 13', refCours: 'poly §4.1.2–4.2 p.94–103', indispensable: true },
  (r) => {
    const [f, g] = r.pick([['f', 'g'], ['u', 'v'], ['\\varphi', '\\psi']])
    const a = r.pick(['a', 'x_0', 'c'])
    return [
      { e: T`Si une fonction $${f}$ admet une limite finie en un point, cette limite est unique.`, rep: true, ex: [T`[cours] **Prop. 4.5** (p.95) : si $f$ admet une limite finie $\ell$ en un point ou en $\pm\infty$, cette limite est **unique**.`, T`[calcul] Idée (TD4 ex 7) : si $\ell\neq\ell'$ étaient deux limites, $f(x)$ serait à moins de $\varepsilon=\frac{|\ell-\ell'|}3$ des deux à la fois : impossible.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Si $${f}(x)\le ${g}(x)\le h(x)$ sur un intervalle ouvert contenant $${a}$ et si $\lim_{x\to ${a}}${f}(x)=\lim_{x\to ${a}}h(x)=\ell$, alors $\lim_{x\to ${a}}${g}(x)=\ell$.`, rep: true, ex: [T`[cours] **Théorème des gendarmes** (Thm. 4.16, p.99, énoncé indispensable) : $\cours{f\le g\le h\ \text{et}\ \lim f=\lim h=\ell\ \Rightarrow\ \lim g=\ell}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Si $${f}(x)\le ${g}(x)$ pour tout $x$ et si $\lim_{x\to+\infty}${g}(x)=\ell$, alors $\lim_{x\to+\infty}${f}(x)=\ell$.`, rep: false, ex: [T`[cours] Le théorème des gendarmes (Thm. 4.16) demande un encadrement **des deux côtés**, par deux fonctions de même limite.`, T`[calcul] Contre-exemple : $${f}(x)=-x$ et $${g}(x)=0$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`La fonction définie par $${g}(x)=x\sin\left(\frac1x\right)$ si $x\neq0$ et $${g}(0)=0$ est continue en $0$.`, rep: true, ex: [T`[cours] Gendarmes (Thm. 4.16) et $\cours{|\sin|\le1}$.`, T`[calcul] $-|x|\le x\sin\frac1x\le|x|$ et $|x|\to0$, donc $\lim_{x\to0}${g}(x)=0=${g}(0)$.`, T`[resultat] ${OKVF(true)} (TD4 ex 9)`] },
      { e: T`Si $${f}$ est dérivable en $${a}$, alors $${f}$ est continue en $${a}$.`, rep: true, ex: [T`[cours] **Prop. 4.21** (p.102) : dérivable en $a$ $\Rightarrow$ continue en $a$.`, T`[calcul] $${f}(x)-${f}(${a})=\frac{${f}(x)-${f}(${a})}{x-${a}}\times(x-${a})\to ${f}'(${a})\times0=0$.`, T`[resultat] ${OKVF(true)} (TD4 ex 10 et 11)`] },
      { e: T`Si $${f}$ est continue en $${a}$, alors $${f}$ est dérivable en $${a}$.`, rep: false, ex: [T`[cours] **Prop. 4.21** (p.102) : la réciproque de « dérivable $\Rightarrow$ continue » est **fausse**.`, T`[calcul] Contre-exemple : $x\mapsto|x|$ est continue en $0$, mais $\frac{|h|}h$ vaut $1$ à droite et $-1$ à gauche : pas de limite.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Si $${f}'>0$ sur $]\alpha,\beta[$, alors $${f}$ est strictement croissante sur $]\alpha,\beta[$.`, rep: true, ex: [T`[cours] **Thm. 4.23** (p.102, énoncé indispensable « dérivée et variations ») : $\cours{f'>0\text{ sur }]a,b[\ \Rightarrow\ f\text{ strictement croissante sur }]a,b[}$.`, T`[resultat] ${OKVF(true)} (TD4 ex 12)`] },
      { e: T`Si $${f}$ est dérivable et strictement croissante sur $\mathbb R$, alors $${f}'(x)>0$ pour tout $x$.`, rep: false, ex: [T`[cours] Le Thm. 4.23 est une **implication** : $f'>0\Rightarrow f$ strictement croissante. Sa réciproque est fausse.`, T`[calcul] Contre-exemple : $x\mapsto x^3$ est strictement croissante, mais sa dérivée $3x^2$ s'annule en $0$.`, T`[resultat] ${OKVF(false)} On a seulement $${f}'\ge0$.`] },
      { e: T`Si $${f}$ est continue sur $[\alpha,\beta]$ avec $${f}(\alpha)<0<${f}(\beta)$, alors il existe $c\in[\alpha,\beta]$ tel que $${f}(c)=0$.`, rep: true, ex: [T`[cours] **Théorème des valeurs intermédiaires** (Thm. 4.18, p.100, énoncé indispensable) : une fonction **continue** sur $[a,b]$ prend toute valeur comprise entre $f(a)$ et $f(b)$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Si $${f}$ est continue sur $[\alpha,\beta]$ avec $${f}(\alpha)<0<${f}(\beta)$, alors $${f}$ s'annule **exactement une fois** sur $[\alpha,\beta]$.`, rep: false, ex: [T`[cours] Le TVI (Thm. 4.18) donne l'**existence**. L'**unicité** demande en plus la stricte monotonie (théorème de la bijection, Thm. 4.31).`, T`[calcul] Contre-exemple : $x\mapsto x^3-x$ sur $[-2,2]$ s'annule en $-1$, $0$ et $1$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Une fonction croissante et majorée sur $[0,+\infty[$ admet une limite finie en $+\infty$.`, rep: true, ex: [T`[cours] **Prop. 4.8** (p.96, énoncé indispensable) : $\cours{\text{croissante et majorée}\Rightarrow\text{limite finie en }+\infty}$ (de même : décroissante et minorée).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Une fonction bornée sur $\mathbb R$ admet une limite en $+\infty$.`, rep: false, ex: [T`[cours] Prop. 4.8 (p.96) : il faut **monotone** et bornée du bon côté.`, T`[calcul] Contre-exemple : $\sin$ est bornée mais oscille indéfiniment.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour $${f},${g}$ dérivables : $(${f}${g})'=${f}'${g}'$.`, rep: false, ex: [T`[cours] **Thm. 4.25** (p.103) : $\cours{(fg)'=f'g+fg'}$.`, T`[calcul] Avec $${f}(x)=${g}(x)=x$ : $(x^2)'=2x$, alors que $${f}'${g}'=1$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour $${f},${g}$ dérivables avec $${g}(x)\neq0$ : $\left(\dfrac{${f}}{${g}}\right)'=\dfrac{${f}'${g}-${f}${g}'}{${g}^2}$.`, rep: true, ex: [T`[cours] **Thm. 4.25** (p.103) : $\cours{\left(\frac fg\right)'=\frac{f'g-fg'}{g^2}}$.`, T`[resultat] ${OKVF(true)} Attention à l'ordre : c'est $f'g$ **moins** $fg'$.`] },
      { e: T`La dérivée d'une fonction **paire** dérivable est une fonction **impaire**.`, rep: true, ex: [T`[cours] Dérivée d'une composée (Prop. 4.29) : $\cours{(f(-x))'=-f'(-x)}$.`, T`[calcul] On dérive $${f}(-x)=${f}(x)$ : $-${f}'(-x)=${f}'(x)$.`, T`[resultat] ${OKVF(true)} Exemple : $\cos$ est paire, $\cos'=-\sin$ est impaire.`] },
      { e: T`Si $${f}$ est dérivable et $${f}'(${a})=0$, alors $${f}$ admet un extremum local en $${a}$.`, rep: false, ex: [T`[cours] En un extremum local intérieur, la dérivée s'annule ; la **réciproque est fausse** : il faut que $f'$ **change de signe** (Thm. 4.23).`, T`[calcul] Contre-exemple : $x\mapsto x^3$ a une dérivée nulle en $0$ et est strictement croissante.`, T`[resultat] ${OKVF(false)}`] },
    ]
  },
)

const nombreDerive: Gabarit = {
  id: 'g4-nombre-derive',
  chapitre: 'ch4',
  section: 'ch4.s2',
  niveau: 1,
  titre: 'Reconnaître un nombre dérivé dans une limite',
  source: 'poly §4.2.2 (Déf. 4.20)',
  refCours: 'poly §4.2.2 p.101 (Déf. 4.20)',
  indispensable: true,
  generer(r) {
    const a = r.int(2, 6)
    const n = r.int(2, 4)
    const cas = r.int(0, 6)
    const L = [
      { q: T`\frac{(${a}+h)^{${n}}-${a ** n}}{h}`, f: T`x^{${n}}`, en: `${a}`, d: T`${n}x^{${n - 1}}`, val: T`${n}\times${a}^{${n - 1}}=${n * a ** (n - 1)}`, rep: String(n * a ** (n - 1)) },
      { q: T`\frac{\sqrt{${a * a}+h}-${a}}{h}`, f: T`\sqrt x`, en: `${a * a}`, d: T`\frac1{2\sqrt x}`, val: T`\frac1{${2 * a}}`, rep: `1/${2 * a}` },
      { q: T`\frac{e^{${a}+h}-e^{${a}}}{h}`, f: 'e^x', en: `${a}`, d: 'e^x', val: T`e^{${a}}`, rep: `exp(${a})` },
      { q: T`\frac{\ln(${a}+h)-\ln ${a}}{h}`, f: T`\ln x`, en: `${a}`, d: T`\frac1x`, val: T`\frac1{${a}}`, rep: `1/${a}` },
      { q: T`\frac1h\left(\frac1{${a}+h}-\frac1{${a}}\right)`, f: T`\frac1x`, en: `${a}`, d: T`-\frac1{x^2}`, val: T`-\frac1{${a * a}}`, rep: `-1/${a * a}` },
      { q: T`\frac{\sin h}{h}`, f: T`\sin x`, en: '0', d: T`\cos x`, val: T`\cos0=1`, rep: '1' },
      { q: T`\frac{\cos h-1}{h}`, f: T`\cos x`, en: '0', d: T`-\sin x`, val: T`-\sin0=0`, rep: '0' },
    ][cas]
    return {
      type: 'num',
      enonce: T`Calculer $\displaystyle\lim_{h\to0}${L.q}$.`,
      reponse: L.rep,
      indice: T`Reconnais un taux d'accroissement $\frac{f(a+h)-f(a)}h$.`,
      explication: [
        T`[cours] **Définition de la dérivée** (Déf. 4.20, p.101, énoncé indispensable) : $$\cours{f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}}$$`,
        T`[methode] La limite est une forme $\frac00$ : on y **reconnaît** le taux d'accroissement de $f(x)=${L.f}$ en $a=${L.en}$.`,
        T`[calcul] $f'(x)=${L.d}$, donc $f'(${L.en})=\cle{${L.val}}$.`,
        T`[resultat] $\ok{${L.val.includes('=') ? L.val.split('=').pop() : L.val}}$`,
        T`[piege] Répondre « $\frac00$ n'existe pas » : c'est une forme **indéterminée**, que la dérivée lève.`,
      ].join('\n'),
    }
  },
}

const extremum: Gabarit = {
  id: 'g4-extremum',
  chapitre: 'ch4',
  section: 'ch4.s2',
  niveau: 2,
  titre: 'Étude de variations : où est l’extremum ?',
  source: 'TD4 ex 3',
  refCours: 'poly §4.2.2 p.102 (Thm. 4.23, dérivée et variations)',
  indispensable: true,
  generer(r) {
    const a = r.int(2, 6)
    const n = r.int(1, 4)
    const b = r.nz(-5, 5)
    const cas = r.int(0, 5)
    const L = [
      { f: T`x\,e^{-x/${a}}`, D: T`\mathbb R`, max: true, d: T`\left(1-\frac x{${a}}\right)e^{-x/${a}}`, signe: T`du signe de $1-\frac x{${a}}$ (l'exponentielle est $>0$)`, x0: `${a}`, rep: `${a}` },
      { f: T`\exp\left(-${fx(b)}^2\right)`, D: T`\mathbb R`, max: true, d: T`-2${fx(b)}\exp\left(-${fx(b)}^2\right)`, signe: T`du signe de $-${fx(b)}$`, x0: `${b}`, rep: `${b}` },
      { f: n === 1 ? T`\dfrac{\ln x}{x}` : T`\dfrac{\ln x}{x^{${n}}}`, D: T`]0,+\infty[`, max: true, d: T`\dfrac{1-${n === 1 ? '' : n}\ln x}{x^{${n + 1}}}`, signe: T`du signe de $1-${n === 1 ? '' : n}\ln x$`, x0: n === 1 ? 'e' : T`e^{1/${n}}`, rep: `exp(1/${n})` },
      { f: T`x+\dfrac{${a * a}}{x}`, D: T`]0,+\infty[`, max: false, d: T`1-\dfrac{${a * a}}{x^2}=\dfrac{x^2-${a * a}}{x^2}`, signe: T`du signe de $x^2-${a * a}$, soit de $x-${a}$ sur $]0,+\infty[$`, x0: `${a}`, rep: `${a}` },
      { f: T`x\,e^{x/${a}}`, D: T`\mathbb R`, max: false, d: T`\left(1+\frac x{${a}}\right)e^{x/${a}}`, signe: T`du signe de $1+\frac x{${a}}$`, x0: `${-a}`, rep: `${-a}` },
      { f: T`x-${a}\ln x`, D: T`]0,+\infty[`, max: false, d: T`1-\dfrac{${a}}{x}=\dfrac{x-${a}}{x}`, signe: T`du signe de $x-${a}$`, x0: `${a}`, rep: `${a}` },
    ][cas]
    const quoi = L.max ? 'maximum' : 'minimum'
    return {
      type: 'num',
      enonce: T`La fonction $f(x)=${L.f}$, définie sur $${L.D}$, admet un **${quoi}**. En quelle valeur de $x$ est-il atteint ?`,
      reponse: L.rep,
      indice: 'Calcule f′, étudie son signe, dresse le tableau de variations.',
      explication: [
        T`[cours] **Dérivée et variations** (Thm. 4.23, p.102) : $\cours{f'>0\Rightarrow f\text{ strictement croissante}}$, $\cours{f'<0\Rightarrow f\text{ strictement décroissante}}$. Un extremum se trouve là où $f'$ **s'annule en changeant de signe**.`,
        T`[calcul] $$f'(x)=${L.d}$$ $f'(x)$ est ${L.signe} : elle s'annule en $x=\cle{${L.x0}}$.`,
        L.max ? T`$f'>0$ avant, $f'<0$ après : $f$ croît puis décroît.` : T`$f'<0$ avant, $f'>0$ après : $f$ décroît puis croît.`,
        T`[resultat] Le ${quoi} est atteint en $\ok{x=${L.x0}}$.`,
        T`[piege] On demande **où** l'extremum est atteint (une valeur de $x$), pas la valeur de $f$ en ce point.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §4.3 Fonctions composées
// =====================================================================================

function fonctionComposee(r: Rng) {
  const a = r.nz(-4, 4)
  const b = r.int(1, 5)
  const n = r.int(2, 5)
  const ax2 = lin([a], ['x^2'])
  const u1 = T`${ax2}+\dfrac{${b}}{x}`
  const p = (k: number, s: string) => (k === 1 ? s : `${s}^{${k}}`)
  const L = [
    { tex: T`\sin\left(${u1}\right)`, f: `sin(${a}*x^2+${b}/x)`, d: `(${2 * a}*x-${b}/x^2)*cos(${a}*x^2+${b}/x)`, dTex: T`\left(${lin([2 * a], ['x'])}-\dfrac{${b}}{x^2}\right)\cos\left(${u1}\right)`, regle: T`$\cours{(\sin u)'=u'\cos u}$ avec $u=${u1}$ et $u'=${lin([2 * a], ['x'])}-\frac{${b}}{x^2}$ (TD4 ex 4.1).` },
    { tex: T`\dfrac{1}{\tan x}`, f: '1/tan(x)', d: '-1/sin(x)^2', dTex: T`-\dfrac{1}{\sin^2x}`, regle: T`$\frac1{\tan x}=\frac{\cos x}{\sin x}$, quotient : $\frac{-\sin^2x-\cos^2x}{\sin^2x}$, et $\cours{\cos^2+\sin^2=1}$ (TD4 ex 4.2). Valable là où $\sin x\neq0$ et $\cos x\neq0$.` },
    { tex: T`\sin^{${n}}x`, f: `sin(x)^${n}`, d: `${n}*sin(x)^${n - 1}*cos(x)`, dTex: n === 2 ? T`2\sin x\cos x` : T`${n}\sin^{${n - 1}}x\,\cos x`, regle: T`$\cours{(u^n)'=nu'u^{n-1}}$ avec $u=\sin x$, $u'=\cos x$ (TD4 ex 4.3).` },
    { tex: T`\cos(${lx(a, b)})`, f: `cos(${a}*x+${b})`, d: `${-a}*sin(${a}*x+${b})`, dTex: T`${lin([-a], [T`\sin(${lx(a, b)})`])}`, regle: T`$\cours{(\cos u)'=-u'\sin u}$ avec $u=${lx(a, b)}$, $u'=${a}$.` },
    { tex: T`\exp(-x^{${n}})`, f: `exp(-x^${n})`, d: `${-n}*x^${n - 1}*exp(-x^${n})`, dTex: T`-${n}${p(n - 1, 'x')}\,e^{-x^{${n}}}`, regle: T`$\cours{(e^u)'=u'e^u}$ avec $u=-x^{${n}}$, $u'=-${n}${p(n - 1, 'x')}$ (TD4 ex 3.2).` },
    { tex: T`\exp(\cos x)`, f: 'exp(cos(x))', d: '-sin(x)*exp(cos(x))', dTex: T`-\sin x\;e^{\cos x}`, regle: T`$\cours{(e^u)'=u'e^u}$ avec $u=\cos x$, $u'=-\sin x$ (TD4 ex 3.3).` },
    { tex: T`\ln\left(\dfrac1x\right)`, f: 'ln(1/x)', d: '-1/x', dTex: T`-\dfrac1x`, regle: T`$\cours{(\ln u)'=\frac{u'}u}$ avec $u=\frac1x$, $u'=-\frac1{x^2}$ ; ou directement $\ln\frac1x=-\ln x$ (TD4 ex 3.4).` },
    { tex: T`\arctan(${lx(1, b)})`, f: `arctan(x+${b})`, d: `1/(1+(x+${b})^2)`, dTex: T`\dfrac{1}{1+(${lx(1, b)})^2}`, regle: T`$\cours{(\arctan u)'=\frac{u'}{1+u^2}}$ avec $u=${lx(1, b)}$, $u'=1$ (TD4 ex 3.7).` },
    { tex: T`\cos^3x+\cos^2x+\cos x+1`, f: 'cos(x)^3+cos(x)^2+cos(x)+1', d: '-sin(x)*(3*cos(x)^2+2*cos(x)+1)', dTex: T`-\sin x\,(3\cos^2x+2\cos x+1)`, regle: T`C'est $P\circ\cos$ avec $P(X)=X^3+X^2+X+1$ : $\cours{(P\circ f)'=f'\times P'\circ f}$, $P'(X)=3X^2+2X+1$ (poly, Test « polynôme de fonction »).` },
    { tex: T`\ln(\cos x)`, f: 'ln(cos(x))', d: '-tan(x)', dTex: T`-\tan x`, regle: T`$\cours{(\ln u)'=\frac{u'}u}$ avec $u=\cos x$ : $\frac{-\sin x}{\cos x}$.` },
    { tex: T`\exp(-${lin([Math.abs(a)], ['x^2'])})`, f: `exp(-${Math.abs(a)}*x^2)`, d: `${-2 * Math.abs(a)}*x*exp(-${Math.abs(a)}*x^2)`, dTex: T`-${2 * Math.abs(a)}x\,e^{-${lin([Math.abs(a)], ['x^2'])}}`, regle: T`$\cours{(e^u)'=u'e^u}$ avec $u=-${lin([Math.abs(a)], ['x^2'])}$ (poly, Test « la gaussienne »).` },
  ]
  return r.pick(L)
}

const deriveeComposee: Gabarit = {
  id: 'g4-derivee-composee',
  chapitre: 'ch4',
  section: 'ch4.s3',
  niveau: 1,
  titre: 'Dériver une fonction composée',
  source: 'TD4 ex 3 et 4',
  refCours: 'poly §4.3 (Prop. 4.29)',
  indispensable: true,
  generer(r) {
    const fn = fonctionComposee(r)
    for (const x0 of [0.7, 1.2]) {
      const h = 1e-5
      const num = (evalX(fn.f, x0 + h) - evalX(fn.f, x0 - h)) / (2 * h)
      verifier(Math.abs(num - evalX(fn.d, x0)) < 1e-3 * Math.max(1, Math.abs(num)), `dérivée ${fn.tex}`)
    }
    return {
      type: 'court',
      enonce: T`Dériver $f(x)=${fn.tex}$ (là où elle est dérivable).`,
      reponse: [fn.d],
      variables: ['x'],
      mode: 'expression',
      format: "f'(x) = … (écris seulement l'expression)",
      explication: [
        T`[cours] **Dérivation des fonctions composées** (Prop. 4.29, énoncé indispensable) : $$\cours{(g\circ f)'(x)=g'(f(x))\times f'(x)}$$`,
        T`[methode] ${fn.regle}`,
        T`[resultat] $\ok{f'(x)=${fn.dTex}}$`,
        T`[piege] L'erreur (beaucoup trop) courante : **oublier de multiplier par $f'(x)$**. $(g\circ f)'\neq g'\circ f$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §4.4 Fonction réciproque
// =====================================================================================

const reciproque: Gabarit = {
  id: 'g4-reciproque',
  chapitre: 'ch4',
  section: 'ch4.s4',
  niveau: 2,
  titre: 'Dérivée d’une fonction réciproque',
  source: 'TD4 ex 6.4',
  refCours: 'poly §4.4 (Thm. 4.31 et Prop. 4.32)',
  indispensable: true,
  generer(r) {
    const n = r.pick([3, 5])
    const a = r.int(1, 5)
    const b = r.int(-5, 5)
    const x0 = r.int(-2, 2)
    const y0 = x0 ** n + a * x0 + b
    const d = n * x0 ** (n - 1) + a
    const fTex = lin([1, a, b], [`x^${n}`, 'x', ''])
    return {
      type: 'num',
      enonce: T`La fonction $f(x)=${fTex}$ est une bijection strictement croissante de $\mathbb R$ sur $\mathbb R$. Calculer $(f^{-1})'(${y0})$.`,
      reponse: `1/${d}`,
      indice: T`Cherche d'abord $x_0$ tel que $f(x_0)=${y0}$ (une valeur entière simple).`,
      explication: [
        T`[cours] **Prop. 4.32** : si $f$ est strictement monotone et dérivable, $f^{-1}$ est dérivable en tout $y$ tel que $f'(f^{-1}(y))\neq0$, et $$\cours{(f^{-1})'(y)=\frac{1}{f'(f^{-1}(y))}}$$`,
        T`[methode] (1) Trouver $x_0=f^{-1}(${y0})$, c'est-à-dire résoudre $f(x_0)=${y0}$. (2) Calculer $f'(x_0)$. (3) Inverser.`,
        T`[calcul] $f(${x0})=${x0 < 0 ? `(${x0})` : x0}^${n}+${a}\times${x0 < 0 ? `(${x0})` : x0}${b === 0 ? '' : b > 0 ? `+${b}` : b}=${y0}$, donc $f^{-1}(${y0})=\cle{${x0}}$.`,
        T`$f'(x)=${lin([n, a], [`x^${n - 1}`, ''])}$, donc $f'(${x0})=\cle{${d}}$.`,
        T`[resultat] $\ok{(f^{-1})'(${y0})=${new Frac(1, d).tex()}}$`,
        T`[piege] La dérivée se calcule en $x_0=f^{-1}(${y0})$, **pas** en $${y0}$ : $\ko{\frac1{f'(${y0})}}$ est faux.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §4.5.1–4.5.4 Puissances, exp, ln, hyperboliques
// =====================================================================================

const croissancesComparees: Gabarit = {
  id: 'g4-lim-cc',
  chapitre: 'ch4',
  section: 'ch4.s5',
  niveau: 1,
  titre: 'Croissances comparées',
  source: 'TD4 ex 5.4 et 5.5',
  refCours: 'poly §4.5.2 (Prop. 4.37 et 4.39)',
  indispensable: true,
  generer(r) {
    const n = r.int(2, 9)
    const EXP = T`**Exponentielle vs. polynômes** (Prop. 4.37) : $\cours{\lim_{x\to+\infty}\frac{e^x}{x^n}=+\infty}$ et $\cours{\lim_{x\to+\infty}x^ne^{-x}=0}$. L'exponentielle **l'emporte** sur toute puissance.`
    const LN = T`**Logarithme vs. racines** (Prop. 4.39) : $\cours{\lim_{x\to+\infty}\frac{\ln x}{\sqrt[n]x}=0}$ et $\cours{\lim_{x\to0^+}\sqrt[n]x\,\ln x=0}$. Toute puissance **l'emporte** sur le logarithme.`
    const PI = T`Ce n'est **pas** une forme indéterminée : les règles usuelles sur les limites suffisent.`
    const Z = '$0$'
    const P = T`$+\infty$`
    const M = T`$-\infty$`
    const items: { l: string; rep: string; cours: string; calc: string }[] = [
      { l: T`\lim_{x\to+\infty}\frac{e^x}{x^{${n}}}`, rep: P, cours: EXP, calc: T`Forme $\frac\infty\infty$ levée par la Prop. 4.37.` },
      { l: T`\lim_{x\to-\infty}x^{${n}}e^x`, rep: Z, cours: EXP, calc: T`On pose $t=-x\to+\infty$ : $x^{${n}}e^x=${n % 2 ? '-' : ''}t^{${n}}e^{-t}\to0$.` },
      { l: T`\lim_{x\to0^+}x^{${n}}\ln x`, rep: Z, cours: LN, calc: T`$x^{${n}}\ln x=x^{${n}-\frac12}\times\sqrt x\,\ln x$, produit de deux termes qui tendent vers $0$.` },
      { l: T`\lim_{x\to+\infty}\frac{\ln x}{\sqrt[${n}]{x}}`, rep: Z, cours: LN, calc: T`C'est exactement la Prop. 4.39.` },
      { l: T`\lim_{x\to0^+}(x^2+x)\ln x`, rep: Z, cours: LN, calc: T`$(x^2+x)\ln x=(x+1)\times x\ln x$ avec $x+1\to1$ et $x\ln x\to0$ (TD4 ex 5.4).` },
      { l: T`\lim_{x\to+\infty}(x^2+x)\ln x`, rep: P, cours: PI, calc: T`$x^2+x\to+\infty$ et $\ln x\to+\infty$ : le produit tend vers $+\infty$ (TD4 ex 5.4).` },
      { l: T`\lim_{x\to0^+}\frac{e^x}{x^{${n}}}`, rep: P, cours: PI, calc: T`$e^x\to1$ et $x^{${n}}\to0^+$ : « $\frac1{0^+}$ » donne $+\infty$ (TD4 ex 5.5).` },
      { l: T`\lim_{x\to-\infty}\frac{e^x}{x^{${n}}}`, rep: Z, cours: PI, calc: T`$e^x\to0$ et $\frac1{x^{${n}}}\to0$ : le produit tend vers $0$ (TD4 ex 5.5).` },
      { l: T`\lim_{x\to+\infty}x^{${n}}e^{-x}`, rep: Z, cours: EXP, calc: T`C'est exactement la Prop. 4.37.` },
      { l: T`\lim_{x\to+\infty}\left(x-${n}\ln x\right)`, rep: P, cours: LN, calc: T`Forme $\infty-\infty$ : on factorise, $x-${n}\ln x=x\left(1-${n}\frac{\ln x}x\right)$ et $\frac{\ln x}x\to0$.` },
      { l: T`\lim_{x\to+\infty}\left(\ln x-x^{${n}}\right)`, rep: M, cours: LN, calc: T`$\ln x-x^{${n}}=x^{${n}}\left(\frac{\ln x}{x^{${n}}}-1\right)$ avec $\frac{\ln x}{x^{${n}}}\to0$.` },
    ]
    const it = r.pick(items)
    const choix = r.shuffle([Z, P, M, '$1$'])
    return {
      type: 'qcm',
      enonce: T`$\displaystyle${it.l}=$`,
      choix,
      reponse: choix.indexOf(it.rep),
      explication: [T`[cours] ${it.cours}`, T`[calcul] ${it.calc}`, T`[resultat] ${ok(it.rep)}`, T`[piege] Avant d'invoquer les croissances comparées, vérifier qu'il y a **vraiment** une forme indéterminée.`].join('\n'),
    }
  },
}

const formesIndeterminees: Gabarit = {
  id: 'g4-lim-fi',
  chapitre: 'ch4',
  section: 'ch4.s5',
  niveau: 2,
  titre: 'Lever une forme indéterminée (factorisation, conjugué)',
  source: 'TD4 ex 5.6 et 5.7',
  refCours: 'poly §4.1.2 p.94 (limites) et §4.5.1 (Prop. 4.35, racines)',
  generer(r) {
    const cas = r.int(0, 2)
    if (cas === 0) {
      const a = r.int(2, 5)
      const g = r.pick([
        { tex: T`\cos(x)`, at: T`\cos(${a})`, asc: `cos(${a})`, js: Math.cos },
        { tex: 'e^x', at: T`e^{${a}}`, asc: `exp(${a})`, js: Math.exp },
        { tex: T`\ln(x)`, at: T`\ln(${a})`, asc: `ln(${a})`, js: Math.log },
      ])
      const x = a + 1e-6
      verifier(Math.abs(((x * x - a * a) * g.js(x)) / (x - a) - 2 * a * g.js(a)) < 1e-4 * Math.max(1, Math.abs(2 * a * g.js(a))), 'limite 0/0')
      return {
        type: 'num',
        enonce: T`Calculer $\displaystyle\lim_{x\to${a}}\frac{(x^2-${a * a})\,${g.tex}}{x-${a}}$ (valeur exacte).`,
        reponse: `${2 * a}*${g.asc}`,
        explication: [
          T`[cours] Forme $\cours{\frac00}$ : on **factorise** pour simplifier le facteur qui s'annule, $\cours{x^2-a^2=(x-a)(x+a)}$.`,
          T`[calcul] Pour $x\neq${a}$ : $$\frac{(x-${a})(x+${a})\,${g.tex}}{x-${a}}=(x+${a})\,${g.tex}\ \xrightarrow[x\to${a}]{}\ ${2 * a}\,${g.at}$$ par continuité.`,
          T`[resultat] $\ok{${2 * a}\,${g.at}}$ (TD4 ex 5.6)`,
          T`[piege] Ne pas conclure « $0\times$ quelque chose $=0$ » : le dénominateur tend aussi vers $0$.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const a = r.nz(-9, 9)
      const res = new Frac(a, 2)
      const dedans = lin([1, a], ['x^2', 'x'])
      return {
        type: 'num',
        enonce: T`Calculer $\displaystyle\lim_{x\to+\infty}\left(\sqrt{${dedans}}-x\right)$.`,
        reponse: res.ascii(),
        explication: [
          T`[cours] Forme $\cours{\infty-\infty}$ avec des racines : on multiplie par la **quantité conjuguée**, $\cours{\sqrt A-\sqrt B=\frac{A-B}{\sqrt A+\sqrt B}}$.`,
          T`[calcul] $$\sqrt{${dedans}}-x=\frac{(${dedans})-x^2}{\sqrt{${dedans}}+x}=\frac{${lin([a], ['x'])}}{x\left(\sqrt{1${a > 0 ? '+' : '-'}\frac{${Math.abs(a)}}x}+1\right)}$$ pour $x>0$ assez grand.`,
          T`[resultat] Le dénominateur entre parenthèses tend vers $2$ : $\ok{${res.tex()}}$`,
          T`[piege] « $\infty-\infty=0$ » est faux : c'est une forme indéterminée.`,
        ].join('\n'),
      }
    }
    const [a, b] = [r.int(1, 6), r.int(1, 6)]
    const res = new Frac(a + b, 2)
    return {
      type: 'num',
      enonce: T`Calculer $\displaystyle\lim_{x\to+\infty}\sqrt x\left(\sqrt{x+${a}}-\sqrt{x-${b}}\right)$.`,
      reponse: res.ascii(),
      explication: [
        T`[cours] Différence de racines : **quantité conjuguée**, $\cours{\sqrt A-\sqrt B=\frac{A-B}{\sqrt A+\sqrt B}}$.`,
        T`[calcul] $$\sqrt{x+${a}}-\sqrt{x-${b}}=\frac{(x+${a})-(x-${b})}{\sqrt{x+${a}}+\sqrt{x-${b}}}=\frac{${a + b}}{\sqrt{x+${a}}+\sqrt{x-${b}}}$$ On multiplie par $\sqrt x$ et on divise haut et bas par $\sqrt x$ : $\frac{${a + b}}{\sqrt{1+\frac{${a}}x}+\sqrt{1-\frac{${b}}x}}\to\frac{${a + b}}2$.`,
        T`[resultat] $\ok{${res.tex()}}$`,
        T`[verif] Conséquence : $\frac{1}{\sqrt{x+1}-\sqrt{x-1}}=\frac{\sqrt{x+1}+\sqrt{x-1}}2\to+\infty$ (TD4 ex 5.7).`,
      ].join('\n'),
    }
  },
}

const repertoireVf = vfPioche(
  { id: 'g4-repertoire-vf', section: 'ch4.s5', titre: 'Vrai / faux : exp, ln, puissances, ch et sh', source: 'TD4 ex 15 et 16', refCours: 'poly §4.5.2–4.5.4 (Prop. 4.36 à 4.43)', indispensable: true },
  (r) => {
    const n = r.int(2, 6)
    const a = r.pick([2, 3, 5, 10])
    const HYP = T`[cours] (Déf. 4.40) $\cours{\operatorname{ch}x=\frac{e^x+e^{-x}}2}$, $\cours{\operatorname{sh}x=\frac{e^x-e^{-x}}2}$ ; $\operatorname{ch}'=\operatorname{sh}$, $\operatorname{sh}'=\operatorname{ch}$ et $\operatorname{ch}^2-\operatorname{sh}^2=1$.`
    const PUI = T`[cours] **Fonctions puissance** (Déf. 4.42, énoncé indispensable) : pour $x>0$ et $a$ réel, $\cours{x^a=\exp(a\ln x)}$. Prop. 4.43 : $x^ax^b=x^{a+b}$, $(x^a)^b=x^{ab}$, $x^{-a}=\frac1{x^a}$, $(x^a)'=ax^{a-1}$.`
    const EXP = T`[cours] **La fonction exponentielle** (Prop. 4.36, énoncé indispensable) : unique fonction dérivable sur $\mathbb R$ telle que $\cours{f'=f}$ et $\cours{f(0)=1}$. Elle vérifie $e^x>0$, $e^{x+y}=e^xe^y$, $(e^x)^n=e^{nx}$, $\frac1{e^x}=e^{-x}$.`
    return [
      { e: T`Pour tout réel $x$ : $\operatorname{ch}^2(x)-\operatorname{sh}^2(x)=1$.`, rep: true, ex: [HYP, T`[calcul] $\operatorname{ch}^2-\operatorname{sh}^2=(\operatorname{ch}-\operatorname{sh})(\operatorname{ch}+\operatorname{sh})=e^{-x}\times e^x=1$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La dérivée de $\operatorname{ch}$ est $\operatorname{sh}$.`, rep: true, ex: [HYP, T`[calcul] $\left(\frac{e^x+e^{-x}}2\right)'=\frac{e^x-e^{-x}}2$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La dérivée de $\operatorname{ch}$ est $-\operatorname{sh}$.`, rep: false, ex: [HYP, T`[resultat] ${OKVF(false)} Contrairement à $\cos'=-\sin$, il n'y a **pas de signe moins** : $\operatorname{ch}'=\operatorname{sh}$.`] },
      { e: T`$\operatorname{sh}(0)=1$.`, rep: false, ex: [HYP, T`[calcul] $\operatorname{sh}(0)=\frac{1-1}2=0$ et $\operatorname{ch}(0)=\frac{1+1}2=1$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour tout réel $x$ : $-1<\operatorname{th}(x)<1$, où $\operatorname{th}=\dfrac{\operatorname{sh}}{\operatorname{ch}}$.`, rep: true, ex: [T`[cours] (Déf. 4.41) $\cours{\operatorname{th}x=\frac{\operatorname{sh}x}{\operatorname{ch}x}=\frac{e^x-e^{-x}}{e^x+e^{-x}}}$.`, T`[calcul] $|e^x-e^{-x}|<e^x+e^{-x}$ car les deux exponentielles sont strictement positives.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout $x>0$ et tout réel $a$ : $x^a=\exp(a\ln x)$.`, rep: true, ex: [PUI, T`[resultat] ${OKVF(true)} C'est la **définition**.`] },
      { e: T`Pour $x>0$, la dérivée de $x\mapsto x^{\pi}$ est $x\mapsto\pi x^{\pi-1}$.`, rep: true, ex: [PUI, T`[calcul] $(e^{\pi\ln x})'=\frac\pi x\,e^{\pi\ln x}=\pi x^{\pi-1}$ (TD4 ex 16).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La dérivée de $x\mapsto ${a}^x$ est $x\mapsto x\,${a}^{x-1}$.`, rep: false, ex: [PUI, T`[calcul] $${a}^x=e^{x\ln ${a}}$, donc $(${a}^x)'=\ln(${a})\,${a}^x$. La variable est dans l'**exposant** : ce n'est pas une fonction puissance.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`La fonction $x\mapsto x^{\pi}$ est définie sur $\mathbb R$.`, rep: false, ex: [PUI, T`[resultat] ${OKVF(false)} Elle est définie sur $]0,+\infty[$ : il faut $\ln x$ (TD4 ex 3.6).`] },
      { e: T`Pour tous $x>0$ et $a,b$ réels : $x^a\,x^b=x^{ab}$.`, rep: false, ex: [PUI, T`[calcul] $x^ax^b=e^{a\ln x}e^{b\ln x}=e^{(a+b)\ln x}=x^{a+b}$. C'est $(x^a)^b$ qui vaut $x^{ab}$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour tous réels $x,y$ : $\exp(x+y)=\exp(x)+\exp(y)$.`, rep: false, ex: [EXP, T`[calcul] $x=y=0$ : $e^0=1$ mais $e^0+e^0=2$.`, T`[resultat] ${OKVF(false)} L'exponentielle transforme les sommes en **produits**.`] },
      { e: T`Pour tout réel $x$ : $(\exp x)^{${n}}=\exp(${n}x)$.`, rep: true, ex: [EXP, T`[resultat] ${OKVF(true)} (TD4 ex 15.4)`] },
      { e: T`$\displaystyle\lim_{x\to+\infty}\frac{e^x}{x^{${n}}}=0$.`, rep: false, ex: [T`[cours] **Exponentielle vs. polynômes** (Prop. 4.37) : $\cours{\lim_{x\to+\infty}\frac{e^x}{x^n}=+\infty}$.`, T`[resultat] ${OKVF(false)} C'est $x^{${n}}e^{-x}$ qui tend vers $0$.`] },
      { e: T`$\displaystyle\lim_{x\to+\infty}\frac{\ln x}{\sqrt[${n}]{x}}=0$.`, rep: true, ex: [T`[cours] **Logarithme vs. racines** (Prop. 4.39) : $\cours{\lim_{x\to+\infty}\frac{\ln x}{\sqrt[n]x}=0}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Il existe une unique fonction dérivable $f:\mathbb R\to\mathbb R$ telle que $f'=f$ et $f(0)=1$.`, rep: true, ex: [EXP, T`[calcul] Unicité (TD4 ex 15.2) : si $g$ convient aussi, $\left(g\,e^{-x}\right)'=0$, donc $g\,e^{-x}$ est constante égale à $1$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout réel $x$ : $\ln(e^x)=x$ ; et pour tout $x>0$ : $e^{\ln x}=x$.`, rep: true, ex: [T`[cours] **Le logarithme** (Prop. 4.38, énoncé indispensable) : pour tout $x>0$ il existe un unique $y$ tel que $\cours{e^y=x}$ ; on le note $\ln x$. C'est la **réciproque** de $\exp$.`, T`[resultat] ${OKVF(true)}`] },
    ]
  },
)

const michaelis: Gabarit = {
  id: 'g4-michaelis',
  chapitre: 'ch4',
  section: 'ch4.s5',
  niveau: 2,
  titre: 'Fonction modèle : Michaelis-Menten',
  source: 'TD4 ex 17',
  refCours: 'poly §4.5.1 (Prop. 4.34) et §4.2.2 (Thm. 4.25)',
  generer(r) {
    const vm = r.int(2, 12)
    const K = r.int(2, 9)
    const v = T`v(S)=\dfrac{${vm}\,S}{${K}+S}`
    const cas = r.int(0, 3)
    const intro = T`En cinétique enzymatique, la vitesse de réaction en fonction de la concentration $S\ge0$ est $${v}$ (équation de Michaelis-Menten avec $v_{\max}=${vm}$ et $K=${K}$).`
    const C = T`[cours] $\cours{v(S)=\frac{v_{\max}S}{K+S}}$ : la variable est $S$, les paramètres sont $v_{\max}$ et $K$. Quotient de polynômes de même degré (Prop. 4.34) et dérivée d'un quotient (Thm. 4.25).`
    const L = [
      { q: T`Calculer $\displaystyle\lim_{S\to+\infty}v(S)$.`, rep: String(vm), calc: T`Termes dominants : $\frac{${vm}S}{S}=${vm}$. La vitesse **sature** à $v_{\max}$ (asymptote horizontale).`, res: `${vm}` },
      { q: T`Calculer $v(${K})$.`, rep: new Frac(vm, 2).ascii(), calc: T`$v(${K})=\frac{${vm}\times${K}}{${K}+${K}}=\frac{${vm}}2$ : en $S=K$, la vitesse vaut **la moitié** de $v_{\max}$.`, res: new Frac(vm, 2).tex() },
      { q: T`Calculer $v'(0)$ (pente à l'origine).`, rep: new Frac(vm, K).ascii(), calc: T`$v'(S)=\frac{${vm}(${K}+S)-${vm}S}{(${K}+S)^2}=\frac{${vm * K}}{(${K}+S)^2}>0$, donc $v'(0)=\frac{${vm * K}}{${K * K}}$.`, res: new Frac(vm, K).tex() },
      { q: T`Pour quelle concentration $S$ a-t-on $v(S)=\dfrac{v_{\max}}2$ ?`, rep: String(K), calc: T`$\frac{${vm}S}{${K}+S}=\frac{${vm}}2\iff2S=${K}+S\iff S=${K}$ : c'est la signification de la constante $K$.`, res: `S=${K}` },
    ][cas]
    return {
      type: 'num',
      enonce: `${intro} ${L.q}`,
      reponse: L.rep,
      explication: [C, T`[calcul] ${L.calc}`, T`[resultat] $\ok{${L.res}}$`, T`[piege] Ne pas confondre la **variable** $S$ et les **paramètres** : on dérive par rapport à $S$ (TD4 ex 17).`].join('\n'),
    }
  },
}

// =====================================================================================
// §4.5.5–4.5.7 Trigonométrie et fonctions réciproques
// =====================================================================================

const ARCS = {
  arcsin: { dans: 'sin', inter: T`\left[-\frac\pi2,\frac\pi2\right]`, prop: 'Prop. 4.47' },
  arccos: { dans: 'cos', inter: T`[0,\pi]`, prop: 'Prop. 4.48' },
  arctan: { dans: 'tan', inter: T`\left]-\frac\pi2,\frac\pi2\right[`, prop: 'Prop. 4.46' },
} as const

const arcValeurs: Gabarit = {
  id: 'g4-arc',
  chapitre: 'ch4',
  section: 'ch4.s6',
  niveau: 1,
  titre: 'Valeurs de arcsin, arccos, arctan',
  source: 'TD4 ex 6',
  refCours: 'poly §4.5.7 (Prop. 4.46 à 4.48)',
  generer(r) {
    const fn = r.pick(['arcsin', 'arccos', 'arctan'] as const)
    const A = ARCS[fn]
    const FN = `\\${fn}`
    const G = `\\${A.dans}`
    const NOM = { sin: 'le sinus', cos: 'le cosinus', tan: 'la tangente' }[A.dans]
    const MEME = { sin: 'le même sinus', cos: 'le même cosinus', tan: 'la même tangente' }[A.dans]
    const js = { arcsin: (t: number) => Math.asin(Math.sin(t)), arccos: (t: number) => Math.acos(Math.cos(t)), arctan: (t: number) => Math.atan(Math.tan(t)) }[fn]
    const reduire = (t: number) => {
      if (fn === 'arccos') return Math.abs(principal(t))
      if (fn === 'arctan') return mod(t, 12) > 6 ? mod(t, 12) - 12 : mod(t, 12)
      const u = principal(t)
      return u > 6 ? 12 - u : u < -6 ? -12 - u : u
    }
    const COURS = T`[cours] (${A.prop}) $\cours{y=${FN}(x)\iff${G}(y)=x\ \text{et}\ y\in${A.inter}}$ : c'est **l'unique** angle de $${A.inter}$ dont ${NOM} vaut $x$.`
    if (r.bool(0.55)) {
      // composition : arcsin(sin t) avec t hors de l'intervalle principal
      let t: number
      do t = r.int(-23, 23)
      while (!remarquable(t) || (fn === 'arctan' && mod(t, 12) === 6) || reduire(t) === t)
      const res = reduire(t)
      verifier(Math.abs(js((t * Math.PI) / 12) - (res * Math.PI) / 12) < 1e-9, `${fn} ${t}`)
      const val = fn === 'arcsin' ? sinT(t).tex() : fn === 'arccos' ? cosT(t).tex() : tanT(t)!.tex()
      return {
        type: 'num',
        enonce: T`Calculer $${FN}\left(${G}\left(${angleTex(t)}\right)\right)$.`,
        reponse: angleAscii(res),
        indice: `La réponse doit être dans l'intervalle d'arrivée de ${fn}.`,
        explication: [
          COURS,
          T`[methode] $${angleTex(t)}$ n'est **pas** dans $${A.inter}$ : on cherche l'angle de cet intervalle qui a ${MEME} (cercle trigonométrique : ${fn === 'arcsin' ? T`$\sin(\pi-x)=\sin x$ et période $2\pi$` : fn === 'arccos' ? T`$\cos(-x)=\cos x$ et période $2\pi$` : T`période $\pi$`}).`,
          T`[calcul] $${G}\left(${angleTex(t)}\right)=\cle{${val}}=${G}\left(${angleTex(res)}\right)$ et $${angleTex(res)}\in${A.inter}$.`,
          T`[resultat] $\ok{${angleTex(res)}}$`,
          T`[piege] $\ko{${angleTex(t)}}$ : la simplification « ${fn}(${A.dans}(x)) = x » n'est vraie que pour $x\in${A.inter}$ (TD4 ex 6.3).`,
        ].join('\n'),
      }
    }
    const res = r.pick(fn === 'arcsin' ? [-6, -4, -3, -2, 0, 2, 3, 4, 6] : fn === 'arccos' ? [0, 2, 3, 4, 6, 8, 9, 10, 12] : [-4, -3, -2, 0, 2, 3, 4])
    const val = fn === 'arcsin' ? sinT(res) : fn === 'arccos' ? cosT(res) : tanT(res)!
    return {
      type: 'num',
      enonce: T`Calculer $${FN}\left(${val.tex()}\right)$.`,
      reponse: angleAscii(res),
      explication: [
        COURS,
        T`[methode] On cherche, **dans $${A.inter}$**, l'angle dont ${NOM} vaut $${val.tex()}$ (valeurs remarquables).`,
        T`[calcul] $${G}\left(${angleTex(res)}\right)=${val.tex()}$ et $${angleTex(res)}\in${A.inter}$.`,
        T`[resultat] $\ok{${angleTex(res)}}$`,
        T`[piege] La réponse est **un seul** angle, dans l'intervalle d'arrivée : pas de « $+2k\pi$ ».`,
      ].join('\n'),
    }
  },
}

const arcVf = vfPioche(
  { id: 'g4-arc-vf', section: 'ch4.s6', titre: 'Vrai / faux : fonctions trigonométriques et réciproques', source: 'TD4 ex 6', refCours: 'poly §4.5.5–4.5.7 (Prop. 4.44 à 4.48)' },
  () => {
    const AS = T`[cours] (Prop. 4.47, TD4 ex 6) $\arcsin:[-1,1]\to\left[-\frac\pi2,\frac\pi2\right]$ est la réciproque de $\sin$ restreint à $\left[-\frac\pi2,\frac\pi2\right]$ : $\cours{y=\arcsin x\iff\sin y=x\ \text{et}\ y\in\left[-\frac\pi2,\frac\pi2\right]}$.`
    const AT = T`[cours] (Prop. 4.46) $\arctan:\mathbb R\to\left]-\frac\pi2,\frac\pi2\right[$ est la réciproque de $\tan$ restreinte à $\left]-\frac\pi2,\frac\pi2\right[$, de dérivée $\cours{\arctan'(x)=\frac1{1+x^2}}$.`
    const AC = T`[cours] (Prop. 4.48) $\arccos:[-1,1]\to[0,\pi]$ est la réciproque de $\cos$ restreint à $[0,\pi]$.`
    return [
      { e: T`Pour tout $x\in[-1,1]$ : $\sin(\arcsin x)=x$.`, rep: true, ex: [AS, T`[resultat] ${OKVF(true)} Par définition, $\arcsin x$ est un angle dont le sinus vaut $x$.`] },
      { e: T`Pour tout réel $x$ : $\arcsin(\sin x)=x$.`, rep: false, ex: [AS, T`[calcul] $x=\pi$ : $\arcsin(\sin\pi)=\arcsin0=0\neq\pi$.`, T`[resultat] ${OKVF(false)} Vrai seulement pour $x\in\left[-\frac\pi2,\frac\pi2\right]$ (TD4 ex 6.3).`] },
      { e: T`Pour tout $x\in\ ]-1,1[$ : $\arcsin'(x)=\dfrac1{\sqrt{1-x^2}}$.`, rep: true, ex: [T`[cours] Dérivée d'une réciproque (Prop. 4.32) : $\cours{(f^{-1})'(y)=\frac1{f'(f^{-1}(y))}}$.`, T`[calcul] On dérive $\sin(\arcsin x)=x$ : $\arcsin'(x)\cos(\arcsin x)=1$, et $\cos(\arcsin x)=\sqrt{1-x^2}$ car le cosinus est positif sur $\left[-\frac\pi2,\frac\pi2\right]$ (TD4 ex 6.4).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La fonction $\arcsin$ est dérivable en $1$.`, rep: false, ex: [T`[cours] Prop. 4.32 : $f^{-1}$ est dérivable en $y$ seulement si $\cours{f'(f^{-1}(y))\neq0}$.`, T`[calcul] $\arcsin1=\frac\pi2$ et $\sin'\left(\frac\pi2\right)=\cos\frac\pi2=0$ : tangente **verticale** en $x=1$.`, T`[resultat] ${OKVF(false)} $\arcsin$ n'est dérivable que sur $]-1,1[$.`] },
      { e: T`Pour tout réel $x$ : $\arctan'(x)=\dfrac1{1+x^2}$.`, rep: true, ex: [AT, T`[calcul] $\tan'=1+\tan^2$, donc $\arctan'(x)=\frac1{1+\tan^2(\arctan x)}=\frac1{1+x^2}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La fonction $\arccos$ prend ses valeurs dans $[0,\pi]$.`, rep: true, ex: [AC, T`[resultat] ${OKVF(true)}`] },
      { e: T`La fonction $\arcsin$ est définie sur $\mathbb R$.`, rep: false, ex: [AS, T`[resultat] ${OKVF(false)} Un sinus est toujours dans $[-1,1]$ : $\arcsin2$ n'existe pas.`] },
      { e: T`$\displaystyle\lim_{x\to+\infty}\arctan(x)=\frac\pi2$.`, rep: true, ex: [AT, T`[calcul] Quand $y\to\frac\pi2^-$, $\tan y\to+\infty$ : par réciproque, $\arctan x\to\frac\pi2$ quand $x\to+\infty$.`, T`[resultat] ${OKVF(true)} Asymptote horizontale $y=\frac\pi2$.`] },
      { e: T`La fonction $\arctan$ est bornée sur $\mathbb R$.`, rep: true, ex: [AT, T`[resultat] ${OKVF(true)} $-\frac\pi2<\arctan x<\frac\pi2$ pour tout $x$.`] },
      { e: T`Pour tout réel $x$ : $\tan(\arctan x)=x$.`, rep: true, ex: [AT, T`[resultat] ${OKVF(true)} Dans ce sens, la composition redonne toujours $x$.`] },
      { e: T`Pour tout $x$ où $\tan$ est définie : $\arctan(\tan x)=x$.`, rep: false, ex: [AT, T`[calcul] $x=\pi$ : $\arctan(\tan\pi)=\arctan0=0\neq\pi$.`, T`[resultat] ${OKVF(false)} Vrai seulement pour $x\in\left]-\frac\pi2,\frac\pi2\right[$.`] },
      { e: T`Le graphe de $\arcsin$ est le symétrique, par rapport à la droite $y=x$, du graphe de $\sin$ restreint à $\left[-\frac\pi2,\frac\pi2\right]$.`, rep: true, ex: [T`[cours] Le graphe d'une réciproque s'obtient en **échangeant** les rôles de $x$ et $y$, soit par symétrie par rapport à $\cours{y=x}$ (poly §4.4).`, T`[resultat] ${OKVF(true)} (TD4 ex 6.2)`] },
      { e: T`La fonction $\arctan$ est impaire.`, rep: true, ex: [AT, T`[calcul] $\tan(-y)=-\tan y$, donc $\arctan(-x)=-\arctan x$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La fonction $\arccos$ est paire.`, rep: false, ex: [AC, T`[calcul] $\arccos(1)=0$ mais $\arccos(-1)=\pi$. En fait $\arccos(-x)=\pi-\arccos(x)$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`$\sin$ et $\cos$ sont $2\pi$-périodiques, et $\tan$ est $\pi$-périodique.`, rep: true, ex: [T`[cours] (Prop. 4.44, énoncé indispensable) $\sin$ et $\cos$ sont $2\pi$-périodiques, avec $\cours{\cos(x+\pi)=-\cos x}$ et $\cours{\sin(x+\pi)=-\sin x}$.`, T`[calcul] $\tan(x+\pi)=\frac{-\sin x}{-\cos x}=\tan x$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour tout $x\in[-1,1]$ : $\arcsin(x)+\arccos(x)=\dfrac\pi2$.`, rep: true, ex: [AS, T`[calcul] Posons $y=\frac\pi2-\arccos x$. Alors $\sin y=\cos(\arccos x)=x$ et $y\in\left[-\frac\pi2,\frac\pi2\right]$ puisque $\arccos x\in[0,\pi]$ : donc $y=\arcsin x$.`, T`[resultat] ${OKVF(true)}`] },
    ]
  },
)

export const GABARITS_CH4: Gabarit[] = [
  inegAbs,
  inegRacine,
  graphes,
  parite,
  domaine,
  limiteRationnelle,
  analyseVf,
  nombreDerive,
  extremum,
  deriveeComposee,
  reciproque,
  croissancesComparees,
  formesIndeterminees,
  repertoireVf,
  michaelis,
  arcValeurs,
  arcVf,
]
