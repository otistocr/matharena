/**
 * Informatique (UL1IN011) — exercices de programmation : « écris la fonction qui… ».
 * L'étudiant tape son code, l'appli l'exécute (Pyodide) et lance les tests `assert`.
 * Sujets et style d'après les cours d'amphi 1 et 2 : Python typé, préconditions dans la
 * docstring, variables définies en début de fonction, boucles while.
 * Chaque corrigé est exécuté contre ses tests par tests/python.test.ts.
 */
import type { Corps, Gabarit } from './types'
import type { Rng } from './outils'

const T = String.raw
const c = (s: string | number) => '`' + s + '`'
const py = (lignes: string[]) => '```\n' + lignes.join('\n') + '\n```'

interface Exo {
  consigne: string
  entete: string
  /** Lignes de la docstring (préconditions puis description). */
  doc: string[]
  tests: string[]
  /** Corps du corrigé (lignes déjà indentées de 4 espaces). */
  corps: string[]
  idee: string
  piege: string
}

function exercice(e: Exo, cours: string): Corps {
  const doc = e.doc.map((l, i) => `    ${i === 0 ? '"""' : ''}${l}${i === e.doc.length - 1 ? '"""' : ''}`)
  const solution = [e.entete, ...doc, ...e.corps]
  return {
    type: 'code',
    enonce: e.consigne,
    depart: [e.entete, ...doc, '    '].join('\n'),
    tests: e.tests,
    solution: solution.join('\n'),
    indice: e.idee,
    explication: [cours, `[methode] ${e.idee}`, '[resultat] Un corrigé possible :', py(solution), `[piege] ${e.piege}`].join('\n'),
  }
}

const gabarit = (id: string, section: string, niveau: 1 | 2 | 3, titre: string, source: string, refCours: string, cours: string, exos: (r: Rng) => Exo[]): Gabarit => ({
  id,
  chapitre: 'info',
  section,
  niveau,
  titre,
  source,
  refCours,
  code: true,
  generer: (r) => exercice(r.pick(exos(r)), cours),
})

// =====================================================================================
// s2 — Fonctions : une formule, un return
// =====================================================================================

