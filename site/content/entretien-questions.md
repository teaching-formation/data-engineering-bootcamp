# 🎯 Questions d'entretien Data Engineer

**Ne mémorise pas des réponses — comprends le niveau attendu.**

Chaque question ci-dessous est accompagnée de **trois réponses graduées** : ce que répond un junior, un confirmé, un senior. C'est la différence entre les trois qui compte : elle te montre exactement ce qui te sépare du poste que tu vises.

## Comment utiliser ces pages

1. **Lis la question et réponds à voix haute**, comme en entretien. Vraiment à voix haute — c'est là que tu découvres que tu « sais » sans savoir l'expliquer.
2. **Puis seulement**, déplie les réponses et compare.
3. Regarde le **piège** : c'est ce qui élimine le plus de candidats.
4. Si un sujet est flou, suis le lien **Pour approfondir** vers le module correspondant.

| Niveau | Ce que ça signifie |
|--------|--------------------|
| 🟢 **Junior** | Réponse correcte mais incomplète. Suffit à ne pas être éliminé. |
| 🔵 **Confirmé** | Vocabulaire juste, mécanisme expliqué, exemple concret. Le niveau attendu sur la majorité des postes. |
| 🟣 **Senior** | Trade-offs, cas limites, coûts, ce qui casse à l'échelle. C'est ce qui fait la différence de salaire. |

**Marchés.** Les attentes ne sont pas les mêmes partout. `🌍 international` = scale-ups et postes remote (cloud managé, grande échelle, **entretien souvent en anglais**). `🏦 local` = banque, télécom, mobile money, microfinance en Afrique de l'Ouest (budget contraint, on-prem/hybride, souvent un seul Data Engineer qui fait tout). La plupart des questions valent pour les deux.

> 💡 **Entretien en anglais ?** Chaque question a sa **version EN**, et la terminologie anglaise clé est donnée à la fin. Entraîne-toi à répondre en anglais : le vocabulaire technique du Data Engineering est de toute façon anglais.

---

## Les thèmes

Chaque thème est une page courte : **5 questions**, une quinzaine de minutes. Avance à ton rythme, thème par thème.

| Thème | Ce qui est couvert | Questions |
|---|---|---|
| 🗄️ **[SQL & modélisation](/entretien-sql/)** | déduplication, requête lente, SCD Type 2, modèle en étoile, pièges des NULL | 5 |
| 🐍 **[Python & traitement de données](/entretien-python/)** | pandas/Polars/Spark, 50 Go sur 8 Go de RAM, tester un pipeline, vectorisation, structure de projet | 5 |
| ⚡ **[Spark & calcul distribué](/entretien-spark/)** | lazy evaluation, shuffle, data skew, partitionnement, OutOfMemory | 5 |
| 📨 **[Streaming & Kafka](/entretien-streaming/)** | batch vs streaming, partitions & ordre, garanties de livraison, watermark, idempotence | 5 |
| 🏠 **[Lakehouse & formats de table](/entretien-lakehouse/)** | lake vs warehouse, médaillon, ACID/Delta/Iceberg, small files, partitionnement | 5 |
| 🔄 **[Orchestration & CI/CD](/entretien-orchestration/)** | Airflow vs cron, backfill, environnements, CI/CD data, alerting & astreinte | 5 |
| ✅ **[Data Quality & gouvernance](/entretien-qualite/)** | dimensions de qualité, donnée fausse en prod, contrats, RGPD, data mesh | 5 |
| 💬 **[Comportemental & posture](/entretien-comportemental/)** | incident, vulgarisation, désaccord, priorisation, questions à poser | 5 |

**40 questions au total.** 👉 Commence par [🗄️ SQL & modélisation](/entretien-sql/) — chaque page se termine par un lien vers la suivante.

> 💬 **Une question t'a été posée en entretien et elle n'est pas là ?** Partage-la dans la [communauté Telegram](https://t.me/fromzerotoherodataeng) — les meilleures seront ajoutées.

---

> 📌 **Prépare aussi la pratique.** Les questions valident ta compréhension ; un projet valide ta capacité à livrer. Enchaîne avec le [projet intégrateur](/modules/intermediate__26_projet_integrateur/) et le [mini-projet dbt exécutable](/modules/intermediate__25_dbt_data_quality/).
