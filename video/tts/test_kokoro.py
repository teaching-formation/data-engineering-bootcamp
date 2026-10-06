import soundfile as sf
from kokoro import KPipeline

TEXTE = ("Dédupliquer, c'est souvent traiter le symptôme. "
         "Si c'est un rejeu de pipeline, il faut rendre l'ingestion idempotente.")

pipe = KPipeline(lang_code='f')          # 'f' = français
audio_chunks = []
for _, _, audio in pipe(TEXTE, voice='ff_siwis', speed=1.0):
    audio_chunks.append(audio)

import numpy as np
audio = np.concatenate(audio_chunks)
sf.write("out/test_fr.wav", audio, 24000)
print(f"✅ généré : out/test_fr.wav — {len(audio)/24000:.1f}s")