const formules = gabarit(
  'in-code-formule',
  'info.s2',
  1,
  'Écrire une fonction : une formule',
  'UL1IN011 cours 1',
  'cours 1 : définition de fonctions (spécification, implémentation, validation)',
  T`[cours] **Définir une fonction** (cours 1) : la **spécification** (en-tête typé, préconditions, description) est donnée ; il reste l'**implémentation**. Ici une seule instruction suffit : ${c('return expr')} évalue l'expression et renvoie sa valeur. La **validation** se fait avec les tests ${c('assert')}.`,
  (r) => {
    const [a, b, k] = [r.int(1, 4), r.nz(-5, 5), r.int(-9, 9)]
    const P = (x: number) => a * x * x + b * x + k
    const signe = (n: number) => (n < 0 ? ' - ' : ' + ')
    const polyPy = `${a === 1 ? '' : `${a} * `}x * x${signe(b)}${Math.abs(b) === 1 ? '' : `${Math.abs(b)} * `}x${k === 0 ? '' : `${signe(k)}${Math.abs(k)}`}`
    return [
      {
        consigne: `Écris la fonction ${c('perimetre')} qui renvoie le périmètre d'un rectangle dont on donne la largeur et la longueur.`,
        entete: 'def perimetre(largeur: int, longueur: int) -> int:',
        doc: ['Précondition : (longueur >= 0) and (largeur >= 0)', 'retourne le périmètre du rectangle défini par sa largeur et sa longueur.'],
        tests: ['assert perimetre(2, 3) == 10', 'assert perimetre(4, 9) == 26', 'assert perimetre(0, 0) == 0', 'assert perimetre(0, 8) == 16'],
        corps: ['    return 2 * (largeur + longueur)'],
        idee: `La formule mathématique est $2\\times(\\text{largeur}+\\text{longueur})$ : il suffit de la traduire en expression Python après ${c('return')}.`,
        piege: `Oublier les parenthèses : ${c('2 * largeur + longueur')} ne double que la largeur.`,
      },
      {
        consigne: `Écris la fonction ${c('aire_triangle')} qui renvoie l'aire d'un triangle dont on donne la base et la hauteur.`,
        entete: 'def aire_triangle(base: float, hauteur: float) -> float:',
        doc: ['Précondition : (base >= 0) and (hauteur >= 0)', "retourne l'aire du triangle de base et hauteur données."],
        tests: ['assert aire_triangle(4, 3) == 6.0', 'assert aire_triangle(5, 2) == 5.0', 'assert aire_triangle(1, 1) == 0.5', 'assert aire_triangle(0, 7) == 0.0'],
        corps: ['    return base * hauteur / 2'],
        idee: `L'aire vaut $\\frac{\\text{base}\\times\\text{hauteur}}2$. Le résultat annoncé est un ${c('float')} : on utilise la division ${c('/')}.`,
        piege: `${c('//')} donnerait une division entière : ${c('1 * 1 // 2')} vaut ${c('0')}.`,
      },
      {
        consigne: `Écris la fonction ${c('moyenne3')} qui renvoie la moyenne de trois nombres.`,
        entete: 'def moyenne3(a: float, b: float, c: float) -> float:',
        doc: ['retourne la moyenne des trois nombres a, b et c.'],
        tests: ['assert moyenne3(1, 2, 3) == 2.0', 'assert moyenne3(0, 0, 6) == 2.0', 'assert moyenne3(10, 20, 60) == 30.0', 'assert moyenne3(-3, 0, 3) == 0.0'],
        corps: ['    return (a + b + c) / 3'],
        idee: `On additionne les trois nombres **entre parenthèses**, puis on divise par 3.`,
        piege: `Sans parenthèses, ${c('a + b + c / 3')} ne divise que ${c('c')} (la division est prioritaire).`,
      },
      {
        consigne: `Écris la fonction ${c('fahrenheit')} qui convertit une température de degrés Celsius en degrés Fahrenheit ($F=\\frac95C+32$).`,
        entete: 'def fahrenheit(celsius: float) -> float:',
        doc: ['retourne la température en degrés Fahrenheit.'],
        tests: ['assert fahrenheit(0) == 32.0', 'assert fahrenheit(100) == 212.0', 'assert fahrenheit(-40) == -40.0', 'assert fahrenheit(10) == 50.0'],
        corps: ['    return celsius * 9 / 5 + 32'],
        idee: `Traduire la formule : multiplier par 9, diviser par 5, ajouter 32.`,
        piege: `Écrire ${c('9 // 5')} : cette division entière vaut ${c('1')} et fausse tout.`,
      },
      {
        consigne: `Écris la fonction ${c('polynome')} qui renvoie la valeur de $${a === 1 ? '' : a}x^2${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x${k === 0 ? '' : k < 0 ? k : `+${k}`}$ pour un entier $x$ donné.`,
        entete: 'def polynome(x: int) -> int:',
        doc: [`retourne la valeur du polynôme en x.`],
        tests: [0, 1, 2, -1, 10].map((x) => `assert polynome(${x}) == ${P(x)}`),
        corps: [`    return ${polyPy}`],
        idee: `Écrire le polynôme terme à terme ; $x^2$ s'écrit ${c('x * x')} (ou ${c('x ** 2')}).`,
        piege: `En Python, la multiplication doit être écrite : ${c('3x')} est une erreur de syntaxe, il faut ${c('3 * x')}.`,
      },
      {
        consigne: `Écris la fonction ${c('volume_pave')} qui renvoie le volume d'un pavé droit.`,
        entete: 'def volume_pave(longueur: int, largeur: int, hauteur: int) -> int:',
        doc: ['Précondition : les trois dimensions sont positives', 'retourne le volume du pavé droit.'],
        tests: ['assert volume_pave(2, 3, 4) == 24', 'assert volume_pave(1, 1, 1) == 1', 'assert volume_pave(5, 0, 7) == 0', 'assert volume_pave(10, 10, 10) == 1000'],
        corps: ['    return longueur * largeur * hauteur'],
        idee: `Le volume est le produit des trois dimensions.`,
        piege: `Utiliser les noms des **paramètres** tels qu'ils sont écrits dans l'en-tête (pas ${c('l')}, ${c('L')}, ${c('h')}).`,
      },
      {
        consigne: `Écris la fonction ${c('nb_secondes')} qui convertit une durée donnée en heures, minutes et secondes en un nombre total de secondes.`,
        entete: 'def nb_secondes(h: int, m: int, s: int) -> int:',
        doc: ['Précondition : (h >= 0) and (0 <= m < 60) and (0 <= s < 60)', 'retourne la durée totale en secondes.'],
        tests: ['assert nb_secondes(1, 0, 0) == 3600', 'assert nb_secondes(0, 1, 1) == 61', 'assert nb_secondes(2, 30, 15) == 9015', 'assert nb_secondes(0, 0, 0) == 0'],
        corps: ['    return h * 3600 + m * 60 + s'],
        idee: `Une heure vaut 3600 secondes, une minute 60.`,
        piege: `Multiplier les heures par 60 seulement : cela donnerait des minutes.`,
      },
    ]
  },
)

// =====================================================================================
// s4 — Prédicats et alternatives
// =====================================================================================

