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

ID=$(python3 -c "import json; print(json.load(open('$SCRIPT'))['id'])")
FORMAT=$(python3 -c "import json; print(json.load(open('$SCRIPT')).get('format','short'))")
[ "$FORMAT" = "long" ] && COMPO="Cours" || COMPO="Short"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
VOIX="voice/sample.wav"      # ta voix ; si absent, on garde la voix Piper
TAU=0.7

echo "▸ 1/4 — Narration (voix + lexique de prononciation)…"
./.venv/bin/python tts/generate.py "$SCRIPT" --engine piper --speed 1.05 \
  2>&1 | grep -E "✅|^  [a-z]" || true

AUDIO="out/$ID/audio/full.wav"
if [ -f "$VOIX" ]; then
  echo "▸ 2/4 — Application de ta voix (tau=$TAU)…"
  ./.venv/bin/python tts/cloner.py "$AUDIO" "$VOIX" --tau "$TAU" \
    --sortie "out/$ID/audio/full_clone.wav" 2>&1 | grep -E "^✅|segments" || true
  AUDIO="out/$ID/audio/full_clone.wav"
fi

echo "▸ 3/4 — Préparation des assets pour le rendu…"
cp "$AUDIO" render/public/audio/narration.wav
cp "out/$ID/timings.json"   render/src/data/timings.json
cp "$SCRIPT"                render/src/data/script.json

echo "▸ 4/4 — Rendu vidéo ($COMPO)…"
cd render
npx remotion render src/index.ts "$COMPO" "../out/$ID/video.mp4" \
  --browser-executable="$CHROME" 2>&1 | tail -2

cd "$RACINE"
echo ""
echo "✅ out/$ID/video.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$ID/video.mp4" \
  | awk '{printf "   durée : %.1fs\n", $1}'
