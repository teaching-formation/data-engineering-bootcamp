# Chaîne de production vidéo — FromZeroToHero

Produit une vidéo commentée à partir d'un fichier JSON : narration synthétisée,
timbre de voix remplacé par le tien, visuels animés, sous-titres `.srt`.

Tout tourne **en local**, sans service payant : Piper (MIT) pour la synthèse,
OpenVoice v2 (MIT) pour le clonage de timbre, Remotion pour le rendu.

```
script JSON  →  narration (lexique + synthèse)  →  clonage du timbre  →  sous-titres  →  rendu
```

Une commande :

```bash
./produire.sh scripts/mon-script.json
```

---

## Ce qu'il faut avant

| | version utilisée | note |
|---|---|---|
| Python | 3.12 | géré par [uv](https://docs.astral.sh/uv/) |
| Node | 26 | pour Remotion |
| ffmpeg | — | `brew install ffmpeg` |
| Google Chrome | — | voir « Chrome » plus bas |

## Installation

```bash
uv venv --python 3.12
uv pip install piper-tts librosa soundfile numpy scipy pydub onnxruntime torch
```

**OpenVoice demande une précaution.** Son `setup.py` épingle PyAV 10, qui ne
compile plus. On l'installe donc sans ses dépendances, puis on les remet à la
main dans des versions qui, elles, s'installent :

```bash
uv pip install --no-deps git+https://github.com/myshell-ai/OpenVoice
uv pip install av inflect eng_to_ipa jieba cn2an wavmark \
               faster-whisper whisper-timestamped
```

### Les modèles (≈ 190 Mo, non versionnés)

```bash
# voix française masculine pour Piper
.venv/bin/python -m piper.download_voices fr_FR-tom-medium --data-dir .voices

# convertisseur de timbre OpenVoice v2 → checkpoints_v2/converter/
#   depuis https://huggingface.co/myshell-ai/OpenVoiceV2
```

### Remotion

```bash
cd render && npm install
```

**Chrome.** Le téléchargement du Chrome Headless de Remotion échoue souvent
(`ECONNRESET`). `produire.sh` contourne en pointant le Chrome déjà installé :

```bash
--browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

### Ta voix

Dépose un échantillon en `voice/sample.wav` — voir `voice/ENREGISTRE-MOI.md`
pour la durée et les conditions d'enregistrement. **Il n'est jamais versionné.**
Sans ce fichier, la chaîne garde simplement la voix Piper.

La force du transfert se règle par `TAU` dans `produire.sh` (0.7 = marqué).

---

## Écrire une vidéo

### À partir d'une page-lecteur web

Si tu as déjà une page qui enchaîne des scènes (un tableau `S` de `{t, html, say}`) :

```bash
.venv/bin/python outils/artifact_vers_script.py page.html L02-mon-tuto "Mon titre"
./produire.sh scripts/L02-mon-tuto.json
```

Les visuels sont repris **tels quels**. Deux conditions pour que ça marche sans
retouche : la scène doit être en `aspect-ratio:16/9` et ses tailles en `cqw`.

Le composant `render/src/scenes/Html.tsx` s'occupe du reste — et il y a trois
pièges, documentés dans ses commentaires :

1. **Une animation CSS ne survit pas à un rendu image par image.** Le moteur se
   place directement à l'image N ; l'animation, elle, suit l'horloge du
   navigateur. On la fige et on lui donne un `animation-delay` négatif égal au
   temps écoulé.
2. **Les délais de la page sont calés sur une durée estimée.** La chaîne mesure
   l'audio réel : les délais sont remappés proportionnellement, sinon un élément
   tardif apparaît après la fin de sa scène.
3. **Les blocs `white-space:pre` débordent.** Ils sont réduits juste ce qu'il
   faut, après chargement des polices — mesurer avant fausse tout.

### À partir de rien

Écris le JSON à la main en reprenant `scripts/L01-bash-pour-data-engineers.json`.
Chaque segment porte une `narration` et un `visuel`, dont le `type` pointe une
scène du registre `render/src/scenes/Scenes.tsx` (`hook`, `terminal`, `tableau`,
`chapitre`, `html`…).

---

## La prononciation — `tts/lexique.json`

Le moteur est **français** : il lit « dbt » à la française. Avant synthèse,
chaque clé du lexique est remplacée par une graphie qui, lue à la française,
donne le son anglais.

```json
"dbt": "dibiti",  "DuckDB": "deuk-dibi",  "pipeline": "païplaïne"
```

Trois règles tirées de l'expérience :

- **Les substitutions vont de la clé la plus longue à la plus courte.** C'est ce
  qui permet de traiter les homographes : on enregistre la locution
  `docs serve` plutôt que `serve`, qui casserait « qu'il serve » et « serviront ».
  Même chose pour `CREATE TABLE` plutôt que `table`.
- **Un mot anglais homographe d'un mot français courant ne se met jamais en clé
  nue.** `date`, `table`, `test`, `config`, `macros` sont écartés — le champ
  `_attention` du lexique dit pourquoi.
- **Fuis les graphies qui nasalisent.** `INSERT` s'écrit `ine-seurte`, pas
  `inn-seurte` : « inn » se lit /ɛ̃/ en français.

Après chaque production, relis `out/<id>/narration_lue.txt` : c'est le texte
réellement envoyé au moteur. Un terme non couvert se voit immédiatement, et
`generate.py` signale ceux de sa liste de surveillance.

---

## Où est quoi

```
produire.sh                 la chaîne complète, 5 étapes
scripts/*.json              les vidéos, une par fichier
outils/                     page-lecteur web → script
tts/generate.py             narration + application du lexique
tts/cloner.py               transfert de timbre (OpenVoice v2)
tts/sous_titres.py          .srt depuis la narration d'origine
tts/lexique.json            prononciation
render/src/Tuto.tsx         composition 16:9 pour visuels repris d'une page
render/src/Cours.tsx        composition 16:9 avec sous-titres incrustés
render/src/Short.tsx        composition 9:16
render/src/scenes/          les types de visuels
out/<id>/                   audio, timings, narration_lue.txt, .srt, video.mp4
```

Les sous-titres partent en `.srt` séparé plutôt qu'incrustés quand les visuels
sont déjà denses en texte : YouTube les rend sélectionnables et traduisibles.
Ils sont générés depuis la narration **d'origine**, jamais depuis le texte
respelé — sinon on lirait « dibiti doks seurve » à l'écran.
