# Logique, ensembles et raisonnements
Chapitre 3 du poly (p.57–90) et feuille de TD 3 : le **langage** des maths. Trois thèmes, comme dans le TD : la logique (connecteurs, négations), les ensembles (quantificateurs, opérations, applications) et les méthodes de démonstration. Énoncés indispensables 19, 20 et 21.

## Logique : connecteurs, négation, contraposée {#ch3.s1}
[cours] Un énoncé est **vrai ou faux**. Les connecteurs (§3.1.2, p.58) :
- $\lnot A$ (non) échange vrai et faux ; $A\land B$ (et) est vrai si **les deux** le sont ; $A\lor B$ (ou **inclusif**) est faux seulement si les deux sont faux.
- $\cours{A\Rightarrow B}$ n'est faux que dans **un seul cas** : $A$ vrai et $B$ faux. $A\Leftrightarrow B$ : même valeur de vérité.
- **Négations** (Prop. 3.7, p.64) : $\cours{\lnot(A\land B)\Leftrightarrow\lnot A\lor\lnot B}$, $\cours{\lnot(A\lor B)\Leftrightarrow\lnot A\land\lnot B}$ (lois de De Morgan) et $\cours{\lnot(A\Rightarrow B)\Leftrightarrow A\land\lnot B}$.
- $\cours{(A\Rightarrow B)\Leftrightarrow(\lnot A\lor B)}$ (Cor. 3.8) et **contraposition** $\cours{(A\Rightarrow B)\Leftrightarrow(\lnot B\Rightarrow\lnot A)}$ (Prop. 3.10, p.65).
[methode] **Table de vérité** : lister tous les cas (4 pour deux énoncés, 8 pour trois), évaluer de l'intérieur vers l'extérieur. Deux énoncés sont équivalents s'ils ont la même colonne (TD3 ex 1).
[exemple] TD3 ex 4 : « si je mange, alors je bois et je ne parle pas ; si je ne parle pas, je m'ennuie ; je ne m'ennuie pas ». Contraposées : je ne m'ennuie pas $\Rightarrow$ je parle $\Rightarrow$ je ne mange pas. On ne sait rien sur « je bois ».
[piege]
- La **réciproque** $B\Rightarrow A$ n'est pas équivalente à $A\Rightarrow B$ ; la contraposée, si.
- La négation d'une implication n'est **pas** une implication.
- Une implication dont l'hypothèse est fausse est vraie, et n'apprend rien sur sa conclusion.

## Quantificateurs et leur négation {#ch3.s2}
[cours] $\forall x\in A,\ P(x)$ : « pour tout » ; $\exists x\in A,\ P(x)$ : « il existe **au moins un** » (§3.2.2, p.67).
- **Énoncé indispensable 19** (p.70) : $\cours{\lnot(\forall a\in A,\ E(a))=\exists a\in A,\ \lnot E(a)}$ et $\cours{\lnot(\exists a\in A,\ E(a))=\forall a\in A,\ \lnot E(a)}$.
- L'**ordre** compte : dans $\forall x,\ \exists y$, le $y$ dépend de $x$ ; dans $\exists y,\ \forall x$, le même $y$ sert pour tous les $x$.
[methode] **Nier** : de gauche à droite, échanger $\forall$ et $\exists$ sans toucher aux ensembles, puis nier la propriété finale. **Prouver un $\forall$ faux** : un contre-exemple. **Prouver un $\exists$** : exhiber un élément.
[exemple] La négation de $\forall x\in\mathbb R,\ \exists y\in\mathbb R,\ y>x$ est $\exists x\in\mathbb R,\ \forall y\in\mathbb R,\ y\le x$ (fausse : la phrase de départ est vraie, avec $y=x+1$).
[piege] « $x\in A$ » ne devient pas « $x\notin A$ ». Et $\forall\varepsilon>0,\ x<\varepsilon$ donne $x\le0$, pas $x<0$ (TD3 ex 12).

