# Le Socle
Les bases de calcul qui servent partout en L1. Une base fragile en amont se paie en aval : chaque règle ici est utilisée dans tous les chapitres du poly.

## Fractions {#socle.s1}
[cours] $\frac ab$ est le nombre qui, multiplié par $b$, donne $a$ ($b\neq0$).
- $\cours{\frac ab+\frac cd=\frac{ad+bc}{bd}}$ : on additionne des parts de **même taille**.
- $\cours{\frac ab\times\frac cd=\frac{ac}{bd}}$ et $\cours{\frac ab\div\frac cd=\frac ab\times\frac dc}$.
- On simplifie par un **facteur** commun : $\frac{ka}{kb}=\frac ab$.
[methode] Prendre le **plus petit** dénominateur commun (PPCM) : $\frac5{12}+\frac7{18}$, avec $12=2^2\cdot3$ et $18=2\cdot3^2$, PPCM $=36$.
[exemple] $\frac5{12}+\frac7{18}=\frac{15}{36}+\frac{14}{36}=\frac{29}{36}$.
[piege]
- $\frac{a}{b+c}\neq\frac ab+\frac ac$ (la barre ne se distribue que depuis le numérateur).
- $\frac{x+3}3\neq x+1$ : on ne simplifie jamais des **termes**.
- $\frac{a/b}{c}=\frac a{bc}$ mais $\frac a{b/c}=\frac{ac}b$.

## Puissances {#socle.s2}
[cours] Pour $a\neq0$ : $a^0=1$, $\cours{a^{-n}=\frac1{a^n}}$. Les cinq règles : $$\cours{a^ma^n=a^{m+n}}\quad\cours{\frac{a^m}{a^n}=a^{m-n}}\quad\cours{(a^m)^n=a^{mn}}\quad\cours{(ab)^m=a^mb^m}\quad\cours{\left(\frac ab\right)^m=\frac{a^m}{b^m}}$$ Pour $a>0$ : $a^{1/n}=\sqrt[n]a$.
[methode] Tout réécrire dans **une même base** ($4=2^2$, $8=2^3$, $27=3^3$…), puis compter les exposants.
[exemple] $\frac{2^7\times4^3}{8^2}=\frac{2^7\times2^6}{2^6}=2^7$.
[piege]
- $-3^2=-9$ mais $(-3)^2=9$ : la puissance est prioritaire sur le signe.
- $(2^3)^2=2^6$ mais $2^{(3^2)}=2^9$.
- $2^{n+1}=2\times2^n$, pas $2^n+2$.

## Racines carrées {#socle.s3}
[cours] Pour $a,b\ge0$ : $\cours{\sqrt{ab}=\sqrt a\sqrt b}$, $\cours{\sqrt{\frac ab}=\frac{\sqrt a}{\sqrt b}}$ ($b>0$), et $\cours{\sqrt{x^2}=|x|}$ pour tout réel $x$.
[methode] **Simplifier** : faire sortir le plus grand carré, $\sqrt{72}=\sqrt{36\times2}=6\sqrt2$. **Dénominateur rationnel** : multiplier en haut et en bas par la **quantité conjuguée**.
[exemple] $\frac1{\sqrt3-1}=\frac{\sqrt3+1}{(\sqrt3-1)(\sqrt3+1)}=\frac{\sqrt3+1}{3-1}=\frac{\sqrt3+1}2$.
[piege]
- $\sqrt{a+b}\neq\sqrt a+\sqrt b$ ($\sqrt{25}=5$ mais $\sqrt{16}+\sqrt9=7$).
- $\sqrt{x^2}=x$ est faux si $x<0$.

