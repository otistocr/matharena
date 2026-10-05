# Trigonométrie
Une seule histoire racontée trois fois : des rapports dans un triangle, des **coordonnées sur un cercle**, puis **une exponentielle** $e^{i\theta}$. Garde le cercle trigonométrique en tête : il redonne presque toutes les formules.

## Radians, cercle, mesure principale {#trigo.s1}
[cours] Sur le cercle de centre $O$ et de rayon $1$, le point $M(\theta)$ a pour coordonnées $\cours{(\cos\theta,\ \sin\theta)}$. Le sens positif est le sens **inverse des aiguilles d'une montre**.
- $\cours{180^\circ=\pi\ \text{rad}}$, donc $\theta_{\text{rad}}=\theta_{\text{deg}}\times\frac{\pi}{180}$.
- Un arc de rayon $R$ et d'angle $\theta$ (en radians) mesure $\cours{L=R\theta}$.
- $\theta$ et $\theta+2k\pi$ désignent le **même point**. La **mesure principale** est le représentant dans $\cours{]-\pi,\pi]}$.
- Conséquences immédiates : $-1\le\cos\theta,\sin\theta\le1$ et $\cours{\cos^2\theta+\sin^2\theta=1}$ (Pythagore).
[methode] **Mesure principale** : retirer (ou ajouter) des tours de $2\pi$ jusqu'à tomber dans $]-\pi,\pi]$.
[exemple] $\frac{17\pi}{6}-2\pi=\frac{5\pi}{6}$ ; $\quad-\frac{7\pi}{4}+2\pi=\frac{\pi}{4}$ ; $\quad135^\circ=135\times\frac{\pi}{180}=\frac{3\pi}{4}$.
[piege] Toute l'analyse (dérivées, DL…) n'est vraie qu'**en radians**.

## Valeurs remarquables et angles associés {#trigo.s2}
[cours] **Le tableau** (Prop. 4.44) : $$\begin{array}{c|ccccc}\theta&0&\frac\pi6&\frac\pi4&\frac\pi3&\frac\pi2\\\hline\cos&1&\frac{\sqrt3}2&\frac{\sqrt2}2&\frac12&0\\\sin&0&\frac12&\frac{\sqrt2}2&\frac{\sqrt3}2&1\end{array}$$ Astuce : les sinus valent $\frac{\sqrt0}2,\frac{\sqrt1}2,\frac{\sqrt2}2,\frac{\sqrt3}2,\frac{\sqrt4}2$ ; les cosinus, la même liste à l'envers.
[cours] **Les miroirs** (à VOIR sur le cercle) :
- $\cos(-x)=\cos x$, $\ \sin(-x)=-\sin x$ : miroir horizontal ($\cos$ paire, $\sin$ impaire).
- $\cos(\pi-x)=-\cos x$, $\ \sin(\pi-x)=\sin x$ : miroir vertical.
- $\cos(\pi+x)=-\cos x$, $\ \sin(\pi+x)=-\sin x$ : demi-tour.
- $\cos(\frac\pi2-x)=\sin x$, $\ \sin(\frac\pi2-x)=\cos x$ : diagonale $y=x$.
- $\cos(x+\frac\pi2)=-\sin x$, $\ \sin(x+\frac\pi2)=\cos x$ : quart de tour.
[methode] **Calculer n'importe quel cos/sin** : (1) retirer les tours ; (2) écrire l'angle $\alpha$, $\pi-\alpha$, $-\alpha$ ou $\alpha-\pi$ avec $\alpha\in[0,\frac\pi2]$ ; (3) appliquer le miroir et **vérifier le signe** avec le quadrant.
[exemple] $\cos\frac{19\pi}{6}$ : $\frac{19\pi}6-2\pi=\frac{7\pi}6=\pi+\frac\pi6$, donc $\cos\frac{19\pi}6=-\cos\frac\pi6=-\frac{\sqrt3}2$ (quadrant 3 : abscisse négative ✓).
[piege] Apprendre les formules sans les voir : on se trompe de signe. Le cercle ne ment jamais.

