/**
 * Informatique — Éléments de programmation (UL1IN011) : gabarits de questions à variantes.
 * D'après les cours d'amphi 1 et 2 (2026) : expressions et types, fonctions (spécification,
 * implémentation, validation), variables, alternatives, booléens, boucles while et simulation,
 * suites, algorithme d'Euclide. Le code suit les conventions du cours (Python typé, MrPython).
 */
import type { Gabarit } from './types'
import { Rng, pgcdListe, verifier } from './outils'

const T = String.raw
const C1 = 'UL1IN011 cours 1'
const C2 = 'UL1IN011 cours 2'
/** Code en ligne. */
const c = (s: string | number | boolean) => '`' + s + '`'
/** Bloc de code Python. */
const py = (lignes: string[]) => '```\n' + lignes.join('\n') + '\n```'
const OKVF = (b: boolean) => T`$\ok{\text{${b ? 'VRAI' : 'FAUX'}}}$`
const PY = (b: boolean) => (b ? 'True' : 'False')
/** Division entière et modulo de Python (arrondi vers −∞, reste du signe du diviseur). */
const div = (a: number, b: number) => Math.floor(a / b)
const mod = (a: number, b: number) => a - b * Math.floor(a / b)
/** Écriture Python d'un flottant : 416.0, 3.5. */
const fl = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x))

const choixQcm = (r: Rng, bon: string, leurres: string[], n = 3) => {
  const choix = r.shuffle([bon, ...r.shuffle([...new Set(leurres)].filter((l) => l !== bon)).slice(0, n)])
  return { choix, reponse: choix.indexOf(bon) }
}

/** Table de simulation de boucle (cours 2), rendue en bloc de texte aligné. */
function table(cols: string[], lignes: (string | number)[][]): string {
  const tout = [cols, ...lignes.map((l) => l.map(String))]
  const w = cols.map((_, j) => Math.max(...tout.map((l) => l[j].length)))
  return py(tout.map((l) => l.map((x, j) => x.padEnd(w[j])).join('   ').trimEnd()))
}
/** Étiquettes de la colonne « tour » : entrée, 1, 2, …, n (sortie). */
const tours = (n: number) => ['entrée', ...Array.from({ length: n }, (_, i) => (i === n - 1 ? `${i + 1} (sortie)` : `${i + 1}`))]

type Vf = { e: string; rep: boolean; ex: string[] }
const vfPioche = (id: string, section: string, titre: string, source: string, refCours: string, pioche: (r: Rng) => Vf[]): Gabarit => ({
  id,
  chapitre: 'info',
  section,
  niveau: 1,
  titre,
  source,
  refCours,
  generer(r) {
    const x = r.pick(pioche(r))
    return { type: 'vf', enonce: x.e, reponse: x.rep, explication: x.ex.join('\n') }
  },
})

// =====================================================================================
// s1 — Expressions, types, opérateurs
// =====================================================================================