const predicats = gabarit(
  'in-code-predicat',
  'info.s4',
  1,
  'Écrire un prédicat',
  'UL1IN011 cours 1',
  'cours 1 : expressions booléennes, prédicats',
  T`[cours] Un **prédicat** est une fonction qui renvoie un booléen (cours 1). Une comparaison (${c('==')}, ${c('!=')}, ${c('<')}, ${c('<=')}…) **est déjà** un booléen : on écrit directement ${c('return condition')}, sans ${c('if')}. On combine les conditions avec ${c('and')}, ${c('or')}, ${c('not')}.`,
  (r) => {
    const k = r.int(3, 9)
    return [
      {
        consigne: `Écris le prédicat ${c('est_pair')} qui indique si un entier est pair.`,
        entete: 'def est_pair(n: int) -> bool:',
        doc: ['retourne True si n est pair, False sinon.'],
        tests: ['assert est_pair(4) == True', 'assert est_pair(7) == False', 'assert est_pair(0) == True', 'assert est_pair(-3) == False'],
        corps: ['    return n % 2 == 0'],
        idee: `Un entier est pair quand le reste de sa division par 2 est nul : ${c('n % 2 == 0')}.`,
        piege: `Écrire ${c('n % 2 = 0')} : un seul ${c('=')} est une affectation, pas un test.`,
      },
      {
        consigne: `Écris le prédicat ${c('est_divisible')} qui indique si ${c('n')} est divisible par ${c('d')}.`,
        entete: 'def est_divisible(n: int, d: int) -> bool:',
        doc: ['Précondition : d != 0', 'retourne True si n est divisible par d, False sinon.'],
        tests: ['assert est_divisible(12, 4) == True', 'assert est_divisible(12, 5) == False', 'assert est_divisible(0, 3) == True', 'assert est_divisible(7, 7) == True'],
        corps: ['    return n % d == 0'],
        idee: `${c('n')} est divisible par ${c('d')} quand le reste ${c('n % d')} vaut 0.`,
        piege: `Tester ${c('n / d')} : la division flottante ne dit pas directement si le quotient est entier.`,
      },
      {
        consigne: `Écris le prédicat ${c(`est_multiple_de_${k}`)} qui indique si un entier est un multiple de ${k}.`,
        entete: `def est_multiple_de_${k}(n: int) -> bool:`,
        doc: [`retourne True si n est un multiple de ${k}, False sinon.`],
        tests: [`assert est_multiple_de_${k}(${k * 4}) == True`, `assert est_multiple_de_${k}(${k * 4 + 1}) == False`, `assert est_multiple_de_${k}(0) == True`, `assert est_multiple_de_${k}(${k - 1}) == False`],
        corps: [`    return n % ${k} == 0`],
        idee: `Multiple de ${k} : le reste de la division par ${k} est nul.`,
        piege: `0 est un multiple de tous les entiers ($0=${k}\\times0$).`,
      },
      {
        consigne: `Écris le prédicat ${c('dans_intervalle')} qui indique si ${c('x')} appartient à l'intervalle fermé $[a,b]$.`,
        entete: 'def dans_intervalle(x: float, a: float, b: float) -> bool:',
        doc: ['Précondition : a <= b', "retourne True si x est dans l'intervalle [a, b], False sinon."],
        tests: ['assert dans_intervalle(5, 1, 10) == True', 'assert dans_intervalle(1, 1, 10) == True', 'assert dans_intervalle(10, 1, 10) == True', 'assert dans_intervalle(11, 1, 10) == False', 'assert dans_intervalle(0.5, 1, 10) == False'],
        corps: ['    return (a <= x) and (x <= b)'],
        idee: `Deux conditions à vérifier **en même temps** : ${c('a <= x')} **et** ${c('x <= b')}.`,
        piege: `L'intervalle est fermé : inégalités **larges**, sinon les bornes sont refusées.`,
      },
      {
        consigne: `Écris le prédicat ${c('est_bissextile')} : une année est bissextile si elle est divisible par 4 mais pas par 100, ou si elle est divisible par 400.`,
        entete: 'def est_bissextile(annee: int) -> bool:',
        doc: ['Précondition : annee > 0', "retourne True si l'année est bissextile, False sinon."],
        tests: ['assert est_bissextile(2024) == True', 'assert est_bissextile(2023) == False', 'assert est_bissextile(1900) == False', 'assert est_bissextile(2000) == True'],
        corps: ['    return (annee % 4 == 0 and annee % 100 != 0) or (annee % 400 == 0)'],
        idee: `Traduire la phrase mot à mot : « divisible par 4 **et** pas par 100 » **ou** « divisible par 400 ».`,
        piege: `Les parenthèses rendent la priorité explicite (${c('and')} passe avant ${c('or')}).`,
      },
      {
        consigne: `Écris le prédicat ${c('est_triangle')} : trois longueurs strictement positives forment un triangle (non aplati) si chacune est **strictement inférieure** à la somme des deux autres.`,
        entete: 'def est_triangle(a: float, b: float, c: float) -> bool:',
        doc: ['Précondition : (a > 0) and (b > 0) and (c > 0)', 'retourne True si a, b, c sont les longueurs des côtés d’un triangle non aplati.'],
        tests: ['assert est_triangle(3, 4, 5) == True', 'assert est_triangle(1, 1, 3) == False', 'assert est_triangle(2, 3, 5) == False', 'assert est_triangle(5, 5, 5) == True', 'assert est_triangle(7, 2, 3) == False'],
        corps: ['    return (a < b + c) and (b < a + c) and (c < a + b)'],
        idee: `Trois inégalités triangulaires, reliées par ${c('and')}.`,
        piege: `N'en tester qu'une : ${c('est_triangle(7, 2, 3)')} vérifie deux inégalités sur trois.`,
      },
      {
        consigne: `Écris le prédicat ${c('meme_parite')} qui indique si deux entiers ont la même parité (tous les deux pairs, ou tous les deux impairs).`,
        entete: 'def meme_parite(a: int, b: int) -> bool:',
        doc: ['retourne True si a et b ont la même parité, False sinon.'],
        tests: ['assert meme_parite(2, 4) == True', 'assert meme_parite(3, 5) == True', 'assert meme_parite(2, 5) == False', 'assert meme_parite(0, 7) == False'],
        corps: ['    return a % 2 == b % 2'],
        idee: `Comparer les deux restes de la division par 2.`,
        piege: `On peut aussi écrire ${c('(a + b) % 2 == 0')} : une somme est paire exactement quand les deux nombres ont la même parité.`,
      },
    ]
  },
)