## Pythagore + quadrant {#trigo.s3}
[cours] $\cos^2\theta+\sin^2\theta=1$ donne l'autre coordonnée **au signe près** ; c'est le **quadrant** qui tranche.
[methode] (1) $\sin^2\theta=1-\cos^2\theta$ ; (2) signe lu sur l'intervalle ; (3) si besoin $\tan\theta=\frac{\sin\theta}{\cos\theta}$.
[exemple] $\cos\theta=-\frac35$, $\theta\in]\frac\pi2,\pi[$ : $\sin^2\theta=\frac{16}{25}$ et en haut à gauche l'ordonnée est positive, donc $\sin\theta=+\frac45$.
[piege] $\sqrt{\frac{16}{25}}=\frac45$ est positif, mais $\sin\theta$ peut être négatif.

## Équations trigonométriques {#trigo.s4}
[cours] Les équations se **lisent** sur le cercle :
- $\cos x=a$ : droite **verticale** d'abscisse $a$ → deux points, $\cours{\alpha}$ et $\cours{-\alpha}$.
- $\sin x=a$ : droite **horizontale** d'ordonnée $a$ → deux points, $\cours{\alpha}$ et $\cours{\pi-\alpha}$.
- Sur $\mathbb R$ : on ajoute $2k\pi$. Cas particuliers : $\sin x=0\iff x=k\pi$ ; $\cos x=0\iff x=\frac\pi2+k\pi$.
[exemple] Sur $]-\pi,\pi]$ : $\cos x=\frac12\iff x\in\{-\frac\pi3,\frac\pi3\}$ ; $\sin x=-\frac{\sqrt2}2\iff x\in\{-\frac{3\pi}4,-\frac\pi4\}$.
[piege] Ne donner qu'une solution. Seuls $\pm1$ donnent une droite **tangente**, donc un seul point.

## Angle d'un point, argument {#trigo.s5}
[cours] Tout point $(x,y)\neq(0,0)$ s'écrit $(R\cos\theta,R\sin\theta)$ avec $R=\sqrt{x^2+y^2}$ ; pour un complexe, $\cours{z=Re^{i\theta}}$, $R=|z|$, $\theta=\arg z$.
[methode] **La méthode des 4 pas** :
- 1. Normaliser : $R=\sqrt{x^2+y^2}$ et $(c,s)=(\frac xR,\frac yR)$.
- 2. Angle de référence $\alpha\in[0,\frac\pi2]$ tel que $\cos\alpha=|c|$ (on oublie les signes).
- 3. Quadrant par les signes : $(+,+)\to\alpha$ ; $(-,+)\to\pi-\alpha$ ; $(-,-)\to\alpha-\pi$ ; $(+,-)\to-\alpha$.
- 4. Contrôler sur le cercle.
[exemple] $(-2,2\sqrt3)$ : $R=4$, $(c,s)=(-\frac12,\frac{\sqrt3}2)$, $\alpha=\frac\pi3$, signes $(-,+)$ donc $\theta=\pi-\frac\pi3=\frac{2\pi}3$.
[piege] $\arctan\frac yx$ ne voit qu'un rapport : pour $(-1,-1)$ il donne $\frac\pi4$ au lieu de $-\frac{3\pi}4$.

## Addition, duplication, linéarisation {#trigo.s6}
[cours] $$\cours{\cos(a\pm b)=\cos a\cos b\mp\sin a\sin b}\qquad\cours{\sin(a\pm b)=\sin a\cos b\pm\cos a\sin b}$$
- Duplication : $\sin2a=2\sin a\cos a$ ; $\cos2a=\cos^2a-\sin^2a=2\cos^2a-1=1-2\sin^2a$.
- Linéarisation : $\cos^2a=\frac{1+\cos2a}2$ ; $\sin^2a=\frac{1-\cos2a}2$.
- D'où ça vient : $e^{ia}e^{ib}=e^{i(a+b)}$, ou le produit scalaire de deux vecteurs unitaires.
[exemple] $\cos\frac\pi{12}=\cos(\frac\pi3-\frac\pi4)=\frac12\cdot\frac{\sqrt2}2+\frac{\sqrt3}2\cdot\frac{\sqrt2}2=\frac{\sqrt2+\sqrt6}4\approx0{,}97$.
[piege] $\cos(a+b)\neq\cos a+\cos b$ (avec $a=b=0$ : $1\neq2$). Pour le **cosinus**, le signe s'inverse.