const divisions: Gabarit = {
  id: 'in-division',
  chapitre: 'info',
  section: 'info.s1',
  niveau: 1,
  titre: 'Division entière //, reste %, division flottante /',
  source: C1,
  refCours: 'cours 1 : expressions composées, opérateurs arithmétiques',
  generer(r) {
    const b = r.int(2, 9)
    let a: number
    do a = r.int(7, 60)
    while (a % b === 0)
    const cas = r.int(0, 5)
    const COURS = T`[cours] Deux divisions en Python : ${c('//')} est la **division entière** (euclidienne, résultat ${c('int')}), ${c('/')} est la **division flottante** (résultat ${c('float')}, toujours). Le **reste** de la division euclidienne s'obtient avec ${c('%')} (modulo).`
    if (cas === 0)
      return {
        type: 'num',
        enonce: `Que vaut l'expression Python ${c(`${a} // ${b}`)} ?`,
        reponse: div(a, b),
        explication: [COURS, T`[calcul] $${a}=${b}\times${div(a, b)}+${mod(a, b)}$ : le quotient est $${div(a, b)}$.`, T`[resultat] ${c(div(a, b))}`, `[piege] ${c(`${a} / ${b}`)} donnerait le flottant ${c(fl(a / b))} : ce n'est pas la même opération.`].join('\n'),
      }
    if (cas === 1)
      return {
        type: 'num',
        enonce: `Que vaut l'expression Python ${c(`${a} % ${b}`)} ?`,
        reponse: mod(a, b),
        explication: [COURS, T`[calcul] $${a}=${b}\times${div(a, b)}+${mod(a, b)}$ : le reste est $${mod(a, b)}$.`, T`[resultat] ${c(mod(a, b))}`, `[piege] ${c('%')} n'est pas un pourcentage. Le reste est toujours compris entre 0 et ${b - 1}.`].join('\n'),
      }
    if (cas === 2) {
      const d = r.pick([2, 4, 5, 8])
      const n = r.int(3, 40)
      return {
        type: 'num',
        enonce: `Que vaut l'expression Python ${c(`${n} / ${d}`)} ?`,
        reponse: n / d,
        explication: [COURS, T`[calcul] $\frac{${n}}{${d}}=${String(n / d).replace('.', '{,}')}$`, T`[resultat] ${c(fl(n / d))} (un ${c('float')}, même quand la division tombe juste : ${c('6 / 2')} vaut ${c('3.0')}).`, `[piege] Confondre avec ${c(`${n} // ${d}`)}, qui vaut ${c(div(n, d))}.`].join('\n'),
      }
    }
    if (cas === 3)
      return {
        type: 'num',
        enonce: `Que vaut l'expression Python ${c(`-${a} // ${b}`)} ?`,
        reponse: div(-a, b),
        explication: [
          COURS,
          T`[calcul] La division entière arrondit **vers le bas** (vers $-\infty$) : $\frac{-${a}}{${b}}\approx${(-a / b).toFixed(2).replace('.', '{,}')}$, donc le quotient est $${div(-a, b)}$. On a bien $-${a}=${b}\times(${div(-a, b)})+${mod(-a, b)}$ avec un reste entre $0$ et $${b - 1}$.`,
          T`[resultat] ${c(div(-a, b))}`,
          `[piege] Ce n'est pas ${c(-div(a, b))} : Python ne tronque pas, il prend la partie entière (comme en maths, TD3 ex 15).`,
        ].join('\n'),
      }
    if (cas === 4) {
      const [x, n] = [r.int(2, 5), r.int(2, 4)]
      return {
        type: 'num',
        enonce: `Que vaut l'expression Python ${c(`${x} ** ${n}`)} ?`,
        reponse: x ** n,
        explication: [T`[cours] ${c('**')} est l'opérateur **puissance** : ${c('x ** n')} calcule $x^n$.`, T`[calcul] $${x}^{${n}}=${x ** n}$`, T`[resultat] ${c(x ** n)}`, `[piege] Ce n'est ni ${c(`${x} * ${n}`)} (qui vaut ${c(x * n)}), ni l'opérateur ${c('^')} des mathématiques.`].join('\n'),
      }
    }
    return {
      type: 'num',
      enonce: `Que vaut l'expression Python ${c(`(${a} // ${b}) * ${b} + ${a} % ${b}`)} ?`,
      reponse: a,
      explication: [COURS, T`[calcul] C'est la division euclidienne : $${a}=q\times${b}+r$ avec $q=${div(a, b)}$ (${c('//')}) et $r=${mod(a, b)}$ (${c('%')}). Donc $${div(a, b)}\times${b}+${mod(a, b)}$.`, T`[resultat] ${c(a)}`, `[piege] Aucun : on retrouve toujours le nombre de départ, c'est la définition du quotient et du reste.`].join('\n'),
    }
  },
}

const priorites: Gabarit = {
  id: 'in-priorite',
  chapitre: 'info',
  section: 'info.s1',
  niveau: 1,
  titre: 'Évaluer une expression arithmétique',
  source: C1,
  refCours: 'cours 1 : évaluation des expressions arithmétiques',
  generer(r) {
    const [a, b, k, d] = [r.int(2, 9), r.int(2, 9), r.int(2, 5), r.int(2, 4)]
    const [e, f] = [r.int(1, 5), r.int(1, 9)]
    const A = b * r.int(10, 60)
    const L: { ex: string; val: number; aff?: string; etapes: string }[] = [
      { ex: `${a} + ${b} * ${k}`, val: a + b * k, etapes: `${c(`${b} * ${k}`)} d'abord (${b * k}), puis l'addition.` },
      { ex: `(${a} + ${b}) * ${k}`, val: (a + b) * k, etapes: `La parenthèse d'abord (${a + b}), puis le produit.` },
      { ex: `${a * 7} - ${b * 5} // ${k}`, val: a * 7 - div(b * 5, k), etapes: `${c(`${b * 5} // ${k}`)} d'abord (${div(b * 5, k)}), puis la soustraction.` },
      { ex: `${a} * ${b} % ${k}`, val: mod(a * b, k), etapes: `${c('*')} et ${c('%')} ont la même priorité : de gauche à droite, ${c(`${a} * ${b}`)} vaut ${a * b}, puis ${c(`${a * b} % ${k}`)}.` },
      { ex: `${a} + ${b} ** 2`, val: a + b * b, etapes: `La puissance d'abord (${b * b}), puis l'addition.` },
      { ex: `${A} / ${b} * (${k} + ${d})`, val: (A / b) * (k + d), aff: fl((A / b) * (k + d)), etapes: `La parenthèse vaut ${k + d} ; puis de gauche à droite : ${c(`${A} / ${b}`)} vaut ${fl(A / b)}, multiplié par ${k + d}.` },
      { ex: `-${a} ** 2`, val: -a * a, etapes: `La puissance est prioritaire sur le signe moins : on calcule ${c(`${a} ** 2`)} (${a * a}), puis l'opposé.` },
      { ex: `${a * 5 + 1} % ${k} + ${b * 3} // ${d}`, val: mod(a * 5 + 1, k) + div(b * 3, d), etapes: `${c(`${a * 5 + 1} % ${k}`)} vaut ${mod(a * 5 + 1, k)} et ${c(`${b * 3} // ${d}`)} vaut ${div(b * 3, d)} ; on additionne à la fin.` },
      { ex: `(${a} + ${b}) * (max(${k}, ${a}) - ${e}) - ${f}`, val: (a + b) * (Math.max(k, a) - e) - f, etapes: `Sous-expressions de gauche à droite : ${c(`${a} + ${b}`)} vaut ${a + b} ; ${c(`max(${k}, ${a})`)} vaut ${Math.max(k, a)}, moins ${e} donne ${Math.max(k, a) - e} ; produit ${(a + b) * (Math.max(k, a) - e)} ; enfin on retranche ${f}.` },
    ]
    const it = r.pick(L)
    return {
      type: 'num',
      enonce: `Que vaut l'expression Python ${c(it.ex)} ?`,
      reponse: it.val,
      explication: [
        T`[cours] **Principe d'évaluation** (cours 1) : on évalue d'abord les sous-expressions, de gauche à droite. Priorités standard, comme en maths : parenthèses, puis ${c('**')}, puis ${c('*')} ${c('/')} ${c('//')} ${c('%')}, puis ${c('+')} ${c('-')}.`,
        `[calcul] ${it.etapes}`,
        `[resultat] ${c(it.aff ?? it.val)}`,
        `[piege] Les parenthèses changent le terme construit : ${c('208 / 2 * (2 + 2)')} vaut ${c('416.0')} mais ${c('208 / (2 * (2 + 2))')} vaut ${c('26.0')}.`,
      ].join('\n'),
    }
  },
}

const TYPES = ['int', 'float', 'bool', 'str'].map(c)

const types: Gabarit = {
  id: 'in-type',
  chapitre: 'info',
  section: 'info.s1',
  niveau: 1,
  titre: 'Type d’une expression',
  source: C1,
  refCours: 'cours 1 : types d’expressions atomiques, typage',
  generer(r) {
    const [a, b] = [r.int(2, 9), r.int(2, 9)]
    const L: { ex: string; t: number; pq: string }[] = [
      { ex: `${a * b + 1} // ${b}`, t: 0, pq: `${c('//')} prend deux entiers et rend un entier.` },
      { ex: `${a * b + 1} / ${b}`, t: 1, pq: `${c('/')} rend toujours un flottant.` },
      { ex: `${a * b} / ${b}`, t: 1, pq: `${c('/')} rend toujours un flottant, même quand la division tombe juste : ici ${c(fl(a))}.` },
      { ex: `${a} + ${b}.0`, t: 1, pq: `L'entier est converti en flottant (${c('int')} est un sous-type de ${c('float')}) : le résultat est un flottant.` },
      { ex: `"${a}" + "${b}"`, t: 3, pq: `Entre guillemets, ce sont des chaînes : ${c('+')} les colle, ce qui donne ${c(`"${a}${b}"`)}.` },
      { ex: `${a} == ${a}.0`, t: 2, pq: `Une comparaison est une expression booléenne (ici ${c('True')}).` },
      { ex: `not (${a} > ${b})`, t: 2, pq: `${c('not')} s'applique à un booléen et rend un booléen.` },
      { ex: `${a} ** ${b}`, t: 0, pq: `Une puissance d'entiers (exposant positif) est un entier.` },
      { ex: `${a * b + 1} % ${b}`, t: 0, pq: `Le reste d'une division euclidienne est un entier.` },
      { ex: `${a}.5 * 2`, t: 1, pq: `Dès qu'un opérande est flottant, le résultat l'est : ${c(fl(a * 2 + 1))}.` },
      { ex: `x >= 0`, t: 2, pq: `Une comparaison est de type ${c('bool')}, quelle que soit la valeur de ${c('x')}.` },
      { ex: `math.sqrt(${a * a})`, t: 1, pq: `La spécification est ${c('math.sqrt(x: float) -> float')} : le résultat est ${c(fl(a))}, pas ${c(a)}.` },
      { ex: `max(${a}, ${b})`, t: 0, pq: `Le plus grand de deux entiers est un entier.` },
      { ex: `"bon" + "jour"`, t: 3, pq: `Concaténation de deux chaînes de caractères.` },
      { ex: `(${a} > ${b}) and (${b} != 0)`, t: 2, pq: `${c('and')} combine deux booléens en un booléen.` },
      { ex: `"${a} + ${b}"`, t: 3, pq: `Les guillemets en font un **texte** : rien n'est calculé.` },
    ]
    const it = r.pick(L)
    const choix = r.shuffle(TYPES)
    return {
      type: 'qcm',
      enonce: `Quel est le type de l'expression Python ${c(it.ex)} ?`,
      choix,
      reponse: choix.indexOf(TYPES[it.t]),
      explication: [
        T`[cours] Un **type** renseigne sur la nature d'une expression (cours 1) : ${c('bool')} (${c('True')}, ${c('False')}), ${c('int')} (entiers), ${c('float')} (nombres à virgule), ${c('str')} (chaînes entre guillemets). Les entiers sont convertis en flottants si nécessaire.`,
        `[calcul] ${it.pq}`,
        `[resultat] ${TYPES[it.t]}`,
        `[piege] ${c('/')} donne toujours un ${c('float')}, ${c('//')} un ${c('int')} ; et ${c('"3"')} n'est pas le nombre ${c('3')}.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s2 — Fonctions : spécification, appel, return
// =====================================================================================

const appels: Gabarit = {
  id: 'in-appel',
  chapitre: 'info',
  section: 'info.s2',
  niveau: 1,
  titre: 'Évaluer un appel de fonction',
  source: C1,
  refCours: 'cours 1 : définition de fonctions, principe d’évaluation d’une application',
  generer(r) {
    const [p, q, k, m] = [r.int(1, 6), r.int(2, 9), r.int(1, 5), r.int(2, 4)]
    const [a, b, x] = [r.int(2, 4), r.int(1, 6), r.int(1, 5)]
    const L: { code: string[]; ex: string; val: number; aff?: string; etapes: string }[] = [
      {
        code: ['def perimetre(largeur: int, longueur: int) -> int:', '    """Précondition : (longueur >= 0) and (largeur >= 0)', '    retourne le périmètre du rectangle."""', '    return 2 * (largeur + longueur)'],
        ex: `${k} + ${m} * perimetre(${p}, ${q})`,
        val: k + m * 2 * (p + q),
        etapes: `${c(`perimetre(${p}, ${q})`)} vaut ${c(`2 * (${p} + ${q})`)}, soit ${2 * (p + q)}. L'appel est **remplacé par sa valeur** : ${c(`${k} + ${m} * ${2 * (p + q)}`)}.`,
      },
      {
        code: ['def carre(x: int) -> int:', '    return x * x', '', 'def ecart(n: int) -> int:', '    return carre(n + 1) - carre(n)'],
        ex: `ecart(${q})`,
        val: 2 * q + 1,
        etapes: `${c(`carre(${q + 1})`)} vaut ${(q + 1) ** 2} et ${c(`carre(${q})`)} vaut ${q * q} : une fonction peut en appeler une autre. Différence : ${(q + 1) ** 2} - ${q * q}.`,
      },
      {
        code: ['def moyenne(a: float, b: float) -> float:', '    """retourne la moyenne de a et b."""', '    return (a + b) / 2'],
        ex: `moyenne(${2 * p}, moyenne(${2 * q}, ${2 * q + 4 * k}))`,
        val: (2 * p + 2 * q + 2 * k) / 2,
        aff: fl((2 * p + 2 * q + 2 * k) / 2),
        etapes: `On évalue d'abord les **arguments** : ${c(`moyenne(${2 * q}, ${2 * q + 4 * k})`)} vaut ${fl(2 * q + 2 * k)}. Puis ${c(`moyenne(${2 * p}, ${fl(2 * q + 2 * k)})`)}.`,
      },
      {
        code: [`def f(x: int) -> int:`, `    return ${a} * x + ${b}`],
        ex: `f(f(${x}))`,
        val: a * (a * x + b) + b,
        etapes: `L'argument d'abord : ${c(`f(${x})`)} vaut ${a * x + b}. Puis ${c(`f(${a * x + b})`)} vaut ${c(`${a} * ${a * x + b} + ${b}`)}.`,
      },
      {
        code: [`def f(x: int, y: int) -> int:`, `    return x - ${a} * y`],
        ex: `f(${q}, ${p}) + f(${p}, ${q})`,
        val: q - a * p + (p - a * q),
        etapes: `L'ordre des arguments compte : ${c(`f(${q}, ${p})`)} vaut ${q - a * p} (x reçoit ${q}, y reçoit ${p}) et ${c(`f(${p}, ${q})`)} vaut ${p - a * q}.`,
      },
    ]
    const it = r.pick(L)
    return {
      type: 'num',
      enonce: `Que vaut l'expression ${c(it.ex)} ?\n${py(it.code)}`,
      reponse: it.val,
      explication: [
        T`[cours] **Évaluer ${c('fun(arg1, ..., argn)')}** (cours 1) : (1) on évalue les arguments, dans l'ordre ; (2) on exécute le corps en remplaçant les paramètres par ces valeurs ; (3) la valeur du ${c('return')} est renvoyée à l'appelant, qui **remplace l'appel par cette valeur**.`,
        `[calcul] ${it.etapes}`,
        `[resultat] ${c(it.aff ?? it.val)}`,
        `[piege] Les paramètres reçoivent les arguments **dans l'ordre** où ils sont écrits, pas selon leur nom.`,
      ].join('\n'),
    }
  },
}

const printReturn: Gabarit = {
  id: 'in-print-return',
  chapitre: 'info',
  section: 'info.s2',
  niveau: 2,
  titre: 'print ou return ?',
  source: C2,
  refCours: 'cours 2 : effets de bord, différence entre print et return',
  generer(r) {
    const a = r.int(2, 30)
    const k = r.int(2, 5)
    const avecReturn = r.bool()
    const code = ['def h2(x: int) -> int:', '    return x + 1', '', 'def h3(x: int) -> None:', '    print(x + 1)']
    const f = avecReturn ? 'h2' : 'h3'
    const bon = avecReturn ? `La valeur ${1 + k * (a + 1)}` : 'Une erreur : on ne peut pas multiplier `None`'
    const leurres = [`La valeur ${1 + k * (a + 1)}`, 'Une erreur : on ne peut pas multiplier `None`', `La valeur ${1 + k * a}`, `La valeur ${a + 1}`, '`None`']
    const { choix, reponse } = choixQcm(r, bon, leurres)
    return {
      type: 'qcm',
      enonce: `Que donne l'évaluation de ${c(`1 + ${k} * ${f}(${a})`)} ?\n${py(code)}`,
      choix,
      reponse,
      explication: [
        T`[cours] (cours 2) ${c('return')} **renvoie** une valeur à l'appelant, qui peut l'utiliser dans un calcul. ${c('print')} **affiche** à l'écran (un *effet de bord*) et ne renvoie rien : sa valeur de retour est ${c('None')}.`,
        avecReturn
          ? `[calcul] ${c(`h2(${a})`)} renvoie ${a + 1} ; l'appel est remplacé par cette valeur : ${c(`1 + ${k} * ${a + 1}`)}.`
          : `[calcul] ${c(`h3(${a})`)} affiche ${a + 1} à l'écran, mais renvoie ${c('None')}. L'expression devient ${c(`1 + ${k} * None`)}, ce qui n'a pas de sens.`,
        `[resultat] ${bon}`,
        `[piege] Une fonction qui « affiche le bon résultat » dans la console n'est pas forcément correcte : si la spécification annonce ${c('-> int')}, il faut un ${c('return')}.`,
      ].join('\n'),
    }
  },
}

const specVf = vfPioche('in-spec-vf', 'info.s2', 'Vrai / faux : spécification, tests, vocabulaire', `${C1} et 2`, 'cours 1 : spécification, implémentation, validation', (r) => {
  const n = r.int(2, 9)
  const SP = T`[cours] Définir une fonction (cours 1) : **1. Spécification** (en-tête avec les types, préconditions, description) ; **2. Implémentation** (le corps : l'algorithme) ; **3. Validation** (un jeu de tests avec ${c('assert')}).`
  const EX = T`[cours] Une **expression** s'évalue en une valeur ; une **instruction** est un ordre donné à la machine : elle s'interprète et n'a pas de valeur (cours 1).`
  return [
    { e: `La spécification d'une fonction comprend son en-tête (nom, paramètres typés, type du résultat), ses préconditions et une description.`, rep: true, ex: [SP, `[resultat] ${OKVF(true)}`] },
    { e: `La ligne ${c(`assert perimetre(2, ${n}) == ${2 * (2 + n)}`)} fait partie de l'implémentation de la fonction ${c('perimetre')}.`, rep: false, ex: [SP, `[resultat] ${OKVF(false)} C'est un **test** : il appartient à la validation, écrite après la fonction.`] },
    { e: `Si un appel ne respecte pas les préconditions, le programmeur de la fonction ne garantit plus le résultat.`, rep: true, ex: [T`[cours] Une **précondition** est une expression logique que doivent vérifier les paramètres. C'est un contrat : le bon fonctionnement n'est garanti que si elle est satisfaite (cours 1).`, `[resultat] ${OKVF(true)} Exemple : ${c('math.sqrt(x)')} avec la précondition ${c('x >= 0')}.`] },
    { e: `Dans le corps d'une fonction, les instructions placées après un ${c('return')} qui a été exécuté sont quand même exécutées.`, rep: false, ex: [T`[cours] **Interprétation de ${c('return expr')}** : on évalue ${c('expr')}, puis on **sort de la fonction** avec cette valeur (cours 1).`, `[resultat] ${OKVF(false)} C'est ce qui permet la « sortie anticipée » dans une alternative.`] },
    { e: `Un prédicat est une fonction qui renvoie un booléen.`, rep: true, ex: [T`[cours] **Prédicat** (cours 1) : fonction dont le résultat est de type ${c('bool')}, par exemple ${c('est_divisible(n, d)')}. Les conditions des alternatives y font souvent appel.`, `[resultat] ${OKVF(true)}`] },
    { e: `Une fonction dont le paramètre est annoncé de type ${c('float')} peut être appelée avec l'entier ${c(n)}.`, rep: true, ex: [T`[cours] **Sous-typage** (cours 1) : ${c('int')} est un sous-type de ${c('float')}. Là où un ${c('float')} est attendu, un ${c('int')} convient.`, `[resultat] ${OKVF(true)}`] },
    { e: `Une fonction dont le paramètre est annoncé de type ${c('int')} peut être appelée avec ${c(`${n}.5`)}.`, rep: false, ex: [T`[cours] **Sous-typage** (cours 1) : ${c('int')} est un sous-type de ${c('float')}, pas l'inverse. « Si j'ai besoin d'un poisson, je ne peux pas forcément prendre un serpent. »`, `[resultat] ${OKVF(false)}`] },
    { e: `Pour évaluer ${c('f(e1, e2)')}, Python évalue d'abord ${c('e1')}, puis ${c('e2')}, puis exécute le corps de ${c('f')}.`, rep: true, ex: [T`[cours] Principe d'évaluation d'une application (cours 1) : arguments d'abord, **de gauche à droite**, puis le corps, puis la valeur de retour est renvoyée à l'appelant.`, `[resultat] ${OKVF(true)}`] },
    { e: `${c('return x + 1')} est une expression.`, rep: false, ex: [EX, `[resultat] ${OKVF(false)} C'est une **instruction** ; elle contient l'expression ${c('x + 1')}.`] },
    { e: `La valeur de retour de ${c('print("bonjour")')} est ${c('None')}.`, rep: true, ex: [T`[cours] ${c('print')} fait un **effet de bord** (un affichage) et ne renvoie rien : en Python, ${c('None')} (cours 2).`, `[resultat] ${OKVF(true)}`] },
    { e: `Le code ${c('if cond: return True')} / ${c('else: return False')} peut s'écrire plus simplement ${c('return cond')}.`, rep: true, ex: [T`[cours] Raccourcis (cours 2) : une condition **est déjà** un booléen. De même ${c('if cond: return False else: return True')} devient ${c('return not cond')}.`, `[resultat] ${OKVF(true)}`] },
    { e: `Dans le cadre du cours, une fonction peut lire et modifier une variable définie en dehors d'elle (variable globale).`, rep: false, ex: [T`[cours] (cours 2) Les variables définies hors des fonctions sont en fait des **constantes** : elles ne sont ni accessibles dans les fonctions ni modifiables. Elles servent aux tests.`, `[resultat] ${OKVF(false)} Une fonction ne travaille que sur ses paramètres et ses variables locales.`] },
    { e: `En Python, le corps d'une fonction est délimité par l'indentation.`, rep: true, ex: [T`[cours] L'en-tête est introduit par ${c('def')} et se termine par ${c(':')} ; le corps est **indenté** (4 espaces). Les erreurs d'indentation sont parmi les plus fréquentes (cours 1).`, `[resultat] ${OKVF(true)}`] },
    { e: `Une fonction « termine » quand son exécution finit par s'arrêter sur toutes ses entrées.`, rep: true, ex: [T`[cours] **Terminaison** (cours 2) : ${c('f')} termine sur l'entrée ${c('e')} si l'exécution de ${c('f(e)')} s'arrête ; elle termine si c'est vrai pour toutes ses entrées.`, `[resultat] ${OKVF(true)} Sans boucle, toutes les fonctions terminent ; avec ${c('while')}, ce n'est plus garanti.`] },
  ]
})

// =====================================================================================
// s3 — Variables et affectations
// =====================================================================================

const variables: Gabarit = {
  id: 'in-variables',
  chapitre: 'info',
  section: 'info.s3',
  niveau: 1,
  titre: 'Suivre des affectations',
  source: C1,
  refCours: 'cours 1 : variables, occurrence et réaffectation',
  generer(r) {
    const [A, B, X, Y] = [r.int(20, 70), r.int(3, 18), r.int(2, 9), r.int(11, 19)]
    const D = r.int(2, 5)
    const L: { code: string[]; val: number; cols: string[]; lignes: (string | number)[][]; piege: string }[] = [
      {
        code: ['def essai_var() -> int:', '    n: int = 0', `    m: int = ${A}`, `    n = m - ${B}`, '    m = m + 1', '    return n + m'],
        val: A - B + A + 1,
        cols: ['étape', 'n', 'm'],
        lignes: [['n: int = 0', 0, '-'], [`m: int = ${A}`, 0, A], [`n = m - ${B}`, A - B, A], ['m = m + 1', A - B, A + 1]],
        piege: `Quand ${c('m')} change, ${c('n')} ne change pas : une variable contient une **valeur**, pas un calcul.`,
      },
      {
        code: ['def echange() -> int:', `    a: int = ${X}`, `    b: int = ${Y}`, '    a = b', '    b = a', '    return a + b'],
        val: 2 * Y,
        cols: ['étape', 'a', 'b'],
        lignes: [[`a: int = ${X}`, X, '-'], [`b: int = ${Y}`, X, Y], ['a = b', Y, Y], ['b = a', Y, Y]],
        piege: `Ce code n'échange pas les valeurs : après ${c('a = b')}, l'ancienne valeur de ${c('a')} est **perdue**. Il faut une troisième variable.`,
      },
      {
        code: ['def echange2() -> int:', `    a: int = ${X}`, `    b: int = ${Y}`, '    tmp: int = a', '    a = b', '    b = tmp', '    return a - b'],
        val: Y - X,
        cols: ['étape', 'a', 'b', 'tmp'],
        lignes: [[`b: int = ${Y}`, X, Y, '-'], ['tmp: int = a', X, Y, X], ['a = b', Y, Y, X], ['b = tmp', Y, X, X]],
        piege: `La variable ${c('tmp')} sauvegarde l'ancienne valeur de ${c('a')} avant qu'elle soit écrasée.`,
      },
      {
        code: ['def f() -> int:', `    x: int = ${X}`, '    y: int = x * 2', `    x = x + ${B}`, '    return y'],
        val: 2 * X,
        cols: ['étape', 'x', 'y'],
        lignes: [[`x: int = ${X}`, X, '-'], ['y: int = x * 2', X, 2 * X], [`x = x + ${B}`, X + B, 2 * X]],
        piege: `${c('y')} a reçu la valeur ${2 * X} au moment de sa définition ; modifier ${c('x')} ensuite ne la recalcule pas.`,
      },
      {
        code: ['def g() -> int:', `    x: int = ${D}`, '    x = x + x', '    x = x * x', '    return x'],
        val: (2 * D) ** 2,
        cols: ['étape', 'x'],
        lignes: [[`x: int = ${D}`, D], ['x = x + x', 2 * D], ['x = x * x', (2 * D) ** 2]],
        piege: `Dans ${c('x = x * x')}, on évalue d'abord la partie droite avec l'**ancienne** valeur de ${c('x')}, puis on range le résultat.`,
      },
      {
        code: ['def h(a: int, b: int) -> int:', '    r: int = a % b', '    a = a // b', '    return a * b + r', '', `# appel : h(${A}, ${D})`],
        val: A,
        cols: ['étape', 'a', 'b', 'r'],
        lignes: [['(paramètres)', A, D, '-'], ['r: int = a % b', A, D, mod(A, D)], ['a = a // b', div(A, D), D, mod(A, D)]],
        piege: `Les paramètres sont des cases mémoire comme les autres : ils reçoivent les arguments de l'appel et peuvent être réaffectés.`,
      },
    ]
    const it = r.pick(L)
    const estH = it.code[0].startsWith('def h(')
    return {
      type: 'num',
      enonce: `${estH ? `Que renvoie l'appel ${c(`h(${A}, ${D})`)} ?` : `Que renvoie l'appel de cette fonction ?`}\n${py(it.code)}`,
      reponse: it.val,
      indice: 'Fais un tableau : une colonne par variable, une ligne par instruction.',
      explication: [
        T`[cours] Une **variable** est une case mémoire locale à la fonction (cours 1). **Réaffectation** ${c('var = expr')} : (1) on évalue ${c('expr')} ; (2) on remplace le contenu de ${c('var')} par cette valeur. Le signe ${c('=')} n'est **pas symétrique**.`,
        `[calcul] Tableau des variables après chaque instruction :`,
        table(it.cols, it.lignes),
        `[resultat] La fonction renvoie ${c(it.val)}.`,
        `[piege] ${it.piege}`,
      ].join('\n'),
    }
  },
}

const variablesVf = vfPioche('in-var-vf', 'info.s3', 'Vrai / faux : variables, noms, affectation', C1, 'cours 1 : variables, définition, nommage', (r) => {
  const n = r.int(2, 9)
  const NOM = T`[cours] **Nommer les variables** (cours 1, PEP8) : des mots en minuscules séparés par ${c('_')}, des chiffres autorisés à la fin, et un nom **explicite** (${c('demi_perimetre')} plutôt que ${c('s')}). Bons : ${c('compteur')}, ${c('plus_grand_nombre')}, ${c('calcul1')}.`
  const DEF = T`[cours] **Définition** d'une variable (cours 1) : ${c('var: type = expr')}. Elle déclare la variable (son type) et l'initialise. Toutes les variables sont définies **en début de fonction**.`
  return [
    { e: `D'après les règles du cours, ${c('plus_grand_nombre')} est un bon nom de variable.`, rep: true, ex: [NOM, `[resultat] ${OKVF(true)}`] },
    { e: `D'après les règles du cours, ${c('Compteur')} est un bon nom de variable.`, rep: false, ex: [NOM, `[resultat] ${OKVF(false)} Pas de majuscule : ${c('compteur')}.`] },
    { e: `${c('1calcul')} est un nom de variable valide en Python.`, rep: false, ex: [NOM, `[resultat] ${OKVF(false)} Un nom ne peut pas **commencer** par un chiffre ; ${c('calcul1')} est correct.`] },
    { e: `D'après les règles du cours, ${c('plusgrandnombre')} est un bon nom de variable.`, rep: false, ex: [NOM, `[resultat] ${OKVF(false)} Il est accepté par Python mais illisible : on sépare les mots par ${c('_')}.`] },
    { e: `L'instruction ${c(`total: int = ${n}`)} déclare la variable ${c('total')} et lui donne sa première valeur.`, rep: true, ex: [DEF, `[resultat] ${OKVF(true)}`] },
    { e: `Les instructions ${c(`x = ${n}`)} et ${c(`${n} = x`)} sont équivalentes.`, rep: false, ex: [T`[cours] Le ${c('=')} de l'affectation **n'est pas symétrique** (cours 1) : à gauche une variable (la case où ranger), à droite une expression (la valeur à ranger).`, `[resultat] ${OKVF(false)} ${c(`${n} = x`)} est une erreur.`] },
    { e: `${c('x = x + 1')} est une instruction valide : elle augmente de 1 le contenu de ${c('x')}.`, rep: true, ex: [T`[cours] **Réaffectation** (cours 1) : on évalue d'abord ${c('x + 1')} avec la valeur actuelle de ${c('x')}, puis on range le résultat dans ${c('x')}.`, `[resultat] ${OKVF(true)} Ce n'est pas une équation mathématique.`] },
    { e: `${c('x == 3')} modifie la valeur de ${c('x')}.`, rep: false, ex: [T`[cours] Ne pas confondre l'**affectation** ${c('=')} (instruction) et l'**égalité** ${c('==')} (expression booléenne) (cours 1).`, `[resultat] ${OKVF(false)} ${c('x == 3')} teste si ${c('x')} vaut 3 et s'évalue en ${c('True')} ou ${c('False')}.`] },
    { e: `Après ${c(`n: int = ${n}`)} puis ${c('m: int = n')} puis ${c('n = 0')}, la variable ${c('m')} vaut ${c(0)}.`, rep: false, ex: [T`[cours] Une variable contient une **valeur**, pas un lien vers une autre variable (cours 1).`, `[calcul] ${c('m')} a reçu la valeur ${n} ; modifier ${c('n')} ensuite ne change pas ${c('m')}.`, `[resultat] ${OKVF(false)} ${c('m')} vaut ${c(n)}.`] },
    { e: `Dans l'expression ${c('s * (s - a) * (s - b)')}, il y a trois occurrences de la variable ${c('s')}.`, rep: true, ex: [T`[cours] Une **occurrence** est une utilisation (lecture) de la variable dans une expression ; elle s'évalue en la valeur contenue à ce moment-là (cours 1).`, `[resultat] ${OKVF(true)}`] },
    { e: `Une variable définie dans une fonction est utilisable dans les autres fonctions du fichier.`, rep: false, ex: [T`[cours] Une variable est une case mémoire **locale à une fonction** (cours 1) : elle vit sur la pile, le temps de l'appel.`, `[resultat] ${OKVF(false)}`] },
  ]
})

// =====================================================================================
// s4 — Alternatives et booléens
// =====================================================================================

const alternatives: Gabarit = {
  id: 'in-alternative',
  chapitre: 'info',
  section: 'info.s4',
  niveau: 1,
  titre: 'Suivre une alternative if / elif / else',
  source: `${C1} et 2`,
  refCours: 'cours 1 : alternative, alternatives multiples · cours 2 : conditionnelle sans alternant',
  generer(r) {
    const cas = r.int(0, 3)
    const COURS = T`[cours] **Alternative multiple** (cours 1) : on évalue ${c('condition1')} ; si elle vaut ${c('True')} on exécute **uniquement** son conséquent, sinon on passe à la condition suivante ; l'alternant (${c('else')}) n'est exécuté que si toutes les conditions sont fausses. **Une seule branche** est exécutée.`
    if (cas === 0) {
      const s1 = r.pick([4, 12, 18])
      const s2 = s1 + r.pick([8, 14, 47])
      const [v1, v2, v3] = [r.int(0, 5), r.int(6, 10), r.int(11, 16)]
      const age = r.pick([s1 - 1, s1, s1 + 1, s2 - 1, s2, s2 + 3])
      const val = age < s1 ? v1 : age < s2 ? v2 : v3
      const branche = age < s1 ? `${c(`age < ${s1}`)} vaut ${c('True')} : on renvoie ${v1}` : age < s2 ? `${c(`age < ${s1}`)} vaut ${c('False')}, puis ${c(`age < ${s2}`)} vaut ${c('True')} : on renvoie ${v2}` : `les deux conditions valent ${c('False')} : on exécute l'alternant et on renvoie ${v3}`
      return {
        type: 'num',
        enonce: `Que renvoie ${c(`tarif(${age})`)} ?\n${py(['def tarif(age: int) -> int:', '    """Précondition : age >= 0"""', `    if age < ${s1}:`, `        return ${v1}`, `    elif age < ${s2}:`, `        return ${v2}`, '    else:', `        return ${v3}`])}`,
        reponse: val,
        explication: [COURS, `[calcul] Avec ${c(`age = ${age}`)} : ${branche}.`, `[resultat] ${c(val)}`, `[piege] Aux valeurs limites, regarder si l'inégalité est **stricte** : ${c(`${s1} < ${s1}`)} vaut ${c('False')}.`].join('\n'),
      }
    }
    if (cas === 1) {
      const [a, b] = [r.pick([1, 1, 2]), r.int(-6, 6)]
      const cc = r.pick([Math.floor((b * b) / (4 * a)), r.int(-4, 9), (b * b) % (4 * a) === 0 ? (b * b) / (4 * a) : 1])
      const delta = b * b - 4 * a * cc
      const val = delta > 0 ? 2 : delta === 0 ? 1 : 0
      return {
        type: 'num',
        enonce: `Que renvoie ${c(`nb_solutions(${a}, ${b}, ${cc})`)} ?\n${py(['def nb_solutions(a: float, b: float, c: float) -> int:', '    """donne le nombre de solutions de a*x^2 + b*x + c = 0"""', '    delta: float = b * b - 4 * a * c', '    if delta > 0:', '        return 2', '    elif delta == 0:', '        return 1', '    else:', '        return 0'])}`,
        reponse: val,
        explication: [COURS, T`[calcul] ${c('delta')} vaut $${b < 0 ? `(${b})` : b}^2-4\times${a}\times${cc < 0 ? `(${cc})` : cc}=${delta}$. ${delta > 0 ? `${c('delta > 0')} vaut ${c('True')}.` : delta === 0 ? `${c('delta > 0')} vaut ${c('False')}, puis ${c('delta == 0')} vaut ${c('True')}.` : `Les deux conditions valent ${c('False')} : alternant.`}`, `[resultat] ${c(val)}`, `[piege] La variable ${c('delta')} est calculée **une seule fois**, avant l'alternative, puis réutilisée.`].join('\n'),
      }
    }
    if (cas === 2) {
      const k = r.int(1, 9)
      const x = r.nz(-9, 9)
      const val = Math.abs(x) + k
      return {
        type: 'num',
        enonce: `Que renvoie ${c(`f(${x})`)} ?\n${py(['def f(x: int) -> int:', '    r: int = x', '    if x < 0:', '        r = -x', `    return r + ${k}`])}`,
        reponse: val,
        explication: [
          T`[cours] **Conditionnelle sans alternant** (cours 2) : ${c('if cond:')} suivi du conséquent. Si la condition vaut ${c('False')}, on ne fait rien et on passe à la suite.`,
          `[calcul] ${c('r')} vaut d'abord ${x}. ${c(`${x} < 0`)} vaut ${c(PY(x < 0))} : ${x < 0 ? `${c('r')} devient ${-x}` : `${c('r')} n'est pas modifié`}. Le ${c('return')} n'est pas dans le ${c('if')} : il est toujours exécuté.`,
          `[resultat] ${c(val)}`,
          `[piege] L'**indentation** décide de ce qui est dans le ${c('if')} : ici seule la ligne ${c('r = -x')} en fait partie.`,
        ].join('\n'),
      }
    }
    const [s1, s2] = [r.int(2, 5), r.int(6, 12)]
    const n = r.pick([s1 - 1, s1 + 1, s2, s2 + 2])
    const elif = r.bool()
    const val = elif ? (n > s1 ? 1 : n > s2 ? 10 : 0) : (n > s1 ? 1 : 0) + (n > s2 ? 10 : 0)
    return {
      type: 'num',
      enonce: `Que renvoie ${c(`g(${n})`)} ?\n${py(['def g(n: int) -> int:', '    r: int = 0', `    if n > ${s1}:`, '        r = r + 1', `    ${elif ? 'elif' : 'if'} n > ${s2}:`, '        r = r + 10', '    return r'])}`,
      reponse: val,
      explication: [
        COURS,
        elif
          ? `[calcul] Avec ${c('elif')}, la seconde condition n'est testée **que si** la première est fausse. ${c(`${n} > ${s1}`)} vaut ${c(PY(n > s1))}${n > s1 ? ` : on fait ${c('r = r + 1')} et on saute le ${c('elif')}` : ` ; ${c(`${n} > ${s2}`)} vaut ${c(PY(n > s2))}`}.`
          : `[calcul] Deux ${c('if')} **indépendants** : les deux conditions sont testées. ${c(`${n} > ${s1}`)} vaut ${c(PY(n > s1))} ; ${c(`${n} > ${s2}`)} vaut ${c(PY(n > s2))}.`,
        `[resultat] ${c(val)}`,
        `[piege] ${c('if')} … ${c('if')} et ${c('if')} … ${c('elif')} ne font pas la même chose : avec ${c(elif ? 'if' : 'elif')} à la place, on obtiendrait ${c(elif ? (n > s1 ? 1 : 0) + (n > s2 ? 10 : 0) : n > s1 ? 1 : n > s2 ? 10 : 0)}.`,
      ].join('\n'),
    }
  },
}

const booleens: Gabarit = {
  id: 'in-bool',
  chapitre: 'info',
  section: 'info.s4',
  niveau: 1,
  titre: 'Évaluer une expression booléenne',
  source: C1,
  refCours: 'cours 1 : expressions booléennes, and, or, not, calcul paresseux',
  generer(r) {
    const [x, y, z] = [r.int(1, 9), r.int(1, 9), r.int(5, 15)]
    const [A, B, D] = [r.bool(), r.bool(), r.bool()]
    const n0 = r.pick([0, 0, 3, 4])
    const m = r.int(6, 20)
    const L: { ctx: string; ex: string; val: boolean; etapes: string }[] = [
      { ctx: `Avec ${c(`x = ${x}`)} et ${c(`y = ${y}`)}`, ex: `x < y and y % 2 == 0`, val: x < y && y % 2 === 0, etapes: `${c('x < y')} vaut ${c(PY(x < y))}${x < y ? ` ; ${c('y % 2 == 0')} vaut ${c(PY(y % 2 === 0))}` : ` : inutile d'évaluer la suite (${c('and')} paresseux)`}.` },
      { ctx: `Avec ${c(`x = ${x}`)}, ${c(`y = ${y}`)} et ${c(`z = ${z}`)}`, ex: `(x == y) or (x + y > z)`, val: x === y || x + y > z, etapes: `${c('x == y')} vaut ${c(PY(x === y))}${x === y ? ` : inutile d'évaluer la suite (${c('or')} paresseux)` : ` ; ${c('x + y > z')}, soit ${c(`${x + y} > ${z}`)}, vaut ${c(PY(x + y > z))}`}.` },
      { ctx: `Avec ${c(`x = ${x}`)} et ${c(`y = ${y}`)}`, ex: `x != y and not (x > y)`, val: x !== y && !(x > y), etapes: `${c('x != y')} vaut ${c(PY(x !== y))} ; ${c('not (x > y)')} vaut ${c(PY(!(x > y)))}.` },
      { ctx: `Avec ${c(`n = ${n0}`)} et ${c(`m = ${m}`)}`, ex: `(n == 0) or (m % n == 0)`, val: n0 === 0 || m % n0 === 0, etapes: n0 === 0 ? `${c('n == 0')} vaut ${c('True')} : le ${c('or')} renvoie ${c('True')} **sans calculer** ${c('m % n')} (qui provoquerait une division par zéro).` : `${c('n == 0')} vaut ${c('False')} ; ${c(`${m} % ${n0}`)} vaut ${m % n0}, donc ${c('m % n == 0')} vaut ${c(PY(m % n0 === 0))}.` },
      { ctx: `Avec ${c(`n = ${n0}`)} et ${c(`m = ${m}`)}`, ex: `(n != 0) and (m % n == 0)`, val: n0 !== 0 && m % n0 === 0, etapes: n0 === 0 ? `${c('n != 0')} vaut ${c('False')} : le ${c('and')} renvoie ${c('False')} **sans calculer** ${c('m % n')}.` : `${c('n != 0')} vaut ${c('True')} ; ${c(`${m} % ${n0}`)} vaut ${m % n0}, donc ${c('m % n == 0')} vaut ${c(PY(m % n0 === 0))}.` },
      { ctx: 'Sans variable', ex: `not ${PY(A)} and ${PY(B)}`, val: !A && B, etapes: `${c('not')} s'applique d'abord, à ${c(PY(A))} seulement : ${c(`${PY(!A)} and ${PY(B)}`)}.` },
      { ctx: 'Sans variable', ex: `not (${PY(A)} and ${PY(B)})`, val: !(A && B), etapes: `La parenthèse d'abord : ${c(`${PY(A)} and ${PY(B)}`)} vaut ${c(PY(A && B))}, puis ${c('not')}.` },
      { ctx: 'Sans variable', ex: `${PY(A)} or ${PY(B)} and ${PY(D)}`, val: A || (B && D), etapes: `${c('and')} est prioritaire sur ${c('or')} : c'est ${c(`${PY(A)} or (${PY(B)} and ${PY(D)})`)}.` },
      { ctx: `Avec ${c(`x = ${x}`)}`, ex: `x >= 1 and x <= 5`, val: x >= 1 && x <= 5, etapes: `${c('x >= 1')} vaut ${c(PY(x >= 1))} et ${c('x <= 5')} vaut ${c(PY(x <= 5))}.` },
    ]
    const it = r.pick(L)
    const annonce = r.bool()
    return {
      type: 'vf',
      enonce: `${it.ctx}, l'expression ${c(it.ex)} vaut ${c(PY(annonce))}.`,
      reponse: it.val === annonce,
      explication: [
        T`[cours] (cours 1) ${c('e1 and e2')} vaut ${c('True')} quand **les deux** valent ${c('True')} ; ${c('e1 or e2')} quand **au moins une** vaut ${c('True')} ; ${c('not')} inverse. **Calcul paresseux** : si ${c('e1')} suffit à conclure (${c('False')} pour ${c('and')}, ${c('True')} pour ${c('or')}), ${c('e2')} n'est **pas évaluée**.`,
        `[calcul] ${it.etapes}`,
        `[resultat] L'expression vaut ${c(PY(it.val))} : l'affirmation est ${OKVF(it.val === annonce)}.`,
        `[piege] Priorités : ${c('not')}, puis ${c('and')}, puis ${c('or')}. Et ${c('=')} (affectation) n'est pas ${c('==')} (test d'égalité).`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s5 — Boucles while, simulation
// =====================================================================================

const boucles: Gabarit = {
  id: 'in-while',
  chapitre: 'info',
  section: 'info.s5',
  niveau: 1,
  titre: 'Simuler une boucle while',
  source: C2,
  refCours: 'cours 2 : syntaxe et interprétation du while, tables de simulation',
  generer(r) {
    const cas = r.int(0, 4)
    let code: string[], appel: string, cols: string[], lignes: (string | number)[][], val: number
    if (cas === 0) {
      const n = r.int(3, 7)
      code = ['def somme_entiers(n: int) -> int:', '    """Précondition : n >= 1', '    retourne la somme des n premiers entiers naturels."""', '    i: int = 1  # entier courant', '    s: int = 0  # somme cumulée', '    while i <= n:', '        s = s + i', '        i = i + 1', '    return s']
      appel = `somme_entiers(${n})`
      cols = ['tour', 's', 'i']
      let [s, i] = [0, 1]
      lignes = [[s, i]]
      while (i <= n) {
        s += i
        i++
        lignes.push([s, i])
      }
      val = s
    } else if (cas === 1) {
      const [k, n] = [r.int(2, 4), r.int(3, 5)]
      code = ['def f(n: int) -> int:', '    """Précondition : n >= 0"""', '    i: int = 0', '    p: int = 1', '    while i < n:', `        p = p * ${k}`, '        i = i + 1', '    return p']
      appel = `f(${n})`
      cols = ['tour', 'p', 'i']
      let [p, i] = [1, 0]
      lignes = [[p, i]]
      while (i < n) {
        p *= k
        i++
        lignes.push([p, i])
      }
      val = p
    } else if (cas === 2) {
      const n = r.int(120, 9999)
      code = ['def g(n: int) -> int:', '    """Précondition : n >= 0"""', '    s: int = 0', '    m: int = n', '    while m > 0:', '        s = s + m % 10', '        m = m // 10', '    return s']
      appel = `g(${n})`
      cols = ['tour', 's', 'm']
      let [s, m] = [0, n]
      lignes = [[s, m]]
      while (m > 0) {
        s += m % 10
        m = Math.floor(m / 10)
        lignes.push([s, m])
      }
      val = s
    } else if (cas === 3) {
      const x0 = r.int(1, 5)
      const seuil = r.int(30, 200)
      code = ['def h(seuil: int) -> int:', '    """Précondition : seuil >= 1"""', `    x: int = ${x0}`, '    c: int = 0', '    while x < seuil:', '        x = x * 2', '        c = c + 1', '    return c']
      appel = `h(${seuil})`
      cols = ['tour', 'x', 'c']
      let [x, cpt] = [x0, 0]
      lignes = [[x, cpt]]
      while (x < seuil) {
        x *= 2
        cpt++
        lignes.push([x, cpt])
      }
      val = cpt
    } else {
      const [a, pas] = [r.int(0, 4), r.int(2, 4)]
      const b = a + r.int(7, 16)
      code = ['def k(b: int) -> int:', `    i: int = ${a}`, '    while i < b:', `        i = i + ${pas}`, '    return i']
      appel = `k(${b})`
      cols = ['tour', 'i']
      let i = a
      lignes = [[i]]
      while (i < b) {
        i += pas
        lignes.push([i])
      }
      val = i
    }
    const nbTours = lignes.length - 1
    verifier(nbTours >= 1 && nbTours <= 16, 'nombre de tours raisonnable')
    const demandeTours = cas !== 3 && r.bool(0.25)
    const et = tours(nbTours)
    return {
      type: 'num',
      enonce: `${demandeTours ? `Combien de tours de boucle sont effectués lors de l'appel ${c(appel)} ?` : `Que renvoie l'appel ${c(appel)} ?`}\n${py(code)}`,
      reponse: demandeTours ? nbTours : val,
      indice: 'Fais une table de simulation : une ligne par tour de boucle.',
      explication: [
        T`[cours] **Interpréter un ${c('while')}** (cours 2) : (1) on évalue la condition ; (2) si elle est vraie, on exécute **tout le corps** puis on revient en (1) ; (3) si elle est fausse, on sort et on continue après la boucle. **Table de simulation** : une colonne par variable modifiée, une ligne « entrée », puis une ligne par tour (valeurs en **fin** de tour).`,
        `[calcul] Simulation de ${c(appel)} :`,
        table(cols, lignes.map((l, i) => [et[i], ...l])),
        `[resultat] ${demandeTours ? `${c(nbTours)} tours de boucle (la fonction renvoie ${val}).` : `La fonction renvoie ${c(val)} (après ${nbTours} tours).`}`,
        cas === 4 ? `[piege] La variable peut **dépasser** la borne : la condition n'est testée qu'au début de chaque tour.` : `[piege] La condition est testée **avant** chaque tour ; la sortie se fait au premier test qui vaut ${c('False')}, avec les valeurs de la dernière ligne.`,
      ].join('\n'),
    }
  },
}

const imbriquees: Gabarit = {
  id: 'in-imbriquees',
  chapitre: 'info',
  section: 'info.s5',
  niveau: 2,
  titre: 'Boucles imbriquées : compter',
  source: C2,
  refCours: 'cours 2 : boucles imbriquées, couples d’entiers',
  generer(r) {
    const cas = r.int(0, 2)
    const n = r.int(3, 6)
    const m = r.int(2, 5)
    const corps = (borneJ: string, test?: string) => [
      'def compte(n: int) -> int:',
      '    c: int = 0',
      '    i: int = 0',
      '    j: int = 0',
      '    while i < n:',
      '        j = 0',
      `        while j < ${borneJ}:`,
      ...(test ? [`            if ${test}:`, '                c = c + 1'] : ['            c = c + 1']),
      '            j = j + 1',
      '        i = i + 1',
      '    return c',
    ]
    const [code, val, calc] =
      cas === 0
        ? [corps(String(m)), n * m, T`Pour **chacune** des $${n}$ valeurs de ${c('i')}, la boucle intérieure fait $${m}$ tours : $${n}\times${m}$.`]
        : cas === 1
          ? [corps('i'), (n * (n - 1)) / 2, T`Pour ${c('i')} $=0,1,\dots,${n - 1}$, la boucle intérieure fait $i$ tours : $0+1+\dots+${n - 1}=\frac{${n}\times${n - 1}}2$.`]
          : [
              corps('n', '(i + j) % 3 == 0'),
              (() => {
                let k = 0
                for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 3 === 0) k++
                return k
              })(),
              T`On parcourt les $${n}\times${n}=${n * n}$ couples $(i,j)$ avec $0\le i,j<${n}$ et on compte ceux dont la somme est divisible par 3 : pour chaque $i$, les $j$ qui conviennent sont ceux de même reste que $-i$ modulo 3.`,
            ]
    return {
      type: 'num',
      enonce: `Que renvoie l'appel ${c(`compte(${n})`)} ?\n${py(code as string[])}`,
      reponse: val as number,
      explication: [
        T`[cours] **Boucles imbriquées** (cours 2) : pour chaque valeur de ${c('i')}, on parcourt **toutes** les valeurs de ${c('j')}. Il faut remettre ${c('j')} à sa valeur de départ **à chaque tour** de la boucle extérieure.`,
        `[calcul] ${calc}`,
        `[resultat] ${c(val as number)}`,
        `[piege] Oublier ${c('j = 0')} dans la boucle extérieure : la boucle intérieure ne s'exécuterait qu'au premier tour.`,
      ].join('\n'),
    }
  },
}

// =====================================================================================
// s6 — Algorithmes classiques : suites, Euclide, terminaison
// =====================================================================================

const suiteRecursive: Gabarit = {
  id: 'in-suite',
  chapitre: 'info',
  section: 'info.s6',
  niveau: 1,
  titre: 'Suite récursive calculée par une boucle',
  source: C2,
  refCours: 'cours 2 : suites récursives',
  generer(r) {
    const [a, b, u0] = [r.pick([2, 3, -1, -2]), r.int(-4, 5), r.int(0, 7)]
    const n = r.int(2, 5)
    const bTxt = b === 0 ? '' : b > 0 ? ` + ${b}` : ` - ${-b}`
    let u = u0
    const lignes: (string | number)[][] = [[u, 0]]
    for (let i = 1; i <= n; i++) {
      u = a * u + b
      lignes.push([u, i])
    }
    const et = tours(n)
    return {
      type: 'num',
      enonce: `Que renvoie l'appel ${c(`suite_u(${n})`)} ?\n${py(['def suite_u(n: int) -> int:', '    """Précondition : n >= 0', '    retourne la valeur au rang n de la suite U."""', `    u: int = ${u0}  # valeur au rang 0`, '    i: int = 0', '    while i < n:', `        u = ${a} * u${bTxt}`, '        i = i + 1', '    return u'])}`,
      reponse: u,
      explication: [
        T`[cours] **Suite récursive** (cours 2) : $u_0=k$ et $u_{n+1}=f(u_n)$. On la calcule avec un **compteur** ${c('i')} (le rang courant) et une **accumulation** ${c('u')} (la valeur au rang ${c('i')}).`,
        T`[calcul] Ici $u_0=${u0}$ et $u_{n+1}=${a}u_n${b === 0 ? '' : b > 0 ? `+${b}` : b}$. Simulation :`,
        table(['tour', 'u', 'i'], lignes.map((l, i) => [et[i], ...l])),
        `[resultat] ${c(u)}`,
        `[piege] La boucle fait exactement ${c('n')} tours (condition ${c('i < n')} en partant de 0) : un tour de trop ou de moins décale le rang.`,
      ].join('\n'),
    }
  },
}

const euclide: Gabarit = {
  id: 'in-euclide',
  chapitre: 'info',
  section: 'info.s6',
  niveau: 2,
  titre: 'Algorithme d’Euclide',
  source: C2,
  refCours: 'cours 2 : calcul du PGCD, algorithme d’Euclide',
  generer(r) {
    let n: number, m: number
    do {
      const g = r.pick([1, 2, 3, 4, 6, 7, 12, 14, 17])
      n = g * r.int(4, 30)
      m = g * r.int(2, 20)
    } while (n <= m || n % m === 0)
    let [a, b] = [n, m]
    const lignes: (string | number)[][] = [[a, b, 0]]
    const etapes: string[] = []
    while (b !== 0) {
      const reste = a % b
      etapes.push(T`$${a}=${b}\times${Math.floor(a / b)}+${reste}$`)
      a = b
      b = reste
      lignes.push([a, b, reste])
    }
    verifier(a === pgcdListe([n, m]), 'Euclide')
    const nb = lignes.length - 1
    const demandeTours = r.bool(0.3)
    const et = tours(nb)
    return {
      type: 'num',
      enonce: `${demandeTours ? `Combien de tours de boucle fait l'appel ${c(`pgcd(${n}, ${m})`)} ?` : `Que renvoie l'appel ${c(`pgcd(${n}, ${m})`)} ?`}\n${py(['def pgcd(n: int, m: int) -> int:', '    """Précondition : n > 0 and m >= 0"""', '    a: int = n', '    b: int = m', '    r: int = 0', '    while b != 0:', '        r = a % b', '        a = b', '        b = r', '    return a'])}`,
      reponse: demandeTours ? nb : a,
      explication: [
        T`[cours] **Algorithme d'Euclide** (cours 2) : si $r$ est le reste de la division euclidienne de $n$ par $m$, alors $\cours{\operatorname{pgcd}(n,m)=\operatorname{pgcd}(m,r)}$ ; et $\operatorname{pgcd}(n,0)=n$. Le reste **décroît strictement** : la boucle termine.`,
        `[calcul] ${etapes.join(' ; ')}.`,
        table(['tour', 'a', 'b', 'r'], lignes.map((l, i) => [et[i], ...l])),
        `[resultat] ${demandeTours ? `${c(nb)} tours (le PGCD vaut ${a}).` : `${c(a)} : c'est le dernier reste non nul.`}`,
        `[piege] L'ordre des trois instructions compte : il faut calculer ${c('r')} **avant** d'écraser ${c('a')}.`,
      ].join('\n'),
    }
  },
}

const bouclesVf = vfPioche('in-boucles-vf', 'info.s6', 'Vrai / faux : boucles, terminaison, simulation', C2, 'cours 2 : while, simulation, terminaison', (r) => {
  const [n, m] = [r.int(3, 8), r.int(2, 6)]
  const W = T`[cours] **Interpréter un ${c('while')}** (cours 2) : on évalue la condition ; si elle est vraie on exécute tout le corps et on **revient au test** ; si elle est fausse on sort. Le corps est délimité par l'**indentation**.`
  const TE = T`[cours] **Terminaison** (cours 2) : une boucle s'arrête quand sa condition devient fausse. Pour en être sûr, on cherche une quantité entière positive qui **décroît strictement** à chaque tour.`
  return [
    { e: `Si la condition d'un ${c('while')} est fausse dès le départ, le corps de la boucle est exécuté une fois.`, rep: false, ex: [W, `[resultat] ${OKVF(false)} Il est exécuté **zéro** fois : la condition est testée avant chaque tour, y compris le premier.`] },
    { e: `Dans une boucle ${c('while')}, la condition est réévaluée avant chaque tour.`, rep: true, ex: [W, `[resultat] ${OKVF(true)}`] },
    { e: `Une instruction placée après un ${c('while')}, au même niveau d'indentation que lui, est répétée à chaque tour.`, rep: false, ex: [W, `[resultat] ${OKVF(false)} Elle ne fait pas partie du corps : elle est exécutée une seule fois, **à la sortie** de la boucle.`] },
    { e: `La boucle ${c('while i <= n:')} dont le corps est ${c('s = s + i')} puis ${c('i = i - 1')}, avec ${c('i = 1')} au départ et ${c(`n = ${n}`)}, se termine.`, rep: false, ex: [TE, `[calcul] ${c('i')} vaut 1, 0, -1, … : il **diminue**, donc ${c(`i <= ${n}`)} reste toujours vrai.`, `[resultat] ${OKVF(false)} Boucle infinie (exemple ${c('somme_entiers2')} du cours).`] },
    { e: `La boucle ${c('while i <= n:')} dont le corps est ${c('s = s + i')} puis ${c('i = i + 1')}, avec ${c('i = 1')} au départ et ${c(`n = ${n}`)}, fait exactement ${n} tours.`, rep: true, ex: [TE, `[calcul] ${c('i')} prend les valeurs 1, 2, …, ${n} pendant les tours, puis vaut ${n + 1} : la condition devient fausse. La quantité ${c('n - i')} décroît strictement.`, `[resultat] ${OKVF(true)}`] },
    { e: `Dans une table de simulation, on met une colonne pour chaque variable modifiée par la boucle.`, rep: true, ex: [T`[cours] **Table de simulation** (cours 2) : fixer les paramètres, une colonne « tour de boucle », une colonne par variable **modifiée par la boucle**, une ligne « entrée », puis une ligne par tour avec les valeurs en fin de tour.`, `[resultat] ${OKVF(true)}`] },
    { e: `Deux boucles imbriquées où ${c('i')} prend ${n} valeurs et, pour chaque ${c('i')}, ${c('j')} prend ${m} valeurs exécutent le corps intérieur ${n + m} fois.`, rep: false, ex: [T`[cours] **Boucles imbriquées** (cours 2) : pour chaque valeur de ${c('i')}, on parcourt toutes les valeurs de ${c('j')} : les nombres de tours se **multiplient**.`, T`[calcul] $${n}\times${m}=${n * m}$`, `[resultat] ${OKVF(false)}`] },
    { e: `Dans l'algorithme d'Euclide, la boucle termine parce que le reste est strictement plus petit que le diviseur.`, rep: true, ex: [TE, `[calcul] À chaque tour ${c('b')} est remplacé par ${c('a % b')}, strictement plus petit que ${c('b')} et positif : ${c('b')} finit par valoir 0.`, `[resultat] ${OKVF(true)}`] },
    { e: `Après ${c('while True:')}, une instruction ${c('return 1')} placée après la boucle sera exécutée.`, rep: false, ex: [TE, `[resultat] ${OKVF(false)} La condition ne devient jamais fausse : on ne sort jamais de la boucle (fonction ${c('infini')} du cours).`] },
    { e: `Il existe un programme capable de décider, pour n'importe quel programme, s'il termine.`, rep: false, ex: [T`[cours] **Problème de l'arrêt** (cours 2) : la terminaison est **indécidable**. Aucun programme ne peut dire, pour tout programme et toute entrée, s'il s'arrête.`, `[resultat] ${OKVF(false)} C'est au programmeur de justifier la terminaison de ses boucles.`] },
    { e: `Ajouter des ${c('print')} dans le corps d'une boucle permet d'obtenir la même information qu'une table de simulation.`, rep: true, ex: [T`[cours] (cours 2) ${c('print')} permet de **tracer** une boucle : afficher les variables en entrée puis à la fin de chaque tour donne exactement une simulation. Utile pour déboguer en TME.`, `[resultat] ${OKVF(true)}`] },
    { e: `Avec seulement ${c('return')}, l'affectation et l'alternative (sans boucle), toutes les fonctions terminent.`, rep: true, ex: [T`[cours] **Expressivité et terminaison** (cours 2) : sans boucle, chaque instruction est exécutée au plus une fois ; on ne peut écrire que des « formules ». C'est le ${c('while')} qui apporte la répétition, et avec elle le risque de non-terminaison.`, `[resultat] ${OKVF(true)}`] },
  ]
})

export const GABARITS_INFO: Gabarit[] = [divisions, priorites, types, appels, printReturn, specVf, variables, variablesVf, alternatives, booleens, boucles, imbriquees, suiteRecursive, euclide, bouclesVf]
