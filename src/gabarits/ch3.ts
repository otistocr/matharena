/**
 * Chapitre 3 — Logique, ensembles et raisonnements : gabarits de questions à variantes.
 * Inspirés de la feuille de TD 3 (2026) et du poly §3.1–3.3 (p.57–90).
 */
import type { Gabarit } from './types'
import type { Niveau } from '../data/schema'
import { Frac, Rng, lin, linAscii, verifier } from './outils'

const T = String.raw
const X2 = ['x^2', 'x', '']
const LETTRES = [
  ['P', 'Q', 'R'],
  ['A', 'B', 'C'],
  ['E_1', 'E_2', 'E_3'],
  ['p', 'q', 'r'],
] as const
const VF = (b: boolean) => (b ? 'vrai' : 'faux')
const OKVF = (b: boolean) => T`$\ok{\text{${b ? 'VRAI' : 'FAUX'}}}$`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** x − p lisible : p = 0 → x, p = −3 → x+3. */
const xm = (p: number) => (p === 0 ? 'x' : p > 0 ? `x-${p}` : `x+${-p}`)
/** Facteur (x − p) : p = 0 → x. */
const fx = (p: number) => (p === 0 ? 'x' : `(${xm(p)})`)
const ens = (xs: number[]) => (xs.length ? T`\{${xs.join(',')}\}` : T`\varnothing`)

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
  chapitre: 'ch3',
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
// §3.1 Logique classique
// =====================================================================================

type Op = 'et' | 'ou' | 'imp' | 'equiv' | 'xor'
const OPS: Record<Op, { tex: string; f: (a: boolean, b: boolean) => boolean; regle: string }> = {
  et: { tex: T` \land `, f: (a, b) => a && b, regle: T`$\cours{A\land B}$ (« et ») est vrai seulement si **les deux** sont vrais` },
  ou: { tex: T` \lor `, f: (a, b) => a || b, regle: T`$\cours{A\lor B}$ (« ou » inclusif) est faux seulement si **les deux** sont faux` },
  imp: { tex: T` \Rightarrow `, f: (a, b) => !a || b, regle: T`$\cours{A\Rightarrow B}$ n'est faux que dans **un seul cas** : $A$ vrai et $B$ faux` },
  equiv: { tex: T` \Leftrightarrow `, f: (a, b) => a === b, regle: T`$\cours{A\Leftrightarrow B}$ est vrai quand $A$ et $B$ ont la **même** valeur de vérité` },
  xor: { tex: T`\ \mathrm{XOR}\ `, f: (a, b) => a !== b, regle: T`$\cours{A\ \mathrm{XOR}\ B}$ est vrai quand **un seul** des deux est vrai (TD3 ex 2)` },
}
const OPK = ['et', 'ou', 'imp', 'imp', 'equiv', 'xor'] as const

const tableVerite: Gabarit = {
  id: 'g3-table',
  chapitre: 'ch3',
  section: 'ch3.s1',
  niveau: 1,
  titre: 'Valeur de vérité d’un énoncé composé',
  source: 'TD3 ex 1 et 2',
  refCours: 'poly §3.1.2 p.58 (tables de vérité)',
  generer(r) {
    const L = r.pick(LETTRES)
    const v = [r.bool(), r.bool(), r.bool()]
    const lit = (i: number) => {
      const neg = r.bool(0.3)
      return { tex: neg ? T`\lnot ${L[i]}` : L[i], val: neg ? !v[i] : v[i], neg, i }
    }
    const [a, b, c] = [lit(0), lit(1), lit(2)]
    const o1 = r.pick(OPK)
    const o2 = r.pick(OPK)
    const dedans = OPS[o1].f(a.val, b.val)
    const aGauche = r.bool()
    const val = aGauche ? OPS[o2].f(dedans, c.val) : OPS[o2].f(c.val, dedans)
    const dedansTex = `${a.tex}${OPS[o1].tex}${b.tex}`
    const tex = aGauche ? `(${dedansTex})${OPS[o2].tex}${c.tex}` : `${c.tex}${OPS[o2].tex}(${dedansTex})`
    const affirme = r.bool()
    const negs = [a, b, c].filter((l) => l.neg)
    const regles = [...new Set([o1, o2])].map((o) => OPS[o].regle)
    const hypFausse = (o1 === 'imp' && !a.val) || (o2 === 'imp' && (aGauche ? !dedans : !c.val))
    return {
      type: 'vf',
      enonce:
        T`On suppose que $${L[0]}$ est **${VF(v[0])}**, $${L[1]}$ est **${VF(v[1])}** et $${L[2]}$ est **${VF(v[2])}**. Alors l'énoncé $$${tex}$$ est **${VF(affirme)}**.` +
        (o1 === 'xor' || o2 === 'xor' ? T` (XOR : « ou exclusif », vrai quand un seul des deux est vrai.)` : ''),
      reponse: affirme === val,
      indice: 'Commence par la parenthèse, puis applique le connecteur extérieur.',
      explication: [
        T`[cours] ${regles.join(' ; ')}. La négation $\lnot A$ **échange** vrai et faux.`,
        T`[methode] On évalue de l'**intérieur vers l'extérieur** : d'abord les négations, puis la parenthèse, puis le connecteur principal.`,
        ...(negs.length ? [T`[calcul] ${negs.map((l) => T`$${l.tex}$ est ${VF(l.val)}`).join(' ; ')}.`] : []),
        T`${negs.length ? '' : '[calcul] '}Parenthèse : $${dedansTex}$ avec ${VF(a.val)} et ${VF(b.val)} donne $\cle{\text{${VF(dedans)}}}$.`,
        T`Connecteur principal : ${aGauche ? `${VF(dedans)} puis ${VF(c.val)}` : `${VF(c.val)} puis ${VF(dedans)}`} donne $\cle{\text{${VF(val)}}}$.`,
        T`[resultat] L'énoncé est **${VF(val)}** ; l'affirmation « il est ${VF(affirme)} » est donc ${OKVF(affirme === val)}.`,
        ...(hypFausse ? [T`[piege] Une implication dont l'**hypothèse est fausse** est **vraie**, quelle que soit la conclusion.`] : []),
      ].join('\n'),
    }
  },
}

/** Petites formules propositionnelles, pour vérifier les équivalences par table de vérité. */
type Fm = { t: (n: readonly string[]) => string; f: (v: boolean[]) => boolean; atome: boolean }
const V3 = (i: number): Fm => ({ t: (n) => n[i], f: (v) => v[i], atome: true })
const grp = (a: Fm, n: readonly string[]) => (a.atome ? a.t(n) : `(${a.t(n)})`)
const non = (a: Fm): Fm => ({ t: (n) => T`\lnot ${grp(a, n)}`, f: (v) => !a.f(v), atome: true })
const bin = (op: Op) => (a: Fm, b: Fm): Fm => ({ t: (n) => `${grp(a, n)}${OPS[op].tex}${grp(b, n)}`, f: (v) => OPS[op].f(a.f(v), b.f(v)), atome: false })
const [et, ou, imp, equ] = [bin('et'), bin('ou'), bin('imp'), bin('equiv')]
const CAS8 = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [!!(k & 1), !!(k & 2), !!(k & 4)])
const equivalentes = (a: Fm, b: Fm) => CAS8.every((v) => a.f(v) === b.f(v))

