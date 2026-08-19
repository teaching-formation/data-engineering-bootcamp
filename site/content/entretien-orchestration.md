# 🔄 Orchestration & CI/CD

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

## 26. Pourquoi utiliser Airflow plutôt qu'un simple cron ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Why use Airflow instead of a plain cron job?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Airflow permet de définir des **dépendances** entre tâches, de relancer automatiquement en cas d'échec, et offre une interface pour suivre les exécutions. Cron ne fait que lancer une commande à une heure donnée.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Un orchestrateur apporte ce qu'un cron ne peut pas :

- **Dépendances explicites** (le DAG) : la tâche B démarre quand A a réussi, pas « à 3 h parce que A finit vers 2 h 50 ».
- **Reprise ciblée** : relancer à partir de la tâche 31 sur 40, au lieu de tout recommencer.
- **Backfill** paramétré par date d'exécution.
- **Observabilité** : historique, logs centralisés, durées, alerting.
- **Contrôle des ressources** : concurrence, pools, priorités.

Le scénario qui tue le cron : le jour où le premier job prend vingt minutes de plus, le second démarre sur des données incomplètes — **sans aucune erreur**. Le pipeline « réussit » et produit des chiffres faux.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La valeur d'Airflow n'est pas la planification — c'est **l'observabilité et la reprise**. Un cron sait déclencher ; il ne sait pas te dire quelle étape a échoué, depuis quand, ni te permettre de repartir de là.

Mais je suis franc sur le coût, parce que c'est ce qui distingue une réponse mûre. Airflow est une infrastructure à part entière : scheduler, webserver, base de métadonnées, workers. Ça se maintient, ça se met à jour (certaines montées de version sont douloureuses), ça consomme des ressources en permanence. **Pour trois scripts quotidiens indépendants, c'est disproportionné** : un cron, un bon logging et une alerte suffisent, et je le dis en entretien. Proposer Airflow partout est un signal d'immaturité au même titre que proposer Spark pour 2 Go.

Le seuil où l'orchestrateur devient rentable, selon moi : dès qu'il y a des **dépendances entre pipelines**, plusieurs personnes qui doivent voir l'état du système, ou un besoin réel de backfill.

Il faut aussi savoir citer les alternatives et leur angle : **Dagster** raisonne en *assets* (« cette table doit exister et être à jour ») plutôt qu'en tâches, ce qui colle mieux au monde de la data et rend les pipelines nettement plus testables ; **Prefect** est plus léger ; les orchestrateurs managés du cloud évitent d'exploiter l'infrastructure soi-même.

Enfin, un piège spécifique à Airflow que je vérifie en premier sur une instance lente : le scheduler **parse en boucle tous les fichiers de DAG** (toutes les 30 secondes par défaut). Un import lourd, une lecture de fichier ou un appel réseau au niveau module — et pas dans une tâche — dégrade **tout** l'ordonnanceur, pas seulement ce DAG. C'est la cause n°1 des instances Airflow poussives, et elle n'est presque jamais cherchée là.

</details>

> ⚠️ **Le piège** — Réciter les avantages d'Airflow sans jamais reconnaître son coût d'exploitation. La bonne réponse inclut « et parfois, un cron suffit ».
>
> 📘 **Pour approfondir** : [12 · Orchestration](/modules/beginner__12_orchestration_pipelines/) · [28 · Orchestration avancée](/modules/advanced__28_advanced_orchestration/)
>
> 🇬🇧 *DAG, task dependency, backfill, scheduler, data asset, orchestration overhead*

---

## 27. C'est quoi un backfill, et pourquoi l'idempotence est-elle indispensable ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *What is a backfill, and why is idempotency essential for it?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Un backfill consiste à relancer le pipeline sur des dates passées, par exemple après avoir corrigé un bug ou ajouté une colonne.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Pour qu'un backfill soit sûr, chaque exécution doit être **idempotente** : relancer la même date doit produire exactement le même résultat, sans créer de doublons.

