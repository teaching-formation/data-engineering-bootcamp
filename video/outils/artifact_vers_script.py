#!/usr/bin/env python3
"""Transforme une page-lecteur web en script de production vidéo.

Pour une page bâtie sur le modèle « un tableau de scènes » : un tableau JS
nommé S, dont chaque élément porte un titre (t), un visuel (html) et une
narration (say). C'est tout ce dont la chaîne a besoin.

Le tableau est lu SANS évaluer le JavaScript de la page : c'est de la donnée
pure, on la parse. On n'exécute jamais le code d'une page qu'on n'a pas écrite.

Usage :
  python outils/artifact_vers_script.py page.html L02-mon-tuto "Titre de la vidéo"
"""
import argparse
import json
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

# Échappements d'un template literal JS. Sans ça, « .venv\\Scripts » du source
# — qui vaut « .venv\Scripts » une fois évalué par le navigateur — s'afficherait
# avec un double antislash dans la vidéo.
ECHAPPEMENTS = {"\\": "\\", "`": "`", "$": "$", "n": "\n", "t": "\t", "r": "\r"}


def deslash(brut: str) -> str:
    sortie, i = [], 0
    while i < len(brut):
        if brut[i] == "\\" and i + 1 < len(brut):
            suite = brut[i + 1]
            if suite in ECHAPPEMENTS:
                sortie.append(ECHAPPEMENTS[suite])
                i += 2
                continue
            if suite == "u" and i + 6 <= len(brut):
                try:
                    sortie.append(chr(int(brut[i + 2 : i + 6], 16)))
                    i += 6
                    continue
                except ValueError:
                    pass
        sortie.append(brut[i])
        i += 1
    return "".join(sortie)


def dechaine(brut: str) -> str:
    """Décode une chaîne JS double-quotée."""
    try:
        return json.loads('"' + brut + '"')
    except json.JSONDecodeError:
        return json.loads('"' + brut.replace("\\'", "'") + '"')   # \' : légal en JS, pas en JSON


def extraire_scenes(texte: str) -> list[dict]:
    debut = texte.index("const S = [")
    fin = texte.index("\n];", debut)
    blocs = [b.strip() for b in
             re.split(r"\n(?=\{\s*t:\s*\")", texte[debut + len("const S = [") : fin])
             if b.strip()]

    scenes = []
    for n, bloc in enumerate(blocs, 1):
        mt = re.search(r't:\s*"((?:[^"\\]|\\.)*)"', bloc)
        mh = re.search(r"html:\s*`([^`]*)`", bloc, re.S)
        ms = re.search(r'say:\s*"((?:[^"\\]|\\.)*)"', bloc, re.S)
        if not (mt and mh and ms):
            sys.exit(f"scène {n} : champ manquant (t={bool(mt)} html={bool(mh)} say={bool(ms)})")
        scenes.append({
            "n": n,
            "titre": dechaine(mt.group(1)),
            "html": deslash(mh.group(1).strip()),
            "narration": dechaine(ms.group(1)),
        })
    return scenes


def extraire_css(texte: str) -> str:
    m = re.search(r"<style>(.*?)</style>", texte, re.S)
    if not m:
        sys.exit("aucune balise <style> trouvée")
    return re.sub(r"\}\s*", "}\n", m.group(1))


def duree_estimee(narration: str) -> float:
    """Reproduit l'estimation du lecteur d'origine : max(7, mots/2.45 + 1.5).

    Elle ne sert PAS de durée — la chaîne mesure l'audio réel. Elle sert
    d'échelle : les délais d'animation de la page ont été écrits contre elle,
    et le composant de rendu les remappe sur la durée mesurée.
    """
    return round(max(7.0, len(narration.split()) / 2.45 + 1.5), 2)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("page", type=Path, help="la page HTML du lecteur")
    ap.add_argument("id", help="identifiant du script, ex. L02-mon-tuto")
    ap.add_argument("titre", help="titre de la vidéo")
    args = ap.parse_args()

    texte = args.page.read_text(encoding="utf-8", errors="replace")
    scenes = extraire_scenes(texte)
    css = extraire_css(texte)

    segments = [{
        "id": f"sc{s['n']:02d}",
        "chapitre": s["n"],
        "narration": s["narration"],
        "visuel": {
            "type": "html",
            "titre": s["titre"],
            "html": s["html"],
            "duree_artifact_s": duree_estimee(s["narration"]),
        },
    } for s in scenes]

    script = {
        "id": args.id,
        "titre": args.titre,
        "format": "long",
        "orientation": "16:9",
        "composition": "Tuto",
        "resolution": [1920, 1080],
        "duree_cible_s": round(sum(s["visuel"]["duree_artifact_s"] for s in segments)),
        "source": f"Page-lecteur « {args.page.name} » — visuels et narration repris tels quels",
        "segments": segments,
    }

    chemin = RACINE / "scripts" / f"{args.id}.json"
    chemin.write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # La CSS devient un module TS : évite toute config de bundler pour un import brut.
    sur = css.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    (RACINE / "render" / "src" / "data" / "artifactCss.ts").write_text(
        "// Généré depuis la CSS de la page source — ne pas éditer à la main.\n"
        f"export const ARTIFACT_CSS = `{sur}`;\n", encoding="utf-8")

    mots = sum(len(s["narration"].split()) for s in scenes)
    animes = len(re.findall(r"--d:", "".join(s["html"] for s in scenes)))
    print(f"→ scripts/{args.id}.json")
    print(f"   {len(segments)} scènes · {mots} mots · {animes} éléments animés")
    print(f"→ render/src/data/artifactCss.ts  ({len(css)} caractères)")
    print(f"\nEnsuite :  ./produire.sh scripts/{args.id}.json")


if __name__ == "__main__":
    main()