const alternatives = gabarit(
  'in-code-alternative',
  'info.s4',
  1,
  'Écrire une fonction avec une alternative',
  'UL1IN011 cours 1 et 2',
  'cours 1 : alternative, alternatives multiples, sortie anticipée',
  T`[cours] **Alternative** (cours 1) : ${c('if condition:')} conséquent, ${c('else:')} alternant ; avec ${c('elif')} pour plus de deux cas. **Une seule branche** est exécutée. Un ${c('return')} dans une branche fait sortir de la fonction (sortie anticipée). L'**indentation** délimite les branches.`,
  (r) => {
    const s1 = r.pick([4, 12, 18])
    const s2 = s1 + r.pick([8, 14, 47])
    const [v1, v2, v3] = [r.int(0, 5), r.int(6, 10), r.int(11, 16)]
    return [
      {
        consigne: `Écris la fonction ${c('valeur_absolue')} qui renvoie la valeur absolue d'un nombre, sans utiliser ${c('abs')}.`,
        entete: 'def valeur_absolue(x: float) -> float:',
        doc: ['retourne la valeur absolue de x.'],
        tests: ['assert valeur_absolue(3) == 3', 'assert valeur_absolue(-3) == 3', 'assert valeur_absolue(0) == 0', 'assert valeur_absolue(1.5 - 2.5) == valeur_absolue(2.5 - 1.5)'],
        corps: ['    if x >= 0:', '        return x', '    else:', '        return -x'],
        idee: `$|x|=x$ si $x\\ge0$ et $-x$ sinon : un choix entre deux calculs selon une condition.`,
        piege: `Renvoyer ${c('-x')} dans les deux cas, ou oublier le cas négatif.`,
      },
      {
        consigne: `Écris la fonction ${c('maximum')} qui renvoie le plus grand de deux entiers, sans utiliser ${c('max')}.`,
        entete: 'def maximum(a: int, b: int) -> int:',
        doc: ['retourne le plus grand des deux entiers a et b.'],
        tests: ['assert maximum(2, 9) == 9', 'assert maximum(9, 2) == 9', 'assert maximum(4, 4) == 4', 'assert maximum(-5, -8) == -5'],
        corps: ['    if a >= b:', '        return a', '    else:', '        return b'],
        idee: `Comparer ${c('a')} et ${c('b')}, renvoyer celui qui gagne.`,
        piege: `Tester les deux ordres d'arguments : ${c('maximum(2, 9)')} et ${c('maximum(9, 2)')}.`,
      },
      {
        consigne: `Écris la fonction ${c('max3')} qui renvoie le plus grand de trois entiers, sans utiliser ${c('max')}.`,
        entete: 'def max3(a: int, b: int, c: int) -> int:',
        doc: ['retourne le plus grand des trois entiers a, b et c.'],
        tests: ['assert max3(1, 2, 3) == 3', 'assert max3(3, 2, 1) == 3', 'assert max3(2, 3, 1) == 3', 'assert max3(5, 5, 5) == 5', 'assert max3(-1, -7, -3) == -1'],
        corps: ['    m: int = a  # le plus grand vu jusqu’ici', '    if b > m:', '        m = b', '    if c > m:', '        m = c', '    return m'],
        idee: `Garder dans une variable « le plus grand vu jusqu'ici », et la mettre à jour avec deux ${c('if')} **sans** ${c('else')}.`,
        piege: `Ici il faut deux ${c('if')} indépendants (pas ${c('elif')}) : les deux comparaisons doivent être faites.`,
      },
      {
        consigne: `Écris la fonction ${c('nb_solutions')} qui renvoie le nombre de solutions réelles de l'équation $ax^2+bx+c=0$.`,
        entete: 'def nb_solutions(a: float, b: float, c: float) -> int:',
        doc: ['Précondition : a != 0', "retourne le nombre de solutions réelles de l'équation a*x^2 + b*x + c = 0."],
        tests: ['assert nb_solutions(1, 0, -1) == 2', 'assert nb_solutions(1, 2, 1) == 1', 'assert nb_solutions(1, 0, 1) == 0', 'assert nb_solutions(2, -8, 8) == 1'],
        corps: ['    delta: float = b * b - 4 * a * c', '    if delta > 0:', '        return 2', '    elif delta == 0:', '        return 1', '    else:', '        return 0'],
        idee: `Calculer le discriminant **une fois**, dans une variable, puis discuter trois cas avec ${c('if')} / ${c('elif')} / ${c('else')}.`,
        piege: `Recalculer ${c('b * b - 4 * a * c')} dans chaque condition : une variable évite la répétition et les erreurs.`,
      },
      {
        consigne: `Écris la fonction ${c('signe')} qui renvoie 1 si le nombre est strictement positif, -1 s'il est strictement négatif et 0 s'il est nul.`,
        entete: 'def signe(x: float) -> int:',
        doc: ['retourne 1, -1 ou 0 selon le signe de x.'],
        tests: ['assert signe(5) == 1', 'assert signe(-2.5) == -1', 'assert signe(0) == 0', 'assert signe(0.001) == 1'],
        corps: ['    if x > 0:', '        return 1', '    elif x < 0:', '        return -1', '    else:', '        return 0'],
        idee: `Trois cas : une alternative multiple.`,
        piege: `Oublier le cas $x=0$ : avec seulement ${c('if x > 0')} / ${c('else')}, zéro serait classé négatif.`,
      },
      {
        consigne: `Écris la fonction ${c('tarif')} : le prix d'une entrée est ${v1} € avant ${s1} ans, ${v2} € de ${s1} ans à moins de ${s2} ans, et ${v3} € à partir de ${s2} ans.`,
        entete: 'def tarif(age: int) -> int:',
        doc: ['Précondition : age >= 0', `retourne ${v1} si age < ${s1}, ${v2} si ${s1} <= age < ${s2}, ${v3} sinon.`],
        tests: [`assert tarif(${s1 - 1}) == ${v1}`, `assert tarif(${s1}) == ${v2}`, `assert tarif(${s2 - 1}) == ${v2}`, `assert tarif(${s2}) == ${v3}`, `assert tarif(0) == ${v1}`],
        corps: [`    if age < ${s1}:`, `        return ${v1}`, `    elif age < ${s2}:`, `        return ${v2}`, '    else:', `        return ${v3}`],
        idee: `Tester les seuils dans l'ordre croissant : dans le ${c('elif')}, on sait déjà que ${c(`age >= ${s1}`)}.`,
        piege: `Les valeurs limites : à ${s1} ans exactement on paie déjà ${v2} € (inégalité **stricte** dans la première condition).`,
      },
      {
        consigne: `Écris la fonction ${c('borne')} qui ramène un entier dans l'intervalle $[a,b]$ : elle renvoie ${c('a')} si ${c('x')} est trop petit, ${c('b')} s'il est trop grand, et ${c('x')} sinon.`,
        entete: 'def borne(x: int, a: int, b: int) -> int:',
        doc: ['Précondition : a <= b', 'retourne a si x < a, b si x > b, et x sinon.'],
        tests: ['assert borne(5, 0, 10) == 5', 'assert borne(-3, 0, 10) == 0', 'assert borne(42, 0, 10) == 10', 'assert borne(0, 0, 10) == 0', 'assert borne(10, 0, 10) == 10'],
        corps: ['    if x < a:', '        return a', '    elif x > b:', '        return b', '    else:', '        return x'],
        idee: `Trois cas exclusifs : trop petit, trop grand, ou déjà dans l'intervalle.`,
        piege: `Confondre ce qu'on teste (${c('x')}) et ce qu'on renvoie (${c('a')}, ${c('b')} ou ${c('x')}).`,
      },
    ]
  },
)