Deux conditions concrètes :

1. Le job est **paramétré par sa fenêtre temporelle**, jamais par « aujourd'hui ». En Airflow, on utilise la *logical date* / le *data interval*, pas `datetime.now()`.
2. L'écriture **remplace** la partition concernée (`INSERT OVERWRITE PARTITION`, `replaceWhere` en Delta) ou fait un `MERGE` sur clé — jamais un simple `INSERT`.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

`datetime.now()` dans un job orchestré est probablement le bug le plus répandu et le plus coûteux du métier. Il rend le pipeline **non rejouable** : un backfill de mars 2024 traiterait les données d'aujourd'hui et écraserait l'historique avec des valeurs fausses. La règle est absolue : le job reçoit sa fenêtre en paramètre, toujours.

Mais l'idempotence n'est que la condition d'entrée. Ce que peu de candidats anticipent, c'est que **le backfill est une opération à risque, qui se planifie**.

Son **coût** d'abord : relancer deux ans d'historique, c'est 730 exécutions qui peuvent saturer le cluster, épuiser un quota d'API externe ou faire exploser une facture cloud. D'où la limitation de concurrence (`max_active_runs`) et un déroulement par lots plutôt qu'en une fois.

Ses **dépendances aval** ensuite, et c'est le point le plus subtil : si le backfill réécrit Silver, tous les agrégats Gold construits dessus deviennent faux jusqu'à leur propre recalcul. Et si quelqu'un consulte un tableau de bord pendant l'opération, il voit des chiffres incohérents — un modèle recalculé, l'autre pas. Un backfill se planifie donc **en cascade**, de bout en bout, de préférence hors des heures de lecture, et on prévient les consommateurs. Ce réflexe de communication est un marqueur de séniorité.

Enfin, une question de rigueur intellectuelle : le code d'aujourd'hui appliqué à des données d'il y a deux ans ne produit pas nécessairement ce qui avait été produit à l'époque — les règles métier ont pu changer (un taux, un seuil, une définition de client actif). Dans un environnement réglementé, réécrire l'historique peut être tout simplement **interdit** : il faut alors versionner et dater les corrections, pas écraser. C'est une conversation avec la conformité, pas une décision technique.

</details>