const equivalences: Gabarit = {
  id: 'g3-equiv',
  chapitre: 'ch3',
  section: 'ch3.s1',
  niveau: 1,
  titre: 'Reconnaître un énoncé équivalent',
  source: 'TD3 ex 1 et 3',
  refCours: 'poly §3.1.3–3.1.4 p.63–65 (Prop. 3.7, Cor. 3.8, Prop. 3.10)',
  generer(r) {
    const [P, Q, R] = [V3(0), V3(1), V3(2)]
    const items: { cible: Fm; bon: Fm; leurres: Fm[]; cours: string }[] = [
      { cible: imp(P, Q), bon: ou(non(P), Q), leurres: [ou(P, non(Q)), et(non(P), Q), et(P, non(Q))], cours: T`**Corollaire 3.8** (p.64) : $\cours{(A\Rightarrow B)\Leftrightarrow(\lnot A\lor B)}$.` },
      { cible: non(imp(P, Q)), bon: et(P, non(Q)), leurres: [imp(non(P), non(Q)), et(non(P), Q), imp(P, non(Q))], cours: T`**Prop. 3.7 iii)** (p.64) : $\cours{\lnot(A\Rightarrow B)\Leftrightarrow A\land\lnot B}$. La négation d'une implication n'est **pas** une implication.` },
      { cible: non(et(P, Q)), bon: ou(non(P), non(Q)), leurres: [et(non(P), non(Q)), ou(P, Q), ou(non(P), Q)], cours: T`**Loi de De Morgan** (Prop. 3.7 i, p.64) : $\cours{\lnot(A\land B)\Leftrightarrow\lnot A\lor\lnot B}$.` },
      { cible: non(ou(P, Q)), bon: et(non(P), non(Q)), leurres: [ou(non(P), non(Q)), et(P, Q), et(non(P), Q)], cours: T`**Loi de De Morgan** (Prop. 3.7 ii, p.64) : $\cours{\lnot(A\lor B)\Leftrightarrow\lnot A\land\lnot B}$.` },
      { cible: imp(P, Q), bon: imp(non(Q), non(P)), leurres: [imp(Q, P), imp(non(P), non(Q)), et(P, non(Q))], cours: T`**Contraposition** (Prop. 3.10, p.65) : $\cours{(A\Rightarrow B)\Leftrightarrow(\lnot B\Rightarrow\lnot A)}$. La réciproque $B\Rightarrow A$, elle, n'est pas équivalente.` },
      { cible: equ(P, Q), bon: et(imp(P, Q), imp(Q, P)), leurres: [ou(imp(P, Q), imp(Q, P)), et(P, Q), et(non(P), non(Q))], cours: T`Une équivalence est une **double implication** : $\cours{(A\Leftrightarrow B)\Leftrightarrow\big((A\Rightarrow B)\land(B\Rightarrow A)\big)}$ (poly §3.1.2).` },
      { cible: non(equ(P, Q)), bon: et(ou(P, Q), non(et(P, Q))), leurres: [ou(P, Q), et(non(P), non(Q)), ou(et(P, Q), et(non(P), non(Q)))], cours: T`$\lnot(A\Leftrightarrow B)$ est vrai quand **un seul** des deux est vrai : c'est le XOR du TD3 ex 2, soit $\cours{(A\lor B)\land\lnot(A\land B)}$.` },
      { cible: ou(P, et(Q, R)), bon: et(ou(P, Q), ou(P, R)), leurres: [et(ou(P, Q), R), ou(et(P, Q), et(P, R)), et(P, ou(Q, R))], cours: T`**Distributivité** (TD3 ex 1.2) : $\cours{A\lor(B\land C)\Leftrightarrow(A\lor B)\land(A\lor C)}$.` },
      { cible: et(P, ou(Q, R)), bon: ou(et(P, Q), et(P, R)), leurres: [ou(et(P, Q), R), et(ou(P, Q), ou(P, R)), ou(P, et(Q, R))], cours: T`**Distributivité** : $\cours{A\land(B\lor C)\Leftrightarrow(A\land B)\lor(A\land C)}$.` },
      { cible: ou(P, Q), bon: non(et(non(P), non(Q))), leurres: [non(ou(non(P), non(Q))), et(non(P), non(Q)), non(et(P, Q))], cours: T`De Morgan + double négation (TD3 ex 3) : $\cours{A\lor B\Leftrightarrow\lnot(\lnot A\land\lnot B)}$.` },
    ]
    const it = r.pick(items)
    const L = r.pick(LETTRES)
    verifier(equivalentes(it.cible, it.bon), `équivalence ${it.cible.t(L)}`)
    it.leurres.forEach((l) => verifier(!equivalentes(it.cible, l), `leurre équivalent ${l.t(L)}`))
    const contre = (l: Fm) => CAS8.find((v) => l.f(v) !== it.cible.f(v))!
    const { choix, reponse } = choixQcm(r, `$${it.bon.t(L)}$`, it.leurres.map((l) => `$${l.t(L)}$`))
    const l0 = it.leurres[0]
    const cx = contre(l0)
    const trois = CAS8.some((v) => it.cible.f(v) !== it.cible.f([v[0], v[1], !v[2]]))
    return {
      type: 'qcm',
      enonce: r.bool()
        ? T`Lequel de ces énoncés est **logiquement équivalent** à $$${it.cible.t(L)}\ ?$$`
        : T`Quels que soient les énoncés ${L.map((x) => `$${x}$`).join(', ')}, l'énoncé $${it.cible.t(L)}$ a toujours la même valeur de vérité que :`,
      choix,
      reponse,
      explication: [
        T`[cours] ${it.cours}`,
        T`[methode] En cas de doute : **table de vérité**. Deux énoncés sont équivalents s'ils ont la même colonne.`,
        T`[resultat] $\ok{${it.bon.t(L)}}$`,
        T`[verif] Le leurre $${l0.t(L)}$ échoue par exemple pour $${L[0]}$ ${VF(cx[0])}, $${L[1]}$ ${VF(cx[1])}${trois ? T`, $${L[2]}$ ${VF(cx[2])}` : ''} : il est ${VF(l0.f(cx))} alors que $${it.cible.t(L)}$ est ${VF(it.cible.f(cx))}.`,
      ].join('\n'),
    }
  },
}

