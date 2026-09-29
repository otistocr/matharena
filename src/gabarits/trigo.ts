/**
 * Trigonométrie (transversal : poly Fig. 1.3, §2.1.5, Prop. 4.44, §4.5.5–4.5.7, TD1 ex 1, TD2 ex 13,
 * cours perso « La trigonométrie intégrale »). Gabarits à variantes.
 */
import type { Gabarit } from './types'
import { Frac, Rng, verifier, proche } from './outils'
import { c, evaluate, parse, type C } from '../lib/mathexpr'
import { Ex, angleAscii, angleTex, cosT, principal, quadrant, remarquable, sinT, tanT } from './exact'

const T = String.raw
const REF_CERCLE = 'poly Fig. 1.3 p.7 et Prop. 4.44 p.115'

/** Tous les angles remarquables de ]−π, π], en douzièmes de π. */
const REMARQUABLES = Array.from({ length: 24 }, (_, i) => i - 11).filter(remarquable)
const pickAngle = (r: Rng, sansZero = true) => r.pick(REMARQUABLES.filter((t) => !sansZero || t !== 0))

/** Réduction au premier quart : angle principal u = forme(α), et formules de miroir. */
function reduction(t: number) {
  const u = principal(t)
  let alpha: number
  let forme: string
  let cosF: string
  let sinF: string
  let miroir: string
  if (u >= 0 && u <= 6) {
    alpha = u
    forme = angleTex(u)
    cosF = T`\cos\alpha`
    sinF = T`\sin\alpha`
    miroir = 'premier quart : lecture directe'
  } else if (u > 6) {
    alpha = 12 - u
    forme = T`\pi-${angleTex(alpha)}`
    cosF = T`-\cos\alpha`
    sinF = T`\sin\alpha`
    miroir = T`miroir **vertical** $\pi-\alpha$ : $\cos(\pi-\alpha)=-\cos\alpha$, $\sin(\pi-\alpha)=\sin\alpha$`
  } else if (u >= -6) {
    alpha = -u
    forme = T`-${angleTex(alpha)}`
    cosF = T`\cos\alpha`
    sinF = T`-\sin\alpha`
    miroir = T`miroir **horizontal** $-\alpha$ : $\cos(-\alpha)=\cos\alpha$, $\sin(-\alpha)=-\sin\alpha$`
  } else {
    alpha = 12 + u
    forme = T`-\pi+${angleTex(alpha)}`
    cosF = T`-\cos\alpha`
    sinF = T`-\sin\alpha`
    miroir = T`**demi-tour** $\alpha-\pi$ : $\cos(\alpha-\pi)=-\cos\alpha$, $\sin(\alpha-\pi)=-\sin\alpha$`
  }
  return { u, alpha, forme, cosF, sinF, miroir }
}

/** Ex entre parenthèses s'il est négatif. */
const parEx = (e: Ex) => (e.valeur() < 0 ? T`\left(${e.tex()}\right)` : e.tex())
/** Exposant i·θ lisible : e^{-i\frac{5\pi}{6}} plutôt que e^{i-\frac…}. */
const expo = (t: number) => (t < 0 ? `-i${angleTex(-t).replace('\\dfrac', '\\frac')}` : `i${angleTex(t).replace('\\dfrac', '\\frac')}`)

/** a + ib en LaTeX propre. */
function texC(re: Ex, im: Ex): string {
  if (im.zero) return re.tex()
  const imAbs = im.valeur() < 0 ? im.neg() : im
  const imTex = imAbs.tex() === '1' ? 'i' : `${imAbs.tex()}\\,i`
  if (re.zero) return `${im.valeur() < 0 ? '-' : ''}${imTex}`
  return `${re.tex()}${im.valeur() < 0 ? '-' : '+'}${imTex}`
}
const asciiC = (re: Ex, im: Ex) => (im.zero ? re.ascii() : `(${re.ascii()})+(${im.ascii()})*i`)

// =====================================================================================
// s1 — Radians, cercle, mesure principale
// =====================================================================================

const conversion: Gabarit = {
  id: 'tr-conversion',
  chapitre: 'trigo',
  section: 'trigo.s1',
  niveau: 1,
  titre: 'Degrés ↔ radians',
  source: 'cours perso trigo, étage 2',
  refCours: 'poly Fig. 1.3 p.7',
  generer(r) {
    const t = r.pick(REMARQUABLES.filter((x) => x !== 0).map((x) => (x < 0 && r.bool() ? x + 24 : x)))
    const deg = 15 * t
    const versRad = r.bool()
    return {
      type: 'num',
      enonce: versRad ? T`Convertir $${deg}^\circ$ en radians.` : T`Convertir $${angleTex(t)}$ radians en degrés.`,
      reponse: versRad ? angleAscii(t) : deg,
      unite: versRad ? undefined : 'degrés',
      explication: [
        T`[cours] Un tour complet vaut $360^\circ=2\pi$ rad, donc $\cours{180^\circ=\pi}$ : $$\cours{\theta_{\text{rad}}=\theta_{\text{deg}}\times\frac{\pi}{180}}$$`,
        versRad
          ? T`[calcul] $$${deg}\times\frac{\pi}{180}=\frac{${deg}}{180}\pi=${angleTex(t)}$$`
          : T`[calcul] $$${angleTex(t)}\times\frac{180}{\pi}=${new Frac(t, 12).tex()}\times180=${deg}$$`,
        versRad ? T`[resultat] $\ok{${deg}^\circ=${angleTex(t)}}$` : T`[resultat] $\ok{${angleTex(t)}=${deg}^\circ}$`,
        T`[verif] Repères : $\frac\pi6=30^\circ$, $\frac\pi4=45^\circ$, $\frac\pi3=60^\circ$, $\frac\pi2=90^\circ$.`,
      ].join('\n'),
    }
  },
}

const mesurePrincipale: Gabarit = {
  id: 'tr-principale',
  chapitre: 'trigo',
  section: 'trigo.s1',
  niveau: 1,
  titre: 'Mesure principale',
  source: 'cours perso trigo, étage 2 (B3)',
  refCours: 'poly §2.1.5 p.38 (Énoncé indispensable 16)',
  indispensable: 16,
  generer(r) {
    const p = pickAngle(r)
    const k = r.pick([-2, -1, 1, 2, 3])
    const t = p + 24 * k
    return {
      type: 'num',
      enonce: T`Donner la mesure principale (dans $]-\pi,\pi]$) de l'angle $${angleTex(t)}$.`,
      reponse: angleAscii(p),
      explication: [
        T`[cours] $\theta$ et $\theta+2k\pi$ désignent le **même point** du cercle (Énoncé indispensable 16 : $\cours{e^{i\alpha}=e^{i\beta}\iff\alpha=\beta+2k\pi}$). La mesure principale est l'unique représentant dans $\cours{]-\pi,\pi]}$.`,
        T`[methode] Retirer (ou ajouter) des tours de $2\pi=${angleTex(24)}$ jusqu'à tomber dans $]-\pi,\pi]$.`,
        T`[calcul] $$${angleTex(t)}${k > 0 ? '-' : '+'}${Math.abs(k) === 1 ? '' : `${Math.abs(k)}\times`}2\pi=${angleTex(t)}${k > 0 ? '-' : '+'}${angleTex(24 * Math.abs(k))}=${angleTex(p)}$$`,
        T`[resultat] $\ok{${angleTex(p)}}$`,
        p < 0
          ? T`[piege] Répondre $\ko{${angleTex(p + 24)}}$ : c'est le même point, mais cette mesure est dans $[0,2\pi[$, pas dans $]-\pi,\pi]$.`
          : T`[piege] Se tromper dans le nombre de tours : toujours vérifier que le résultat est entre $-\pi$ et $\pi$.`,
      ].join('\n'),
    }
  },
}

