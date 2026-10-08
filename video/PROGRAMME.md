# 🎬 Programme éditorial — chaîne FromZeroToHero

Backlog de production des Shorts. **Document de travail** : réordonne, barre, ajoute.
Une ligne = une vidéo = un fichier `scripts/NN-slug.json`.

---

## Le format standard

| | |
|---|---|
| **Durée** | 45-60 s (idéal : 50 s) |
| **Format** | 1080×1920 (9:16) |
| **Structure** | accroche (0-5 s) → développement → **le twist** → CTA |
| **Sous-titres** | incrustés, toujours (on regarde sans le son) |
| **Diffusion** | YouTube Shorts · TikTok · Instagram Reels · LinkedIn |

### Les 3 critères d'un bon sujet

1. **Contre-intuitif** — l'accroche s'écrit toute seule
2. **Montrable** — on peut le dessiner, pas seulement le dire
3. **Une seule idée** — un payoff, pas trois

❌ Ne marchent pas en 50 s : les définitions encyclopédiques, les sujets larges,
tout ce qui demande 10 lignes de code à l'écran.

---

## 🧭 Saison 1 — Les fondamentaux

> **Cible** : ceux qui cherchent leur voie. C'est le public du bootcamp — cette saison
> alimente directement ton entonnoir. À publier en premier.

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| 1 | **C'est quoi le Data Engineering ?** | « 14h32, Abidjan. Un paiement mobile money. Suis cette donnée. » | `/curriculum/` |
| 2 | **Engineer vs Analyst vs Scientist vs Architect** | « Un seul construit la route. Les autres roulent dessus. » | `/curriculum/` |
| 3 | **Combien gagne un Data Engineer ?** | « 45 à 90 K€. Voilà ce qui fait la différence entre les deux. » | `/curriculum/` |
| 4 | **Faut-il savoir coder ?** | « Non. Mais il faut savoir une chose que personne ne dit. » | `/modules/beginner__01…/` |
| 5 | **Par quoi commencer à zéro ?** | « Pas par Spark. Pas par le cloud. Par ça. » | `/modules/beginner__01…/` |
| 6 | **C'est quoi un pipeline de données ?** | « Entre l'appli et le tableau de bord, il se passe 5 choses. » | `/curriculum/` |
| 7 | **ETL ou ELT ?** | « Une lettre d'écart. Dix ans d'évolution du métier. » | `/curriculum/` |
| 8 | **Pourquoi SQL reste la compétence n°1** | « En 2026, la compétence la mieux payée a 50 ans. » | `/entretien-sql/` |

## 🧰 Saison 2 — Les outils : à quoi ça sert *vraiment*

> Chaque vidéo répond à « pourquoi ça existe », pas « comment ça s'installe ».

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| 9 | **Spark** | « Spark sert à une seule chose. Et ce n'est pas la vitesse. » | module 11 |
| 10 | **Kafka** | « Ton appli écrit. Dix systèmes veulent lire. Kafka règle ça. » | module 24 |
| 11 | **Airflow vs cron** | « Ton job 2 démarre à 3h parce que le job 1 finit vers 2h50. » | module 12 |
| 12 | **dbt** | « Du SQL. Avec des tests et de la doc. C'est tout. C'est énorme. » | module 25 |
| 13 | **Docker pour la data** | « Ça marche sur ma machine. Docker tue cette phrase. » | module 14 |
| 14 | **Lake vs warehouse vs lakehouse** | « Trois mots, un seul vrai enjeu : qui possède tes données. » | module 22 |
| 15 | **Delta Lake / Iceberg** | « Des fichiers Parquet, mais avec des transactions. Pourquoi ? » | module 23 |

## 🐌 Saison 3 — Pourquoi c'est lent

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| ~~16~~ | ~~**Le shuffle**~~ ✅ *produit* | « 40 min. Le coupable a un nom. » | module 19 |
| 17 | **Small files problem** | « Ta table fait 1 Go. Elle met 40 minutes à se lire. » | module 23 |
| 18 | **Data skew** | « 199 tâches terminées. Une seule tourne depuis 40 minutes. » | `/entretien-spark/` |
| 19 | **`coalesce(1)`** | « Cette ligne divise la vitesse de ton job par 50. » | module 19 |
| 20 | **Les UDF Python** | « Cette fonction rend ton job Spark 100 fois plus lent. » | module 19 |
| 21 | **Le mauvais partitionnement** | « Tu as partitionné par jour. Spark lit quand même tout. » | module 23 |

## 🔴 Saison 4 — Pourquoi tes chiffres sont faux

