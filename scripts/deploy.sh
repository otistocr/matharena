#!/bin/sh
# Publie l'appli sur GitHub Pages : tests, build, puis envoi du dossier dist/ sur la branche gh-pages.
# Usage : npm run deploy
set -e
cd "$(dirname "$0")/.."
npm test
npm run build
depot=$(git remote get-url origin)
version=$(git rev-parse --short HEAD)
tmp=$(mktemp -d)
cp -R dist/. "$tmp"
touch "$tmp/.nojekyll"
cd "$tmp"
git init -q -b gh-pages
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" commit -q -m "Déploiement de $version"
git push -q -f "$depot" gh-pages
cd "$OLDPWD"
rm -rf "$tmp"
echo "Publié (version $version)."
