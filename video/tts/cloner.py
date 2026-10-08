#!/usr/bin/env python3
"""
Applique ta voix sur une narration déjà générée.

Principe : Piper produit un français correct (prononciation, prosodie),
puis OpenVoice v2 remplace uniquement le TIMBRE par le tien. On ne touche
pas à la langue — aucun risque de dégrader le français.

Le découpage en segments est fait ici (sur les silences), pour éviter
la dépendance à whisper/silero de se_extractor, qui échoue à l'install.

Usage :
  python tts/cloner.py out/<id>/audio/full.wav voice/sample.wav
"""
import argparse
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

import librosa
import numpy as np
import soundfile as sf
import torch
from openvoice.api import ToneColorConverter

RACINE = Path(__file__).resolve().parent.parent
CKPT = RACINE / "checkpoints_v2" / "converter"
SR_MODELE = 22050
DUREE_SEGMENT_S = 8.0


def decouper(chemin: Path, dossier: Path, prefixe: str) -> list[str]:
    """Découpe l'audio en segments exploitables, en coupant sur les silences."""
    y, sr = librosa.load(str(chemin), sr=SR_MODELE, mono=True)
    dossier.mkdir(parents=True, exist_ok=True)

    # retire les silences de début/fin, puis découpe en tranches régulières
    y, _ = librosa.effects.trim(y, top_db=30)
    taille = int(DUREE_SEGMENT_S * sr)
    chemins = []
    for i in range(0, len(y), taille):
        bloc = y[i : i + taille]
        if len(bloc) < sr * 1.5:          # ignore les bouts trop courts
            continue
        p = dossier / f"{prefixe}_{i // taille:03d}.wav"
        sf.write(p, bloc, sr)
        chemins.append(str(p))

    if not chemins:                        # audio très court : on le garde entier
        p = dossier / f"{prefixe}_000.wav"
        sf.write(p, y, sr)
        chemins.append(str(p))
    return chemins


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source", type=Path, help="narration générée (voix Piper)")
    ap.add_argument("reference", type=Path, help="échantillon de TA voix")
    ap.add_argument("--sortie", type=Path, default=None)
    ap.add_argument("--tau", type=float, default=0.3,
                    help="force du transfert de timbre (0.1 = léger, 0.6 = marqué)")
    args = ap.parse_args()

    for f in (args.source, args.reference):
        if not f.exists():
            sys.exit(f"❌ introuvable : {f}")

    device = "cpu"   # le convertisseur n'est pas stable sur MPS
    sortie = args.sortie or args.source.with_name(args.source.stem + "_clone.wav")
    travail = RACINE / "out" / "_clonage"

    conv = ToneColorConverter(str(CKPT / "config.json"), device=device)
    conv.load_ckpt(str(CKPT / "checkpoint.pth"))

    seg_ref = decouper(args.reference, travail / "ref", "ref")
    seg_src = decouper(args.source, travail / "src", "src")
    print(f"  référence : {len(seg_ref)} segments · source : {len(seg_src)} segments")

    se_cible = conv.extract_se(seg_ref)
    se_source = conv.extract_se(seg_src)

    conv.convert(
        audio_src_path=str(args.source),
        src_se=se_source,
        tgt_se=se_cible,
        output_path=str(sortie),
        tau=args.tau,
        message="@FromZeroToHero",
    )
    print(f"✅ {sortie}  (tau={args.tau})")


if __name__ == "__main__":
    sys.exit(main())