## Opérations sur les ensembles {#ch3.s3}
[cours] (§3.2.4–3.2.6, p.71–73) Pour $A,B\subset E$ :
- $A\cap B$ (et), $A\cup B$ (ou), $A\setminus B$ (dans $A$, pas dans $B$), complémentaire $\overline A=E\setminus A$.
- **De Morgan** : $\cours{\overline{A\cap B}=\overline A\cup\overline B}$ et $\cours{\overline{A\cup B}=\overline A\cap\overline B}$ ; **distributivité** : $\cours{A\cup(B\cap C)=(A\cup B)\cap(A\cup C)}$ et $\cours{A\cap(B\cup C)=(A\cap B)\cup(A\cap C)}$ (TD3 ex 7).
- $A\subset B\Rightarrow\overline B\subset\overline A$ : le complémentaire **renverse** les inclusions.
- **Différence symétrique** (TD3 ex 8) : $\cours{A\,\Delta\,B=(A\setminus B)\cup(B\setminus A)=(A\cup B)\setminus(A\cap B)}$, les éléments qui sont dans un seul des deux.
- Produit cartésien $E\times F$ : $\operatorname{card}=\operatorname{card}E\times\operatorname{card}F$ ; parties : $\cours{\operatorname{card}\mathcal P(E)=2^{\operatorname{card}E}}$.
[methode] **Montrer une égalité d'ensembles** : par double inclusion, ou en traduisant « $x\in\dots$ » avec les connecteurs logiques ($\cap$ = et, $\cup$ = ou, complémentaire = non).
[exemple] $\operatorname{card}(A\cup B)=\operatorname{card}A+\operatorname{card}B-\operatorname{card}(A\cap B)$ : $5+4-2=7$.
[piege] $A\setminus B\neq B\setminus A$. Et $\varnothing$ et $E$ sont des parties de $E$.

## Applications : injection, surjection, bijection {#ch3.s4}
[cours] **Énoncé indispensable 20** (p.76) : une application $f:A\to B$ associe à **chaque** $a\in A$ **une seule** image $f(a)\in B$. Composée : $\cours{(g\circ f)(a)=g(f(a))}$ (Déf. 3.16).
- **Énoncé indispensable 21** (p.79) : **injective** si $\cours{a_1\neq a_2\Rightarrow f(a_1)\neq f(a_2)}$ (au plus un antécédent) ; **surjective** si $\cours{\forall b\in B,\ \exists a\in A,\ b=f(a)}$ (au moins un) ; **bijective** si les deux (exactement un), et alors $f^{-1}$ existe.
- Composition (TD3 ex 10) : $f,g$ injectives $\Rightarrow g\circ f$ injective (idem surjectives). Si $g\circ f$ est injective, $f$ l'est ; si $g\circ f$ est surjective, $g$ l'est.
- $E$ **fini**, $f:E\to E$ : injective $\iff$ surjective (TD3 ex 9).
[methode] **Injective ?** Résoudre $f(x)=f(x')$ et voir si $x=x'$. **Surjective ?** Résoudre $f(x)=y$ pour $y$ quelconque de l'arrivée.
[exemple] $x\mapsto x^2$ : de $\mathbb R$ dans $\mathbb R$, ni l'un ni l'autre ; de $\mathbb R_+$ dans $\mathbb R_+$, bijective. Sur $\mathbb N$ : $n\mapsto n+1$ est injective mais pas surjective.
[piege] Les ensembles de départ et d'arrivée font partie de l'application. Et $g\circ f\neq f\circ g$ en général.

## Démonstrations et raisonnements {#ch3.s5}
[cours] Une démonstration est une suite de déductions par **modus ponens** : $A\Rightarrow B$ vrai et $A$ vrai donnent $B$ vrai (Prop. 3.19, p.83). Méthodes (§3.3.2–3.3.3, p.85–89) :
- **Contre-exemple** pour réfuter un $\forall$.
- **Contraposée** : pour $A\Rightarrow B$, supposer $\lnot B$ et montrer $\lnot A$.
- **Absurde** : supposer la négation et aboutir à une contradiction ($\sqrt2$, $\sqrt3$ irrationnels, TD3 ex 13).
- **Disjonction de cas** (valeurs absolues, parité…).
- **Récurrence** (p.88) : **initialisation** $E(0)$, puis **hérédité** $\cours{E(n)\Rightarrow E(n+1)}$ pour tout $n$.
[methode] **Équations** : une suite d'implications ne donne que des **candidats** ; il faut vérifier (ou raisonner par équivalences). Élever au carré : $u=\sqrt v\Rightarrow u^2=v$, la réciproque demande $u\ge0$.
[exemple] TD3 ex 14 : $\sum_{k=0}^nk^2=\frac{n(n+1)(2n+1)}6$. TD3 ex 11 : $x+5=\sqrt{x+11}$ donne les candidats $-2$ et $-7$ ; seul $-2$ convient. Partie entière (TD3 ex 15) : $\lfloor x\rfloor$ est l'entier $n$ tel que $n\le x<n+1$, donc $\lfloor-2{,}5\rfloor=-3$.
[piege] Une récurrence sans initialisation ne prouve rien. De $A\Rightarrow B$ on ne déduit pas $\lnot A\Rightarrow\lnot B$ (TD3 ex 17).
