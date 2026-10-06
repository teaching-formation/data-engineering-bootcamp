#!/usr/bin/env python3
"""
Génère la narration d'une vidéo à partir de son script JSON.

Applique d'abord le lexique de prononciation (tts/lexique.json) pour que les
termes anglais ne soient pas lus à la française, puis synthétise.

Moteurs :
  --engine piper   voix masculine française (défaut)
  --engine kokoro  voix féminine française

Produit :
  out/<id>/audio/<segment>.wav   un fichier par segment
  out/<id>/audio/full.wav        la narration complète
  out/<id>/timings.json          durée de chaque segment (pilote l'animation)
  out/<id>/narration_lue.txt     le texte réellement prononcé (pour vérifier le lexique)

Usage :
  python tts/generate.py scripts/01-deduplication.json
  python tts/generate.py scripts/01-deduplication.json --engine kokoro
"""
import argparse
import json
import re
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

import numpy as np
import soundfile as sf

SILENCE_ENTRE_SEGMENTS_S = 0.45
RACINE = Path(__file__).resolve().parent.parent


# ──────────────────────────── lexique ────────────────────────────

def charger_lexique():
    data = json.loads((RACINE / "tts" / "lexique.json").read_text())
    termes = data["termes"]
    # les expressions les plus longues d'abord (« MERGE INTO » avant « merge »)
    return sorted(termes.items(), key=lambda kv: -len(kv[0]))


def appliquer_lexique(texte, lexique):
    """Remplace chaque terme par sa graphie phonétique, en respectant les limites de mots."""
    for terme, phonetique in lexique:
        motif = r"(?<!\w)" + re.escape(terme) + r"(?!\w)"
        texte = re.sub(motif, phonetique, texte, flags=re.IGNORECASE)
    return texte


# ──────────────────────────── moteurs ────────────────────────────

class MoteurPiper:
    """Piper (MIT) — voix masculine française."""
    nom = "piper"

    def __init__(self, voix="fr_FR-tom-medium", vitesse=1.0):
        from piper import PiperVoice
        modele = RACINE / ".voices" / f"{voix}.onnx"
        if not modele.exists():
            sys.exit(f"❌ voix absente : {modele}\n"
                     f"   → .venv/bin/python -m piper.download_voices {voix} --data-dir .voices")
        self.voice = PiperVoice.load(str(modele))
        self.vitesse = vitesse
        self.sample_rate = self.voice.config.sample_rate

    def synthetiser(self, texte):
        from piper import SynthesisConfig
        cfg = SynthesisConfig(length_scale=1.0 / self.vitesse)
        morceaux = [np.frombuffer(c.audio_int16_bytes, dtype=np.int16)
                    for c in self.voice.synthesize(texte, syn_config=cfg)]
        return np.concatenate(morceaux).astype(np.float32) / 32768.0


class MoteurKokoro:
    """Kokoro (Apache 2.0) — voix féminine française."""
    nom = "kokoro"
    sample_rate = 24_000

    def __init__(self, voix="ff_siwis", vitesse=1.0):
        from kokoro import KPipeline
        self.pipe = KPipeline(lang_code="f", repo_id="hexgrad/Kokoro-82M")
        self.voix, self.vitesse = voix, vitesse

    def synthetiser(self, texte):
        morceaux = [a for _, _, a in self.pipe(texte, voice=self.voix, speed=self.vitesse)]
        return np.concatenate(morceaux)


# ──────────────────────────── principal ────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script", type=Path)
    ap.add_argument("--engine", choices=["piper", "kokoro"], default="piper")
    ap.add_argument("--voice", default=None)
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--no-lexique", action="store_true", help="désactive le lexique (pour comparer)")
    args = ap.parse_args()

    script = json.loads(args.script.read_text())
    sortie = RACINE / "out" / script["id"]
    (sortie / "audio").mkdir(parents=True, exist_ok=True)

    lexique = [] if args.no_lexique else charger_lexique()

    if args.engine == "piper":
        moteur = MoteurPiper(args.voice or "fr_FR-tom-medium", args.speed)
    else:
        moteur = MoteurKokoro(args.voice or "ff_siwis", args.speed)

    sr = moteur.sample_rate
    silence = np.zeros(int(sr * SILENCE_ENTRE_SEGMENTS_S), dtype=np.float32)
    timings, pleine, curseur, relu = [], [], 0.0, []

    print(f"moteur : {moteur.nom} · lexique : {'off' if args.no_lexique else f'{len(lexique)} termes'}\n")

    for seg in script["segments"]:
        texte = appliquer_lexique(seg["narration"], lexique)
        relu.append(f"[{seg['id']}]\n{texte}\n")

        audio = moteur.synthetiser(texte)
        duree = len(audio) / sr
        sf.write(sortie / "audio" / f"{seg['id']}.wav", audio, sr)

        timings.append({
            "id": seg["id"], "niveau": seg.get("niveau"),
            "debut_s": round(curseur, 3), "duree_s": round(duree, 3),
            "fin_s": round(curseur + duree, 3),
        })
        pleine.extend([audio, silence])
        curseur += duree + SILENCE_ENTRE_SEGMENTS_S
        print(f"  {seg['id']:<10} {duree:5.1f}s")

    full = np.concatenate(pleine)
    sf.write(sortie / "audio" / "full.wav", full, sr)
    (sortie / "narration_lue.txt").write_text("\n".join(relu))

    total = len(full) / sr
    (sortie / "timings.json").write_text(json.dumps(
        {"id": script["id"], "engine": moteur.nom, "sample_rate": sr,
         "total_s": round(total, 3), "segments": timings},
        ensure_ascii=False, indent=2))

    cible = script.get("duree_cible_s")
    print(f"\n✅ narration : {total:.1f}s" + (f" (cible {cible}s)" if cible else ""))
    print(f"   → {sortie.relative_to(RACINE)}/audio/full.wav")
    print(f"   → {sortie.relative_to(RACINE)}/narration_lue.txt  (vérifie le lexique ici)")


if __name__ == "__main__":
    sys.exit(main())
