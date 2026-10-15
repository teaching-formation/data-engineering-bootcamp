#!/usr/bin/env python3
"""Génère un .srt à partir du script et des durées mesurées.

Les sous-titres reprennent la narration D'ORIGINE, jamais le texte respelé du
lexique : à l'écran on doit lire « dbt docs serve », pas « dibiti doks seurve ».

Usage :
  python tts/sous_titres.py out/<id>
"""
import json
import re
import sys
from pathlib import Path

LARGEUR_LIGNE = 42      # caractères par ligne, lisible en 1080p
MAX_LIGNES = 2
DUREE_MIN_S = 1.2       # un sous-titre plus court est illisible


def decouper(texte: str) -> list[str]:
    """Découpe en sous-titres de 2 lignes max, en cassant d'abord aux phrases."""
    phrases = [p.strip() for p in re.split(r"(?<=[.!?:;])\s+", texte) if p.strip()]
    plafond = LARGEUR_LIGNE * MAX_LIGNES
    blocs: list[str] = []
    for phrase in phrases:
        if len(phrase) <= plafond:
            blocs.append(phrase)
            continue
        # phrase trop longue : on regroupe ses propositions (coupure aux virgules)
        courant = ""
        for prop in re.split(r"(?<=,)\s+", phrase):
            for morceau in ([prop] if len(prop) <= plafond else couper_equilibre(prop, plafond)):
                if courant and len(courant) + 1 + len(morceau) > plafond:
                    blocs.append(courant)
                    courant = morceau
                else:
                    courant = f"{courant} {morceau}".strip()
        if courant:
            blocs.append(courant)
    return blocs


def couper_equilibre(texte: str, plafond: int) -> list[str]:
    """Coupe sur les mots en blocs de longueur égale.

    Un découpage glouton remplit chaque bloc au maximum et laisse traîner un mot
    seul à la fin (« pas. ») ; viser la longueur moyenne l'évite.
    """
    mots = texte.split()
    n = -(-len(texte) // plafond)
    while True:
        cible = len(texte) / n
        blocs, courant = [], ""
        for mot in mots:
            essai = f"{courant} {mot}".strip()
            if courant and len(blocs) < n - 1 and abs(len(essai) - cible) > abs(len(courant) - cible):
                blocs.append(courant)
                courant = mot
            else:
                courant = essai
        blocs.append(courant)
        if all(len(b) <= plafond for b in blocs):
            return blocs
        n += 1


def habiller(bloc: str) -> str:
    """Répartit le bloc sur au plus 2 lignes équilibrées."""
    if len(bloc) <= LARGEUR_LIGNE:
        return bloc
    mots = bloc.split()
    milieu = len(bloc) / 2
    meilleur, ecart = 1, float("inf")
    for i in range(1, len(mots)):
        gauche = len(" ".join(mots[:i]))
        if abs(gauche - milieu) < ecart:
            ecart, meilleur = abs(gauche - milieu), i
    return " ".join(mots[:meilleur]) + "\n" + " ".join(mots[meilleur:])


def repartir(duree: float, blocs: list[str], mini: float) -> list[float]:
    """Répartit la durée d'un segment entre ses sous-titres.

    Au prorata du nombre de caractères — ce qui approxime le temps de lecture —
    mais sans laisser un bloc court passer en coup de vent : « Bonjour ! » ne
    doit pas clignoter 0,3 s. Les blocs sous le minimum sont relevés, et le
    temps manquant est pris sur ceux qui ont de la marge.
    """
    total = sum(len(b) for b in blocs) or 1
    parts = [duree * len(b) / total for b in blocs]
    if len(blocs) * mini >= duree:      # segment trop court : rien à redistribuer
        return parts
    for _ in range(4):
        manque = sum(mini - p for p in parts if p < mini)
        if manque < 1e-6:
            break
        marge = sum(p - mini for p in parts if p > mini)
        if marge <= manque:
            break
        parts = [mini if p < mini else p - manque * (p - mini) / marge for p in parts]
    return parts


def horodate(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def main() -> None:
    dossier = Path(sys.argv[1])
    chemin_script = Path(sys.argv[2])
    script = json.loads(chemin_script.read_text(encoding="utf-8"))
    timings = json.loads((dossier / "timings.json").read_text(encoding="utf-8"))

    narration = {s["id"]: s["narration"] for s in script["segments"]}

    cues: list[tuple[float, float, str]] = []
    for seg in timings["segments"]:
        texte = narration.get(seg["id"], "")
        blocs = decouper(texte)
        if not blocs:
            continue
        t = seg["debut_s"]
        for b, part in zip(blocs, repartir(seg["duree_s"], blocs, DUREE_MIN_S)):
            cues.append((t, t + part, habiller(b)))
            t += part

    lignes = [
        f"{n}\n{horodate(debut)} --> {horodate(fin)}\n{texte}\n"
        for n, (debut, fin, texte) in enumerate(cues, 1)
    ]

    sortie = dossier / "sous-titres.srt"
    sortie.write_text("\n".join(lignes), encoding="utf-8")
    print(f"✅ {sortie.name} · {len(cues)} sous-titres")


if __name__ == "__main__":
    main()