const longueurArc: Gabarit = {
  id: 'tr-arc',
  chapitre: 'trigo',
  section: 'trigo.s1',
  niveau: 1,
  titre: 'Longueur d’arc',
  source: 'cours perso trigo, étage 2 (B4)',
  refCours: 'cours perso trigo, étage 2',
  generer(r) {
    const R = r.int(2, 9)
    const t = r.pick([2, 3, 4, 6, 8, 9, 10, 12, 16, 18])
    const L = new Frac(R * t, 12)
    const Ltex = L.n === 1 && L.d === 1 ? '\\pi' : L.d === 1 ? `${L.n}\\pi` : `\\dfrac{${L.n === 1 ? '' : L.n}\\pi}{${L.d}}`
    return {
      type: 'num',
      enonce: T`Sur un cercle de rayon $${R}$, quelle est la longueur de l'arc intercepté par un angle au centre de $${angleTex(t)}$ radians ?`,
      reponse: `${L.n}pi/${L.d}`.replace(/^1pi/, 'pi').replace(/\/1$/, ''),
      explication: [
        T`[cours] Le radian **est** une longueur : sur un cercle de rayon $R$, un angle $\theta$ (en radians) découpe un arc de longueur $\cours{L=R\,\theta}$.`,
        T`[calcul] $$L=${R}\times${angleTex(t)}=${Ltex}$$`,
        T`[resultat] $\ok{L=${Ltex}}$`,
        T`[verif] Pour un tour complet ($\theta=2\pi$) on retrouve le périmètre $2\pi R=${2 * R}\pi$ ✓`,
        T`[piege] La formule $L=R\theta$ n'est valable qu'avec $\theta$ **en radians**.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s2 — Valeurs remarquables, angles associés
// =====================================================================================

const valeurRemarquable: Gabarit = {
  id: 'tr-valeur',
  chapitre: 'trigo',
  section: 'trigo.s2',
  niveau: 1,
  titre: 'Cosinus / sinus d’un angle remarquable',
  source: 'TD1 ex 1',
  refCours: REF_CERCLE,
  indispensable: true,
  generer(r) {
    const p = pickAngle(r, false)
    const k = r.pick([0, 0, 1, -1, 2])
    const t = p + 24 * k
    const f = r.pick(['cos', 'sin'] as const)
    const v = f === 'cos' ? cosT(t) : sinT(t)
    verifier(proche(v.valeur(), (f === 'cos' ? Math.cos : Math.sin)((t * Math.PI) / 12)), 'valeur remarquable')
    const red = reduction(t)
    const q = quadrant(t)
    const signe = v.valeur() > 0 ? 'positif' : v.valeur() < 0 ? 'négatif' : 'nul'
    return {
      type: 'num',
      enonce: T`Donner la valeur exacte de $${'\\' + f}\left(${angleTex(t)}\right)$.`,
      reponse: v.ascii(),
      indice: T`Retire les tours, écris l'angle sous la forme $\alpha$, $\pi-\alpha$, $-\alpha$ ou $\alpha-\pi$ avec $\alpha\in[0,\frac\pi2]$, puis vérifie le signe sur le cercle.`,
      explication: [
        T`[cours] Valeurs du premier quart (Prop. 4.44) : $$\cours{\begin{array}{c|ccccc}\theta&0&\frac\pi6&\frac\pi4&\frac\pi3&\frac\pi2\\\hline\cos&1&\frac{\sqrt3}2&\frac{\sqrt2}2&\frac12&0\\\sin&0&\frac12&\frac{\sqrt2}2&\frac{\sqrt3}2&1\end{array}}$$`,
        T`[methode] (1) Retirer les tours. (2) Se ramener au premier quart par un **miroir**. (3) Contrôler le **signe** sur le cercle.`,
        k !== 0 ? T`[calcul] (1) $${angleTex(t)}=${angleTex(red.u)}${k > 0 ? '+' : '-'}${angleTex(24 * Math.abs(k))}$, donc $${'\\' + f}\left(${angleTex(t)}\right)=${'\\' + f}\left(${angleTex(red.u)}\right)$.` : T`[calcul] (1) Pas de tour à retirer : $${angleTex(t)}\in]-\pi,\pi]$.`,
        T`(2) $${angleTex(red.u)}=${red.forme}$ avec $\alpha=${angleTex(red.alpha)}$ : ${red.miroir}.`,
        T`$$${'\\' + f}\left(${angleTex(red.u)}\right)=${f === 'cos' ? red.cosF : red.sinF}=\cle{${v.tex()}}$$`,
        T`[resultat] $\ok{${'\\' + f}\left(${angleTex(t)}\right)=${v.tex()}}$`,
        q ? T`[verif] Le point est dans le quadrant ${q} : ${f === 'cos' ? "l'abscisse" : "l'ordonnée"} y est **${signe}** ✓` : T`[verif] Le point est sur un axe : lecture directe sur le cercle ✓`,
      ].join('\n'),
    }
  },
}

const ASSOCIES: { tex: (x: string) => string; f: (x: number) => number; regle: string }[] = [
  { tex: (x) => T`-${x}`, f: (x) => -x, regle: T`miroir **horizontal** (symétrie par rapport à l'axe des abscisses)` },
  { tex: (x) => T`\pi-${x}`, f: (x) => Math.PI - x, regle: T`miroir **vertical** (symétrie par rapport à l'axe des ordonnées)` },
  { tex: (x) => T`\pi+${x}`, f: (x) => Math.PI + x, regle: T`**demi-tour** (symétrie par rapport à l'origine)` },
  { tex: (x) => T`\frac{\pi}{2}-${x}`, f: (x) => Math.PI / 2 - x, regle: T`miroir selon la **diagonale** $y=x$ : abscisse et ordonnée s'échangent` },
  { tex: (x) => T`${x}+\frac{\pi}{2}`, f: (x) => x + Math.PI / 2, regle: T`**quart de tour** direct : $(c,s)\mapsto(-s,c)$ (Prop. 4.44)` },
  { tex: (x) => T`${x}-\frac{\pi}{2}`, f: (x) => x - Math.PI / 2, regle: T`**quart de tour** indirect : $(c,s)\mapsto(s,-c)$` },
  { tex: (x) => T`${x}+2\pi`, f: (x) => x + 2 * Math.PI, regle: T`**un tour complet** : même point (périodicité $2\pi$)` },
  { tex: (x) => T`${x}+3\pi`, f: (x) => x + 3 * Math.PI, regle: T`un tour **plus** un demi-tour : comme $\pi+x$` },
]

const anglesAssocies: Gabarit = {
  id: 'tr-associes',
  chapitre: 'trigo',
  section: 'trigo.s2',
  niveau: 1,
  titre: 'Angles associés (les miroirs)',
  source: 'TD1 ex 1.2',
  refCours: 'poly Prop. 4.44 p.115 et p.116 (Test)',
  indispensable: true,
  generer(r) {
    const x = r.pick(['x', '\\theta', 'a', 't'])
    const a = r.pick(ASSOCIES)
    const f = r.pick(['cos', 'sin'] as const)
    const x0 = 0.37
    const val = (f === 'cos' ? Math.cos : Math.sin)(a.f(x0))
    const cands = [
      { tex: T`\cos ${x}`, v: Math.cos(x0) },
      { tex: T`-\cos ${x}`, v: -Math.cos(x0) },
      { tex: T`\sin ${x}`, v: Math.sin(x0) },
      { tex: T`-\sin ${x}`, v: -Math.sin(x0) },
    ]
    const bon = cands.find((c) => proche(c.v, val))
    verifier(!!bon, 'angle associé')
    const choix = r.shuffle(cands.map((c) => `$${c.tex}$`))
    return {
      type: 'qcm',
      enonce: T`Pour tout réel $${x}$, $${'\\' + f}\left(${a.tex(x)}\right)=$`,
      choix,
      reponse: choix.indexOf(`$${bon!.tex}$`),
      explication: [
        T`[cours] Sur le cercle, $M(${a.tex(x)})$ s'obtient à partir de $M(${x})$ par un ${a.regle}.`,
        T`[methode] Placer $${x}$ **petit** (par exemple $\frac{\pi}{12}$) sur le cercle, puis placer $${a.tex(x)}$ et comparer les coordonnées : ${f === 'cos' ? "l'abscisse" : "l'ordonnée"} de ce point est l'une des coordonnées de $M(${x})$, au signe près.`,
        T`[resultat] $\ok{${'\\' + f}\left(${a.tex(x)}\right)=${bon!.tex}}$`,
        T`[piege] Retenir les formules par cœur sans les « voir » : on se trompe de signe. Le cercle ne ment jamais.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s3 — Pythagore + quadrant
// =====================================================================================

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
]
const INTERVALLES = [
  { q: 1, tex: T`\left]0,\frac\pi2\right[`, sc: 1, ss: 1 },
  { q: 2, tex: T`\left]\frac\pi2,\pi\right[`, sc: -1, ss: 1 },
  { q: 3, tex: T`\left]-\pi,-\frac\pi2\right[`, sc: -1, ss: -1 },
  { q: 4, tex: T`\left]-\frac\pi2,0\right[`, sc: 1, ss: -1 },
]

const pythagoreQuadrant: Gabarit = {
  id: 'tr-pythagore',
  chapitre: 'trigo',
  section: 'trigo.s3',
  niveau: 1,
  titre: 'cos → sin (Pythagore + quadrant)',
  source: 'cours perso trigo, étage 3 (C3)',
  refCours: 'poly Prop. 4.44 p.115 (sin² + cos² = 1)',
  indispensable: true,
  generer(r) {
    const tr = r.pick(TRIPLES)
    const [a, b] = r.bool() ? [tr[0], tr[1]] : [tr[1], tr[0]]
    const hyp = tr[2]
    const I = r.pick(INTERVALLES)
    const donne = r.pick(['cos', 'sin'] as const)
    const cherche = r.pick(donne === 'cos' ? (['sin', 'tan'] as const) : (['cos', 'tan'] as const))
    const cosV = new Frac(I.sc * a, hyp)
    const sinV = new Frac(I.ss * b, hyp)
    const connu = donne === 'cos' ? cosV : sinV
    const autre = donne === 'cos' ? sinV : cosV
    const rep = cherche === 'tan' ? sinV.div(cosV) : autre
    const autreNom = donne === 'cos' ? 'sin' : 'cos'
    const carre = new Frac(1).sub(connu.mul(connu))
    verifier(proche(carre.valeur(), autre.valeur() ** 2), 'pythagore')
    return {
      type: 'num',
      enonce: T`On sait que $${'\\' + donne}\theta=${connu.tex()}$ et $\theta\in ${I.tex}$. Calculer $${'\\' + cherche}\theta$.`,
      reponse: rep.ascii(),
      explication: [
        T`[cours] $\cours{\cos^2\theta+\sin^2\theta=1}$ (Prop. 4.44 : c'est Pythagore sur le cercle de rayon 1). Cela donne l'autre coordonnée **au signe près**, et c'est le **quadrant** qui tranche.`,
        T`[calcul] $$${'\\' + autreNom}^2\theta=1-\left(${connu.tex()}\right)^2=${carre.tex()}\quad\Rightarrow\quad${'\\' + autreNom}\theta=\pm${new Frac(Math.abs(autre.n), autre.d).tex()}$$`,
        T`$\theta\in ${I.tex}$ : quadrant ${I.q}, où le ${autreNom === 'sin' ? "sinus (l'ordonnée)" : "cosinus (l'abscisse)"} est **${(autreNom === 'sin' ? I.ss : I.sc) > 0 ? 'positif' : 'négatif'}**, donc $${'\\' + autreNom}\theta=\cle{${autre.tex()}}$.`,
        cherche === 'tan' ? T`$$\tan\theta=\frac{\sin\theta}{\cos\theta}=\frac{${sinV.tex()}}{${cosV.tex()}}=${rep.tex()}$$` : '',
        T`[resultat] $\ok{${'\\' + cherche}\theta=${rep.tex()}}$`,
        T`[piege] Oublier le signe : $\sqrt{${carre.tex()}}$ donne une valeur **positive**, mais dans le quadrant ${I.q} le ${autreNom === 'sin' ? 'sinus' : 'cosinus'} est ${(autreNom === 'sin' ? I.ss : I.sc) > 0 ? 'positif' : 'négatif'}.`,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
}

// =====================================================================================
// s4 — Équations trigonométriques
// =====================================================================================

const equation: Gabarit = {
  id: 'tr-equation',
  chapitre: 'trigo',
  section: 'trigo.s4',
  niveau: 1,
  titre: 'Résoudre cos x = a, sin x = a',
  source: 'cours perso trigo, étage 3 (C4)',
  refCours: 'poly p.116 (Test) et cours perso trigo, étage 3',
  generer(r) {
    const f = r.pick(['cos', 'sin'] as const)
    const intervalle = r.pick(['principal', 'positif'] as const)
    const domaine = intervalle === 'principal' ? REMARQUABLES : REMARQUABLES.map((t) => (t < 0 ? t + 24 : t)).sort((a, b) => a - b)
    const t0 = r.pick(domaine)
    const fx = f === 'cos' ? cosT : sinT
    const cible = fx(t0)
    const sols = domaine.filter((t) => proche(fx(t).valeur(), cible.valeur()))
    const setTex = (ts: number[]) => (ts.length ? T`$\left\{${[...ts].sort((a, b) => a - b).map(angleTex).join(',\ ')}\right\}$` : '$\\varnothing$')
    const bon = setTex(sols)
    // leurres : une seule solution, confusion cos/sin, signe opposé
    const autreF = f === 'cos' ? sinT : cosT
    const leurres = [
      setTex([t0 >= 0 ? sols.at(-1)! : sols[0]]),
      setTex(domaine.filter((t) => proche(autreF(t).valeur(), cible.valeur()))),
      setTex(domaine.filter((t) => proche(fx(t).valeur(), -cible.valeur()))),
      setTex(sols.map((t) => (intervalle === 'principal' ? principal(t + 12) : (t + 12) % 24))),
    ]
    const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((c) => c !== bon)).slice(0, 3)])
    const I = intervalle === 'principal' ? T`]-\pi,\pi]` : T`[0,2\pi[`
    return {
      type: 'qcm',
      enonce: T`Résoudre dans $${I}$ l'équation $${'\\' + f} x=${cible.tex()}$.`,
      choix,
      reponse: choix.indexOf(bon),
      explication: [
        f === 'cos'
          ? T`[cours] $\cos x=a$ : on coupe le cercle par la droite **verticale** d'abscisse $a$. Il y a en général **deux** points, d'angles $\cours{\alpha}$ et $\cours{-\alpha}$ (Prop. 4.44 : $\cos$ est paire).`
          : T`[cours] $\sin x=a$ : on coupe le cercle par la droite **horizontale** d'ordonnée $a$. Il y a en général **deux** points, d'angles $\cours{\alpha}$ et $\cours{\pi-\alpha}$.`,
        T`[calcul] Un angle qui convient : $${'\\' + f}\left(${angleTex(t0)}\right)=${cible.tex()}$.`,
        sols.length === 1
          ? T`Ici la droite est **tangente** au cercle : un seul point.`
          : f === 'cos'
            ? T`L'autre est son symétrique $-${angleTex(principal(t0))}$${intervalle === 'positif' ? ', ramené dans $[0,2\pi[$' : ''}.`
            : T`L'autre est $\pi-${angleTex(principal(t0))}$${intervalle === 'positif' ? ', ramené dans $[0,2\pi[$' : ''}.`,
        T`[resultat] $\ok{S=}$ ${bon}`,
        T`[piege] Ne donner qu'**une** solution : une droite coupe le cercle en deux points (sauf si elle est tangente, pour $\pm1$).`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s5 — Retrouver l'angle d'un point (argument)
// =====================================================================================

const anglePoint: Gabarit = {
  id: 'tr-angle-point',
  chapitre: 'trigo',
  section: 'trigo.s5',
  niveau: 1,
  titre: 'Angle d’un point / argument (méthode des 4 pas)',
  source: 'TD2 ex 1 · cours perso trigo, étage 4',
  refCours: 'poly §2.1.5 p.36–38',
  indispensable: 14,
  generer(r) {
    const t = pickAngle(r, false)
    const m = r.int(1, 3)
    const axe = t % 6 === 0
    const famille45 = !axe && t % 3 === 0
    const R = axe ? m : famille45 ? m * Math.SQRT2 : 2 * m
    const Rtex = axe ? String(m) : famille45 ? (m === 1 ? '\\sqrt2' : `${m}\\sqrt2`) : String(2 * m)
    const coord = (e: Ex) => {
      const v = e.valeur() * R
      const k = Math.round(v)
      if (proche(v, k)) return { tex: String(k), ascii: String(k) }
      const q = Math.round(v / Math.sqrt(3))
      return { tex: `${q < 0 ? '-' : ''}${Math.abs(q) === 1 ? '' : Math.abs(q)}\\sqrt3`, ascii: `${q}*sqrt(3)` }
    }
    const x = coord(cosT(t))
    const y = coord(sinT(t))
    const complexe = r.bool()
    const alpha = Math.min(Math.abs(t), 12 - Math.abs(t))
    const q = quadrant(t)
    const formule = { 1: T`\theta=\alpha`, 2: T`\theta=\pi-\alpha`, 3: T`\theta=\alpha-\pi`, 4: T`\theta=-\alpha` }
    const yAbs = y.tex.replace(/^-/, '')
    const partieIm = `${yAbs === '1' ? '' : yAbs}${yAbs === '1' ? 'i' : '\\,i'}`
    const zTex = y.tex === '0' ? x.tex : x.tex === '0' ? `${y.tex.startsWith('-') ? '-' : ''}${partieIm}` : `${x.tex}${y.tex.startsWith('-') ? '-' : '+'}${partieIm}`
    return {
      type: 'num',
      enonce: complexe
        ? T`Donner l'argument principal (dans $]-\pi,\pi]$) du nombre complexe $z=${zTex}$.`
        : T`Dans un repère orthonormé, donner la mesure principale (dans $]-\pi,\pi]$) de l'angle $(\vec\imath,\overrightarrow{OM})$ pour $M=(${x.tex},\,${y.tex})$.`,
      reponse: angleAscii(t),
      indice: T`Calcule $R=\sqrt{x^2+y^2}$, puis $(\frac xR,\frac yR)$ : c'est un point du cercle unité. Lis l'angle de référence, puis place le point avec les signes.`,
      explication: [
        T`[cours] Un point $(x,y)\neq(0,0)$ s'écrit $\cours{(R\cos\theta,\ R\sin\theta)}$ avec $R=\sqrt{x^2+y^2}$. Pour un complexe : $\cours{z=Re^{i\theta}}$ (Énoncé indispensable 14), $R=|z|$, $\theta=\arg z$.`,
        T`[methode] **Les 4 pas** : normaliser → angle de référence $\alpha$ (sans les signes) → quadrant par les signes → contrôle.`,
        T`[calcul] 1. $R=\sqrt{(${x.tex})^2+(${y.tex})^2}=\cle{${Rtex}}$, donc $(c,s)=\left(${cosT(t).tex()},\ ${sinT(t).tex()}\right)$.`,
        axe
          ? T`2–3. Le point est **sur un axe** : lecture directe.`
          : T`2. Sans les signes : $\cos\alpha=${cosT(alpha).tex()}$, donc $\alpha=\cle{${angleTex(alpha)}}$. 3. Signes $(${cosT(t).valeur() > 0 ? '+' : '-'},${sinT(t).valeur() > 0 ? '+' : '-'})$ : quadrant ${q}, donc $${formule[q as 1]}$.`,
        T`[resultat] $\ok{\theta=${angleTex(t)}}$${complexe ? T`, donc $z=${Rtex}\,e^{${expo(t)}}$` : ''}`,
        T`[verif] $${Rtex}\cos\left(${angleTex(t)}\right)=${x.tex}$ et $${Rtex}\sin\left(${angleTex(t)}\right)=${y.tex}$ ✓`,
        axe
          ? T`[piege] Sur les axes, pas de calcul : $(+,0)\to0$, $(0,+)\to\frac\pi2$, $(-,0)\to\pi$, $(0,-)\to-\frac\pi2$. Et la mesure principale de « plein ouest » est $\pi$, pas $-\pi$.`
          : q === 3 || q === 2
          ? T`[piege] $\arctan\frac yx$ donne $\ko{${angleTex(q === 3 ? alpha : -alpha)}}$ : faux, car le rapport perd le quadrant. C'est la **paire de signes** qui situe le point.`
          : T`[piege] Ne jamais conclure sur une seule coordonnée : $\cos\theta=${cosT(t).tex()}$ seul donne deux candidats.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s6 — Addition, duplication, linéarisation
// =====================================================================================

const addition: Gabarit = {
  id: 'tr-addition',
  chapitre: 'trigo',
  section: 'trigo.s6',
  niveau: 2,
  titre: 'Valeur exacte par les formules d’addition',
  source: 'cours perso trigo, étage 5',
  refCours: 'poly §2.1.5 p.39 (produit sous forme trigonométrique)',
  generer(r) {
    let a: number, b: number, op: 1 | -1, t: number
    do {
      a = r.pick([2, 3, 4, 8, 9, 10])
      b = r.pick([2, 3, 4])
      op = r.pick([1, -1] as const)
      t = a + op * b
    } while (remarquable(t) || t === 0)
    const f = r.pick(['cos', 'sin'] as const)
    const [ca, sa, cb, sb] = [cosT(a), sinT(a), cosT(b), sinT(b)]
    const v =
      f === 'cos'
        ? op === 1
          ? ca.mul(cb).sub(sa.mul(sb))
          : ca.mul(cb).add(sa.mul(sb))
        : op === 1
          ? sa.mul(cb).add(ca.mul(sb))
          : sa.mul(cb).sub(ca.mul(sb))
    verifier(proche(v.valeur(), (f === 'cos' ? Math.cos : Math.sin)((t * Math.PI) / 12)), 'addition')
    const s = op === 1 ? '+' : '-'
    const formule =
      f === 'cos'
        ? T`\cos(a${s}b)=\cos a\cos b${op === 1 ? '-' : '+'}\sin a\sin b`
        : T`\sin(a${s}b)=\sin a\cos b${s}\cos a\sin b`
    const detail =
      f === 'cos'
        ? T`${parEx(ca)}\times${parEx(cb)}${op === 1 ? '-' : '+'}${parEx(sa)}\times${parEx(sb)}`
        : T`${parEx(sa)}\times${parEx(cb)}${s}${parEx(ca)}\times${parEx(sb)}`
    return {
      type: 'num',
      enonce: T`Sachant que $${angleTex(t)}=${angleTex(a)}${s}${angleTex(b)}$, calculer la valeur exacte de $${'\\' + f}\left(${angleTex(t)}\right)$.`,
      reponse: v.ascii(),
      indice: T`$${formule}$`,
      explication: [
        T`[cours] **Formules d'addition** : $$\cours{\cos(a\pm b)=\cos a\cos b\mp\sin a\sin b},\qquad\cours{\sin(a\pm b)=\sin a\cos b\pm\cos a\sin b}$$ Elles viennent de $e^{ia}e^{ib}=e^{i(a+b)}$ (poly p.39), ou du produit scalaire de deux vecteurs unitaires.`,
        T`[calcul] $a=${angleTex(a)}$, $b=${angleTex(b)}$ :`,
        T`$$${'\\' + f}\left(${angleTex(t)}\right)=${detail}=\cle{${v.tex()}}$$`,
        T`[resultat] $\ok{${'\\' + f}\left(${angleTex(t)}\right)=${v.tex()}\approx${v.valeur().toFixed(3).replace('.', ',')}}$`,
        T`[verif] Ordre de grandeur : $${angleTex(t)}\approx${15 * t}^\circ$, donc la valeur doit être ${v.valeur() > 0 ? 'positive' : 'négative'} ✓`,
        T`[piege] $\ko{${'\\' + f}(a${s}b)=${'\\' + f}a${s}${'\\' + f}b}$ est **faux** : avec $a=b=0$ on obtiendrait $\cos0=2$.`,
      ].join('\n'),
    }
  },
}

const duplication: Gabarit = {
  id: 'tr-duplication',
  chapitre: 'trigo',
  section: 'trigo.s6',
  niveau: 2,
  titre: 'Duplication : sin 2a, cos 2a',
  source: 'cours perso trigo, étage 5 (E3)',
  refCours: 'cours perso trigo, étage 5',
  generer(r) {
    const [a, b, c] = r.pick(TRIPLES)
    const I = r.pick(INTERVALLES)
    const cosA = new Frac(I.sc * a, c)
    const sinA = new Frac(I.ss * b, c)
    const cherche = r.pick(['sin2', 'cos2'] as const)
    const rep = cherche === 'sin2' ? sinA.mul(cosA).mul(2) : cosA.mul(cosA).mul(2).sub(1)
    const x = r.pick(['a', 'x', '\\theta'])
    return {
      type: 'num',
      enonce: T`On sait que $\cos ${x}=${cosA.tex()}$ et $${x}\in ${I.tex}$. Calculer $${cherche === 'sin2' ? T`\sin(2${x})` : T`\cos(2${x})`}$.`,
      reponse: rep.ascii(),
      explication: [
        T`[cours] **Duplication** ($b=a$ dans les formules d'addition) : $$\cours{\sin2a=2\sin a\cos a},\qquad\cours{\cos2a=\cos^2a-\sin^2a=2\cos^2a-1=1-2\sin^2a}$$`,
        cherche === 'sin2'
          ? T`[calcul] Il faut d'abord $\sin ${x}$ : $\sin^2 ${x}=1-${cosA.mul(cosA).tex()}=${sinA.mul(sinA).tex()}$, et le quadrant ${I.q} donne $\sin ${x}=\cle{${sinA.tex()}}$. $$\sin(2${x})=2\times${sinA.tex()}\times${cosA.tex()}=${rep.tex()}$$`
          : T`[calcul] Pas besoin du sinus avec la bonne formule : $$\cos(2${x})=2\cos^2 ${x}-1=2\times${cosA.mul(cosA).tex()}-1=${rep.tex()}$$`,
        T`[resultat] $\ok{${rep.tex()}}$`,
        cherche === 'sin2'
          ? T`[piege] Oublier le signe de $\sin ${x}$ (quadrant ${I.q}), ou le facteur **2**.`
          : T`[piege] $\cos(2${x})\neq2\cos ${x}$ : ce serait $\ko{${cosA.mul(2).tex()}}$.`,
      ].join('\n'),
    }
  },
}

const formulesQcm: Gabarit = {
  id: 'tr-formules',
  chapitre: 'trigo',
  section: 'trigo.s6',
  niveau: 1,
  titre: 'Formules : addition, duplication, linéarisation',
  source: 'cours perso trigo, étage 5',
  refCours: 'cours perso trigo, étage 5 · poly §2.1.5',
  generer(r) {
    const [a, b] = r.pick([
      ['a', 'b'],
      ['x', 'y'],
      ['\\alpha', '\\beta'],
      ['p', 'q'],
    ])
    const pioche: { q: string; bon: string; faux: string[]; ex: string }[] = [
      { q: T`\cos(${a}+${b})`, bon: T`\cos ${a}\cos ${b}-\sin ${a}\sin ${b}`, faux: [T`\cos ${a}+\cos ${b}`, T`\cos ${a}\cos ${b}+\sin ${a}\sin ${b}`, T`\sin ${a}\cos ${b}+\cos ${a}\sin ${b}`], ex: T`Pour le **cosinus**, le signe s'**inverse** : $\cos(a+b)$ a un $-$.` },
      { q: T`\cos(${a}-${b})`, bon: T`\cos ${a}\cos ${b}+\sin ${a}\sin ${b}`, faux: [T`\cos ${a}-\cos ${b}`, T`\cos ${a}\cos ${b}-\sin ${a}\sin ${b}`, T`\sin ${a}\cos ${b}-\cos ${a}\sin ${b}`], ex: T`C'est le produit scalaire de deux vecteurs unitaires d'angles $a$ et $b$ : $\cos a\cos b+\sin a\sin b$.` },
      { q: T`\sin(${a}+${b})`, bon: T`\sin ${a}\cos ${b}+\cos ${a}\sin ${b}`, faux: [T`\sin ${a}+\sin ${b}`, T`\sin ${a}\sin ${b}+\cos ${a}\cos ${b}`, T`\sin ${a}\cos ${b}-\cos ${a}\sin ${b}`], ex: T`Pour le **sinus**, le signe est **conservé** et on « croise » sin et cos.` },
      { q: T`\sin(${a}-${b})`, bon: T`\sin ${a}\cos ${b}-\cos ${a}\sin ${b}`, faux: [T`\sin ${a}-\sin ${b}`, T`\sin ${a}\cos ${b}+\cos ${a}\sin ${b}`, T`\cos ${a}\cos ${b}-\sin ${a}\sin ${b}`], ex: T`Sinus : signe conservé, termes croisés.` },
      { q: T`\sin(2${a})`, bon: T`2\sin ${a}\cos ${a}`, faux: [T`2\sin ${a}`, T`\sin^2 ${a}-\cos^2 ${a}`, T`\sin ${a}\cos ${a}`], ex: T`$\sin(a+a)=\sin a\cos a+\cos a\sin a$.` },
      { q: T`\cos(2${a})`, bon: T`2\cos^2 ${a}-1`, faux: [T`2\cos ${a}`, T`1-2\cos^2 ${a}`, T`\cos^2 ${a}+\sin^2 ${a}`], ex: T`$\cos2a=\cos^2a-\sin^2a$, puis $\sin^2a=1-\cos^2a$.` },
      { q: T`\cos^2 ${a}`, bon: T`\dfrac{1+\cos(2${a})}{2}`, faux: [T`\dfrac{1-\cos(2${a})}{2}`, T`\cos(${a}^2)`, T`\dfrac{\cos(2${a})}{2}`], ex: T`**Linéarisation** : on retourne $\cos2a=2\cos^2a-1$.` },
      { q: T`\sin^2 ${a}`, bon: T`\dfrac{1-\cos(2${a})}{2}`, faux: [T`\dfrac{1+\cos(2${a})}{2}`, T`\sin(${a}^2)`, T`1+\cos^2 ${a}`], ex: T`**Linéarisation** : on retourne $\cos2a=1-2\sin^2a$.` },
    ]
    const c = r.pick(pioche)
    const choix = r.shuffle([c.bon, ...c.faux].map((x) => `$${x}$`))
    return {
      type: 'qcm',
      enonce: T`Pour tous réels, $${c.q}=$`,
      choix,
      reponse: choix.indexOf(`$${c.bon}$`),
      explication: [
        T`[cours] $\cours{\cos(a\pm b)=\cos a\cos b\mp\sin a\sin b}$ et $\cours{\sin(a\pm b)=\sin a\cos b\pm\cos a\sin b}$ ; duplication et linéarisation s'en déduisent.`,
        T`[methode] ${c.ex}`,
        T`[resultat] $\ok{${c.q}=${c.bon}}$`,
        T`[verif] Tester avec des valeurs simples ($0$, $\frac\pi2$) élimine vite les mauvaises formules.`,
        T`[piege] Les fonctions trigonométriques ne sont **pas linéaires** : $\ko{\cos(a+b)=\cos a+\cos b}$.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s7 — Fonctions sin, cos, tan
// =====================================================================================

const tangente: Gabarit = {
  id: 'tr-tan',
  chapitre: 'trigo',
  section: 'trigo.s7',
  niveau: 1,
  titre: 'Tangente d’un angle remarquable',
  source: 'poly p.117 (Test)',
  refCours: 'poly Déf. 4.45 p.116',
  generer(r) {
    let t: number
    do t = pickAngle(r, false) + 24 * r.pick([0, 0, 1, -1])
    while (tanT(t) === null)
    const v = tanT(t)!
    verifier(proche(v.valeur(), Math.tan((t * Math.PI) / 12)), 'tan')
    const red = reduction(t)
    return {
      type: 'num',
      enonce: T`Donner la valeur exacte de $\tan\left(${angleTex(t)}\right)$.`,
      reponse: v.ascii(),
      explication: [
        T`[cours] **Déf. 4.45** : $\cours{\tan x=\frac{\sin x}{\cos x}}$ (si $\cos x\neq0$). La tangente est **$\pi$-périodique** et **impaire**.`,
        T`[calcul] Mesure principale $${angleTex(red.u)}$ :`,
        T`$$\tan\left(${angleTex(t)}\right)=\frac{${sinT(t).tex()}}{${cosT(t).tex()}}=\cle{${v.tex()}}$$`,
        T`[resultat] $\ok{${v.tex()}}$`,
        T`[verif] Signe : ${v.valeur() > 0 ? 'cos et sin de même signe (quadrants 1 ou 3), donc tan positive' : v.valeur() < 0 ? 'cos et sin de signes opposés (quadrants 2 ou 4), donc tan négative' : 'sinus nul, donc tangente nulle'} ✓`,
        T`[piege] $\tan\frac\pi6=\frac{1}{\sqrt3}=\frac{\sqrt3}{3}$ et $\tan\frac\pi3=\sqrt3$ : ne pas les échanger.`,
      ].join('\n'),
    }
  },
}

interface Fn {
  tex: string
  ascii: string
  d: string
  dTex: string
  f: (x: number) => number
  ex: string
}
function fonctionADeriver(r: Rng, x: string): Fn {
  const a = r.pick([2, 3, 4, 5, -2, -3])
  const b = r.pick([0, 1, 2, -1, 3])
  const A = r.pick([1, 2, 3, -1])
  const inner = b === 0 ? `${a}${x}` : `${a}${x}${b > 0 ? '+' : '-'}${Math.abs(b)}`
  const coef = (k: number) => (k === 1 ? '' : k === -1 ? '-' : String(k))
  const cas: Fn[] = [
    {
      tex: `${coef(A)}\\sin(${inner})`,
      ascii: `${A}*sin(${inner})`,
      d: `${A * a}*cos(${inner})`,
      dTex: `${coef(A * a)}\\cos(${inner})`,
      f: (t) => A * Math.sin(a * t + b),
      ex: T`$(\sin u)'=u'\cos u$ avec $u=${inner}$, $u'=${a}$.`,
    },
    {
      tex: `${coef(A)}\\cos(${inner})`,
      ascii: `${A}*cos(${inner})`,
      d: `${-A * a}*sin(${inner})`,
      dTex: `${coef(-A * a)}\\sin(${inner})`,
      f: (t) => A * Math.cos(a * t + b),
      ex: T`$(\cos u)'=-u'\sin u$ avec $u=${inner}$, $u'=${a}$ : attention au **signe moins**.`,
    },
    {
      tex: `\\sin^2 ${x}`,
      ascii: `sin(${x})^2`,
      d: `2*sin(${x})*cos(${x})`,
      dTex: `2\\sin ${x}\\cos ${x}`,
      f: (t) => Math.sin(t) ** 2,
      ex: T`$(u^2)'=2uu'$ avec $u=\sin ${x}$. On peut aussi écrire le résultat $\sin(2${x})$.`,
    },
    {
      tex: `\\cos^2 ${x}`,
      ascii: `cos(${x})^2`,
      d: `-2*sin(${x})*cos(${x})`,
      dTex: `-2\\sin ${x}\\cos ${x}`,
      f: (t) => Math.cos(t) ** 2,
      ex: T`$(u^2)'=2uu'$ avec $u=\cos ${x}$, $u'=-\sin ${x}$. On peut aussi écrire le résultat $-\sin(2${x})$.`,
    },
    {
      tex: `\\tan ${x}`,
      ascii: `tan(${x})`,
      d: `1+tan(${x})^2`,
      dTex: `1+\\tan^2 ${x}=\\frac{1}{\\cos^2 ${x}}`,
      f: (t) => Math.tan(t),
      ex: T`Poly p.117 : $\tan'=1+\tan^2=\frac{1}{\cos^2}$ (dérivée du quotient $\frac{\sin}{\cos}$).`,
    },
    {
      tex: `${x}\\sin ${x}`,
      ascii: `${x}*sin(${x})`,
      d: `sin(${x})+${x}*cos(${x})`,
      dTex: `\\sin ${x}+${x}\\cos ${x}`,
      f: (t) => t * Math.sin(t),
      ex: T`Produit : $(uv)'=u'v+uv'$ avec $u=${x}$, $v=\sin ${x}$.`,
    },
  ]
  return r.pick(cas)
}

const derivee: Gabarit = {
  id: 'tr-derivee',
  chapitre: 'trigo',
  section: 'trigo.s7',
  niveau: 1,
  titre: 'Dériver une fonction trigonométrique',
  source: 'poly Prop. 4.44',
  refCours: 'poly Prop. 4.44 p.115 et p.117',
  indispensable: true,
  generer(r) {
    const x = r.pick(['x', 't'])
    const fn = fonctionADeriver(r, x)
    // contrôle numérique de la dérivée annoncée
    const h = 1e-6
    for (const x0 of [0.3, 0.7, 1.1]) {
      const num = (fn.f(x0 + h) - fn.f(x0 - h)) / (2 * h)
      const d = (evaluate(parse(fn.d), { [x]: c(x0) }) as C).re
      verifier(Math.abs(num - d) < 1e-4, 'dérivée')
    }
    return {
      type: 'court',
      enonce: T`Calculer la dérivée de $f(${x})=${fn.tex}$.`,
      reponse: [fn.d],
      variables: [x],
      mode: 'expression',
      format: `f'(${x}) = … (écris seulement l'expression)`,
      explication: [
        T`[cours] **Prop. 4.44** : $\cours{\sin'=\cos}$ et $\cours{\cos'=-\sin}$ ; $\cours{\tan'=1+\tan^2}$ (p.117) ; composée : $\cours{(g\circ u)'=u'\times g'\circ u}$.`,
        T`[methode] ${fn.ex}`,
        T`[resultat] $\ok{f'(${x})=${fn.dTex}}$`,
        T`[piege] Oublier le facteur $u'$ de la composée, ou le **signe moins** de la dérivée du cosinus.`,
      ].join('\n'),
    }
  },
}

const vfFonctions: Gabarit = {
  id: 'tr-vf-fonctions',
  chapitre: 'trigo',
  section: 'trigo.s7',
  niveau: 1,
  titre: 'Vrai / faux : propriétés de sin, cos, tan',
  source: 'poly p.116 (Tests)',
  refCours: 'poly Prop. 4.44 p.115, Déf. 4.45 p.116',
  indispensable: true,
  generer(r) {
    const x = r.pick(['x', 't', '\\theta'])
    const pioche: { e: string; rep: boolean; ex: string[] }[] = [
      { e: T`La fonction $\cos$ est impaire.`, rep: false, ex: [T`[cours] Prop. 4.44 : $\cours{\cos(-${x})=\cos ${x}}$ : cos est **paire** (miroir horizontal, l'abscisse ne change pas).`, T`[resultat] $\ok{\text{FAUX}}$ : c'est $\sin$ qui est impaire.`] },
      { e: T`La fonction $\tan$ est $\pi$-périodique.`, rep: true, ex: [T`[cours] $\tan(${x}+\pi)=\dfrac{\sin(${x}+\pi)}{\cos(${x}+\pi)}=\dfrac{-\sin ${x}}{-\cos ${x}}=\tan ${x}$ (Prop. 4.44 et Test p.116).`, T`[resultat] $\ok{\text{VRAI}}$ : sa période est $\pi$, pas seulement $2\pi$.`] },
      { e: T`Pour tout réel $${x}$ : $\sin'(${x})=-\cos(${x})$.`, rep: false, ex: [T`[cours] Prop. 4.44 : $\cours{\sin'=\cos}$ et $\cours{\cos'=-\sin}$.`, T`[resultat] $\ok{\text{FAUX}}$ : le signe moins est pour la dérivée de $\cos$.`] },
      { e: T`La fonction $\tan$ est définie sur $\mathbb R$.`, rep: false, ex: [T`[cours] Déf. 4.45 : $\tan=\frac{\sin}{\cos}$ n'est définie que si $\cos ${x}\neq0$, soit $${x}\neq\frac\pi2+k\pi$.`, T`[resultat] $\ok{\text{FAUX}}$ : il y a une asymptote verticale en chaque $\frac\pi2+k\pi$.`] },
      { e: T`$\cos ${x}=0\iff ${x}=\frac\pi2+2k\pi,\ k\in\mathbb Z$.`, rep: false, ex: [T`[cours] Sur le cercle, l'abscisse est nulle en **deux** points : $\frac\pi2$ (en haut) **et** $-\frac\pi2$ (en bas).`, T`[resultat] $\ok{\text{FAUX}}$ : $\cos ${x}=0\iff ${x}=\frac\pi2+k\pi$ (période $\pi$ ici, pas $2\pi$).`] },
      { e: T`$\sin ${x}=0\iff ${x}=k\pi,\ k\in\mathbb Z$.`, rep: true, ex: [T`[cours] L'ordonnée est nulle aux points $(1,0)$ et $(-1,0)$, d'angles $0$ et $\pi$ (à $2\pi$ près).`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`Pour tout réel $${x}$ : $\sin(2${x})=2\sin ${x}$.`, rep: false, ex: [T`[cours] Duplication : $\cours{\sin2x=2\sin x\cos x}$.`, T`[calcul] Avec $${x}=\frac\pi2$ : $\sin\pi=0$ mais $2\sin\frac\pi2=2$.`, T`[resultat] $\ok{\text{FAUX}}$`] },
      { e: T`La fonction $\sin$ atteint son minimum $-1$ exactement aux points $-\frac\pi2+2k\pi$.`, rep: true, ex: [T`[cours] $\sin ${x}=-1$ : point le plus bas du cercle, $(0,-1)$, d'angle $-\frac\pi2$ (Test p.116).`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`Pour tout $${x}$ où elle est définie : $\tan'(${x})=\dfrac{1}{\cos^2 ${x}}$.`, rep: true, ex: [T`[cours] Poly p.117 : $\cours{\tan'=\frac{1}{\cos^2}=1+\tan^2}$.`, T`[calcul] $\left(\frac{\sin}{\cos}\right)'=\frac{\cos\cdot\cos-\sin\cdot(-\sin)}{\cos^2}=\frac{\cos^2+\sin^2}{\cos^2}=\frac{1}{\cos^2}$`, T`[resultat] $\ok{\text{VRAI}}$`] },
      { e: T`Pour tout réel $${x}$ : $\cos(${x}+\pi)=\cos ${x}$.`, rep: false, ex: [T`[cours] Prop. 4.44 : $\cours{\cos(x+\pi)=-\cos x}$ (demi-tour : le point passe de l'autre côté).`, T`[resultat] $\ok{\text{FAUX}}$ : la période de $\cos$ est $2\pi$, pas $\pi$.`] },
    ]
    const c = r.pick(pioche)
    return { type: 'vf', enonce: c.e, reponse: c.rep, explication: c.ex.join('\n') }
  },
}

// =====================================================================================
// s8 — Fonctions réciproques
// =====================================================================================

const reciproques: Gabarit = {
  id: 'tr-arc-valeurs',
  chapitre: 'trigo',
  section: 'trigo.s8',
  niveau: 2,
  titre: 'arcsin, arccos, arctan : valeurs (et pièges)',
  source: 'poly §4.5.7',
  refCours: 'poly Prop. 4.46–4.48 p.119–120',
  generer(r) {
    const f = r.pick(['arcsin', 'arccos', 'arctan'] as const)
    const piege = r.bool(0.35)
    const DOM = {
      arcsin: { ts: [-6, -4, -3, -2, 0, 2, 3, 4, 6], I: T`\left[-\frac\pi2,\frac\pi2\right]`, base: sinT, nom: 'sin', mono: 'croissante' },
      arccos: { ts: [0, 2, 3, 4, 6, 8, 9, 10, 12], I: T`[0,\pi]`, base: cosT, nom: 'cos', mono: 'décroissante' },
      arctan: { ts: [-4, -3, -2, 0, 2, 3, 4], I: T`\left]-\frac\pi2,\frac\pi2\right[`, base: (t: number) => tanT(t)!, nom: 'tan', mono: 'croissante' },
    }[f]
    const sol = r.pick(DOM.ts)
    const valeur = DOM.base(sol)
    if (piege) {
      // f(g(t)) avec t hors de l'intervalle : la réponse n'est pas t
      const candidats = REMARQUABLES.filter((t) => !DOM.ts.includes(t) && proche(DOM.base(t)?.valeur() ?? NaN, valeur.valeur()))
      if (candidats.length) {
        const t = r.pick(candidats)
        return {
          type: 'num',
          enonce: T`Calculer $${'\\' + f}\left(${'\\' + DOM.nom}\left(${angleTex(t)}\right)\right)$.`,
          reponse: angleAscii(sol),
          explication: [
            T`[cours] $${'\\' + f}$ est à valeurs dans $\cours{${DOM.I}}$ : $${'\\' + f}(y)$ est **l'unique** angle de cet intervalle dont le ${DOM.nom} vaut $y$.`,
            T`[calcul] $${'\\' + DOM.nom}\left(${angleTex(t)}\right)=\cle{${valeur.tex()}}$, et l'angle de $${DOM.I}$ ayant ce ${DOM.nom} est $${angleTex(sol)}$.`,
            T`[resultat] $\ok{${angleTex(sol)}}$`,
            T`[piege] Répondre $\ko{${angleTex(t)}}$ : on a $${'\\' + f}(${'\\' + DOM.nom}\,x)=x$ **seulement** si $x\in ${DOM.I}$, et ici $${angleTex(t)}\notin${DOM.I}$.`,
          ].join('\n'),
        }
      }
    }
    verifier(proche(valeur.valeur(), (f === 'arcsin' ? Math.sin : f === 'arccos' ? Math.cos : Math.tan)((sol * Math.PI) / 12)), 'arc')
    return {
      type: 'num',
      enonce: T`Calculer $${'\\' + f}\left(${valeur.tex()}\right)$.`,
      reponse: angleAscii(sol),
      explication: [
        T`[cours] **Poly §4.5.7** : $${'\\' + f}(y)$ est l'**unique** $\theta\in\cours{${DOM.I}}$ tel que $${'\\' + DOM.nom}\theta=y$. La fonction $${'\\' + f}$ est continue et strictement ${DOM.mono}.`,
        T`[calcul] On cherche dans $${DOM.I}$ l'angle de ${DOM.nom} $${valeur.tex()}$ : c'est $\cle{${angleTex(sol)}}$.`,
        T`[resultat] $\ok{${'\\' + f}\left(${valeur.tex()}\right)=${angleTex(sol)}}$`,
        f === 'arccos'
          ? T`[piege] arccos est à valeurs dans $[0,\pi]$ : un résultat **négatif** est forcément faux.`
          : T`[piege] ${f} est à valeurs dans $${DOM.I}$ : par exemple, $\frac{5\pi}6$ n'est **jamais** une valeur de ${f}.`,
      ].join('\n'),
    }
  },
}

const reciproquesQcm: Gabarit = {
  id: 'tr-arc-qcm',
  chapitre: 'trigo',
  section: 'trigo.s8',
  niveau: 2,
  titre: 'Réciproques : domaines, dérivées',
  source: 'poly §4.5.7',
  refCours: 'poly Prop. 4.46–4.48 p.119–120',
  generer(r) {
    const pioche: { q: string; bon: string; faux: string[]; ex: string }[] = [
      { q: T`\arctan'(x)=`, bon: T`\dfrac{1}{1+x^2}`, faux: [T`\dfrac{1}{\sqrt{1-x^2}}`, T`1+\tan^2 x`, T`\dfrac{1}{\cos^2 x}`], ex: T`Prop. 4.46 : $\cours{\arctan'(x)=\frac{1}{1+x^2}}$ pour tout $x\in\mathbb R$.` },
      { q: T`\arcsin'(x)=`, bon: T`\dfrac{1}{\sqrt{1-x^2}}`, faux: [T`-\dfrac{1}{\sqrt{1-x^2}}`, T`\dfrac{1}{1+x^2}`, T`\cos x`], ex: T`Prop. 4.47 : $\cours{\arcsin'(x)=\frac{1}{\sqrt{1-x^2}}}$ sur $]-1,1[$.` },
      { q: T`\arccos'(x)=`, bon: T`-\dfrac{1}{\sqrt{1-x^2}}`, faux: [T`\dfrac{1}{\sqrt{1-x^2}}`, T`-\sin x`, T`-\dfrac{1}{1+x^2}`], ex: T`Prop. 4.48 : $\cours{\arccos'(x)=-\frac{1}{\sqrt{1-x^2}}}$ : arccos est **décroissante**.` },
      { q: T`\text{L'ensemble d'arrivée de }\arccos\text{ est}`, bon: T`[0,\pi]`, faux: [T`\left[-\frac\pi2,\frac\pi2\right]`, T`[-1,1]`, T`\mathbb R`], ex: T`Prop. 4.48 : $\cours{\arccos:[-1,1]\to[0,\pi]}$ (là où cos est strictement monotone).` },
      { q: T`\text{L'ensemble de définition de }\arctan\text{ est}`, bon: T`\mathbb R`, faux: [T`[-1,1]`, T`\left]-\frac\pi2,\frac\pi2\right[`, T`\mathbb R\setminus\{\frac\pi2+k\pi\}`], ex: T`Prop. 4.46 : $\cours{\arctan:\mathbb R\to\left]-\frac\pi2,\frac\pi2\right[}$ (tan prend toutes les valeurs réelles).` },
      { q: T`\arcsin(x)+\arccos(x)=`, bon: T`\dfrac{\pi}{2}`, faux: [T`0`, T`\pi`, T`1`], ex: T`Figure 4.14 : la dérivée de $\arcsin+\arccos$ est nulle, donc la somme est constante. En $x=0$ : $0+\frac\pi2$.` },
    ]
    const c = r.pick(pioche)
    const choix = r.shuffle([c.bon, ...c.faux].map((x) => `$${x}$`))
    return {
      type: 'qcm',
      enonce: T`$${c.q}$`,
      choix,
      reponse: choix.indexOf(`$${c.bon}$`),
      explication: [T`[cours] ${c.ex}`, T`[resultat] $\ok{${c.q}\ ${c.bon}}$`, T`[piege] Confondre les dérivées de arcsin et arctan, ou le domaine (entrée) avec l'ensemble d'arrivée (sortie).`].join('\n'),
    }
  },
}

// =====================================================================================
// s9 — Exponentielle complexe, Euler, Moivre
// =====================================================================================

const eulerQcm: Gabarit = {
  id: 'tr-euler',
  chapitre: 'trigo',
  section: 'trigo.s9',
  niveau: 1,
  titre: 'Formules d’Euler et e^{iθ}',
  source: 'TD2 ex 13',
  refCours: 'poly §2.1.5 p.37–38 (Énoncés indispensables 14–16)',
  generer(r) {
    const th = r.pick(['\\theta', 'x', 't'])
    const pioche: { q: string; bon: string; faux: string[]; ex: string; ind: number | true }[] = [
      { q: T`e^{i${th}}=`, bon: T`\cos ${th}+i\sin ${th}`, faux: [T`\sin ${th}+i\cos ${th}`, T`\cos ${th}-i\sin ${th}`, T`e^{${th}}(\cos ${th}+i\sin ${th})`], ex: T`**Énoncé indispensable 14** : $\cours{e^{i\theta}=\cos\theta+i\sin\theta}$ (le point du cercle d'angle $\theta$).`, ind: 14 },
      { q: T`\cos ${th}=`, bon: T`\dfrac{e^{i${th}}+e^{-i${th}}}{2}`, faux: [T`\dfrac{e^{i${th}}-e^{-i${th}}}{2}`, T`\dfrac{e^{i${th}}+e^{-i${th}}}{2i}`, T`\dfrac{e^{i${th}}-e^{-i${th}}}{2i}`], ex: T`**Énoncé indispensable 15** (Euler) : $\cours{\cos\theta=\frac{e^{i\theta}+e^{-i\theta}}2}$ : les parties imaginaires s'annulent.`, ind: 15 },
      { q: T`\sin ${th}=`, bon: T`\dfrac{e^{i${th}}-e^{-i${th}}}{2i}`, faux: [T`\dfrac{e^{i${th}}-e^{-i${th}}}{2}`, T`\dfrac{e^{i${th}}+e^{-i${th}}}{2i}`, T`\dfrac{e^{-i${th}}-e^{i${th}}}{2i}`], ex: T`**Énoncé indispensable 15** (Euler) : $\cours{\sin\theta=\frac{e^{i\theta}-e^{-i\theta}}{2i}}$ : $e^{i\theta}-e^{-i\theta}=2i\sin\theta$.`, ind: 15 },
      { q: T`e^{i\pi}=`, bon: T`-1`, faux: [T`1`, T`i`, T`0`], ex: T`$e^{i\pi}=\cos\pi+i\sin\pi=-1$ : c'est l'identité d'Euler $e^{i\pi}+1=0$.`, ind: 14 },
      { q: T`\left|e^{i${th}}\right|=`, bon: T`1`, faux: [T`${th}`, T`e^{${th}}`, T`\cos ${th}`], ex: T`$|e^{i\theta}|^2=\cos^2\theta+\sin^2\theta=1$ : $e^{i\theta}$ est **sur le cercle unité**.`, ind: 14 },
      { q: T`\overline{e^{i${th}}}=`, bon: T`e^{-i${th}}`, faux: [T`-e^{i${th}}`, T`e^{i${th}}`, T`\dfrac{1}{e^{-i${th}}}`], ex: T`Le conjugué fait le miroir horizontal : $\overline{\cos\theta+i\sin\theta}=\cos\theta-i\sin\theta=\cos(-\theta)+i\sin(-\theta)$.`, ind: 14 },
      { q: T`e^{ia}\,e^{ib}=`, bon: T`e^{i(a+b)}`, faux: [T`e^{iab}`, T`e^{i(a-b)}`, T`e^{-ab}`], ex: T`Poly (2.8) p.39 : $\cours{e^{ia}e^{ib}=e^{i(a+b)}}$ : les **angles s'additionnent**, c'est exactement les formules d'addition.`, ind: true },
      { q: T`e^{ia}=e^{ib}\iff`, bon: T`a=b+2k\pi,\ k\in\mathbb Z`, faux: [T`a=b`, T`a=b+k\pi,\ k\in\mathbb Z`, T`a=-b`], ex: T`**Énoncé indispensable 16** : $\cours{e^{i\alpha}=e^{i\beta}\iff\alpha=\beta+2k\pi}$ (même point du cercle).`, ind: 16 },
    ]
    const c = r.pick(pioche)
    const choix = r.shuffle([c.bon, ...c.faux].map((x) => `$${x}$`))
    return {
      type: 'qcm',
      enonce: T`$${c.q}$`,
      choix,
      reponse: choix.indexOf(`$${c.bon}$`),
      explication: [T`[cours] ${c.ex}`, T`[resultat] $\ok{${c.q}\ ${c.bon}}$`, T`[verif] Tester avec $\theta=0$ : $e^{0}=1=\cos0+i\sin0$ ✓`].join('\n'),
    }
  },
}

const BASES_Z = [
  { tex: '1+i', R: [Ex.rac(2)], t: 3 },
  { tex: '1-i', R: [Ex.rac(2)], t: -3 },
  { tex: '-1+i', R: [Ex.rac(2)], t: 9 },
  { tex: '\\sqrt3+i', R: [Ex.entier(2)], t: 2 },
  { tex: '1+i\\sqrt3', R: [Ex.entier(2)], t: 4 },
  { tex: '-\\sqrt3+i', R: [Ex.entier(2)], t: 10 },
  { tex: '1-i\\sqrt3', R: [Ex.entier(2)], t: -4 },
  { tex: 'i', R: [Ex.entier(1)], t: 6 },
]

const moivre: Gabarit = {
  id: 'tr-moivre',
  chapitre: 'trigo',
  section: 'trigo.s9',
  niveau: 2,
  titre: 'Puissance d’un complexe (Moivre)',
  source: 'TD2 ex 1, 5 · cours perso trigo, étage 6',
  refCours: 'poly §2.1.5 p.39 et §2.1.6',
  generer(r) {
    const z = r.pick(BASES_Z)
    const n = r.int(2, z.tex === 'i' ? 11 : 9)
    const Rz = z.R[0]
    let Rn = Ex.entier(1)
    for (let k = 0; k < n; k++) Rn = Rn.mul(Rz)
    const ang = n * z.t
    const p = principal(ang)
    const re = Rn.mul(cosT(ang))
    const im = Rn.mul(sinT(ang))
    // vérification par calcul direct en complexes flottants
    let wr = 1
    let wi = 0
    const zr = Rz.valeur() * Math.cos((z.t * Math.PI) / 12)
    const zi = Rz.valeur() * Math.sin((z.t * Math.PI) / 12)
    for (let k = 0; k < n; k++) [wr, wi] = [wr * zr - wi * zi, wr * zi + wi * zr]
    verifier(proche(re.valeur(), wr) && proche(im.valeur(), wi), 'Moivre')
    return {
      type: 'num',
      enonce: T`Calculer $\left(${z.tex}\right)^{${n}}$ sous forme algébrique $a+ib$.`,
      reponse: asciiC(re, im),
      indice: T`Passe en forme exponentielle, élève à la puissance, réduis l'angle.`,
      explication: [
        T`[cours] **Moivre** : $\cours{(Re^{i\theta})^n=R^n e^{in\theta}}$ : le module passe à la puissance $n$ et l'angle est **multiplié** par $n$ (conséquence de $e^{ia}e^{ib}=e^{i(a+b)}$).`,
        T`[calcul] Forme exponentielle (méthode des 4 pas) : $${z.tex}=${Rz.tex()}\,e^{${expo(z.t)}}$`,
        T`$$\left(${z.tex}\right)^{${n}}=\left(${Rz.tex()}\right)^{${n}}e^{i\,${n}\times\left(${angleTex(z.t).replace('\\dfrac', '\\frac')}\right)}=${Rn.tex()}\,e^{${expo(ang)}}$$`,
        ang !== p ? T`Réduction de l'angle : $${angleTex(ang)}\equiv\cle{${angleTex(p)}}\ [2\pi]$` : '',
        T`$$=${Rn.tex()}\left(\cos\left(${angleTex(p)}\right)+i\sin\left(${angleTex(p)}\right)\right)$$`,
        T`[resultat] $\ok{\left(${z.tex}\right)^{${n}}=${texC(re, im)}}$`,
        T`[piege] Oublier d'élever **le module** : $(${Rz.tex()})^{${n}}=${Rn.tex()}$, pas $${Rz.tex()}$.`,
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
}

const expValeur: Gabarit = {
  id: 'tr-exp-valeur',
  chapitre: 'trigo',
  section: 'trigo.s9',
  niveau: 1,
  titre: 'e^{iθ} sous forme algébrique',
  source: 'TD2 ex 1',
  refCours: 'poly §2.1.5 p.37 (Énoncé indispensable 14)',
  indispensable: 14,
  generer(r) {
    const t = pickAngle(r, false) + 24 * r.pick([0, 0, 1, -1])
    const R = r.pick([1, 1, 2, 4])
    const re = cosT(t).scale(R)
    const im = sinT(t).scale(R)
    const Rtex = R === 1 ? '' : String(R)
    return {
      type: 'num',
      enonce: T`Écrire $${Rtex}e^{${expo(t)}}$ sous forme algébrique $a+ib$.`,
      reponse: asciiC(re, im),
      explication: [
        T`[cours] **Énoncé indispensable 14** : $\cours{e^{i\theta}=\cos\theta+i\sin\theta}$.`,
        T`[calcul] $$${Rtex}e^{${expo(t)}}=${Rtex}\left(\cos\left(${angleTex(t)}\right)+i\sin\left(${angleTex(t)}\right)\right)=${Rtex}\left(${cosT(t).tex()}+i\cdot${sinT(t).valeur() < 0 ? `\\left(${sinT(t).tex()}\\right)` : sinT(t).tex()}\right)$$`,
        T`[resultat] $\ok{${texC(re, im)}}$`,
        T`[verif] Le module vaut ${R === 1 ? '$1$' : `$${R}$`} : $|a+ib|^2=${R * R}$ ✓`,
      ].join('\n'),
    }
  },
}

export const GABARITS_TRIGO: Gabarit[] = [
  conversion,
  mesurePrincipale,
  longueurArc,
  valeurRemarquable,
  anglesAssocies,
  pythagoreQuadrant,
  equation,
  anglePoint,
  addition,
  duplication,
  formulesQcm,
  tangente,
  derivee,
  vfFonctions,
  reciproques,
  reciproquesQcm,
  eulerQcm,
  moivre,
  expValeur,
]
