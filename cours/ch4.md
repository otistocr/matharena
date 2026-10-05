# Études de fonctions
Chapitre 4 du poly et feuille de TD 4 : le vocabulaire (limites, variations, parité), la continuité et la dérivabilité, les composées et les réciproques, puis les **fonctions du répertoire**. Les numéros (Prop. 4.x) sont les mêmes dans les deux versions du poly ; les pages diffèrent à partir du §4.3.

## Vocabulaire : bornes, limites, parité {#ch4.s1}
[cours] (§4.1, p.93–98)
- $f$ est **paire** si $\cours{f(-x)=f(x)}$, **impaire** si $\cours{f(-x)=-f(x)}$ (Déf. 4.11), $T$-périodique si $f(x+T)=f(x)$ (Déf. 4.12).
- Une limite finie, si elle existe, est **unique** (Prop. 4.5). **Énoncé indispensable** : une fonction **croissante et majorée** a une limite finie en $+\infty$ (Prop. 4.8).
- **Quotient de polynômes en $\pm\infty$** (Prop. 4.34) : même limite que le quotient des termes de plus haut degré.
[methode] **Étudier une fonction** (TD4 ex 3) : domaine, parité ou périodicité, dérivée, signe de la dérivée, tableau de variations, limites aux bornes, esquisse du graphe. **Domaine** : pas de division par $0$, pas de racine d'un négatif, pas de $\ln$ d'un nombre $\le0$.
[exemple] $\sqrt{x^2-5x+4}<x-1$ (TD4 ex 1.4) : domaine $x\le1$ ou $x\ge4$ ; il faut $x-1>0$ donc $x\ge4$ ; au carré, $-5x+4<-2x+1$ soit $x>1$. Solutions : $[4,+\infty[$.
[piege] On n'élève au carré une inégalité que si les **deux membres sont positifs**. Et $\frac{x-1}{x^2+2x-3}$ n'est pas définie en $1$, même si elle se simplifie.

## Continuité et dérivabilité {#ch4.s2}
[cours] (§4.2, p.98–103) Énoncés indispensables :
- **Gendarmes** (Thm. 4.16) : $\cours{f\le g\le h\ \text{et}\ \lim f=\lim h=\ell\Rightarrow\lim g=\ell}$.
- **Valeurs intermédiaires** (Thm. 4.18) : $f$ **continue** sur $[a,b]$ prend toute valeur entre $f(a)$ et $f(b)$.
- **Dérivée** (Déf. 4.20) : $\cours{f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}h}$. Dérivable $\Rightarrow$ continue ; la réciproque est fausse (Prop. 4.21).
- **Variations** (Thm. 4.23) : $f'>0$ sur $]a,b[$ $\Rightarrow f$ strictement croissante.
- **Règles** (Thm. 4.25) : $(f+g)'=f'+g'$, $\cours{(fg)'=f'g+fg'}$, $\cours{\left(\frac fg\right)'=\frac{f'g-fg'}{g^2}}$.
[methode] **Forme $\frac00$** : factoriser, ou reconnaître un taux d'accroissement. **Racines** : multiplier par la quantité conjuguée, $\sqrt A-\sqrt B=\frac{A-B}{\sqrt A+\sqrt B}$.
[exemple] $x\sin\frac1x$ prolongée par $0$ est continue en $0$ : $-|x|\le x\sin\frac1x\le|x|$ (TD4 ex 9). $\lim_{x\to2}\frac{(x^2-4)\cos x}{x-2}=4\cos2$ (TD4 ex 5.6).
[piege] $|x|$ est continue mais pas dérivable en $0$. $f'(a)=0$ ne suffit pas pour un extremum ($x^3$). Le TVI donne l'existence, pas l'unicité.

## Fonctions composées {#ch4.s3}
[cours] (§4.3) La composée de deux fonctions continues est continue (Prop. 4.27). **Énoncé indispensable** (Prop. 4.29) : $$\cours{(g\circ f)'(x)=g'(f(x))\times f'(x)}$$ Cas usuels : $(u^n)'=nu'u^{n-1}$, $(e^u)'=u'e^u$, $(\ln u)'=\frac{u'}u$, $(\sin u)'=u'\cos u$, $(\cos u)'=-u'\sin u$.
[methode] Repérer la fonction **intérieure** $u$, dériver l'extérieure en $u$, puis **multiplier par $u'$**.
[exemple] $\left(\sin\left(3x^2+\frac1x\right)\right)'=\left(6x-\frac1{x^2}\right)\cos\left(3x^2+\frac1x\right)$ ; $(\sin^2x)'=2\sin x\cos x$ (TD4 ex 4).
[piege] L'erreur la plus courante : oublier le facteur $f'(x)$. $(g\circ f)'\neq g'\circ f$.

## Fonction réciproque d'une bijection {#ch4.s4}
[cours] (§4.4) **Théorème de la bijection** (Thm. 4.31, énoncé indispensable) : $f:[a,b]\to\mathbb R$ **continue et strictement monotone** est une bijection sur $[f(a),f(b)]$ (ou $[f(b),f(a)]$) ; $f^{-1}$ est continue, de même sens de variation. Si de plus $f$ est dérivable (Prop. 4.32) : $$\cours{(f^{-1})'(y)=\frac1{f'(f^{-1}(y))}}\quad\text{là où }f'(f^{-1}(y))\neq0.$$
[methode] Pour $(f^{-1})'(y_0)$ : trouver $x_0$ tel que $f(x_0)=y_0$, calculer $f'(x_0)$, inverser. Le graphe de $f^{-1}$ est le symétrique de celui de $f$ par rapport à $y=x$.
[exemple] $f(x)=x^3+x$ : $f(1)=2$, $f'(1)=4$, donc $(f^{-1})'(2)=\frac14$.
[piege] On dérive en $x_0=f^{-1}(y_0)$, pas en $y_0$.

## Puissances, exponentielle, logarithme, hyperboliques {#ch4.s5}
[cours] (§4.5.1–4.5.4) Énoncés indispensables :
- **exp** (Prop. 4.36) : unique fonction dérivable avec $\cours{f'=f,\ f(0)=1}$ ; $e^x>0$, $e^{x+y}=e^xe^y$.
- **exp vs. polynômes** (Prop. 4.37) : $\cours{\lim_{+\infty}\frac{e^x}{x^n}=+\infty}$, $\cours{\lim_{+\infty}x^ne^{-x}=0}$.
- **ln** (Prop. 4.38) : réciproque de exp, définie sur $]0,+\infty[$. **ln vs. racines** (Prop. 4.39) : $\cours{\lim_{+\infty}\frac{\ln x}{\sqrt[n]x}=0}$, $\cours{\lim_{0^+}\sqrt[n]x\ln x=0}$.
- **Puissances réelles** (Déf. 4.42) : $\cours{x^a=\exp(a\ln x)}$ pour $x>0$ ; $x^ax^b=x^{a+b}$, $(x^a)^b=x^{ab}$, $(x^a)'=ax^{a-1}$ (Prop. 4.43).
- **Hyperboliques** (Déf. 4.40) : $\operatorname{ch}x=\frac{e^x+e^{-x}}2$ (paire), $\operatorname{sh}x=\frac{e^x-e^{-x}}2$ (impaire), $\operatorname{ch}'=\operatorname{sh}$, $\operatorname{sh}'=\operatorname{ch}$, $\cours{\operatorname{ch}^2-\operatorname{sh}^2=1}$.
[methode] **Croissances comparées** : vérifier d'abord qu'il y a une forme indéterminée, puis factoriser le terme dominant ($e^x$ bat $x^n$, qui bat $\ln x$).
[exemple] $\lim_{0^+}(x^2+x)\ln x=0$ car $(x+1)\times x\ln x$ ; $\lim_{+\infty}\frac{e^x}{x^{430}}=+\infty$ (TD4 ex 5). Michaelis-Menten $v(S)=\frac{v_{\max}S}{K+S}$ : croissante, $v(K)=\frac{v_{\max}}2$, limite $v_{\max}$ (TD4 ex 17).
[piege] $x^\pi$ n'est définie que pour $x>0$. $(a^x)'=\ln(a)\,a^x$, pas $xa^{x-1}$.

## Trigonométrie et fonctions réciproques {#ch4.s6}
[cours] (§4.5.5–4.5.7) $\sin$ et $\cos$ sont $2\pi$-périodiques, $\cos$ paire, $\sin$ impaire (Prop. 4.44) ; $\tan=\frac{\sin}{\cos}$ est $\pi$-périodique, $\tan'=1+\tan^2$.
- $\cours{\arctan:\mathbb R\to\left]-\frac\pi2,\frac\pi2\right[}$, $\arctan'(x)=\frac1{1+x^2}$ (Prop. 4.46).
- $\cours{\arcsin:[-1,1]\to\left[-\frac\pi2,\frac\pi2\right]}$, $\arcsin'(x)=\frac1{\sqrt{1-x^2}}$ sur $]-1,1[$ (Prop. 4.47, TD4 ex 6).
- $\cours{\arccos:[-1,1]\to[0,\pi]}$ (Prop. 4.48).
[methode] $\arcsin(\sin x)$ : chercher l'angle de $\left[-\frac\pi2,\frac\pi2\right]$ qui a le même sinus que $x$.
[exemple] $\arcsin\left(\sin\frac{5\pi}6\right)=\frac\pi6$ ; $\arccos\left(-\frac{\sqrt2}2\right)=\frac{3\pi}4$ ; $\arctan(\sqrt3)=\frac\pi3$.
[piege] $\sin(\arcsin x)=x$ toujours, mais $\arcsin(\sin x)=x$ **seulement** sur $\left[-\frac\pi2,\frac\pi2\right]$.