// =====================================================================================
// s5 — Boucles while
// =====================================================================================

const bouclesCode = gabarit(
  'in-code-boucle',
  'info.s5',
  2,
  'Écrire une fonction avec une boucle while',
  'UL1IN011 cours 2',
  'cours 2 : actions répétitives, syntaxe du while, somme des premiers entiers',
  T`[cours] **Schéma de boucle** (cours 2) : un **compteur** (l'entier courant) et un **accumulateur** (le résultat partiel), définis avant la boucle ; ${c('while condition:')} ; dans le corps on met à jour l'accumulateur **puis** le compteur ; le ${c('return')} est **après** la boucle (désindenté).`,
  (r) => {
    const k = r.pick([3, 5, 7])
    return [
      {
        consigne: `Écris la fonction ${c('somme_entiers')} qui renvoie la somme $1+2+\\dots+n$ en utilisant une boucle ${c('while')}.`,
        entete: 'def somme_entiers(n: int) -> int:',
        doc: ['Précondition : n >= 0', 'retourne la somme des n premiers entiers naturels non nuls.'],
        tests: ['assert somme_entiers(5) == 15', 'assert somme_entiers(1) == 1', 'assert somme_entiers(0) == 0', 'assert somme_entiers(100) == 5050'],
        corps: ['    i: int = 1  # entier courant', '    s: int = 0  # somme cumulée', '    while i <= n:', '        s = s + i', '        i = i + 1', '    return s'],
        idee: `Un compteur ${c('i')} qui va de 1 à ${c('n')}, une somme ${c('s')} qui part de 0 et à laquelle on ajoute ${c('i')} à chaque tour.`,
        piege: `Oublier ${c('i = i + 1')} : la condition reste vraie pour toujours (boucle infinie).`,
      },
      {
        consigne: `Écris la fonction ${c('somme_carres')} qui renvoie $1^2+2^2+\\dots+n^2$.`,
        entete: 'def somme_carres(n: int) -> int:',
        doc: ['Précondition : n >= 0', 'retourne la somme des carrés des entiers de 1 à n.'],
        tests: ['assert somme_carres(3) == 14', 'assert somme_carres(0) == 0', 'assert somme_carres(1) == 1', 'assert somme_carres(10) == 385'],
        corps: ['    i: int = 1', '    s: int = 0', '    while i <= n:', '        s = s + i * i', '        i = i + 1', '    return s'],
        idee: `Même schéma que la somme des entiers, en ajoutant ${c('i * i')} au lieu de ${c('i')}.`,
        piege: `Mettre le ${c('return')} dans la boucle : la fonction s'arrêterait au premier tour.`,
      },
      {
        consigne: `Écris la fonction ${c('factorielle')} qui renvoie $n!=1\\times2\\times\\dots\\times n$ (avec $0!=1$).`,
        entete: 'def factorielle(n: int) -> int:',
        doc: ['Précondition : n >= 0', 'retourne la factorielle de n.'],
        tests: ['assert factorielle(0) == 1', 'assert factorielle(1) == 1', 'assert factorielle(5) == 120', 'assert factorielle(10) == 3628800'],
        corps: ['    i: int = 1', '    p: int = 1  # produit cumulé', '    while i <= n:', '        p = p * i', '        i = i + 1', '    return p'],
        idee: `Un produit cumulé : l'accumulateur part de **1** (l'élément neutre du produit) et on le multiplie par ${c('i')} à chaque tour.`,
        piege: `Initialiser le produit à 0 : tout resterait nul.`,
      },
      {
        consigne: `Écris la fonction ${c('puissance')} qui renvoie $x^n$ avec une boucle, sans utiliser l'opérateur ${c('**')}.`,
        entete: 'def puissance(x: int, n: int) -> int:',
        doc: ['Précondition : n >= 0', 'retourne x à la puissance n.'],
        tests: ['assert puissance(2, 10) == 1024', 'assert puissance(5, 0) == 1', 'assert puissance(3, 4) == 81', 'assert puissance(-2, 3) == -8'],
        corps: ['    i: int = 0  # nombre de multiplications faites', '    p: int = 1', '    while i < n:', '        p = p * x', '        i = i + 1', '    return p'],
        idee: `Multiplier ${c('n')} fois par ${c('x')}, en partant de 1 : le compteur compte les multiplications.`,
        piege: `Faire ${c('n + 1')} tours (condition ${c('i <= n')} en partant de 0) : on obtiendrait $x^{n+1}$.`,
      },
      {
        consigne: `Écris la fonction ${c('somme_multiples')} qui renvoie la somme des multiples de ${k} compris entre 1 et ${c('n')} (inclus).`,
        entete: 'def somme_multiples(n: int) -> int:',
        doc: ['Précondition : n >= 0', `retourne la somme des multiples de ${k} entre 1 et n.`],
        tests: [`assert somme_multiples(${k * 4}) == ${k * 10}`, `assert somme_multiples(${k * 4 + 1}) == ${k * 10}`, `assert somme_multiples(${k - 1}) == 0`, `assert somme_multiples(${k}) == ${k}`],
        corps: ['    i: int = 1', '    s: int = 0', '    while i <= n:', `        if i % ${k} == 0:`, '            s = s + i', '        i = i + 1', '    return s'],
        idee: `Parcourir tous les entiers de 1 à ${c('n')} et n'ajouter que ceux qui passent le test ${c(`i % ${k} == 0`)} : une alternative **dans** la boucle.`,
        piege: `Mettre ${c('i = i + 1')} dans le ${c('if')} : le compteur n'avancerait plus dès le premier non-multiple.`,
      },
      {
        consigne: `Écris la fonction ${c('nb_chiffres')} qui renvoie le nombre de chiffres d'un entier strictement positif.`,
        entete: 'def nb_chiffres(n: int) -> int:',
        doc: ['Précondition : n >= 1', "retourne le nombre de chiffres de l'écriture décimale de n."],
        tests: ['assert nb_chiffres(7) == 1', 'assert nb_chiffres(42) == 2', 'assert nb_chiffres(1000) == 4', 'assert nb_chiffres(99999) == 5'],
        corps: ['    m: int = n  # ce qu’il reste du nombre', '    c: int = 0  # nombre de chiffres comptés', '    while m > 0:', '        m = m // 10', '        c = c + 1', '    return c'],
        idee: `Diviser par 10 (${c('//')}) retire le dernier chiffre : on compte combien de fois on peut le faire avant d'arriver à 0.`,
        piege: `Utiliser ${c('/')} au lieu de ${c('//')} : le nombre ne deviendrait jamais exactement 0 au bon moment.`,
      },
      {
        consigne: `Écris la fonction ${c('somme_chiffres')} qui renvoie la somme des chiffres d'un entier positif.`,
        entete: 'def somme_chiffres(n: int) -> int:',
        doc: ['Précondition : n >= 0', "retourne la somme des chiffres de l'écriture décimale de n."],
        tests: ['assert somme_chiffres(0) == 0', 'assert somme_chiffres(7) == 7', 'assert somme_chiffres(123) == 6', 'assert somme_chiffres(9999) == 36'],
        corps: ['    m: int = n', '    s: int = 0', '    while m > 0:', '        s = s + m % 10', '        m = m // 10', '    return s'],
        idee: `${c('m % 10')} donne le dernier chiffre, ${c('m // 10')} le retire.`,
        piege: `Inverser les deux instructions du corps : on perdrait le chiffre avant de l'avoir ajouté.`,
      },
      {
        consigne: `Écris la fonction ${c('nb_diviseurs')} qui renvoie le nombre de diviseurs positifs d'un entier.`,
        entete: 'def nb_diviseurs(n: int) -> int:',
        doc: ['Précondition : n >= 1', 'retourne le nombre de diviseurs positifs de n.'],
        tests: ['assert nb_diviseurs(1) == 1', 'assert nb_diviseurs(12) == 6', 'assert nb_diviseurs(13) == 2', 'assert nb_diviseurs(36) == 9'],
        corps: ['    d: int = 1  # diviseur candidat', '    c: int = 0  # nombre de diviseurs trouvés', '    while d <= n:', '        if n % d == 0:', '            c = c + 1', '        d = d + 1', '    return c'],
        idee: `Essayer tous les candidats de 1 à ${c('n')} et compter ceux pour lesquels ${c('n % d == 0')}.`,
        piege: `Commencer à 0 : ${c('n % 0')} provoque une division par zéro.`,
      },
    ]
  },
)