> ⚠️ **Le piège** — Utiliser la date du jour à l'intérieur d'un job planifié. C'est le premier réflexe qu'un recruteur cherche à vérifier sur cette question.
>
> 📘 **Pour approfondir** : [12 · Orchestration](/modules/beginner__12_orchestration_pipelines/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *backfill, logical date, data interval, idempotency, partition overwrite, downstream dependency*

---

## 28. Comment gères-tu les environnements dev / staging / prod pour un pipeline de données ?

`fréquente` · `🌍 international` · **EN** — *How do you handle dev / staging / prod environments for a data pipeline?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

On sépare les environnements pour tester avant la production, avec des bases ou des schémas distincts, et une configuration différente par environnement.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

On sépare deux choses : le **code** (branches Git, CI) et les **données** (schémas ou buckets distincts).

Le code déployé doit être identique d'un environnement à l'autre ; seule la **configuration** change (chemins, connexions, taille du cluster), injectée par variables d'environnement. En dbt, cela se traduit par des *targets* : en dev chacun écrit dans son schéma personnel, en prod dans le schéma de production.

Le principe : ce qui est validé en staging doit être exactement ce qui part en production.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La difficulté propre à la data, c'est que **l'environnement n'est pas seulement du code : c'est aussi de la donnée**. Un pipeline testé sur 100 lignes propres passera tous les tests en dev et cassera en production sur des données réelles et sales. C'est ce qui rend le sujet plus dur qu'en développement applicatif classique.

Trois stratégies, chacune avec son coût :

1. **Données synthétiques** — reproductibles, aucun risque réglementaire, mais elles ne reproduisent pas les anomalies réelles (c'est justement ce qu'on veut tester).
2. **Échantillon anonymisé de production** — bien plus réaliste, mais il faut un processus de pseudonymisation fiable **et cohérent** : prendre 1 % des commandes sans les clients correspondants casse toutes les jointures et rend l'échantillon inutilisable.
3. **Lecture seule sur la production depuis staging** — réaliste et sans copie, mais il suffit d'une écriture involontaire pour que ce soit un incident majeur.

En banque, l'option 2 avec pseudonymisation est souvent la seule acceptable, et c'est un sujet de **conformité** avant d'être un sujet d'ingénierie.

Le pattern qui offre selon moi le meilleur rapport valeur/effort, c'est le **Write-Audit-Publish** : le job écrit dans une table ou une branche temporaire, les tests de qualité s'exécutent dessus, et ce n'est **qu'en cas de succès** que l'on bascule atomiquement le pointeur vers la nouvelle version. On obtient ainsi un « staging » à chaque exécution, directement en production, sans dupliquer l'infrastructure. Les formats de table modernes rendent cette bascule atomique et donc sûre.

Pour le développement quotidien, les **branches de données** (Nessie, ou les clones *zero-copy* de Snowflake et Databricks) permettent d'obtenir un environnement isolé sans copier les téraoctets. C'est en train de devenir le standard, et c'est une bonne chose à mentionner : ça montre que tu suis l'évolution du métier.

</details>

> ⚠️ **Le piège** — Ne parler que du code. Séparer les branches Git ne sert à rien si tout le monde écrit dans la même table de production.
>
> 📘 **Pour approfondir** : [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/) · [14 · Docker](/modules/intermediate__14_docker_for_data_engineers/)
>
> 🇬🇧 *environment parity, data anonymization, write-audit-publish, zero-copy clone, data branching*

---

## 29. À quoi ressemble une CI/CD pour un pipeline de données ?

`fréquente` · `🌍 international` · **EN** — *What does CI/CD look like for a data pipeline?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

À chaque *push*, une CI lance les tests automatiquement ; si tout passe, le code est déployé.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Un enchaînement typique :

```text
lint (ruff, black) → tests unitaires → build de l'image Docker
   → déploiement staging → tests d'intégration → déploiement prod
```

Pour un projet dbt, on construit les modèles **modifiés et leurs dépendances** dans un schéma éphémère propre à la pull request :

```bash
dbt build --select state:modified+ --target ci
```

Un test qui échoue bloque la fusion de la PR.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La spécificité de la data, c'est qu'un déploiement peut être **techniquement valide et produire des chiffres faux**. D'où deux ajouts que je considère indispensables et que je vois rarement en place.

**1. Les tests de données dans la CI, pas seulement en production.** Sur la pull request, on construit les modèles modifiés sur un échantillon et on exécute les tests de qualité. Sans cela, on découvre le problème après la fusion, quand il est déjà en production.

**2. La détection de rupture de contrat.** Renommer une colonne d'une table Gold est un déploiement parfaitement valide qui casse silencieusement trois tableaux de bord et deux modèles ML. Comparer le schéma de sortie à un schéma de référence versionné attrape ça avant le merge. C'est peu coûteux et ça évite les incidents les plus embarrassants — ceux qu'on découvre par un message du métier.

Un point de mécanique que peu de gens ont en tête : **on ne « rollback » pas une donnée**. Contrairement à une application, revenir au commit précédent ne restaure pas une table écrasée. C'est précisément là que le *time travel* du lakehouse cesse d'être une curiosité pour devenir un outil d'exploitation critique (`RESTORE TABLE ... VERSION AS OF`). Savoir dire ça montre qu'on a déjà géré un incident.

Sur la vitesse enfin : une CI data qui prend 45 minutes ne sera pas respectée — les gens contournent. Je découpe : tests rapides à chaque *push*, tests lourds sur la PR ou la nuit. Et j'ordonne les déploiements comme des migrations compatibles en avant : **ajouter la colonne avant** le code qui la remplit, jamais l'inverse.

</details>

> ⚠️ **Le piège** — Décrire une CI d'application classique en oubliant que le code peut être juste et la donnée fausse. Sans tests de données, la CI ne protège que la moitié du risque.
>
> 📘 **Pour approfondir** : [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/) · [03 · Git](/modules/beginner__03_git_for_data_engineers/)
>
> 🇬🇧 *continuous integration, slim CI, schema contract, breaking change, forward-compatible migration, restore*

---

## 30. Ton pipeline échoue à 3 h du matin. Comment es-tu prévenu, et que fais-tu ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *Your pipeline fails at 3 a.m. How do you find out, and what do you do?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Une alerte part par mail ou sur Slack. Je consulte les logs, j'identifie l'erreur, je corrige si nécessaire et je relance le job.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Il faut trois choses : un **alerting** (callback en cas d'échec vers Slack ou PagerDuty), des **logs centralisés**, et une **procédure**.

La démarche : identifier la tâche en échec, lire l'erreur, déterminer si la cause est transitoire (indisponibilité réseau → relance suffit) ou structurelle (changement de schéma en source → correction nécessaire). Ensuite, évaluer l'**impact** : qui consomme cette donnée, faut-il prévenir les utilisateurs ? Et si l'incident est significatif, écrire un post-mortem.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ma première question n'est pas technique : **est-ce que ça doit me réveiller ?** Une alerte à 3 h qui n'appelle aucune action à 3 h est une alerte mal conçue. À force, elles sont toutes ignorées — c'est la fatigue d'alerte, et c'est ainsi qu'on rate la vraie. Je classe donc explicitement : si le rapport est lu à 9 h et que le job peut être relancé à 7 h, ce n'est pas une astreinte, c'est un ticket. Si c'est un flux de paiement ou de détection de fraude, oui, on réveille. Cette classification doit être **écrite**, avec un SLA par pipeline, et validée avec le métier.

Le point le plus important, et c'est là que la plupart des réponses s'arrêtent trop tôt : **la majorité des équipes n'alertent que sur l'échec du job**. C'est le cas facile — le job a échoué, on le sait. Les pannes réellement coûteuses sont **silencieuses** : le job réussit mais la source n'a envoyé que 10 % des lignes ; la table n'est plus mise à jour depuis trois jours parce que le DAG est en pause ; un `COALESCE` a transformé des `NULL` en zéros et la moyenne s'est effondrée sans qu'aucune exception ne soit levée.

D'où trois familles de contrôles que je mets systématiquement en place, en plus de l'alerte d'échec :

- **Fraîcheur** — la table a-t-elle été mise à jour dans la fenêtre attendue ?
- **Volumétrie** — le nombre de lignes est-il dans la plage historique ? (une chute de 90 % est un incident, même si le job est vert)
- **Distribution** — le taux de valeurs nulles ou la somme d'un montant clé ont-ils dérivé anormalement ?

Ce sont ces alertes-là qui protègent vraiment, et elles sont bien plus rares en entreprise que les alertes d'échec.

Sur la culture, enfin : le post-mortem doit être **sans blâme** et déboucher sur une action concrète — le plus souvent un test de non-régression ajouté à la suite. Un incident qui ne produit pas de test est un incident qu'on revivra.

</details>

> ⚠️ **Le piège** — Ne parler que de l'échec visible. Les incidents les plus coûteux sont ceux où le pipeline est **vert** et la donnée fausse.
>
> 📘 **Pour approfondir** : [28 · Orchestration avancée](/modules/advanced__28_advanced_orchestration/) · [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/)
>
> 🇬🇧 *alert fatigue, on-call, SLA, freshness check, volume anomaly, silent failure, blameless post-mortem*

---

← **Thème précédent** : [🏠 Lakehouse & formats de table](/entretien-lakehouse/)

📋 [**Tous les thèmes**](/entretien-questions/)
