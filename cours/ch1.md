# Géométrie du plan et de l'espace
Chapitre 1 du poly (p.5–30) : le plan et l'espace vus comme des points, comme des vecteurs, et surtout **en coordonnées**. Les Énoncés indispensables 1 à 9 sont tous ici.

## Vecteurs, produit scalaire, projection {#ch1.s1}
[cours] **Énoncé indispensable 1** : $\cours{\vec u\cdot\vec v=\|\vec u\|\,\|\vec v\|\cos\theta}$, où $\theta\in[0,\pi]$ est l'angle **non orienté**.
- $\vec u\cdot\vec u=\|\vec u\|^2$ ; pour deux vecteurs non nuls, $\cours{\vec u\cdot\vec v=0\iff\vec u\perp\vec v}$.
- Le signe du produit scalaire est celui de $\cos\theta$ : positif = angle aigu, négatif = angle obtus.
- $\|\lambda\vec u\|=|\lambda|\,\|\vec u\|$ ; Chasles : $\overrightarrow{AB}+\overrightarrow{BC}=\overrightarrow{AC}$.
- **Projeté orthogonal** sur une direction $\vec d$ : $\cours{\vec u'=\frac{\vec u\cdot\vec d}{\|\vec d\|^2}\,\vec d}$ (§1.1.5).
[methode] **Trouver un angle** : calculer $\vec u\cdot\vec v$ de deux façons (composantes et normes), puis $\cos\theta=\frac{\vec u\cdot\vec v}{\|\vec u\|\|\vec v\|}$.
[exemple] $\vec u=(-1,0)$, $\vec v=(\sqrt3,-1)$ : $\vec u\cdot\vec v=-\sqrt3$, $\|\vec u\|=1$, $\|\vec v\|=2$, donc $\cos\theta=-\frac{\sqrt3}2$ et $\theta=\frac{5\pi}6$.
[piege] $\vec u\cdot\vec v=0$ n'implique pas que $\vec u=\vec0$ ou $\vec v=\vec0$. Et le projeté n'est $(\vec u\cdot\vec\imath)\vec\imath$ que si $\|\vec\imath\|=1$.

## Bases, familles libres, composantes {#ch1.s2}
[cours] Une famille est **libre** si $\lambda_1\vec u_1+\dots+\lambda_k\vec u_k=\vec0$ impose $\lambda_1=\dots=\lambda_k=0$ (Déf. 1.2), et **liée** sinon.
- 2 vecteurs sont liés $\iff$ colinéaires ; 3 vecteurs sont liés $\iff$ coplanaires.
- Plan : base = 2 vecteurs libres ; espace : base = 3 vecteurs libres (Prop. 1.3). 4 vecteurs de l'espace sont **toujours** liés (Rem. 1.4).
- **Énoncé indispensable 3** : $\cours{\overrightarrow{MM'}=(x'-x,\ y'-y)}$, arrivée moins départ.
- **Énoncé indispensable 4** : en base orthonormée, $\cours{\vec u\cdot\vec v=xx'+yy'(+zz')}$ ; **Énoncé indispensable 5** : symétrique et bilinéaire.
[methode] **Libre ou liée (3 vecteurs de l'espace)** : résoudre le système $\lambda_1\vec u_1+\lambda_2\vec u_2+\lambda_3\vec u_3=\vec0$, ou calculer $\vec n=\vec u_1\wedge\vec u_2$ et tester $\vec n\cdot\vec u_3=0$ (coplanaires).
[exemple] $(0,-3,0),(0,1,3),(2,1,3)$ : le système donne $\lambda_3=0$, puis $\lambda_2=0$, puis $\lambda_1=0$. La famille est libre, c'est donc une base.
[piege] « Deux à deux non colinéaires » ne suffit pas pour trois vecteurs.

## Produit vectoriel {#ch1.s3}
[cours] (Déf. 1.5) $\vec u\wedge\vec v$ est un **vecteur** orthogonal à $\vec u$ et à $\vec v$, de norme $\|\vec u\|\|\vec v\|\sin\theta$, tel que $(\vec u,\vec v,\vec u\wedge\vec v)$ est directe. **Énoncé indispensable 6** : $$\cours{\begin{pmatrix}x\\y\\z\end{pmatrix}\wedge\begin{pmatrix}x'\\y'\\z'\end{pmatrix}=\begin{pmatrix}yz'-zy'\\zx'-xz'\\xy'-yx'\end{pmatrix}}$$
- Antisymétrique : $\vec u\wedge\vec v=-\vec v\wedge\vec u$ ; bilinéaire.
- $\cours{\vec u\wedge\vec v=\vec0\iff\vec u,\vec v\text{ colinéaires}}$.
- $\|\vec u\wedge\vec v\|$ = aire du parallélogramme ; le triangle en est la **moitié**.
[methode] Calculer, puis **toujours vérifier** : $(\vec u\wedge\vec v)\cdot\vec u=0$ et $(\vec u\wedge\vec v)\cdot\vec v=0$.
[exemple] $(2,1,-1)\wedge(0,3,4)=(1\cdot4-(-1)\cdot3,\ (-1)\cdot0-2\cdot4,\ 2\cdot3-1\cdot0)=(7,-8,6)$ ; vérification : $14-8-6=0$ ✓.
[piege] L'ordre des vecteurs, et la 2e composante $zx'-xz'$. Le produit vectoriel n'existe que dans l'**espace**.

## Équations de droites et de plans {#ch1.s4}
[cours] **Paramétrique** : la droite passant par $A$ et dirigée par $\vec u$ est $\{A+\lambda\vec u\}$. Pratique pour **produire** des points, pas pour tester l'appartenance.
- **Énoncé indispensable 7** (droite du plan, passant par $(a,b)$ et dirigée par $(s,t)$) : $\cours{-t(x-a)+s(y-b)=0}$. Pour $ax+by+c=0$ : vecteur normal $(a,b)$, vecteur directeur $(-b,a)$.
- **Plan** passant par $A$ et dirigé par $\vec u,\vec v$ : $\vec n=\vec u\wedge\vec v$, puis $\cours{M\in P\iff\overrightarrow{AM}\cdot\vec n=0}$, soit $ax+by+cz+d=0$ avec $\vec n=(a,b,c)$.
- **Droite de l'espace** : un système de **deux** équations cartésiennes (Énoncé indispensable 8).
[methode] **Paramétrique → cartésienne** : lire un point et un vecteur directeur, puis appliquer l'Énoncé 7 (ou éliminer le paramètre). **Appartenance (paramétrique)** : il faut un **même** $\lambda$ pour toutes les coordonnées.
[exemple] Plan par $A=(0,1,2)$ dirigé par $(1,0,1)$ et $(0,1,1)$ : $\vec n=(-1,-1,1)$, d'où $x+y-z+1=0$.
[piege] La constante $d$ ne fait pas partie du vecteur normal. Et une équation cartésienne n'est définie qu'**à un facteur près**.

## Équation d'un cercle {#ch1.s5}
[cours] **Énoncé indispensable 9** : en repère orthonormé, le cercle de centre $(a,b)$ et de rayon $r$ a pour équation $\cours{(x-a)^2+(y-b)^2=r^2}$.
[methode] **Retrouver centre et rayon** : compléter les carrés, $x^2-2px=(x-p)^2-p^2$.
[exemple] $x^2-2x+y^2-4y-4=0\iff(x-1)^2+(y-2)^2=9$ : centre $(1,2)$, rayon $3$.
[piege] Le membre de droite vaut $r^2$, pas $r$. Et $(x+3)^2$ correspond à un centre d'abscisse $-3$.

## Transformations du plan {#ch1.s6}
[cours] (§1.6)
- Translation : $T_{\vec a}(\vec x)=\vec x+\vec a$, avec $T_{\vec u}T_{\vec v}=T_{\vec u+\vec v}$. Elle n'est **pas linéaire**.
- Homothétie : $H_k(\vec u)=k\vec u$, avec $H_aH_b=H_{ab}$.
- Rotation $R_\theta$ : conserve la norme et tourne de $\theta$. En base orthonormée directe, $R_{\pi/2}(x,y)=(-y,x)$ et $R_\pi(\vec u)=-\vec u$.
- Dans une base $(\vec e_1,\vec e_2)$, si $\vec u=x_1\vec e_1+x_2\vec e_2$ : symétrie $S_1(\vec u)=x_1\vec e_1-x_2\vec e_2$ et projection $p_1(\vec u)=x_1\vec e_1$.
[methode] **Symétrie ou projection dans une base quelconque** : (1) décomposer $\vec u$ en résolvant un système 2×2 ; (2) appliquer la définition ; (3) revenir aux composantes canoniques.
[piege] Si la base n'est pas orthonormée, on ne « lit » pas $x_1,x_2$ sur les composantes : il faut résoudre le système.
