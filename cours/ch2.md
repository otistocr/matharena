# Complexes et polynômes
Chapitre 2 du poly (p.31–56) et feuille de TD 2 : calculer dans $\mathbb C$ sous forme algébrique puis exponentielle, résoudre $z^n=a$ et les équations du second degré, puis factoriser des polynômes. Énoncés indispensables 10 à 18. Pour Euler, Moivre et les valeurs de $e^{i\theta}$, voir aussi la fiche Trigonométrie.

## Forme algébrique, conjugué, module {#ch2.s1}
[cours] $z=x+iy$ avec $x=\Re(z)$, $y=\Im(z)$ réels et $\cours{i^2=-1}$.
- **Énoncés indispensables 10 et 11** (p.31–32) : on additionne partie par partie ; $\cours{(x_1+iy_1)(x_2+iy_2)=(x_1x_2-y_1y_2)+i(x_1y_2+y_1x_2)}$.
- Conjugué $\bar z=x-iy$ (Déf. 2.7) : $\overline{z_1+z_2}=\bar z_1+\bar z_2$, $\overline{z_1z_2}=\bar z_1\bar z_2$, $z+\bar z=2\Re(z)$, $z-\bar z=2i\,\Im(z)$.
- Module $\cours{|z|=\sqrt{x^2+y^2}}$, $\cours{z\bar z=|z|^2}$, donc $\cours{\frac1z=\frac{\bar z}{|z|^2}}$.
- **Énoncé indispensable 12** : $|z_1z_2|=|z_1||z_2|$. **Énoncé indispensable 13** : $|z_1+z_2|\le|z_1|+|z_2|$.
[methode] **Quotient** : multiplier en haut et en bas par le **conjugué du dénominateur**.
[exemple] $\frac{1+2i}{1-i}=\frac{(1+2i)(1+i)}{2}=\frac{-1+3i}2$ (TD2 ex 1). Circuit RLC : $Z=R+i\left(L\omega-\frac1{C\omega}\right)$ car $\frac1i=-i$ (TD2 ex 14).
[piege] $|z_1+z_2|\neq|z_1|+|z_2|$ en général. $z^2\neq|z|^2$. Les puissances de $i$ sont périodiques : $1,\ i,\ -1,\ -i$.

## Forme trigonométrique, exponentielle complexe {#ch2.s2}
[cours] **Énoncé indispensable 14** (p.37) : $\cours{e^{i\theta}=\cos\theta+i\sin\theta}$, de module 1. Tout $z\neq0$ s'écrit $\cours{z=\rho e^{i\theta}}$ avec $\rho=|z|$ et $\theta=\arg z$ défini modulo $2\pi$ (Prop. 2.17).
- **Énoncé indispensable 15**, Euler : $\cos\theta=\frac{e^{i\theta}+e^{-i\theta}}2$, $\sin\theta=\frac{e^{i\theta}-e^{-i\theta}}{2i}$.
- **Énoncé indispensable 16** : $e^{i\alpha}=e^{i\beta}\iff\alpha\equiv\beta\ [2\pi]$.
- **Produit** (p.39) : $\cours{(\rho_1e^{i\theta_1})(\rho_2e^{i\theta_2})=\rho_1\rho_2e^{i(\theta_1+\theta_2)}}$ : on multiplie les modules, on additionne les arguments.
- Exponentielle complexe (Déf. 2.23) : $e^{x+iy}=e^xe^{iy}$, de module $e^x$ et d'argument $y$.
[methode] **Passer en forme trigonométrique** : calculer $|z|$, le mettre en facteur, reconnaître $\cos\theta$ et $\sin\theta$.
[exemple] $-2\sqrt3+2i=4\left(-\frac{\sqrt3}2+\frac12i\right)=4e^{5i\pi/6}$ ; $1-i=\sqrt2\,e^{-i\pi/4}$ (TD2 ex 1 et 5).
[piege] Le quadrant se lit sur les signes de $\cos\theta$ **et** $\sin\theta$. Factoriser par l'angle moitié : $1-e^{ix}=-2i\sin\frac x2\,e^{ix/2}$ (TD2 ex 13).