> **Portée la plus large** : touche aussi les analystes et les data scientists.

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| 22 | **`NOT IN` avec NULL** | « Cette requête renvoie 0 ligne. Elle devrait en renvoyer 10 000. » | `/entretien-sql/` |
| 23 | **LEFT JOIN + WHERE** | « Tu crois faire un LEFT JOIN. Tu fais un INNER JOIN. » | `/entretien-sql/` |
| 24 | **`COUNT(col)` vs `COUNT(*)`** | « Deux requêtes, même table, deux résultats. » | `/entretien-sql/` |
| 25 | **Le fan-out d'un doublon** | « Un doublon dans ta dimension, ton chiffre d'affaires double. » | `/entretien-sql/` |
| 26 | **`COALESCE(x, 0)`** | « Tu viens de fausser toutes tes moyennes. » | module 25 |
| 27 | **SCD Type 2** | « Ton client a déménagé. Ton rapport de l'an dernier est faux. » | `/entretien-sql/` |

## 🔇 Saison 5 — Les pannes silencieuses

> **Ton angle le plus différenciant.** Personne ne couvre ça sur YouTube :
> le pipeline est vert et la donnée est fausse.

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| 28 | **La fraîcheur** | « Ton pipeline est vert. Ta table n'a pas bougé depuis 3 jours. » | module 25 |
| 29 | **`datetime.now()`** | « Cette ligne rend ton pipeline impossible à rejouer. » | `/entretien-orchestration/` |
| 30 | **Le job qui réussit à 10 %** | « La source a envoyé un dixième des lignes. Aucune alerte. » | `/entretien-qualite/` |
| 31 | **L'alerte qui ne réveille personne** | « 40 alertes par jour. Donc plus aucune alerte. » | `/entretien-orchestration/` |

## 💸 Saison 6 — Les choix qui coûtent cher

> Opinions tranchées = commentaires = portée. À sortir quand tu as un peu d'audience.

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| 32 | **Spark pour 2 Go** | « 90 % des jobs Spark n'auraient jamais dû être en Spark. » | `/entretien-python/` |
| 33 | **Le `VACUUM` oublié** | « Ta facture S3 a triplé. Tu n'as ajouté aucune donnée. » | module 23 |
| 34 | **Le hash qui n'anonymise rien** | « Tu as hashé les numéros. On les retrouve en 2 minutes. » | `/entretien-qualite/` |
| 35 | **L'exactly-once** | « L'exactly-once de bout en bout n'existe pas. » | `/entretien-streaming/` |
| 36 | **Le data mesh** | « Si tu es moins de 3, tu n'en as pas besoin. » | `/entretien-qualite/` |

## 🎯 Saison 7 — Carrière & entretien

| № | Sujet | L'accroche | CTA |
|---|---|---|---|
| 37 | **La question qui élimine le plus** | « 80 % répondent DISTINCT. C'est la mauvaise réponse. » | `/entretien-sql/` |
| 38 | **Les questions à POSER au recruteur** | « Ne rien demander, c'est dire : je prends n'importe quoi. » | `/entretien-comportemental/` |
| 39 | **Présenter un projet en entretien** | « Ton projet est bon. Ta façon d'en parler te coûte le poste. » | `/entretien-comportemental/` |
| 40 | **Junior, confirmé, senior** | « Même question. Trois réponses. Un écart de 40 K€. » | `/entretien-questions/` |

---

## Ordre de publication recommandé

**Ne pas publier dans l'ordre des saisons.** Alterner garde la chaîne vivante et teste
plusieurs publics tôt :

```
1 · 2 · 22 · 3 · 17 · 5 · 23 · 9 · 18 · 8 …
```

Logique : on ouvre avec les **fondamentaux** (public large, cœur de cible du bootcamp),
on glisse vite un **piège SQL** (portée maximale, très partageable), on garde les
**opinions tranchées** (saison 6) pour quand il y a une audience à faire réagir.

## Cadence

| Rythme | Durée du backlog | Réaliste ? |
|---|---|---|
| 1 / semaine | 40 semaines | ✅ tenable en solo |
| 2 / semaine | 20 semaines | ⚠️ seulement en production par lots |

> 💡 **Produis par lots.** Écrire 4 scripts d'un coup puis générer les 4 vidéos coûte
> bien moins que 4 sessions séparées. La régularité tue plus de chaînes que la qualité.

---

## Chaîne de production

```
scripts/NN-slug.json                  ← tu écris ça
   ↓  python tts/generate.py …        voix + lexique de prononciation
out/NN-slug/audio/ + timings.json
   ↓  npx remotion render …           animation 9:16 + sous-titres
out/NN-slug/short.mp4                 ← prêt à publier
```

**Scènes réutilisables** : `hook` · `partitions` · `etapes` · `conseils` · `cta`
Nouvelles scènes à créer au fil de l'eau (ex. `parcours` pour la vidéo 1, `grille`
pour le small files problem).

> ⚠️ Au rendu, ajouter `--browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
> (le téléchargement de Chrome Headless échoue sur cette connexion).

---

## Suivi

| № | Sujet | Script | Voix | Vidéo | Publié |
|---|---|---|---|---|---|
| 16 | Le shuffle | ✅ | ✅ | ✅ | ☐ |
| 1 | C'est quoi le Data Engineering | ☐ | ☐ | ☐ | ☐ |
| 2 | Les 4 métiers | ☐ | ☐ | ☐ | ☐ |
