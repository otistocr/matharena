# MathArena — UL1MA001

Entraînement maths L1 (Sorbonne Université, UL1MA001) façon zetamac : Entraînement (toutes les questions),
Blitz 3 min, Défi du jour, **cahier d’erreurs** (une erreur sort du cahier après 2 réussites d’affilée, rappels SM-2),
progression par chapitre et par section. Corrections en blocs colorés. PWA 100 % statique et hors-ligne, sans compte ni serveur.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur local (accessible depuis le téléphone sur le même Wi-Fi) |
| `npm test` | tests unitaires (SM-2, cahier d’erreurs, correcteur de réponses, schéma, export/import) |
| `npm run validate-questions` | vérifie toutes les banques (refuse toute question sans réponse ni explication) |
| `npm run new-chapter -- <id> "<Titre>" "<Court>" [sorbonne\|lycee]` | crée un nouveau fichier de banque |
| `npm run build` | validation + typage + build dans `dist/` |

## Banques de questions

Un fichier par chapitre dans `questions/` : métadonnées du chapitre (sections) + questions.
Schéma : `src/data/schema.ts`. Types : `qcm`, `vf`, `num`, `court`, `redaction`.

- `num` : `reponse` nombre ou expression (`"5pi/6"`, `"(7,-8,6)"`, `"1+i"`), `tolerance` facultative.
- `court` : `reponse` = formes acceptées, `variables`, `mode` `expression` (égalité de fonctions)
  ou `equation` (même équation à un facteur près). La correction se fait par évaluation numérique.
- Chaque question porte `source` (TD1 ex 3, poly p.42, CC1 2023…, créée), `origine`
  (transposée/créée), `refCours` et, si besoin, `indispensable` (★ n° ou `true`).

Arborescence des chapitres : `docs/arborescence.md`. Les documents sources (`sources/`) ne sont pas versionnés.

## Déploiement (GitHub Pages)

1. Crée un dépôt GitHub (ex. `matharena`) et pousse la branche `main`.
2. Dans le dépôt : **Settings → Pages → Source : GitHub Actions**.
3. Chaque `git push` sur `main` teste, valide les questions, build et déploie
   (`.github/workflows/deploy.yml`). URL : `https://<pseudo>.github.io/matharena/`.

Sur iPhone/iPad : ouvre l’URL dans Safari → Partager → **Sur l’écran d’accueil**.

## Données

Historique et cahier d’erreurs sont en IndexedDB, sur l’appareil uniquement.
Onglet **Données** → Exporter / Importer (fusion) pour synchroniser à la main.
