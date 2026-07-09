#!/usr/bin/env bash
# ==============================================================================
# Déploiement du site Next.js sur Vercel (projet data-engineering-bootcamp)
# ==============================================================================
# Le renderer lit les notebooks dans ../notebooks au build, donc on build en
# local puis on pousse le dossier statique `out/` sur Vercel.
#
# Usage :  ./deploy.sh
# ==============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/site"

echo "▸ Build du site (Next.js export + index Pagefind)…"
npm run build   # exécute next build puis postbuild (pagefind --site out)

echo "▸ Déploiement du dossier out/ sur le projet data-engineering-bootcamp…"
cd out
mkdir -p .vercel
cat > .vercel/project.json <<'JSON'
{"projectId":"prj_fdRBu4YRBT0n1VlrkRGtwKkldcP6","orgId":"team_gzHpTN5fL7z69QNq6vfa0rd7","projectName":"data-engineering-bootcamp"}
JSON

# Note : la redirection data-engineering-bootcamp.vercel.app → dataeng.from0tohero.dev
# est configurée au niveau du domaine Vercel (persistante), pas ici.

vercel deploy --prod --yes

echo "✅ Déployé sur https://data-engineering-bootcamp.vercel.app"