## Racines de l'unité, sommes géométriques {#ch2.s3}
[cours] **Prop. 2.26** (p.41) : $z^n=1$ a exactement $n$ solutions, $\cours{\omega_k=e^{2ik\pi/n}}$, $0\le k\le n-1$. Pour $n=3$ : $1,\ j=e^{2i\pi/3},\ j^2=\bar j$, avec $\cours{1+j+j^2=0}$.
- $(z^n)$ tend vers $0$ si et seulement si $|z|<1$ (Lemme 2.27).
- Somme géométrique (Lemme 2.28) : pour $z\neq1$, $\cours{1+z+\dots+z^n=\frac{1-z^{n+1}}{1-z}}$.
[methode] **Résoudre $z^n=a$** : écrire $a=re^{i\varphi}$, chercher $z=\rho e^{i\theta}$ : $\rho=\sqrt[n]r$ et $\theta=\frac\varphi n+\frac{2k\pi}n$, $k=0,\dots,n-1$.
[exemple] $z^3=-27i=27e^{-i\pi/2}$ : $z=3e^{i\theta}$ avec $\theta=-\frac\pi6+\frac{2k\pi}3$ (TD2 ex 6). $z^3=8$ : $2,\ 2j,\ 2j^2$ (TD2 ex 3).
[piege] Il y a toujours $n$ solutions, espacées de $\frac{2\pi}n$ ; on prend la racine $n$-ième du module et on **divise** l'argument par $n$.

## Racines carrées, équations du second degré {#ch2.s4}
[cours] **Énoncé indispensable 17** (p.43) : pour $(x+iy)^2=a+ib$, écrire $x^2-y^2=a$, $2xy=b$ et ajouter l'équation du **module** $x^2+y^2=\sqrt{a^2+b^2}$.
- **Énoncé indispensable 18** (p.44) : $az^2+bz+c=0$, $\Delta=b^2-4ac$, solutions $\cours{\frac{-b\pm\delta}{2a}}$ où $\delta^2=\Delta$.
[methode] Coefficients réels et $\Delta<0$ : $\delta=i\sqrt{-\Delta}$, deux racines **conjuguées**. Coefficients complexes : chercher $\delta$ par l'Énoncé 17.
[exemple] Racines carrées de $5+12i$ : $x^2-y^2=5$, $x^2+y^2=13$, $xy>0$, donc $\pm(3+2i)$ (TD2 ex 4).
[piege] Pas de symbole $\sqrt{\ }$ dans $\mathbb C$ : deux racines carrées opposées, aucune n'est « la positive ».

## Polynômes : opérations, degré {#ch2.s5}
[cours] (§2.2, p.44–48) Un polynôme est déterminé par ses coefficients : deux polynômes sont égaux si et seulement s'ils ont les **mêmes coefficients**.
- $\cours{\deg(PQ)=\deg P+\deg Q}$ ; $\cours{\deg(P+Q)\le\max(\deg P,\deg Q)}$.
- Polynôme dérivé (Déf. 2.57) : $P'=na_nX^{n-1}+\dots+a_1$, de degré $n-1$.
[methode] **Équation d'inconnue un polynôme** (TD2 ex 8 et 9) : trouver d'abord le degré, poser les coefficients, identifier.
[exemple] $P^2+P=X^2+3X+2$ : degré 1, $P=aX+b$ avec $a^2=1$ ; on trouve $P=X+1$ ou $P=-X-2$.
[piege] Dans une somme, les termes dominants peuvent se compenser.

## Racines d'un polynôme {#ch2.s6}
[cours] (§2.3, p.48–54)
- $\alpha$ racine de $P$ $\iff$ $\cours{P=(X-\alpha)Q}$ (Prop. 2.45).
- **D'Alembert-Gauss** (Thm. 2.48) : tout polynôme complexe non constant a une racine dans $\mathbb C$ ; un polynôme de degré $n$ a exactement $n$ racines comptées avec multiplicité et $\cours{P=a(X-\alpha_1)\cdots(X-\alpha_n)}$ (Cor. 2.50).
- Seul le polynôme nul a « trop » de racines (Prop. 2.53).
- **Multiplicité** (Prop. 2.59) : $a$ est racine d'ordre $m$ $\iff$ $\cours{P(a)=P'(a)=\dots=P^{(m-1)}(a)=0}$ et $P^{(m)}(a)\neq0$.
- Coefficients réels : les racines non réelles vont par paires conjuguées ; $(Z-z)(Z-\bar z)=Z^2-2\Re(z)Z+|z|^2$ (TD2 ex 15).
[methode] **Degré 3** : tester $-1$, $0$, $1$, factoriser par $(Z-\alpha)$, puis résoudre le trinôme.
[exemple] $Z^3-7Z+6$ : $1$ est racine, $Z^3-7Z+6=(Z-1)(Z^2+Z-6)=(Z-1)(Z-2)(Z+3)$ (TD2 ex 10). $X^2+X+1=(X-j)(X-j^2)$ divise $(X+1)^7-X^7-1$ (TD2 ex 11).
[piege] $P(a)=0$ dit seulement « racine » ; c'est $P'(a)=0$ qui révèle une racine multiple.