## Fonctions sin, cos, tan {#trigo.s7}
[cours] (Prop. 4.44, Déf. 4.45)
- $\sin,\cos$ : définies sur $\mathbb R$, $2\pi$-périodiques, $\cos$ paire, $\sin$ impaire.
- $\cours{\sin'=\cos}$, $\cours{\cos'=-\sin}$ ; composée : $(\sin u)'=u'\cos u$, $(\cos u)'=-u'\sin u$.
- $\tan=\frac{\sin}{\cos}$, définie si $x\neq\frac\pi2+k\pi$, **$\pi$-périodique**, impaire, $\cours{\tan'=1+\tan^2=\frac1{\cos^2}}$.
- $\tan\frac\pi6=\frac{\sqrt3}3$, $\tan\frac\pi4=1$, $\tan\frac\pi3=\sqrt3$.
[exemple] $(3\cos(2x+1))'=-6\sin(2x+1)$ ; $\quad(\sin^2x)'=2\sin x\cos x=\sin2x$.
[piege] Le signe « $-$ » de $\cos'$, et le facteur $u'$ de la composée.

## Fonctions réciproques {#trigo.s8}
[cours] (§4.5.7)
- $\arcsin:[-1,1]\to[-\frac\pi2,\frac\pi2]$, croissante, $\arcsin'(x)=\frac1{\sqrt{1-x^2}}$.
- $\arccos:[-1,1]\to[0,\pi]$, décroissante, $\arccos'(x)=-\frac1{\sqrt{1-x^2}}$.
- $\arctan:\mathbb R\to]-\frac\pi2,\frac\pi2[$, croissante, $\arctan'(x)=\frac1{1+x^2}$.
- $\arcsin(y)$ est **l'unique** angle de $[-\frac\pi2,\frac\pi2]$ dont le sinus vaut $y$ (idem pour les autres).
[exemple] $\arccos(-\frac12)=\frac{2\pi}3$ ; $\arctan(-1)=-\frac\pi4$ ; $\arcsin(\sin\frac{5\pi}6)=\arcsin\frac12=\frac\pi6$.
[piege] $\arcsin(\sin x)=x$ **seulement** si $x\in[-\frac\pi2,\frac\pi2]$.

## Exponentielle complexe, Euler, Moivre {#trigo.s9}
[cours] **Énoncés indispensables 14–16** :
- $\cours{e^{i\theta}=\cos\theta+i\sin\theta}$ : c'est le point du cercle unité d'angle $\theta$, et $|e^{i\theta}|=1$.
- **Euler** : $\cours{\cos\theta=\frac{e^{i\theta}+e^{-i\theta}}2}$, $\cours{\sin\theta=\frac{e^{i\theta}-e^{-i\theta}}{2i}}$.
- $e^{ia}e^{ib}=e^{i(a+b)}$ ; $e^{ia}=e^{ib}\iff a=b+2k\pi$ ; $\overline{e^{i\theta}}=e^{-i\theta}$ ; $e^{i\pi}=-1$.
- **Moivre** : $\cours{(Re^{i\theta})^n=R^ne^{in\theta}}$.
[methode] **Puissance d'un complexe** : forme exponentielle (les 4 pas) → module puissance $n$, angle $\times n$ → réduire l'angle → revenir à $a+ib$.
[exemple] $1+i=\sqrt2\,e^{i\pi/4}$, donc $(1+i)^8=(\sqrt2)^8e^{2i\pi}=16$.
[piege] Oublier d'élever le **module** : $(2e^{i\pi/6})^3=8e^{i\pi/2}$, pas $2e^{i\pi/2}$.
