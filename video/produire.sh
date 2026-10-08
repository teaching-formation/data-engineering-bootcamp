#!/usr/bin/env bash
# ==============================================================================
# Produit un Short de bout en bout : script JSON → narration → vidéo 9:16
#
# Usage :  ./produire.sh scripts/02-cest-quoi-le-data-engineering.json
# ==============================================================================
set -euo pipefail

SCRIPT="${1:?usage: ./produire.sh scripts/NN-slug.json}"
RACINE="$(cd "$(dirname "$0")" && pwd)"
cd "$RACINE"

ID=$(python3 -c "import json,sys; print(json.load(open('$SCRIPT'))['id'])")
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "▸ 1/3 — Narration (voix + lexique de prononciation)…"
./.venv/bin/python tts/generate.py "$SCRIPT" --engine piper --speed 1.05 \
  2>&1 | grep -E "✅|^  [a-z]" || true

echo "▸ 2/3 — Préparation des assets pour le rendu…"
cp "out/$ID/audio/full.wav" render/public/audio/narration.wav
cp "out/$ID/timings.json"   render/src/data/timings.json
cp "$SCRIPT"                render/src/data/script.json

echo "▸ 3/3 — Rendu vidéo 1080×1920…"
cd render
npx remotion render src/index.ts Short "../out/$ID/short.mp4" \
  --browser-executable="$CHROME" 2>&1 | tail -2

cd "$RACINE"
echo ""
echo "✅ out/$ID/short.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$ID/short.mp4" \
  | awk '{printf "   durée : %.1fs\n", $1}'
