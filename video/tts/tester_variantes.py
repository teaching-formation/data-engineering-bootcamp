#!/usr/bin/env python3
"""Génère un audio comparatif de plusieurs graphies phonétiques, pour choisir à l'oreille."""
import sys, warnings, numpy as np, soundfile as sf
warnings.filterwarnings("ignore")
sys.path.insert(0, "tts")
from generate import MoteurPiper

PHRASE = "Le {}, c'est le socle technique."
VARIANTES = [
    ("actuelle", "data inndjinieringue"),
    ("A", "data ènedjinirine"),
    ("B", "déïta ènedjinirine"),
    ("C", "data ènne djini rine"),
    ("D", "data ènndjinirigne"),
]

m = MoteurPiper("fr_FR-tom-medium", 1.0)
sr = m.sample_rate
blanc = np.zeros(int(sr * 0.7), dtype=np.float32)
morceaux = []
for label, graphie in VARIANTES:
    morceaux.append(m.synthetiser(f"Version {label}."))
    morceaux.append(np.zeros(int(sr * 0.25), dtype=np.float32))
    morceaux.append(m.synthetiser(PHRASE.format(graphie)))
    morceaux.append(blanc)
    print(f"  {label:<9} → {graphie}")

sf.write("out/variantes_data_engineering.wav", np.concatenate(morceaux), sr)
print("\n✅ out/variantes_data_engineering.wav")