## Développer, factoriser {#socle.s4}
[cours] $(a+b)(c+d)=ac+ad+bc+bd$. Identités remarquables : $$\cours{(a\pm b)^2=a^2\pm2ab+b^2}\qquad\cours{a^2-b^2=(a-b)(a+b)}$$ $$\cours{(a+b)^3=a^3+3a^2b+3ab^2+b^3}\qquad\cours{a^3-b^3=(a-b)(a^2+ab+b^2)}$$
[methode] **Factoriser, dans l'ordre** :
- 1. facteur commun : $6x^2+9x=3x(2x+3)$ ;
- 2. identité remarquable : $x^2-16=(x-4)(x+4)$, $x^2+6x+9=(x+3)^2$ ;
- 3. trinôme : $ax^2+bx+c=a(x-x_1)(x-x_2)$ avec les racines (discriminant).
[exemple] $(2x-3)^2-(x+1)(x-5)=4x^2-12x+9-(x^2-4x-5)=3x^2-8x+14$.
[piege] $(a+b)^2\neq a^2+b^2$ : le double produit $2ab$ n'est pas optionnel ($(3+4)^2=49$, $9+16=25$).

## Pourcentages {#socle.s5}
[cours] Augmenter de $t\,\%$, c'est **multiplier** par $\cours{1+\frac t{100}}$ ; diminuer de $t\,\%$, multiplier par $1-\frac t{100}$. Taux d'évolution : $\cours{\frac{V_1-V_0}{V_0}}$.
[methode] Des évolutions **successives** se composent en **multipliant** les coefficients.
[exemple] $+20\,\%$ puis $-20\,\%$ : $1{,}2\times0{,}8=0{,}96$, soit $-4\,\%$. Pour annuler $+25\,\%$ : $\frac1{1{,}25}=0{,}8$, il faut $-20\,\%$.
[piege] Les pourcentages ne s'additionnent pas. Et la valeur de départ se retrouve en **divisant** : $V_0=\frac{V_1}{1+t/100}$.

