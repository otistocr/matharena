# Informatique — Éléments de programmation
UL1IN011, cours d'amphi 1 et 2 (2026) : programmer en Python **typé** (environnement MrPython). Une fonction se définit toujours en trois temps : spécification, implémentation, validation.

## Expressions, types, opérateurs {#info.s1}
[cours] Une **expression** s'évalue en une **valeur**. Expressions atomiques : `42`, `3.14`, `True`, `"bonjour"`. Expressions composées : opérateurs et appels de fonctions.
- Types : `bool` (`True`, `False`), `int` (entiers), `float` (nombres à virgule), `str` (chaînes). Les entiers sont convertis en flottants si nécessaire.
- `/` division flottante (toujours un `float`) ; `//` division entière ; `%` reste de la division euclidienne ; `**` puissance.
- Priorités standard : parenthèses, `**`, puis `*` `/` `//` `%`, puis `+` `-` ; de gauche à droite à priorité égale.
[methode] **Évaluer** : repérer la sous-expression à calculer en premier (de gauche à droite, du plus profond vers l'extérieur), la remplacer par sa valeur, recommencer.
[exemple] `208 / 2 * (2 + 2)` vaut `416.0` ; `17 // 5` vaut `3` et `17 % 5` vaut `2` ; `6 / 2` vaut `3.0`.
[piege] `-7 // 2` vaut `-4` (arrondi vers le bas). `"3" + "2"` vaut `"32"`. `-3 ** 2` vaut `-9`.

## Fonctions : spécification, appel, return {#info.s2}
[cours] Définir une fonction en trois étapes :
- **Spécification** : l'en-tête `def nom(param: type, ...) -> type:`, les **préconditions** et une description.
- **Implémentation** : le corps (indenté), une suite d'instructions ; `return expr` évalue `expr` et **sort** de la fonction avec cette valeur.
- **Validation** : un jeu de tests, `assert perimetre(2, 3) == 10`.
- **Évaluer `f(e1, e2)`** : on évalue les arguments de gauche à droite, on exécute le corps, la valeur de retour **remplace l'appel**.
- Un **prédicat** est une fonction qui renvoie un booléen. `int` est un sous-type de `float`.
[exemple]
```
def perimetre(largeur: int, longueur: int) -> int:
    """Précondition : (longueur >= 0) and (largeur >= 0)
    retourne le périmètre du rectangle."""
    return 2 * (largeur + longueur)

assert perimetre(2, 3) == 10
```
[piege] `print` **affiche** (effet de bord) et renvoie `None` ; `return` **renvoie** une valeur utilisable dans un calcul. `1 + 2 * h3(10)` échoue si `h3` ne fait qu'un `print`.

## Variables et affectations {#info.s3}
[cours] Une **variable** est une case mémoire locale à la fonction : un nom, un type, une valeur.
- **Définition** : `var: type = expr`, en début de fonction.
- **Réaffectation** : `var = expr` ; on évalue `expr`, puis on remplace le contenu. Le `=` n'est **pas symétrique**.
- Une variable contient une **valeur**, pas un calcul.
- Noms : minuscules, mots séparés par `_`, explicites (`demi_perimetre` plutôt que `s`).
[methode] Suivre un code : un tableau avec une colonne par variable et une ligne par instruction.
[exemple]
```
n: int = 0
m: int = 58
n = m - 16     # n vaut 42
m = m + 1      # m vaut 59, n vaut toujours 42
```
[piege] `a = b` puis `b = a` n'échange rien : il faut une variable temporaire. `=` (affectation) n'est pas `==` (test).

## Alternatives et booléens {#info.s4}
[cours] `if condition:` conséquent, `else:` alternant. Alternative multiple avec `elif` : **une seule branche** est exécutée, la première dont la condition est vraie. Sans `else`, si la condition est fausse on ne fait rien.
- Comparaisons : `<`, `>`, `<=`, `>=`, `==`, `!=`. Opérateurs : `and`, `or`, `not`.
- **Calcul paresseux** : `e1 and e2` ne calcule pas `e2` si `e1` vaut `False` ; `e1 or e2` ne calcule pas `e2` si `e1` vaut `True`.
- Raccourci : `if c: return True` / `else: return False` s'écrit `return c`.
[exemple]
```
def nb_solutions(a: float, b: float, c: float) -> int:
    delta: float = b * b - 4 * a * c
    if delta > 0:
        return 2
    elif delta == 0:
        return 1
    else:
        return 0
```
[piege] Deux `if` à la suite sont testés tous les deux ; `if` … `elif` s'arrête à la première condition vraie. L'indentation décide de ce qui est dans la branche.

## Boucles while et simulation {#info.s5}
[cours] `while cond:` suivi du corps indenté. On évalue la condition ; si elle est vraie on exécute **tout** le corps et on revient au test ; sinon on sort.
- **Table de simulation** : fixer les paramètres ; une colonne « tour », une colonne par variable modifiée ; une ligne « entrée », puis une ligne par tour (valeurs en fin de tour).
- **Boucles imbriquées** : pour chaque valeur de `i`, on parcourt toutes les valeurs de `j` ; les nombres de tours se multiplient.
[exemple]
```
def somme_entiers(n: int) -> int:
    i: int = 1
    s: int = 0
    while i <= n:
        s = s + i
        i = i + 1
    return s
```
`somme_entiers(5)` : `s` vaut 0, 1, 3, 6, 10, 15 et `i` vaut 1, 2, 3, 4, 5, 6. Résultat : 15.
[piege] Si la condition est fausse au départ, le corps n'est jamais exécuté. Oublier de faire évoluer le compteur donne une boucle infinie.

## Suites, Euclide, terminaison {#info.s6}
[cours] **Suite récursive** $u_0=k$, $u_{n+1}=f(u_n)$ : un compteur `i` et une accumulation `u`, `n` tours de boucle.
- **Euclide** : $\cours{\operatorname{pgcd}(n,m)=\operatorname{pgcd}(m,\ n\bmod m)}$ et $\operatorname{pgcd}(n,0)=n$.
- **Terminaison** : une boucle termine si une quantité entière positive décroît strictement à chaque tour. Le problème de l'arrêt est **indécidable** : aucun programme ne peut le vérifier à notre place.
[exemple] pgcd(56, 42) : $56=42\times1+14$, $42=14\times3+0$, donc 14.
[piege] Dans Euclide, calculer le reste **avant** d'écraser `a`.