const negContraRecip: Gabarit = {
  id: 'g3-neg-contra',
  chapitre: 'ch3',
  section: 'ch3.s1',
  niveau: 1,
  titre: 'Négation, contraposée, réciproque d’une implication',
  source: 'TD3 ex 5.3 et 6',
  refCours: 'poly §3.1.3–3.1.4 p.63–65',
  generer(r) {
    const a = r.int(2, 6)
    const txt = (s: string) => T`\text{${s}}`
    const pool = [
      { ctx: 'Soient $x,y$ deux réels.', H: 'x=y', C: 'x^2=y^2', nH: T`x\neq y`, nC: T`x^2\neq y^2` },
      { ctx: 'Soient $x,y$ deux réels.', H: 'x<y', C: 'x^2<y^2', nH: T`x\ge y`, nC: T`x^2\ge y^2` },
      { ctx: T`Soient $f:\mathbb R\to\mathbb R$ et $x,y$ deux réels.`, H: T`f(x)\le f(y)`, C: T`x\le y`, nH: 'f(x)>f(y)', nC: 'x>y' },
      { ctx: 'Soit $n$ un entier.', H: `n^2${txt(' pair')}`, C: `n${txt(' pair')}`, nH: `n^2${txt(' impair')}`, nC: `n${txt(' impair')}` },
      { ctx: 'Soit $x$ un réel.', H: `x>${a}`, C: `x^2>${a * a}`, nH: T`x\le ${a}`, nC: T`x^2\le ${a * a}` },
      { ctx: 'Soient $a,b$ deux réels.', H: 'ab=0', C: `a=0${txt(' ou ')}b=0`, nH: T`ab\neq0`, nC: T`a\neq0${txt(' et ')}b\neq0` },
      { ctx: 'Soit $p$ un entier.', H: `p^2${txt(' multiple de 3')}`, C: `p${txt(' multiple de 3')}`, nH: `p^2${txt(' non multiple de 3')}`, nC: `p${txt(' non multiple de 3')}` },
    ]
    const it = r.pick(pool)
    const implique = (h: string, c: string) => T`$(${h})\Rightarrow(${c})$`
    const formes = {
      négation: T`$(${it.H})${txt(' et ')}(${it.nC})$`,
      contraposée: implique(it.nC, it.nH),
      réciproque: implique(it.C, it.H),
      inverse: implique(it.nH, it.nC),
    }
    const quoi = r.pick(['négation', 'contraposée', 'réciproque'] as const)
    const choix = r.shuffle(Object.values(formes))
    return {
      type: 'qcm',
      enonce: T`${it.ctx} Quelle est la **${quoi}** de l'implication $$(${it.H})\Rightarrow(${it.C})\ ?$$`,
      choix,
      reponse: choix.indexOf(formes[quoi]),
      explication: [
        T`[cours] Pour $A\Rightarrow B$ : **négation** $\cours{A\land\lnot B}$ (Prop. 3.7 iii, p.64) ; **contraposée** $\cours{\lnot B\Rightarrow\lnot A}$, équivalente à l'implication (Prop. 3.10, p.65) ; **réciproque** $\cours{B\Rightarrow A}$, qui n'est pas équivalente.`,
        T`[calcul] Ici $A$ est « $${it.H}$ », $B$ est « $${it.C}$ », donc $\lnot A$ est « $${it.nH}$ » et $\lnot B$ est « $${it.nC}$ ».`,
        T`[resultat] La ${quoi} est ${formes[quoi].replace(/^\$/, T`$\ok{`).replace(/\$$/, '}$')}`,
        quoi === 'négation'
          ? T`[piege] La négation d'une implication n'est **pas** une implication : c'est « l'hypothèse est vraie **et** la conclusion est fausse ».`
          : T`[piege] Ne pas confondre **contraposée** (on nie *et* on retourne) et **réciproque** (on retourne seulement). $(${it.nH})\Rightarrow(${it.nC})$ est la contraposée de la réciproque.`,
      ].join('\n'),
    }
  },
}

const enigme: Gabarit = {
  id: 'g3-enigme',
  chapitre: 'ch3',
  section: 'ch3.s1',
  niveau: 2,
  titre: 'Énigme : enchaîner contraposées et déductions',
  source: 'TD3 ex 4',
  refCours: 'poly §3.1.4 p.65 (contraposition) et Prop. 3.19 p.83 (modus ponens)',
  generer(r) {
    const histoires = [
      { siA: 'si je mange', A: 'je mange', nA: 'je ne mange pas', B: 'je bois', nB: 'je ne bois pas', C: 'je parle', nC: 'je ne parle pas', D: "je m'ennuie", nD: "je ne m'ennuie pas" },
      { siA: "s'il pleut", A: 'il pleut', nA: 'il ne pleut pas', B: 'je prends le bus', nB: 'je ne prends pas le bus', C: 'je cours', nC: 'je ne cours pas', D: 'je suis en retard', nD: 'je ne suis pas en retard' },
      { siA: 'si je révise', A: 'je révise', nA: 'je ne révise pas', B: "j'écoute de la musique", nB: "je n'écoute pas de musique", C: 'je dors', nC: 'je ne dors pas', D: 'je suis fatigué', nD: 'je ne suis pas fatigué' },
      { siA: 'si le chat est dehors', A: 'le chat est dehors', nA: "le chat n'est pas dehors", B: 'la porte est ouverte', nB: "la porte n'est pas ouverte", C: 'la lumière est allumée', nC: "la lumière n'est pas allumée", D: 'il fait sombre', nD: 'il ne fait pas sombre' },
    ]
    const h = r.pick(histoires)
    const k = r.int(0, 4)
    const phrase = [h.C, h.A, h.nA, h.nB, h.B][k]
    const rep = [true, false, true, false, false][k]
    const pourquoi = [
      T`« ${cap(h.C)} » est bien une conséquence certaine.`,
      T`On peut au contraire affirmer « ${h.nA} ».`,
      T`« ${cap(h.nA)} » est bien une conséquence certaine.`,
      T`Comme « ${h.A} » est faux, la première phrase ne dit **rien** sur « ${h.B} » : on ne peut ni l'affirmer ni le nier.`,
      T`Comme « ${h.A} » est faux, la première phrase ne dit **rien** sur « ${h.B} » : on ne peut ni l'affirmer ni le nier.`,
    ][k]
    return {
      type: 'vf',
      enonce: T`On suppose vraies les trois phrases suivantes. ${cap(h.siA)}, alors ${h.B} et ${h.nC}. Si ${h.nC}, alors ${h.D}. Or ${h.nD}.` + '\n\n' + T`Peut-on en déduire **avec certitude** : « ${phrase} » ?`,
      reponse: rep,
      indice: 'Pars de la dernière phrase et remonte avec des contraposées.',
      explication: [
        T`[cours] **Contraposition** (Prop. 3.10, p.65) : $\cours{(A\Rightarrow B)\Leftrightarrow(\lnot B\Rightarrow\lnot A)}$. **Modus ponens** (Prop. 3.19, p.83) : si $A\Rightarrow B$ et $A$ sont vrais, alors $B$ est vrai.`,
        T`[methode] Formaliser : $A$ = « ${h.A} », $B$ = « ${h.B} », $C$ = « ${h.C} », $D$ = « ${h.D} ». Les phrases sont $A\Rightarrow(B\land\lnot C)$, $\lnot C\Rightarrow D$ et $\lnot D$.`,
        T`[calcul] La contraposée de $\lnot C\Rightarrow D$ est $\lnot D\Rightarrow C$. Or $\lnot D$ est vrai, donc $\cle{C}$ est vrai : ${h.C}.`,
        T`La contraposée de $A\Rightarrow(B\land\lnot C)$ est $(\lnot B\lor C)\Rightarrow\lnot A$. Comme $C$ est vrai, $\cle{\lnot A}$ est vrai : ${h.nA}.`,
        T`[resultat] ${OKVF(rep)} ${pourquoi}`,
        T`[piege] Quand l'hypothèse d'une implication est fausse, l'implication est vraie **sans rien apprendre** sur sa conclusion.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §3.2.2–3.2.3 Quantificateurs
// =====================================================================================

const negQuantifie: Gabarit = {
  id: 'g3-neg-quant',
  chapitre: 'ch3',
  section: 'ch3.s2',
  niveau: 1,
  titre: 'Nier un énoncé quantifié',
  source: 'TD3 ex 5.1',
  refCours: 'poly §3.2.3 p.70',
  indispensable: 19,
  generer(r) {
    const a = r.int(1, 9)
    const E = [T`\mathbb R`, T`\mathbb Z`, T`\mathbb N`, T`\mathbb Q`]
    const rel = r.pick([
      ['x+y=0', T`x+y\neq0`],
      ['y>x', T`y\le x`],
      ['xy=1', T`xy\neq1`],
      [T`x\le y`, 'x>y'],
      ['|x-y|<1', T`|x-y|\ge1`],
      ['x^2=y', T`x^2\neq y`],
      [`x+y=${a}`, T`x+y\neq${a}`],
      [T`xy\ge${a}`, `xy<${a}`],
    ])
    const [e1, e2] = [r.pick(E), r.pick(E)]
    const [q1, q2] = [r.bool(), r.bool()] // true = ∀
    const Q = (b: boolean) => (b ? T`\forall` : T`\exists`)
    const phrase = (b1: boolean, b2: boolean, p: string) => T`$${Q(b1)} x\in${e1},\ ${Q(b2)} y\in${e2},\ ${p}$`
    const bon = phrase(!q1, !q2, rel[1])
    const leurres = [phrase(q1, q2, rel[1]), phrase(!q1, !q2, rel[0]), phrase(!q1, q2, rel[1]), phrase(q1, !q2, rel[1])]
    const { choix, reponse } = choixQcm(r, bon, leurres)
    return {
      type: 'qcm',
      enonce: T`Quelle est la **négation** de l'énoncé $$${phrase(q1, q2, rel[0]).slice(1, -1)}\ ?$$`,
      choix,
      reponse,
      explication: [
        T`[cours] **Énoncé indispensable 19** (p.70) : $\cours{\lnot(\forall a\in A,\ E(a))=\exists a\in A,\ \lnot E(a)}$ et $\cours{\lnot(\exists a\in A,\ E(a))=\forall a\in A,\ \lnot E(a)}$.`,
        T`[methode] De **gauche à droite**, on échange chaque $\forall$ avec $\exists$ (sans toucher aux ensembles), puis on nie la propriété finale.`,
        T`[calcul] $${Q(q1)}$ devient $${Q(!q1)}$, $${Q(q2)}$ devient $${Q(!q2)}$, et « $${rel[0]}$ » devient « $\cle{${rel[1]}}$ ».`,
        T`[resultat] ${bon.replace(/^\$/, T`$\ok{`).replace(/\$$/, '}$')}`,
        T`[piege] « $x\in${e1}$ » ne devient **pas** « $x\notin${e1}$ » : seuls les quantificateurs et la propriété finale changent.`,
      ].join('\n'),
    }
  },
}

const quantVf = vfPioche(
  { id: 'g3-quant-vf', section: 'ch3.s2', titre: 'Vrai / faux : énoncés quantifiés', source: 'TD3 ex 5 et 12', refCours: 'poly §3.2.2 p.67 (quantificateurs)' },
  (r) => {
    const a = r.int(2, 9)
    const b = a * r.int(1, 4) + 1
    const C = T`[cours] L'**ordre des quantificateurs compte** : dans $\cours{\forall x,\ \exists y}$ le $y$ peut dépendre de $x$ ; dans $\cours{\exists y,\ \forall x}$ le même $y$ doit convenir pour tous les $x$ (poly §3.2.2).`
    const CE = T`[cours] Pour prouver qu'un énoncé $\cours{\forall x,\ P(x)}$ est **faux**, un seul **contre-exemple** suffit (poly §3.3.2 p.85).`
    const EX = T`[cours] Pour prouver $\cours{\exists x,\ P(x)}$, il suffit d'**exhiber** un $x$ qui convient ; pour le réfuter, il faut montrer que **aucun** ne convient.`
    const e = (s: string) => T`Vrai ou faux ? $$${s}$$`
    return [
      { e: e(T`\forall x\in\mathbb R,\ \exists y\in\mathbb R,\ y>x`), rep: true, ex: [C, T`[calcul] Pour un $x$ donné, $y=x+1$ convient.`, T`[resultat] ${OKVF(true)}`] },
      { e: e(T`\exists y\in\mathbb R,\ \forall x\in\mathbb R,\ y>x`), rep: false, ex: [C, T`[calcul] Si un tel $y$ existait, en prenant $x=y$ on aurait $y>y$ : absurde. Il n'y a pas de plus grand réel.`, T`[resultat] ${OKVF(false)}`] },
      { e: e(T`\forall x\in\mathbb R,\ x^2\ge x`), rep: false, ex: [CE, T`[calcul] $x=\frac12$ : $x^2=\frac14<\frac12$.`, T`[resultat] ${OKVF(false)}`] },
      { e: e(T`\forall n\in\mathbb N,\ n^2\ge n`), rep: true, ex: [T`[cours] Pour prouver un $\cours{\forall}$, on prend un élément **quelconque** et on raisonne (ici par disjonction de cas, poly §3.3.3).`, T`[calcul] Si $n=0$ : $0\ge0$. Si $n\ge1$ : $n^2=n\times n\ge n\times1$.`, T`[resultat] ${OKVF(true)} Les contre-exemples réels (entre 0 et 1) ne sont pas des entiers.`] },
      { e: e(T`\exists x\in\mathbb R,\ x^2=-${a}`), rep: false, ex: [EX, T`[calcul] Pour tout réel $x$, $x^2\ge0>-${a}$.`, T`[resultat] ${OKVF(false)} (Ce serait vrai dans $\mathbb C$.)`] },
      { e: e(T`\forall x\in\mathbb R,\ \exists y\in\mathbb R,\ x+y=${a}`), rep: true, ex: [C, T`[calcul] $y=${a}-x$ convient.`, T`[resultat] ${OKVF(true)}`] },
      { e: e(T`\exists x\in\mathbb R,\ \forall y\in\mathbb R,\ x+y=${a}`), rep: false, ex: [C, T`[calcul] Un même $x$ devrait vérifier $x+0=${a}$ et $x+1=${a}$ : impossible.`, T`[resultat] ${OKVF(false)}`] },
      { e: e(T`\exists x\in\mathbb R,\ \forall y\in\mathbb R,\ xy=0`), rep: true, ex: [EX, T`[calcul] $x=0$ convient : $0\times y=0$ pour tout $y$.`, T`[resultat] ${OKVF(true)}`] },
      { e: e(T`\forall x\in\mathbb R,\ \big(\forall\varepsilon>0,\ x\le\varepsilon\big)\Rightarrow(x\le0)`), rep: true, ex: [T`[cours] Raisonnement par **contraposée** (poly §3.3.3 p.86) : on montre $(x>0)\Rightarrow(\exists\varepsilon>0,\ x>\varepsilon)$.`, T`[calcul] Si $x>0$, alors $\varepsilon=\frac x2>0$ vérifie $x>\varepsilon$.`, T`[resultat] ${OKVF(true)} (TD3 ex 12.1)`] },
      { e: e(T`\forall x\in\mathbb R,\ \big(\forall\varepsilon>0,\ x<\varepsilon\big)\Rightarrow(x<0)`), rep: false, ex: [CE, T`[calcul] $x=0$ : pour tout $\varepsilon>0$ on a bien $0<\varepsilon$, mais $0<0$ est faux.`, T`[resultat] ${OKVF(false)} (TD3 ex 12.2) On obtient seulement $x\le0$.`] },
      { e: e(T`\forall x\in\mathbb R^*,\ \exists y\in\mathbb R,\ xy=1`), rep: true, ex: [C, T`[calcul] $y=\frac1x$ convient, puisque $x\neq0$.`, T`[resultat] ${OKVF(true)}`] },
      { e: e(T`\exists n\in\mathbb Z,\ ${a}n=${b}`), rep: false, ex: [EX, T`[calcul] $${b}=${a}\times${(b - 1) / a}+1$ n'est pas un multiple de $${a}$.`, T`[resultat] ${OKVF(false)} L'ensemble où vit la variable compte : dans $\mathbb Q$, $n=\frac{${b}}{${a}}$ conviendrait.`] },
      { e: e(T`\exists x\in\mathbb Q,\ ${a}x=${b}`), rep: true, ex: [EX, T`[calcul] $x=\frac{${b}}{${a}}\in\mathbb Q$ convient.`, T`[resultat] ${OKVF(true)}`] },
      { e: e(T`\forall x\in\mathbb R,\ (x^2=${a * a}\Rightarrow x=${a})`), rep: false, ex: [CE, T`[calcul] $x=-${a}$ : $x^2=${a * a}$ mais $x\neq${a}$.`, T`[resultat] ${OKVF(false)}`] },
      { e: e(T`\forall x\in\mathbb R_+,\ (x^2=${a * a}\Rightarrow x=${a})`), rep: true, ex: [T`[cours] Sur $\mathbb R_+$, la fonction carré est **injective** : $\cours{x^2=a^2\iff x=a}$ pour $x,a\ge0$.`, T`[calcul] $x^2=${a * a}$ donne $x=\pm${a}$, et $x\ge0$ impose $x=${a}$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Soit $f:\mathbb R\to\mathbb R$. L'énoncé $\forall x\in\mathbb R,\ (f(x)=0\Rightarrow x=0)$ affirme que $f(0)=0$.`, rep: false, ex: [T`[cours] $\cours{A\Rightarrow B}$ ne dit rien quand $A$ est faux (poly §3.1.2).`, T`[calcul] L'énoncé dit : « le **seul** endroit où $f$ peut s'annuler est $0$ ». Il est vrai pour $f(x)=x^2+1$, qui ne s'annule jamais.`, T`[resultat] ${OKVF(false)} (TD3 ex 5.4)`] },
    ]
  },
)

// =====================================================================================
// §3.2.4–3.2.6 Ensembles
// =====================================================================================

const ensemblesCalcul: Gabarit = {
  id: 'g3-ens-calc',
  chapitre: 'ch3',
  section: 'ch3.s3',
  niveau: 1,
  titre: 'Calculer avec des ensembles finis',
  source: 'TD3 ex 7 et 8',
  refCours: 'poly §3.2.4 p.71–72',
  generer(r) {
    const n = r.int(7, 9)
    const E = Array.from({ length: n }, (_, i) => i + 1)
    let A: number[], B: number[]
    const dans = (X: number[]) => (x: number) => X.includes(x)
    for (;;) {
      A = r.shuffle(E).slice(0, r.int(3, 5)).sort((x, y) => x - y)
      B = r.shuffle(E).slice(0, r.int(3, 5)).sort((x, y) => x - y)
      const inter = A.filter(dans(B)).length
      if (inter > 0 && inter < A.length && inter < B.length && new Set([...A, ...B]).size < n) break
    }
    const [a, b] = r.pick([['A', 'B'], ['X', 'Y'], ['F', 'G']])
    const inA = dans(A)
    const inB = dans(B)
    const ops = [
      { tex: T`${a}\cap ${b}`, f: (x: number) => inA(x) && inB(x), def: T`$\cours{${a}\cap ${b}}$ : les éléments qui sont dans $${a}$ **et** dans $${b}$` },
      { tex: T`${a}\cup ${b}`, f: (x: number) => inA(x) || inB(x), def: T`$\cours{${a}\cup ${b}}$ : les éléments qui sont dans $${a}$ **ou** dans $${b}$ (ou les deux)` },
      { tex: T`${a}\setminus ${b}`, f: (x: number) => inA(x) && !inB(x), def: T`$\cours{${a}\setminus ${b}}$ : les éléments de $${a}$ qui ne sont **pas** dans $${b}$` },
      { tex: T`${b}\setminus ${a}`, f: (x: number) => inB(x) && !inA(x), def: T`$\cours{${b}\setminus ${a}}$ : les éléments de $${b}$ qui ne sont **pas** dans $${a}$` },
      { tex: T`${a}\,\Delta\,${b}`, f: (x: number) => inA(x) !== inB(x), def: T`$\cours{${a}\,\Delta\,${b}=(${a}\setminus ${b})\cup(${b}\setminus ${a})}$ : les éléments qui sont dans **un seul** des deux (TD3 ex 8)` },
      { tex: T`\overline{${a}\cup ${b}}`, f: (x: number) => !(inA(x) || inB(x)), def: T`$\cours{\overline{${a}\cup ${b}}=\overline{${a}}\cap\overline{${b}}}$ (De Morgan) : les éléments de $E$ qui ne sont dans **aucun** des deux` },
      { tex: T`\overline{${a}\cap ${b}}`, f: (x: number) => !(inA(x) && inB(x)), def: T`$\cours{\overline{${a}\cap ${b}}=\overline{${a}}\cup\overline{${b}}}$ (De Morgan) : les éléments de $E$ qui ne sont pas dans les deux à la fois` },
    ]
    const k = r.int(0, ops.length - 1)
    const res = ops.map((o) => `$${ens(E.filter(o.f))}$`)
    verifier(new Set(res).size === res.length, 'ensembles distincts')
    const { choix, reponse } = choixQcm(r, res[k], res)
    return {
      type: 'qcm',
      enonce:
        T`Dans $E=\{1,2,\dots,${n}\}$, on pose $${a}=${ens(A)}$ et $${b}=${ens(B)}$. Déterminer $${ops[k].tex}$` +
        (k === 4 ? T`, où $${a}\,\Delta\,${b}=(${a}\setminus ${b})\cup(${b}\setminus ${a})$.` : k >= 5 ? T` (la barre désigne le complémentaire dans $E$).` : '.'),
      choix,
      reponse,
      explication: [
        T`[cours] ${ops[k].def} (poly §3.2.4 p.71).`,
        T`[calcul] $${a}\cap ${b}=\cle{${ens(E.filter(ops[0].f))}}$ et $${a}\cup ${b}=\cle{${ens(E.filter(ops[1].f))}}$.`,
        T`[resultat] $\ok{${ops[k].tex}=${ens(E.filter(ops[k].f))}}$`,
        T`[piege] $${a}\setminus ${b}$ et $${b}\setminus ${a}$ sont différents ; et le complémentaire se prend **dans $E$**.`,
      ].join('\n'),
    }
  },
}

const ensemblesVf = vfPioche(
  { id: 'g3-ens-vf', section: 'ch3.s3', titre: 'Vrai / faux : opérations sur les ensembles', source: 'TD3 ex 7 et 8', refCours: 'poly §3.2.4–3.2.6 p.71–73' },
  (r) => {
    const [A, B, C] = r.pick([['A', 'B', 'C'], ['X', 'Y', 'Z'], ['F', 'G', 'H']])
    const n = r.int(3, 7)
    const b = (x: string) => T`\overline{${x}}`
    const ctx = T`Soient $${A},${B},${C}$ des parties d'un ensemble $E$ (complémentaire noté $${b(A)}$).`
    const delta = T`On note $${A}\,\Delta\,${B}=(${A}\setminus ${B})\cup(${B}\setminus ${A})$ (parties d'un ensemble $E$).`
    const DM = T`[cours] **Lois de De Morgan** (TD3 ex 7.2) : $\cours{\overline{A\cap B}=\overline A\cup\overline B}$ et $\cours{\overline{A\cup B}=\overline A\cap\overline B}$. Le complémentaire **échange** $\cap$ et $\cup$, comme la négation échange « et » et « ou » (Prop. 3.7).`
    const DI = T`[cours] **Distributivité** (TD3 ex 7.1) : $\cours{A\cup(B\cap C)=(A\cup B)\cap(A\cup C)}$ et $\cours{A\cap(B\cup C)=(A\cap B)\cup(A\cap C)}$.`
    const DE = T`[cours] $\cours{x\in A\,\Delta\,B\iff(x\in A)\ \mathrm{XOR}\ (x\in B)}$ : $x$ est dans **un seul** des deux (TD3 ex 8.2).`
    return [
      { e: T`${ctx} Alors $\overline{${A}\cap ${B}}=${b(A)}\cup${b(B)}$.`, rep: true, ex: [DM, T`[calcul] $x\notin ${A}\cap ${B}$ signifie « non ($x\in ${A}$ et $x\in ${B}$) », soit « $x\notin ${A}$ ou $x\notin ${B}$ ».`, T`[resultat] ${OKVF(true)}`] },
      { e: T`${ctx} Alors $\overline{${A}\cup ${B}}=${b(A)}\cap${b(B)}$.`, rep: true, ex: [DM, T`[resultat] ${OKVF(true)}`] },
      { e: T`${ctx} Alors $\overline{${A}\cap ${B}}=${b(A)}\cap${b(B)}$.`, rep: false, ex: [DM, T`[calcul] Contre-exemple : $E=\{1,2\}$, $${A}=\{1\}$, $${B}=\{2\}$. À gauche $\overline{\varnothing}=E$, à droite $\{2\}\cap\{1\}=\varnothing$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`${ctx} Alors $${A}\cup(${B}\cap ${C})=(${A}\cup ${B})\cap(${A}\cup ${C})$.`, rep: true, ex: [DI, T`[resultat] ${OKVF(true)}`] },
      { e: T`${ctx} Alors $${A}\cap(${B}\cup ${C})=(${A}\cap ${B})\cup(${A}\cap ${C})$.`, rep: true, ex: [DI, T`[resultat] ${OKVF(true)}`] },
      { e: T`${ctx} Alors $${A}\cup(${B}\cap ${C})=(${A}\cup ${B})\cap ${C}$.`, rep: false, ex: [DI, T`[calcul] Contre-exemple : $${A}=\{1\}$, $${B}=${C}=\varnothing$. À gauche $\{1\}$, à droite $\varnothing$.`, T`[resultat] ${OKVF(false)} Les parenthèses comptent.`] },
      { e: T`${ctx} Si $${A}\subset ${B}$, alors $${b(B)}\subset${b(A)}$.`, rep: true, ex: [T`[cours] C'est la **contraposée** de $x\in A\Rightarrow x\in B$ : $\cours{x\notin B\Rightarrow x\notin A}$ (TD3 ex 7.3).`, T`[resultat] ${OKVF(true)} Le passage au complémentaire **renverse** les inclusions.`] },
      { e: T`${ctx} Si $${A}\subset ${B}$, alors $${b(A)}\subset${b(B)}$.`, rep: false, ex: [T`[cours] Le complémentaire **renverse** les inclusions : $\cours{A\subset B\Rightarrow\overline B\subset\overline A}$ (TD3 ex 7.3).`, T`[calcul] Contre-exemple : $E=\{1\}$, $${A}=\varnothing$, $${B}=E$ : $${b(A)}=E$ n'est pas inclus dans $${b(B)}=\varnothing$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`${delta} Alors $${A}\,\Delta\,${A}=\varnothing$.`, rep: true, ex: [DE, T`[calcul] $${A}\setminus ${A}=\varnothing$, donc $${A}\,\Delta\,${A}=\varnothing\cup\varnothing$.`, T`[resultat] ${OKVF(true)} (TD3 ex 8.3)`] },
      { e: T`${delta} Alors $\overline{${A}}\,\Delta\,\overline{${B}}=${A}\,\Delta\,${B}$.`, rep: true, ex: [DE, T`[calcul] $x$ est dans un seul des deux complémentaires si et seulement s'il **manque** à un seul des deux ensembles, c'est-à-dire s'il **appartient** à un seul des deux.`, T`[resultat] ${OKVF(true)} (TD3 ex 8.4)`] },
      { e: T`${ctx} Alors $${A}\setminus ${B}=${A}\cap${b(B)}$.`, rep: true, ex: [T`[cours] $\cours{A\setminus B=\{x\in A\ ;\ x\notin B\}}$ (poly §3.2.4 p.71) : être dans $A$ **et** hors de $B$.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`${delta} Alors $${A}\,\Delta\,${B}=${A}\cup ${B}$ pour toutes parties $${A},${B}$.`, rep: false, ex: [T`[cours] $\cours{A\,\Delta\,B=(A\cup B)\setminus(A\cap B)}$ (TD3 ex 8.1) : on **retire** la partie commune.`, T`[calcul] Contre-exemple : $${A}=${B}=\{1\}$ donne $\varnothing$ à gauche et $\{1\}$ à droite.`, T`[resultat] ${OKVF(false)} L'égalité n'a lieu que si $${A}\cap ${B}=\varnothing$.`] },
      { e: T`${ctx} Si $${A}\cap ${B}=${A}\cup ${B}$, alors $${A}=${B}$.`, rep: true, ex: [T`[cours] On a toujours $\cours{A\cap B\subset A\subset A\cup B}$ (poly §3.2.4).`, T`[calcul] $${A}\subset ${A}\cup ${B}=${A}\cap ${B}\subset ${B}$, et de même $${B}\subset ${A}$ : double inclusion.`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Si un ensemble $E$ a $${n}$ éléments, alors l'ensemble $\mathcal P(E)$ de ses parties a $${2 * n}$ éléments.`, rep: false, ex: [T`[cours] Chaque élément est **pris ou non** dans une partie : $\cours{\operatorname{card}\mathcal P(E)=2^n}$ (poly §3.2.6 p.73).`, T`[calcul] $2^{${n}}=${2 ** n}\neq${2 * n}$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Pour tout ensemble $E$ : $\varnothing\in\mathcal P(E)$.`, rep: true, ex: [T`[cours] $\cours{\mathcal P(E)}$ est l'ensemble de **toutes** les parties de $E$ (poly §3.2.6 p.73), et $\varnothing\subset E$ toujours.`, T`[resultat] ${OKVF(true)} De même $E\in\mathcal P(E)$.`] },
      { e: T`${delta} Si $${A}\,\Delta\,${B}=${A}\,\Delta\,${C}$, alors $${B}=${C}$.`, rep: true, ex: [DE, T`[calcul] Pour $x\in ${A}$ : $x\in ${A}\,\Delta\,${B}\iff x\notin ${B}$. Pour $x\notin ${A}$ : $x\in ${A}\,\Delta\,${B}\iff x\in ${B}$. Dans les deux cas, l'appartenance à $${B}$ se lit sur $${A}\,\Delta\,${B}$, donc $${B}$ et $${C}$ ont les mêmes éléments.`, T`[resultat] ${OKVF(true)} (TD3 ex 8.6)`] },
    ]
  },
)

const cardinaux: Gabarit = {
  id: 'g3-card',
  chapitre: 'ch3',
  section: 'ch3.s3',
  niveau: 1,
  titre: 'Compter : parties, produit cartésien, réunion',
  source: 'poly §3.2.4–3.2.6 (exemples)',
  refCours: 'poly §3.2.4–3.2.6 p.71–73',
  generer(r) {
    const [n, m] = [r.int(3, 8), r.int(2, 7)]
    const i = r.int(1, Math.min(n, m) - 1)
    const cas = r.int(0, 3)
    if (cas === 0)
      return {
        type: 'num',
        enonce: T`Un ensemble $E$ a $${n}$ éléments. Combien d'éléments a l'ensemble $\mathcal P(E)$ de ses parties ?`,
        reponse: 2 ** n,
        explication: [
          T`[cours] $\cours{\operatorname{card}\mathcal P(E)=2^{\operatorname{card}E}}$ (poly §3.2.6 p.73) : pour construire une partie, chaque élément est **pris ou laissé**, soit 2 choix par élément.`,
          T`[calcul] $2^{${n}}=${2 ** n}$`,
          T`[resultat] $\ok{${2 ** n}}$`,
          T`[piege] Ne pas oublier $\varnothing$ et $E$ lui-même, qui sont des parties de $E$. Et ce n'est pas $2\times${n}$.`,
        ].join('\n'),
      }
    if (cas === 1)
      return {
        type: 'num',
        enonce: T`$E$ a $${n}$ éléments et $F$ a $${m}$ éléments. Combien de couples contient le produit cartésien $E\times F$ ?`,
        reponse: n * m,
        explication: [
          T`[cours] $\cours{E\times F=\{(x,y)\ ;\ x\in E,\ y\in F\}}$ (poly §3.2.5 p.73), donc $\operatorname{card}(E\times F)=\operatorname{card}E\times\operatorname{card}F$.`,
          T`[calcul] $${n}$ choix pour $x$, puis $${m}$ choix pour $y$ : $${n}\times${m}=${n * m}$`,
          T`[resultat] $\ok{${n * m}}$`,
          T`[piege] Ce n'est pas $${n}+${m}$ : un couple associe **un** élément de chaque ensemble.`,
        ].join('\n'),
      }
    const d = cas === 3
    return {
      type: 'num',
      enonce: d
        ? T`$A$ a $${n}$ éléments, $B$ en a $${m}$ et $A\cap B$ en a $${i}$. Combien d'éléments a la différence symétrique $A\,\Delta\,B=(A\setminus B)\cup(B\setminus A)$ ?`
        : T`$A$ a $${n}$ éléments, $B$ en a $${m}$ et $A\cap B$ en a $${i}$. Combien d'éléments a $A\cup B$ ?`,
      reponse: d ? n + m - 2 * i : n + m - i,
      explication: [
        T`[cours] $\cours{\operatorname{card}(A\cup B)=\operatorname{card}A+\operatorname{card}B-\operatorname{card}(A\cap B)}$ : en additionnant, on compte **deux fois** la partie commune.`,
        d
          ? T`[calcul] $A\,\Delta\,B=(A\cup B)\setminus(A\cap B)$ (TD3 ex 8.1) : $(${n}+${m}-${i})-${i}=${n + m - 2 * i}$`
          : T`[calcul] $${n}+${m}-${i}=${n + m - i}$`,
        T`[resultat] $\ok{${d ? n + m - 2 * i : n + m - i}}$`,
        T`[piege] $${n}+${m}$ n'est correct que si $A$ et $B$ sont **disjoints**.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// §3.2.7–3.2.9 Applications
// =====================================================================================

const TYPES_APP = ['injective mais pas surjective', 'surjective mais pas injective', 'bijective', 'ni injective ni surjective']

const applications: Gabarit = {
  id: 'g3-inj-surj',
  chapitre: 'ch3',
  section: 'ch3.s4',
  niveau: 1,
  titre: 'Injective, surjective, bijective ?',
  source: 'TD3 ex 9',
  refCours: 'poly §3.2.9 p.77–79',
  indispensable: 21,
  generer(r) {
    const k = r.int(2, 6)
    const a = r.nz(-5, 5)
    const b = r.int(-6, 6)
    const R = T`\mathbb R`
    const Rp = T`\mathbb R_+`
    const items: { f: string; t: number; inj: string; surj: string }[] = [
      { f: T`${R}\to${R},\ x\mapsto x^2`, t: 3, inj: T`$1$ et $-1$ ont la même image $1$ : pas injective`, surj: T`$-1$ n'a pas d'antécédent : pas surjective` },
      { f: T`${R}\to${Rp},\ x\mapsto x^2`, t: 1, inj: T`$1$ et $-1$ ont la même image : pas injective`, surj: T`tout $y\ge0$ a l'antécédent $\sqrt y$ : surjective` },
      { f: T`${Rp}\to${R},\ x\mapsto x^2`, t: 0, inj: T`sur $\mathbb R_+$, $x^2=x'^2$ impose $x=x'$ : injective`, surj: T`$-1$ n'a pas d'antécédent : pas surjective` },
      { f: T`${Rp}\to${Rp},\ x\mapsto x^2`, t: 2, inj: T`sur $\mathbb R_+$, $x^2=x'^2$ impose $x=x'$ : injective`, surj: T`tout $y\ge0$ a l'antécédent $\sqrt y$ : surjective` },
      { f: T`${R}\to${R},\ x\mapsto ${lin([a, b], ['x', ''])}`, t: 2, inj: T`$y=${lin([a, b], ['x', ''])}$ a l'**unique** solution $x=\frac{y${b === 0 ? '' : b > 0 ? `-${b}` : `+${-b}`}}{${a}}$ : injective`, surj: T`et cette solution existe pour tout $y$ : surjective` },
      { f: T`\mathbb N\to\mathbb N,\ n\mapsto n+${k}`, t: 0, inj: T`$n+${k}=n'+${k}$ impose $n=n'$ : injective`, surj: T`$0$ n'a pas d'antécédent (il faudrait $n=-${k}\notin\mathbb N$) : pas surjective` },
      { f: T`\mathbb Z\to\mathbb Z,\ n\mapsto n+${k}`, t: 2, inj: T`$n+${k}=n'+${k}$ impose $n=n'$ : injective`, surj: T`tout $m$ a l'antécédent $m-${k}\in\mathbb Z$ : surjective` },
      { f: T`\mathbb N\to\mathbb N,\ n\mapsto\left\lfloor\frac n${k}\right\rfloor`, t: 1, inj: T`$0$ et $1$ ont la même image $0$ : pas injective`, surj: T`tout $m$ a l'antécédent $${k}m$ : surjective` },
      { f: T`\mathbb Z\to\mathbb Z,\ n\mapsto ${k}n`, t: 0, inj: T`$${k}n=${k}n'$ impose $n=n'$ : injective`, surj: T`$1$ n'est pas un multiple de $${k}$ : pas surjective` },
      { f: T`${R}\to${R},\ x\mapsto e^x`, t: 0, inj: T`$\exp$ est strictement croissante : injective`, surj: T`$e^x>0$, donc $-1$ n'a pas d'antécédent : pas surjective` },
      { f: T`${R}\to\ ]0,+\infty[,\ x\mapsto e^x`, t: 2, inj: T`$\exp$ est strictement croissante : injective`, surj: T`tout $y>0$ a l'antécédent $\ln y$ : surjective` },
      { f: T`${R}\to[-1,1],\ x\mapsto\sin x`, t: 1, inj: T`$\sin0=\sin\pi=0$ : pas injective`, surj: T`$\sin$ prend toutes les valeurs de $[-1,1]$ : surjective` },
      { f: T`${R}\to${R},\ x\mapsto x^3`, t: 2, inj: T`$x\mapsto x^3$ est strictement croissante : injective`, surj: T`tout $y$ a l'antécédent $\sqrt[3]y$ : surjective` },
      { f: T`${R}\to${R},\ x\mapsto|x|`, t: 3, inj: T`$|1|=|-1|$ : pas injective`, surj: T`$-1$ n'a pas d'antécédent : pas surjective` },
    ]
    const it = r.pick(items)
    const choix = r.shuffle(TYPES_APP)
    return {
      type: 'qcm',
      enonce: T`L'application $$f:${it.f}$$ est :`,
      choix,
      reponse: choix.indexOf(TYPES_APP[it.t]),
      indice: 'Deux éléments différents peuvent-ils avoir la même image ? Tout élément de l’arrivée a-t-il un antécédent ?',
      explication: [
        T`[cours] **Énoncé indispensable 21** (p.79) : $f:A\to B$ est **injective** si $\cours{a_1\neq a_2\Rightarrow f(a_1)\neq f(a_2)}$ (au plus un antécédent), **surjective** si $\cours{\forall b\in B,\ \exists a\in A,\ b=f(a)}$ (au moins un antécédent), **bijective** si les deux.`,
        T`[calcul] Injectivité : ${it.inj}.`,
        T`Surjectivité : ${it.surj}.`,
        T`[resultat] $f$ est $\ok{\text{${TYPES_APP[it.t]}}}$.`,
        T`[piege] Les ensembles de **départ et d'arrivée** font partie de l'application : la même formule peut changer de nature quand on les modifie.`,
      ].join('\n'),
    }
  },
}

const applicationsVf = vfPioche(
  { id: 'g3-app-vf', section: 'ch3.s4', titre: 'Vrai / faux : applications et composition', source: 'TD3 ex 9 et 10', refCours: 'poly §3.2.7–3.2.9 p.74–79', indispensable: 21 },
  (r) => {
    const [f, g] = r.pick([['f', 'g'], ['u', 'v'], ['\\varphi', '\\psi']])
    const ctx = T`Soient $${f}:A\to B$ et $${g}:B\to C$ deux applications.`
    const D = T`[cours] (Énoncé indispensable 21, p.79) injective : $\cours{f(a_1)=f(a_2)\Rightarrow a_1=a_2}$ ; surjective : $\cours{\forall b\in B,\ \exists a\in A,\ f(a)=b}$. Composée : $\cours{(g\circ f)(a)=g(f(a))}$ (Déf. 3.16, p.76).`
    return [
      { e: T`${ctx} Si $${f}$ et $${g}$ sont injectives, alors $${g}\circ ${f}$ est injective.`, rep: true, ex: [D, T`[calcul] Si $${g}(${f}(a))=${g}(${f}(a'))$, alors $${f}(a)=${f}(a')$ car $${g}$ est injective, puis $a=a'$ car $${f}$ l'est.`, T`[resultat] ${OKVF(true)} (TD3 ex 10.1)`] },
      { e: T`${ctx} Si $${f}$ et $${g}$ sont surjectives, alors $${g}\circ ${f}$ est surjective.`, rep: true, ex: [D, T`[calcul] Soit $c\in C$ : il existe $b$ avec $${g}(b)=c$, puis $a$ avec $${f}(a)=b$, donc $${g}(${f}(a))=c$.`, T`[resultat] ${OKVF(true)} (TD3 ex 10.2)`] },
      { e: T`${ctx} Si $${g}\circ ${f}$ est injective, alors $${f}$ est injective.`, rep: true, ex: [D, T`[calcul] Si $${f}(a)=${f}(a')$, on applique $${g}$ : $${g}(${f}(a))=${g}(${f}(a'))$, donc $a=a'$.`, T`[resultat] ${OKVF(true)} (TD3 ex 10.3)`] },
      { e: T`${ctx} Si $${g}\circ ${f}$ est injective, alors $${g}$ est injective.`, rep: false, ex: [D, T`[calcul] Contre-exemple : $${f}:\mathbb R_+\to\mathbb R,\ x\mapsto x$ et $${g}:\mathbb R\to\mathbb R,\ y\mapsto y^2$. Alors $${g}\circ ${f}:x\mapsto x^2$ est injective sur $\mathbb R_+$, mais $${g}$ ne l'est pas.`, T`[resultat] ${OKVF(false)} Seule $${f}$ (celle qu'on applique **en premier**) est forcément injective.`] },
      { e: T`${ctx} Si $${g}\circ ${f}$ est surjective, alors $${g}$ est surjective.`, rep: true, ex: [D, T`[calcul] Tout $c\in C$ s'écrit $${g}(${f}(a))$ : $b=${f}(a)$ est un antécédent de $c$ par $${g}$.`, T`[resultat] ${OKVF(true)} (TD3 ex 10.4)`] },
      { e: T`${ctx} Si $${g}\circ ${f}$ est surjective, alors $${f}$ est surjective.`, rep: false, ex: [D, T`[calcul] Contre-exemple : $${f}:\mathbb R_+\to\mathbb R,\ x\mapsto x$ (pas surjective) et $${g}:\mathbb R\to\mathbb R_+,\ y\mapsto y^2$. Alors $${g}\circ ${f}:\mathbb R_+\to\mathbb R_+,\ x\mapsto x^2$ est surjective.`, T`[resultat] ${OKVF(false)} Seule $${g}$ (celle qu'on applique **en dernier**) est forcément surjective.`] },
      { e: T`Soit $E$ un ensemble **fini** et $${f}:E\to E$. Alors $${f}$ est injective si et seulement si elle est surjective.`, rep: true, ex: [T`[cours] Si $E=\{e_1,\dots,e_n\}$ et $f$ est injective, les $n$ images $f(e_1),\dots,f(e_n)$ sont **distinctes** : elles remplissent $E$ (TD3 ex 9a).`, T`[resultat] ${OKVF(true)} C'est faux pour un ensemble infini.`] },
      { e: T`Toute application injective $${f}:\mathbb N\to\mathbb N$ est surjective.`, rep: false, ex: [T`[cours] L'équivalence injective $\iff$ surjective ne vaut que pour $f:E\to E$ avec $\cours{E\text{ fini}}$ (TD3 ex 9).`, T`[calcul] Contre-exemple : $n\mapsto n+1$ est injective, mais $0$ n'a pas d'antécédent.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Une application $${f}:A\to B$ est bijective si et seulement si tout élément de $B$ a **exactement un** antécédent.`, rep: true, ex: [D, T`[calcul] « Au moins un » = surjective ; « au plus un » = injective.`, T`[resultat] ${OKVF(true)} C'est ce qui permet de définir la réciproque $${f}^{-1}$ (Prop. 3.18, p.78).`] },
      { e: T`Une application $${f}:A\to B$ est injective si tout élément de $B$ a **au moins un** antécédent.`, rep: false, ex: [D, T`[resultat] ${OKVF(false)} « Au moins un antécédent » est la définition de **surjective**. Injective = « au plus un ».`] },
      { e: T`Pour toutes applications $${f},${g}:\mathbb R\to\mathbb R$, on a $${g}\circ ${f}=${f}\circ ${g}$.`, rep: false, ex: [T`[cours] $\cours{(g\circ f)(x)=g(f(x))}$ : on applique d'abord $f$ (Déf. 3.16, p.76). La composition n'est **pas commutative**.`, T`[calcul] Avec $${f}(x)=x+1$ et $${g}(x)=x^2$ : $${g}(${f}(x))=(x+1)^2$ mais $${f}(${g}(x))=x^2+1$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Une application $${f}:A\to B$ associe à chaque élément de $A$ **un et un seul** élément de $B$.`, rep: true, ex: [T`[cours] **Énoncé indispensable 20** (p.76) : une application de $A$ dans $B$ fait correspondre à **tout** $a\in A$ une **unique** image $f(a)\in B$.`, T`[resultat] ${OKVF(true)} En revanche, un élément de $B$ peut avoir zéro, un ou plusieurs antécédents.`] },
    ]
  },
)

const composee: Gabarit = {
  id: 'g3-composee',
  chapitre: 'ch3',
  section: 'ch3.s4',
  niveau: 1,
  titre: 'Calculer une composée',
  source: 'poly §3.2.8 (exemples)',
  refCours: 'poly §3.2.8 p.76 (Déf. 3.16)',
  generer(r) {
    const [f, g] = r.pick([['f', 'g'], ['u', 'v'], ['h', 'k']])
    for (;;) {
      const [a, b, c, d] = [r.nz(-4, 4), r.nz(-5, 5), r.nz(-4, 4), r.int(-5, 5)]
      const carre = r.bool(0.6)
      const fTex = lin([a, b], ['x', ''])
      const gTex = carre ? lin([1, c], ['x^2', '']) : lin([c, d], ['x', ''])
      const fA = (u: string) => `${a}*(${u})+(${b})`
      const gA = (u: string) => (carre ? `(${u})^2+(${c})` : `${c}*(${u})+(${d})`)
      // coefficients développés de g∘f et de f∘g (en x², x, 1)
      const gf = carre ? [a * a, 2 * a * b, b * b + c] : [0, c * a, c * b + d]
      const fg = carre ? [a, 0, a * c + b] : [0, a * c, a * d + b]
      if (gf.every((x, i) => x === fg[i])) continue
      const gPuisF = r.bool()
      const [ext, int] = gPuisF ? [g, f] : [f, g]
      const res = gPuisF ? gf : fg
      const intTex = gPuisF ? fTex : gTex
      return {
        type: 'court',
        enonce: T`On pose $${f}(x)=${fTex}$ et $${g}(x)=${gTex}$. Calculer $(${ext}\circ ${int})(x)$.`,
        reponse: [gPuisF ? gA(linAscii([a, b], ['x', ''])) : fA(carre ? `x^2+(${c})` : `${c}*x+(${d})`)],
        variables: ['x'],
        mode: 'expression',
        format: 'expression en x (développée ou non)',
        explication: [
          T`[cours] (Déf. 3.16, p.76) $\cours{(g\circ f)(x)=g(f(x))}$ : on applique d'abord la fonction écrite **à droite**.`,
          T`[methode] Dans l'expression de $${ext}$, on remplace $x$ par $${int}(x)=${intTex}$, **entre parenthèses**.`,
          T`[calcul] $$(${ext}\circ ${int})(x)=${ext}(${intTex})=${gPuisF ? (carre ? T`(${fTex})^2${c > 0 ? '+' : ''}${c}` : T`${c}(${fTex})${d === 0 ? '' : d > 0 ? `+${d}` : d}`) : T`${a}(${gTex})${b > 0 ? '+' : ''}${b}`}$$`,
          T`[resultat] $\ok{(${ext}\circ ${int})(x)=${lin(res, X2)}}$`,
          T`[piege] L'ordre compte : ici $(${int}\circ ${ext})(x)=${lin(gPuisF ? fg : gf, X2)}$, ce qui est différent.`,
        ].join('\n'),
      }
    }
  },
}

// =====================================================================================
// §3.3 Raisonnements
// =====================================================================================

const equationRacine: Gabarit = {
  id: 'g3-eq-racine',
  chapitre: 'ch3',
  section: 'ch3.s5',
  niveau: 2,
  titre: 'Équation avec racine : implications et vérification',
  source: 'TD3 ex 11.2',
  refCours: 'poly §3.3 p.82–86 (implication ≠ équivalence)',
  generer(r) {
    const t = r.int(2, 5) // valeur de x + a en la vraie solution
    const s = r.int(-6, 4)
    const a = t - s
    const b = t * t - s
    const parasite = s + 1 - 2 * t
    verifier(s + a >= 0 && (s + a) ** 2 === s + b, 'solution')
    verifier(parasite + a < 0 && (parasite + a) ** 2 === parasite + b, 'parasite')
    const gauche = lin([1, a], ['x', ''])
    const dedans = lin([1, b], ['x', ''])
    const tri = [1, 2 * a - 1, a * a - b]
    return {
      type: 'num',
      enonce: r.bool()
        ? T`Résoudre dans $\mathbb R$ l'équation $${gauche}=\sqrt{${dedans}}$ (elle a une seule solution).`
        : T`L'ensemble $B=\{x\in\mathbb R\ ;\ ${gauche}=\sqrt{${dedans}}\}$ contient un seul élément. Lequel ?`,
      reponse: s,
      indice: 'Élever au carré ne donne qu’une implication : vérifie chaque candidat dans l’équation de départ.',
      explication: [
        T`[cours] Élever au carré n'est qu'une **implication** : $\cours{u=\sqrt v\Rightarrow u^2=v}$. La réciproque demande $\cours{u\ge0}$. On obtient donc des **candidats** qu'il faut vérifier (TD3 ex 11 et 17.2).`,
        T`[calcul] $(${gauche})^2=${dedans}\iff ${lin(tri, X2)}=0\iff${fx(s)}${fx(parasite)}=0$, d'où les candidats $\cle{${s}}$ et $\cle{${parasite}}$.`,
        T`[verif] $x=${s}$ : $${gauche}$ vaut $${s + a}$ et $\sqrt{${s + b}}=${t}$ : convient. $x=${parasite}$ : $${gauche}$ vaut $${parasite + a}<0$, or une racine carrée est positive : $\ko{${parasite}}$ est une solution **parasite**.`,
        T`[resultat] $\ok{x=${s}}$`,
        T`[piege] Raisonner par implications sans vérifier, c'est risquer de garder des solutions parasites.`,
      ].join('\n'),
    }
  },
}

const equationAbs: Gabarit = {
  id: 'g3-eq-abs',
  chapitre: 'ch3',
  section: 'ch3.s5',
  niveau: 2,
  titre: 'Somme de valeurs absolues : disjonction de cas',
  source: 'TD3 ex 11.1',
  refCours: 'poly §3.3.3 p.86 (disjonction de cas)',
  generer(r) {
    const p = r.int(-5, 3)
    const L = r.int(2, 6)
    const q = p + L
    const k = r.int(1, 3)
    const cas = r.int(0, 2) // 0 : d > L (deux solutions), 1 : d = L (segment), 2 : d < L (vide)
    const d = cas === 0 ? L + 2 * k : cas === 1 ? L : r.int(1, L - 1)
    const deux = T`$\{${p - k},\ ${q + k}\}$`
    const seg = T`$[${p},\ ${q}]$`
    const vide = T`$\varnothing$`
    const bon = [deux, seg, vide][cas]
    const choix = r.shuffle([deux, seg, vide, T`$\{${q + k}\}$`])
    const f = (x: number) => Math.abs(x - p) + Math.abs(x - q)
    if (cas === 0) verifier(f(p - k) === d && f(q + k) === d, 'valeurs absolues')
    return {
      type: 'qcm',
      enonce: T`Décrire explicitement l'ensemble $$A=\{x\in\mathbb R\ ;\ |${xm(p)}|+|${xm(q)}|=${d}\}.$$`,
      choix,
      reponse: choix.indexOf(bon),
      indice: T`Sépare selon la position de $x$ par rapport à $${p}$ et $${q}$.`,
      explication: [
        T`[cours] $\cours{|u|=u\text{ si }u\ge0,\quad|u|=-u\text{ si }u\le0}$. On raisonne par **disjonction de cas** (poly §3.3.3) selon le signe de chaque expression.`,
        T`[calcul] Si $x\le${p}$ : la somme vaut $(${p}-x)+(${q}-x)=${p + q}-2x\ \ge${L}$.`,
        T`Si $${p}\le x\le${q}$ : la somme vaut $(x-${p < 0 ? `(${p})` : p})+(${q}-x)=\cle{${L}}$, **constante** (c'est la distance entre $${p}$ et $${q}$).`,
        T`Si $x\ge${q}$ : la somme vaut $2x-${p + q < 0 ? `(${p + q})` : p + q}\ \ge${L}$.`,
        cas === 0
          ? T`[resultat] $${d}>${L}$ : une solution dans chaque cas extérieur, $${p + q}-2x=${d}$ et $2x-${p + q < 0 ? `(${p + q})` : p + q}=${d}$, soit $\ok{A=\{${p - k},\ ${q + k}\}}$.`
          : cas === 1
            ? T`[resultat] $${d}$ est exactement la valeur constante du cas central : $\ok{A=[${p},\ ${q}]}$, une infinité de solutions.`
            : T`[resultat] La somme vaut toujours au moins $${L}$, et $${d}<${L}$ : $\ok{A=\varnothing}$.`,
        T`[piege] Ne pas oublier un cas, et vérifier que chaque solution trouvée est bien **dans l'intervalle** du cas étudié.`,
      ].join('\n'),
    }
  },
}

const sommes: Gabarit = {
  id: 'g3-sommes',
  chapitre: 'ch3',
  section: 'ch3.s5',
  niveau: 1,
  titre: 'Sommes classiques (démontrées par récurrence)',
  source: 'TD3 ex 14',
  refCours: 'poly §3.3.3 p.88–89 (récurrence)',
  generer(r) {
    const n = r.int(4, 20)
    const cas = r.int(0, 3)
    const brut = (g: (k: number) => number) => Array.from({ length: n + 1 }, (_, k) => g(k)).reduce((s, x) => s + x, 0)
    const REC = T`[methode] Ces formules se démontrent **par récurrence** (poly p.88) : **initialisation** (vérifier pour $n=0$), puis **hérédité** (supposer la formule au rang $n$ et la démontrer au rang $n+1$ en ajoutant le terme suivant).`
    const L = [
      {
        somme: 'k',
        formule: T`\frac{n(n+1)}2`,
        val: (n * (n + 1)) / 2,
        calc: T`\frac{${n}\times${n + 1}}2`,
        g: (k: number) => k,
        her: T`$\frac{n(n+1)}2+(n+1)=\frac{(n+1)(n+2)}2$`,
      },
      {
        somme: 'k^2',
        formule: T`\frac{n(n+1)(2n+1)}6`,
        val: (n * (n + 1) * (2 * n + 1)) / 6,
        calc: T`\frac{${n}\times${n + 1}\times${2 * n + 1}}6`,
        g: (k: number) => k * k,
        her: T`$\frac{n(n+1)(2n+1)}6+(n+1)^2=\frac{(n+1)(2n^2+7n+6)}6=\frac{(n+1)(n+2)(2n+3)}6$`,
      },
      {
        somme: '(2k+1)',
        formule: '(n+1)^2',
        val: (n + 1) ** 2,
        calc: T`${n + 1}^2`,
        g: (k: number) => 2 * k + 1,
        her: T`$(n+1)^2+(2n+3)=n^2+4n+4=(n+2)^2$`,
      },
      {
        somme: 'k^3',
        formule: T`\left(\frac{n(n+1)}2\right)^2`,
        val: ((n * (n + 1)) / 2) ** 2,
        calc: T`\left(\frac{${n}\times${n + 1}}2\right)^2=${(n * (n + 1)) / 2}^2`,
        g: (k: number) => k ** 3,
        her: T`$\left(\frac{n(n+1)}2\right)^2+(n+1)^3=\frac{(n+1)^2(n^2+4n+4)}4=\left(\frac{(n+1)(n+2)}2\right)^2$`,
      },
    ][cas]
    verifier(brut(L.g) === L.val, 'somme')
    return {
      type: 'num',
      enonce: T`Calculer $\displaystyle\sum_{k=0}^{${n}}${L.somme}$.`,
      reponse: L.val,
      explication: [
        T`[cours] Pour tout $n\in\mathbb N$ : $$\cours{\sum_{k=0}^{n}${L.somme}=${L.formule}}$$`,
        REC,
        T`Hérédité ici : ${L.her}.`,
        T`[calcul] Avec $n=${n}$ : $${L.calc}=${L.val}$`,
        T`[resultat] $\ok{${L.val}}$`,
        T`[piege] Une récurrence sans **initialisation** ne prouve rien (TD3 ex 17.3).`,
      ].join('\n'),
    }
  },
}

const raisonnementsVf = vfPioche(
  { id: 'g3-raison-vf', section: 'ch3.s5', titre: 'Vrai / faux : méthodes de raisonnement', source: 'TD3 ex 13 et 17', refCours: 'poly §3.3 p.82–89', indispensable: true },
  (r) => {
    const [P, Q] = r.pick([['P', 'Q'], ['A', 'B'], ['E_1', 'E_2']])
    const m = r.pick([3, 5, 7])
    const MP = T`[cours] **Modus ponens** (Prop. 3.19, p.83) : si $\cours{E_1\Rightarrow E_2}$ est vrai et si $E_1$ est vrai, alors $E_2$ est vrai. C'est la règle de déduction de base d'une démonstration.`
    const REC = T`[cours] **Récurrence** (p.88) : i) **initialisation**, $E(0)$ est vrai ; ii) **hérédité**, pour tout $n$, $\cours{E(n)\Rightarrow E(n+1)}$. Alors $\forall n\in\mathbb N,\ E(n)$.`
    return [
      { e: T`Pour démontrer $${P}\Rightarrow ${Q}$ par **contraposée**, on suppose $\lnot ${Q}$ et on démontre $\lnot ${P}$.`, rep: true, ex: [T`[cours] $\cours{(A\Rightarrow B)\Leftrightarrow(\lnot B\Rightarrow\lnot A)}$ (Prop. 3.10, p.65 ; méthode p.86).`, T`[resultat] ${OKVF(true)} Exemple du poly : « $n^2$ pair $\Rightarrow n$ pair » via « $n$ impair $\Rightarrow n^2$ impair ».`] },
      { e: T`Pour démontrer $${P}\Rightarrow ${Q}$ par **l'absurde**, on suppose $${P}$ et $\lnot ${Q}$ et on cherche une contradiction.`, rep: true, ex: [T`[cours] $\cours{\lnot(A\Rightarrow B)\Leftrightarrow A\land\lnot B}$ (Prop. 3.7). Supposer la négation et aboutir à une contradiction prouve l'énoncé (p.87).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour démontrer qu'un énoncé « $\forall x\in A,\ P(x)$ » est **faux**, il suffit d'un contre-exemple.`, rep: true, ex: [T`[cours] $\cours{\lnot(\forall x\in A,\ P(x))=\exists x\in A,\ \lnot P(x)}$ (Énoncé indispensable 19 ; §3.3.2 p.85).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`Pour démontrer qu'un énoncé « $\forall n\in\mathbb N,\ P(n)$ » est **vrai**, il suffit de le vérifier pour $n=0,1,2,\dots,${m * 20}$.`, rep: false, ex: [T`[cours] Un $\cours{\forall}$ porte sur **tous** les éléments : des exemples, même nombreux, ne prouvent rien (§3.3.3 p.86).`, T`[resultat] ${OKVF(false)} Il faut un raisonnement général (direct, contraposée, absurde, récurrence…).`] },
      { e: T`Dans une récurrence, si l'hérédité $E(n)\Rightarrow E(n+1)$ est vraie pour tout $n$, alors $E(n)$ est vrai pour tout $n$.`, rep: false, ex: [REC, T`[calcul] Exemple : $E(n)$ = « $n=n+1$ ». L'hérédité est vraie (ajouter 1 des deux côtés), mais $E(0)$ est faux.`, T`[resultat] ${OKVF(false)} Sans **initialisation**, rien n'est prouvé.`] },
      { e: T`Si $${P}\Rightarrow ${Q}$ est vrai et si $${Q}$ est vrai, alors $${P}$ est vrai.`, rep: false, ex: [MP, T`[calcul] « $x=2\Rightarrow x^2=4$ » est vrai et « $x^2=4$ » peut être vrai avec $x=-2$.`, T`[resultat] ${OKVF(false)} C'est confondre l'implication avec sa **réciproque**.`] },
      { e: T`Si $${P}\Rightarrow ${Q}$ est vrai et si $${P}$ est vrai, alors $${Q}$ est vrai.`, rep: true, ex: [MP, T`[resultat] ${OKVF(true)}`] },
      { e: T`Si $${P}\Rightarrow ${Q}$ est vrai et si $${Q}$ est faux, alors $${P}$ est faux.`, rep: true, ex: [T`[cours] Contraposée : $\cours{\lnot B\Rightarrow\lnot A}$ est équivalente à $A\Rightarrow B$ (Prop. 3.10), puis modus ponens (Prop. 3.19).`, T`[resultat] ${OKVF(true)}`] },
      { e: T`La contraposée de « si $p^2$ est multiple de $${m}$, alors $p$ est multiple de $${m}$ » est « si $p$ n'est pas multiple de $${m}$, alors $p^2$ n'est pas multiple de $${m}$ ».`, rep: true, ex: [T`[cours] Contraposée de $A\Rightarrow B$ : $\cours{\lnot B\Rightarrow\lnot A}$ (Prop. 3.10, p.65).`, T`[resultat] ${OKVF(true)} C'est la démarche du TD3 ex 13 pour prouver que $\sqrt3$ est irrationnel.`] },
      { e: T`Le théorème des valeurs intermédiaires dit : « si $f$ est continue sur $[a,b]$, elle prend toutes les valeurs entre $f(a)$ et $f(b)$ ». On en déduit qu'une fonction **non continue** ne prend pas toutes ces valeurs.`, rep: false, ex: [T`[cours] De $\cours{A\Rightarrow B}$ on ne peut **pas** déduire $\lnot A\Rightarrow\lnot B$ (ce serait la contraposée de la réciproque).`, T`[calcul] TD3 ex 17.1 : $f(x)=x+1$ si $x<0$, $f(x)=x$ si $x\ge0$ n'est pas continue sur $[-1,1]$, et prend pourtant toutes les valeurs de $[0,1]$.`, T`[resultat] ${OKVF(false)}`] },
      { e: T`Résolution de $x^2=\pi$ : « $x^2=\pi$ donc $\sin(x^2)=0$, donc $x^2=k\pi$ avec $k\in\mathbb N$, donc les solutions sont les $\pm\sqrt{k\pi}$ ». Ce raisonnement est correct.`, rep: false, ex: [T`[cours] Une suite d'**implications** ne fournit que des conditions **nécessaires** : il faut ensuite vérifier les candidats (ou raisonner par équivalences).`, T`[calcul] $x^2=\pi\Rightarrow\sin(x^2)=0$ est vrai, mais la réciproque est fausse : $x=\sqrt{2\pi}$ annule $\sin(x^2)$ sans vérifier $x^2=\pi$.`, T`[resultat] ${OKVF(false)} (TD3 ex 17.2) Les seules solutions sont $\pm\sqrt\pi$.`] },
      { e: T`On démontre classiquement que $\sqrt{${m}}$ est irrationnel par un raisonnement par l'absurde.`, rep: true, ex: [T`[cours] Par l'absurde (p.87) : on suppose $\sqrt{${m}}=\frac pq$ **irréductible**. Alors $p^2=${m}q^2$, donc $p$ est multiple de $${m}$, puis $q$ aussi : contradiction avec l'irréductibilité.`, T`[resultat] ${OKVF(true)} (TD3 ex 13 pour $\sqrt3$)`] },
    ]
  },
)

const partieEntiere: Gabarit = {
  id: 'g3-partie-entiere',
  chapitre: 'ch3',
  section: 'ch3.s5',
  niveau: 1,
  titre: 'Partie entière',
  source: 'TD3 ex 15',
  refCours: 'TD3 ex 15 · poly §3.2.10 p.80 (ensembles de nombres)',
  generer(r) {
    const DEF = T`[cours] La **partie entière** $\lfloor x\rfloor$ est l'unique entier $n$ tel que $\cours{n\le x<n+1}$ (TD3 ex 15) : le plus grand entier **inférieur ou égal** à $x$.`
    const cas = r.int(0, 2)
    if (cas === 0) {
      const q = r.pick([2, 3, 4, 5, 7])
      let p: number
      do p = r.nz(-30, 30)
      while (p % q === 0)
      const x = new Frac(p, q)
      const n = Math.floor(p / q)
      return {
        type: 'num',
        enonce: T`Calculer $\left\lfloor${x.tex()}\right\rfloor$ (partie entière).`,
        reponse: n,
        explication: [
          DEF,
          T`[calcul] $${n}=\frac{${n * q}}{${q}}\le${x.tex()}<\frac{${(n + 1) * q}}{${q}}=${n + 1}$`,
          T`[resultat] $\ok{${n}}$`,
          p < 0 ? T`[piege] Pour un nombre **négatif**, la partie entière n'est pas la troncature : $\ko{${n + 1}}$ est plus **grand** que $${x.tex()}$.` : T`[piege] Attention aux négatifs : $\lfloor-2{,}5\rfloor=-3$, pas $-2$.`,
        ].join('\n'),
      }
    }
    if (cas === 1) {
      const e = r.int(1, 9)
      const dec = r.int(1, 9)
      return {
        type: 'num',
        enonce: T`Calculer $\lfloor-${e}{,}${dec}\rfloor$ (partie entière).`,
        reponse: -e - 1,
        explication: [
          DEF,
          T`[calcul] $${-e - 1}\le-${e}{,}${dec}<${-e}$`,
          T`[resultat] $\ok{${-e - 1}}$`,
          T`[piege] $\ko{${-e}}$ est **supérieur** à $-${e}{,}${dec}$ : ce n'est pas la partie entière.`,
        ].join('\n'),
      }
    }
    const m = r.int(-9, 9)
    const k = r.nz(-6, 6)
    return {
      type: 'num',
      enonce: T`Soit $x$ un réel tel que $\lfloor x\rfloor=${m}$. Que vaut $\lfloor ${lin([1, k], ['x', ''])}\rfloor$ ?`,
      reponse: m + k,
      explication: [
        DEF,
        T`[calcul] $${m}\le x<${m + 1}$ donne, en ajoutant $${k}$ : $${m + k}\le ${lin([1, k], ['x', ''])}<${m + k + 1}$.`,
        T`[resultat] $\ok{${m + k}}$ : pour tout entier $k$, $\lfloor x+k\rfloor=\lfloor x\rfloor+k$ (TD3 ex 15.3).`,
        T`[piege] Cette règle ne vaut que pour $k$ **entier** ; en général $\lfloor x+y\rfloor\neq\lfloor x\rfloor+\lfloor y\rfloor$.`,
      ].join('\n'),
    }
  },
}

export const GABARITS_CH3: Gabarit[] = [
  tableVerite,
  equivalences,
  negContraRecip,
  enigme,
  negQuantifie,
  quantVf,
  ensemblesCalcul,
  ensemblesVf,
  cardinaux,
  applications,
  applicationsVf,
  composee,
  equationRacine,
  equationAbs,
  sommes,
  raisonnementsVf,
  partieEntiere,
]