## Équations du 1er degré, produit nul, systèmes {#socle.s6}
[cours] On applique aux deux membres une opération **réversible** (ajouter ; multiplier par un nombre **non nul**). $ax=b$ : si $a\neq0$, $x=\frac ba$ ; si $a=0$, soit aucune solution, soit tous les réels.
- **Produit nul** : $\cours{AB=0\iff A=0\ \text{ou}\ B=0}$.
- **Quotient nul** : $\frac AB=0\iff A=0$ **et** $B\neq0$ (écrire le domaine d'abord).
[methode] **Système 2×2** : par combinaison (éliminer une inconnue) ou par substitution, puis **vérifier** dans l'autre équation.
[exemple] $\begin{cases}2x+3y=7\\x-y=1\end{cases}$ : $x=1+y$, donc $2+2y+3y=7$, $y=1$, $x=2$.
[piege] Diviser par $x$ dans $x^2=3x$ fait perdre $x=0$ : on **factorise**, $x(x-3)=0$.

## Second degré {#socle.s7}
[cours] $\Delta=b^2-4ac$. Forme canonique : $\cours{ax^2+bx+c=a\left(x+\frac b{2a}\right)^2-\frac\Delta{4a}}$, sommet en $x=-\frac b{2a}$.
- $\Delta>0$ : $\cours{x_{1,2}=\frac{-b\pm\sqrt\Delta}{2a}}$ et $ax^2+bx+c=a(x-x_1)(x-x_2)$.
- $\Delta=0$ : racine double $-\frac b{2a}$ ; $\Delta<0$ : pas de racine réelle (deux complexes conjuguées, poly Énoncé indispensable 18).
- **Signe** : celui de $a$ à l'extérieur des racines, celui de $-a$ entre elles.
- Vérification éclair : $x_1+x_2=-\frac ba$ et $x_1x_2=\frac ca$.
[exemple] $2x^2-5x-3=0$ : $\Delta=25+24=49$, $x=\frac{5\pm7}4$, soit $-\frac12$ et $3$ (somme $\frac52$ ✓, produit $-\frac32$ ✓).
[piege] Le $-b$ et le $2a$ sont **entiers** dans la formule. Attention aux signes quand $a<0$.

## Inéquations, tableaux de signes {#socle.s8}
[cours] Comme une équation, **sauf** : multiplier ou diviser par un **négatif renverse** le sens. On peut ajouter deux inégalités de même sens, jamais les soustraire.
[methode] **Tableau de signes** : (1) domaine (valeurs interdites) ; (2) tout factoriser ; (3) une ligne par facteur, la dernière est le produit ; (4) lire, bornes incluses là où l'expression **s'annule**, jamais aux valeurs interdites.
[exemple] $\frac{(2x-1)(x+3)}{x-2}\ge0\iff x\in[-3,\frac12]\cup]2,+\infty[$.
[piege]
- Ne jamais multiplier par une expression de signe inconnu : on ramène tout à gauche.
- $x^2\le9\iff-3\le x\le3$, et non « $x\le3$ ».

## Valeur absolue {#socle.s9}
[cours] $|x-a|$ est la **distance** entre $x$ et $a$ ; $|x|=\sqrt{x^2}$, $|xy|=|x||y|$. Pour $h>0$ :
- $\cours{|x-a|=h\iff x=a\pm h}$ ;
- $\cours{|x-a|\le h\iff a-h\le x\le a+h}$ ;
- $\cours{|x-a|\ge h\iff x\le a-h\ \text{ou}\ x\ge a+h}$.
- Inégalité triangulaire : $|x+y|\le|x|+|y|$.
[methode] **Lire avant de calculer** : centre $a$, rayon $h$, dedans ou dehors.
[exemple] $|x+2|<5$ : centre $-2$, rayon $5$, donc $x\in]-7,3[$.
[piege] $|x+2|=|x-(-2)|$ est centré en $-2$, pas en $2$.

## Exponentielle et logarithme {#socle.s10}
[cours] $e^x>0$ pour tout $x$, $e^0=1$ ; $\ln$ est définie sur $]0,+\infty[$, $\ln1=0$, $\ln e=1$. Réciproques : $\cours{e^{\ln a}=a}$ ($a>0$) et $\ln(e^x)=x$.
- $\cours{e^{a+b}=e^ae^b}$, $e^{-a}=\frac1{e^a}$ ; $\cours{\ln(ab)=\ln a+\ln b}$, $\ln\frac ab=\ln a-\ln b$, $\ln(a^n)=n\ln a$.
- Équation reine : $\cours{e^X=c\iff X=\ln c}$ (si $c>0$ ; aucune solution si $c\le0$).
- Croissances comparées : $\ln x\ll x^a\ll e^x$ en $+\infty$.
[exemple] $e^{2x-1}=5\iff2x-1=\ln5\iff x=\frac{1+\ln5}2$.
[piege] $\ln(a+b)\neq\ln a+\ln b$ ; et on écrit toujours le domaine avant de résoudre avec un $\ln$.

## Limites {#socle.s11}
[cours] Formes indéterminées : $\infty-\infty$, $0\times\infty$, $\frac\infty\infty$, $\frac00$. Tout le reste se calcule avec les règles naïves.
[methode] Face à une forme indéterminée :
- **À l'infini** : mettre le terme dominant en facteur, un polynôme se comporte comme son terme de plus haut degré.
- **$\frac00$ en $a$** : factoriser par $(x-a)$ et simplifier.
- **Racines** : quantité conjuguée.
[exemple] $\lim_{x\to+\infty}\frac{3x^2-x+1}{2x^2+5}=\frac32$ ; $\lim_{x\to2}\frac{x^2-4}{x-2}=\lim(x+2)=4$.
[piege] Conclure trop vite sur une forme indéterminée. Asymptotes : horizontale si la limite en $\pm\infty$ est finie, verticale si la limite est infinie en un point.

## Dérivation {#socle.s12}
[cours] $f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}h$ : pente de la tangente $\cours{y=f(a)+f'(a)(x-a)}$.
- $(x^n)'=nx^{n-1}$, $(\frac1x)'=-\frac1{x^2}$, $(\sqrt x)'=\frac1{2\sqrt x}$, $(e^x)'=e^x$, $(\ln x)'=\frac1x$.
- $\cours{(uv)'=u'v+uv'}$, $\cours{\left(\frac uv\right)'=\frac{u'v-uv'}{v^2}}$, chaîne $\cours{(g\circ u)'=u'\times g'\circ u}$.
- $(e^u)'=u'e^u$, $(\ln u)'=\frac{u'}u$, $(u^n)'=nu'u^{n-1}$.
- $f'\ge0$ sur un intervalle $\iff f$ croissante ; $f'$ s'annulant en changeant de signe donne un extremum.
[exemple] $(\sqrt{x^2+1})'=\frac{2x}{2\sqrt{x^2+1}}=\frac x{\sqrt{x^2+1}}$.
[piege] Oublier le facteur $u'$ de la chaîne.

## Fonctions : domaine, parité, composition {#socle.s13}
[cours] **Trois interdits** : diviser par $0$ ; racine d'un négatif ; ln d'un nombre $\le0$.
- Paire : $f(-x)=f(x)$ (symétrie axe vertical) ; impaire : $f(-x)=-f(x)$ (symétrie centrale), sur un domaine symétrique.
- $(g\circ f)(x)=g(f(x))$ : la sortie de $f$ entre dans $g$. **L'ordre compte**.
[exemple] $f(x)=\frac{\sqrt{x+2}}{x-3}$ : $D_f=[-2,3[\cup]3,+\infty[$. Avec $f(x)=x+1$, $g(x)=x^2$ : $(g\circ f)(x)=(x+1)^2$ mais $(f\circ g)(x)=x^2+1$.
[piege] Une constante est un terme **pair** : $x^3+1$ n'est ni paire ni impaire.

## Priorités, signes, isoler une inconnue {#socle.s14}
[cours] **Ordre des opérations** : parenthèses, puis puissances, puis $\times$ et $\div$, puis $+$ et $-$ ; de gauche à droite à priorité égale.
- Signes : $(-)\times(-)=(+)$ ; $-a^2\neq(-a)^2$ ; un moins devant une parenthèse change **tous** les signes.
- **Même opération des deux côtés** : $\cours{A=B\iff A+c=B+c}$ et, si $c\neq0$, $\cours{A=B\iff cA=cB}$.
- **Produit en croix** : $\cours{\frac ab=\frac cd\iff ad=bc}$ (dénominateurs non nuls).
- Mise en équation : $\cours{d=v\times t}$ ; travail $=$ débit $\times$ temps, et les **débits s'additionnent**.
[methode] **Isoler une variable** : défaire les opérations dans l'ordre inverse ; si l'inconnue apparaît deux fois, la regrouper d'un côté et **factoriser**.
[exemple] $y=\frac x{x+1}\Rightarrow yx+y=x\Rightarrow y=x(1-y)\Rightarrow x=\frac y{1-y}$. Deux robinets (3 h et 6 h) : $\frac13+\frac16=\frac12$, donc 2 h ensemble.
[piege] Une vitesse moyenne sur un aller-retour n'est pas la moyenne des vitesses. Et $12\div3\times2=8$, pas $2$.

## Inégalités, encadrements, intervalles {#socle.s15}
[cours] On peut ajouter un même nombre aux deux membres, et additionner deux inégalités de même sens.
- Multiplier par $c>0$ **garde** le sens ; par $c<0$ le **change**.
- Pour $0<a<b$ : $\cours{\frac1b<\frac1a}$ et $a^2<b^2$. Le carré n'est croissant que sur $[0,+\infty[$.
- $\cours{x^2\le k^2\iff-k\le x\le k}$ ; $x^2>k^2\iff x>k$ **ou** $x<-k$.
- Intervalles : $I\cap J$ (dans les deux), $I\cup J$ (dans l'un au moins) ; crochet vers l'intérieur = borne incluse.
[methode] **Encadrer** : partir de l'encadrement de $x$ et appliquer les opérations une à une, en retournant l'encadrement à chaque multiplication par un négatif ou passage à l'inverse.
[exemple] $-2\le x\le3\Rightarrow-9\le-3x\le6\Rightarrow-8\le-3x+1\le7$ ; et $0\le x^2\le9$.
[piege] On ne soustrait pas et on ne divise pas des inégalités membre à membre. On ne multiplie pas par $x$ sans connaître son signe.

## Sommes Σ, factorielles, binôme {#socle.s16}
[cours] $\sum_{k=m}^nu_k=u_m+u_{m+1}+\dots+u_n$ a $\cours{n-m+1}$ termes ; la somme est linéaire.
- $\cours{\sum_{k=1}^nk=\frac{n(n+1)}2}$, $\sum_{k=1}^nk^2=\frac{n(n+1)(2n+1)}6$, $\cours{\sum_{k=0}^nq^k=\frac{q^{n+1}-1}{q-1}}$ ($q\neq1$).
- Télescopage : $\sum_{k=1}^n(a_k-a_{k+1})=a_1-a_{n+1}$.
- $\cours{n!=n\times(n-1)!}$, $0!=1$ ; $\cours{\binom nk=\frac{n!}{k!(n-k)!}}$, $\binom nk=\binom n{n-k}$, $\binom n2=\frac{n(n-1)}2$.
- **Binôme de Newton** : $\cours{(a+b)^n=\sum_{k=0}^n\binom nka^kb^{n-k}}$ ; $(a+b)^3=a^3+3a^2b+3ab^2+b^3$.
[exemple] $\frac{10!}{8!}=10\times9=90$ ; coefficient de $x^2$ dans $(x+2)^4$ : $\binom42\times2^2=24$.
[piege] $\sum_{k=1}^n3=3n$. $(a+b)^3\neq a^3+b^3$. $(n+1)!\neq n!+1$.

## Arithmétique : divisibilité, PGCD, nombres premiers {#socle.s17}
[cours] **Division euclidienne** : $\cours{a=bq+r,\ 0\le r<b}$. Tout entier $\ge2$ se décompose de façon **unique** en produit de nombres premiers.
- Critères : par 2, 5, 10 (dernier chiffre) ; par 3, 9 (somme des chiffres) ; par 4 (deux derniers chiffres).
- **PGCD** : plus petits exposants ; **PPCM** : plus grands exposants ; $\operatorname{pgcd}\times\operatorname{ppcm}=ab$.
- $N=p_1^{a_1}\cdots p_r^{a_r}$ a $(a_1+1)\cdots(a_r+1)$ diviseurs positifs.
- Parité : impair $+$ impair $=$ pair ; un produit est impair seulement si tous les facteurs le sont.
[methode] **Reste d'une grande puissance** : calculer les restes des premières puissances, repérer le cycle, réduire l'exposant modulo la période.
[exemple] $84=2^2\times3\times7$, $126=2\times3^2\times7$ : PGCD $=42$, PPCM $=252$. Chiffre des unités de $7^{50}$ : cycle $7,9,3,1$ ; $50=4\times12+2$, donc $9$.
[piege] $1$ n'est pas premier ; $2$ est premier. Le reste est toujours positif : $-17=5\times(-4)+3$.

## Suites arithmétiques et géométriques {#socle.s18}
[cours] **Arithmétique** (raison $r$) : $\cours{u_n=u_0+nr}$ ; somme $=$ nombre de termes $\times\frac{\text{premier}+\text{dernier}}2$.
- **Géométrique** (raison $q$) : $\cours{u_n=u_0q^n}$ ; $u_0+\dots+u_n=u_0\frac{q^{n+1}-1}{q-1}$ ; $(q^n)$ tend vers $0$ si $|q|<1$.
[methode] Raison arithmétique : $\frac{u_m-u_p}{m-p}$. Raison géométrique : quotient de deux termes consécutifs.
[exemple] $u_0=3$, $r=4$ : $u_{10}=43$ et $u_0+\dots+u_{10}=11\times\frac{3+43}2=253$.
[piege] De $u_0$ à $u_n$ il y a $n+1$ termes.