// =====================================================================================
// s6 — Suites, Euclide, algorithmes
// =====================================================================================

const algorithmes = gabarit(
  'in-code-algo',
  'info.s6',
  2,
  'Écrire un algorithme : suites, PGCD, nombres premiers',
  'UL1IN011 cours 2',
  'cours 2 : suites récursives, algorithme d’Euclide, boucles imbriquées',
  T`[cours] (cours 2) **Suite récursive** : un compteur pour le rang, une variable pour la valeur courante, ${c('n')} tours de boucle. **Euclide** : $\cours{\operatorname{pgcd}(n,m)=\operatorname{pgcd}(m,\ n\bmod m)}$ et $\operatorname{pgcd}(n,0)=n$. Toujours se demander pourquoi la boucle **termine** : quelle quantité décroît (ou croît vers une borne) à chaque tour ?`,
  (r) => {
    const [a, b, u0] = [r.pick([2, 3, -2]), r.int(-4, 5), r.int(0, 7)]
    const u = (n: number) => {
      let x = u0
      for (let i = 0; i < n; i++) x = a * x + b
      return x
    }
    const bTxt = b === 0 ? '' : b > 0 ? ` + ${b}` : ` - ${-b}`
    return [
      {
        consigne: `Écris la fonction ${c('suite_u')} qui renvoie le terme de rang $n$ de la suite définie par $u_0=${u0}$ et $u_{n+1}=${a}u_n${b === 0 ? '' : b > 0 ? `+${b}` : b}$.`,
        entete: 'def suite_u(n: int) -> int:',
        doc: ['Précondition : n >= 0', 'retourne la valeur au rang n de la suite U.'],
        tests: [0, 1, 2, 5].map((n) => `assert suite_u(${n}) == ${u(n)}`),
        corps: [`    u: int = ${u0}  # valeur au rang 0`, '    i: int = 0  # rang courant', '    while i < n:', `        u = ${a} * u${bTxt}`, '        i = i + 1', '    return u'],
        idee: `Partir de $u_0$ et appliquer la relation de récurrence ${c('n')} fois : ${c('i')} est le rang de la valeur contenue dans ${c('u')}.`,
        piege: `Faire un tour de trop ou de moins : pour ${c('n = 0')}, la boucle ne doit pas s'exécuter du tout.`,
      },
      {
        consigne: `Écris la fonction ${c('pgcd')} qui calcule le PGCD de deux entiers par l'algorithme d'Euclide.`,
        entete: 'def pgcd(n: int, m: int) -> int:',
        doc: ['Précondition : (n > 0) and (m >= 0)', 'retourne le plus grand commun diviseur de n et m.'],
        tests: ['assert pgcd(56, 42) == 14', 'assert pgcd(4199, 1530) == 17', 'assert pgcd(7, 0) == 7', 'assert pgcd(13, 5) == 1', 'assert pgcd(42, 56) == 14'],
        corps: ['    a: int = n', '    b: int = m', '    r: int = 0  # reste courant', '    while b != 0:', '        r = a % b', '        a = b', '        b = r', '    return a'],
        idee: `Tant que le second nombre n'est pas nul, remplacer le couple $(a,b)$ par $(b,\\ a\\bmod b)$. Le PGCD est le dernier ${c('a')}.`,
        piege: `Écraser ${c('a')} avant d'avoir calculé le reste : il faut une variable intermédiaire ${c('r')}.`,
      },
      {
        consigne: `Écris le prédicat ${c('est_premier')} qui indique si un entier est premier.`,
        entete: 'def est_premier(n: int) -> bool:',
        doc: ['Précondition : n >= 0', 'retourne True si n est un nombre premier, False sinon.'],
        tests: ['assert est_premier(2) == True', 'assert est_premier(1) == False', 'assert est_premier(0) == False', 'assert est_premier(17) == True', 'assert est_premier(91) == False', 'assert est_premier(97) == True'],
        corps: ['    d: int = 2  # diviseur candidat', '    if n < 2:', '        return False', '    while d * d <= n:', '        if n % d == 0:', '            return False', '        d = d + 1', '    return True'],
        idee: `Chercher un diviseur entre 2 et $\\sqrt n$ : dès qu'on en trouve un, on sort avec ${c('False')} (sortie anticipée) ; si la boucle se termine sans rien trouver, ${c('n')} est premier.`,
        piege: `0 et 1 ne sont pas premiers : à traiter à part, avant la boucle.`,
      },
      {
        consigne: `Écris la fonction ${c('plus_petit_diviseur')} qui renvoie le plus petit diviseur strictement supérieur à 1 d'un entier.`,
        entete: 'def plus_petit_diviseur(n: int) -> int:',
        doc: ['Précondition : n >= 2', 'retourne le plus petit diviseur de n supérieur ou égal à 2.'],
        tests: ['assert plus_petit_diviseur(15) == 3', 'assert plus_petit_diviseur(49) == 7', 'assert plus_petit_diviseur(13) == 13', 'assert plus_petit_diviseur(2) == 2', 'assert plus_petit_diviseur(100) == 2'],
        corps: ['    d: int = 2', '    while n % d != 0:', '        d = d + 1', '    return d'],
        idee: `Essayer 2, 3, 4… jusqu'au premier ${c('d')} qui divise ${c('n')}. La boucle termine car ${c('n')} se divise lui-même.`,
        piege: `Écrire la condition à l'envers : on reste dans la boucle **tant que** ${c('d')} ne divise **pas** ${c('n')}.`,
      },
      {
        consigne: `Écris la fonction ${c('nb_doublements')} : combien de fois faut-il doubler ${c('depart')} pour atteindre ou dépasser ${c('seuil')} ?`,
        entete: 'def nb_doublements(depart: int, seuil: int) -> int:',
        doc: ['Précondition : depart >= 1', 'retourne le nombre de doublements nécessaires pour que la valeur atteigne ou dépasse seuil.'],
        tests: ['assert nb_doublements(1, 8) == 3', 'assert nb_doublements(1, 9) == 4', 'assert nb_doublements(5, 5) == 0', 'assert nb_doublements(3, 100) == 6'],
        corps: ['    x: int = depart  # valeur courante', '    c: int = 0  # nombre de doublements', '    while x < seuil:', '        x = x * 2', '        c = c + 1', '    return c'],
        idee: `On ne connaît pas à l'avance le nombre de tours : c'est la condition ${c('x < seuil')} qui décide, et un compteur compte les tours.`,
        piege: `Avec ${c('depart = 0')} la boucle ne terminerait jamais : d'où la précondition ${c('depart >= 1')}.`,
      },
      {
        consigne: `Écris la fonction ${c('somme_partielle')} qui renvoie $1+\\frac12+\\frac14+\\dots+\\frac1{2^n}$.`,
        entete: 'def somme_partielle(n: int) -> float:',
        doc: ['Précondition : n >= 0', 'retourne la somme 1 + 1/2 + 1/4 + ... + (1/2)^n.'],
        tests: ['assert somme_partielle(0) == 1.0', 'assert somme_partielle(1) == 1.5', 'assert somme_partielle(2) == 1.75', 'assert somme_partielle(3) == 1.875'],
        corps: ['    s: float = 0.0  # la somme vaut 0 initialement', '    k: int = 0  # on commence au rang 0', '    while k <= n:', '        s = s + (1 / 2) ** k', '        k = k + 1', '    return s'],
        idee: `Somme cumulée des termes $\\left(\\frac12\\right)^k$ pour $k$ de 0 à ${c('n')} inclus.`,
        piege: `S'arrêter à ${c('k < n')} : il manquerait le dernier terme.`,
      },
      {
        consigne: `Écris la fonction ${c('duree_syracuse')} : on part de ${c('n')} ; s'il est pair on le divise par 2, sinon on le remplace par $3n+1$. Combien d'étapes faut-il pour atteindre 1 ?`,
        entete: 'def duree_syracuse(n: int) -> int:',
        doc: ['Précondition : n >= 1', 'retourne le nombre d’étapes pour atteindre 1 en partant de n.'],
        tests: ['assert duree_syracuse(1) == 0', 'assert duree_syracuse(2) == 1', 'assert duree_syracuse(6) == 8', 'assert duree_syracuse(27) == 111'],
        corps: ['    x: int = n  # valeur courante', '    c: int = 0  # nombre d’étapes', '    while x != 1:', '        if x % 2 == 0:', '            x = x // 2', '        else:', '            x = 3 * x + 1', '        c = c + 1', '    return c'],
        idee: `Une alternative **dans** la boucle choisit la transformation ; le compteur avance à chaque étape, quelle que soit la branche.`,
        piege: `Utiliser ${c('/')} : ${c('x')} deviendrait un flottant. Personne ne sait démontrer que cette boucle termine toujours (conjecture de Syracuse).`,
      },
      {
        consigne: `Écris la fonction ${c('compte_couples')} qui renvoie le nombre de couples d'entiers $(i,j)$, avec $0\\le i\\le n$ et $0\\le j\\le n$, tels que $i+j$ soit divisible par 3.`,
        entete: 'def compte_couples(n: int) -> int:',
        doc: ['Précondition : n >= 0', 'retourne le nombre de couples (i, j) de [0, n] x [0, n] tels que i + j est divisible par 3.'],
        tests: ['assert compte_couples(0) == 1', 'assert compte_couples(1) == 1', 'assert compte_couples(2) == 3', 'assert compte_couples(5) == 12'],
        corps: ['    c: int = 0', '    i: int = 0', '    j: int = 0', '    while i <= n:', '        j = 0', '        while j <= n:', '            if (i + j) % 3 == 0:', '                c = c + 1', '            j = j + 1', '        i = i + 1', '    return c'],
        idee: `Deux **boucles imbriquées** : pour chaque ${c('i')}, on parcourt tous les ${c('j')}.`,
        piege: `Oublier de remettre ${c('j = 0')} au début de chaque tour de la boucle extérieure.`,
      },
    ]
  },
)

export const GABARITS_INFO_CODE: Gabarit[] = [formules, predicats, alternatives, bouclesCode, algorithmes]
