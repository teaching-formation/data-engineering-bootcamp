# 🗄️ SQL & modélisation

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

## 1. Comment supprimes-tu les doublons d'une table en gardant la ligne la plus récente ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *How would you deduplicate a table, keeping only the most recent row per key?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

J'utilise `SELECT DISTINCT`, ou un `GROUP BY` sur la clé.

*C'est là que beaucoup s'arrêtent — et ça ne répond pas à la question :* `DISTINCT` supprime les lignes **entièrement** identiques, mais ne permet pas de choisir **laquelle** garder quand les autres colonnes diffèrent.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

J'utilise une **fonction de fenêtrage** pour numéroter les lignes par clé, triées par date décroissante, puis je ne garde que la première :

```sql
WITH ranked AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY customer_id
               ORDER BY updated_at DESC
           ) AS rn
    FROM raw_customers
)
SELECT * FROM ranked WHERE rn = 1;
```

`PARTITION BY` définit le groupe (la clé métier), `ORDER BY` définit quelle ligne gagne. J'utilise `ROW_NUMBER()` et non `RANK()` : en cas d'égalité, `RANK()` renverrait plusieurs lignes à 1 et je garderais encore des doublons. Sur certains moteurs (DuckDB, Snowflake, BigQuery) on peut simplifier avec `QUALIFY rn = 1` sans la CTE.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La requête, c'est la partie facile. Les vraies questions arrivent avant et après.

**1 — D'où viennent les doublons ?** Dédupliquer, c'est souvent traiter le symptôme. Un rejeu de pipeline produit des doublons **techniques** (même ligne, deux fois) ; un vrai second achat produit un doublon **métier** (deux lignes légitimes avec la même clé mal choisie). Les confondre détruit de la donnée. Si les doublons viennent d'un rejeu, le vrai correctif est de rendre l'ingestion **idempotente** (`MERGE` sur une clé), pas d'ajouter un `ROW_NUMBER()` en aval.

**2 — Le tie-breaker doit être déterministe.** Si deux lignes ont le même `updated_at` (fréquent quand la source a une précision à la seconde), `ROW_NUMBER()` choisit arbitrairement — et le résultat **change d'un run à l'autre**. C'est un cauchemar à déboguer. Toujours un départage stable : `ORDER BY updated_at DESC, ingestion_id DESC`.

**3 — Le coût.** Une fonction de fenêtrage impose un **shuffle + tri** sur toute la table. Sur 500 millions de lignes, re-dédupliquer tout l'historique chaque nuit est un gaspillage : je passe en incrémental, je ne déduplique que la fenêtre récente et je fais un `MERGE INTO` sur la table cible.

**4 — L'effet de bord en aval.** Un doublon non traité dans une dimension provoque un **fan-out** en jointure : la table de faits gonfle et le chiffre d'affaires est compté deux fois. C'est le bug qu'on découvre en comité de direction. D'où un test d'unicité automatisé sur la clé (`unique` en dbt), pas juste une requête ponctuelle.

**5 — Choix de la couche.** Je déduplique en Silver, pas en Bronze : Bronze garde le brut tel quel (auditabilité, capacité à rejouer), Silver porte la vérité métier.

</details>

> ⚠️ **Le piège** — Répondre `DISTINCT` sans se demander *quelle* ligne garder, ou ne pas prévoir de départage en cas d'égalité de dates. Le recruteur teste si tu penses au déterminisme.
>
> 📘 **Pour approfondir** : [07 · SQL](/modules/beginner__07_sql_for_data_engineers/) · [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/)
>
> 🇬🇧 *deduplication, window function, tie-breaker, fan-out, idempotency*

---

## 2. Une requête est lente en production. Comment tu t'y prends ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *A query is slow in production. Walk me through how you'd debug it.*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Je regarde la requête et j'ajoute un index sur les colonnes du `WHERE`, ou je limite le nombre de lignes retournées.

*Ce n'est pas faux, mais c'est une solution avant le diagnostic.*

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Je commence par le **plan d'exécution** — je ne devine pas :

```sql
EXPLAIN ANALYZE SELECT ...;
```

Je cherche : un *sequential scan* sur une grosse table alors qu'un filtre sélectif existe, un type de jointure inadapté (*nested loop* sur des millions de lignes), un écart énorme entre lignes **estimées** et **réelles** (statistiques obsolètes → `ANALYZE`), un tri qui déborde sur disque.

Ensuite les correctifs classiques : index sur les colonnes de filtre et de jointure ; ne sélectionner que les colonnes utiles ; filtrer le plus tôt possible ; éviter d'appliquer une fonction sur une colonne indexée (`WHERE DATE(created_at) = ...` casse l'usage de l'index — on écrit un intervalle à la place).

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ma première question n'est pas technique : **est-ce que cette requête doit être rapide ?** Un batch nocturne qui prend 40 minutes ne coûte rien à personne ; un dashboard à 8 secondes coûte un client. On optimise ce qui a un impact.

Ensuite, je qualifie le problème avant de toucher au SQL. *Lente depuis quand ?* Une requête qui était rapide et qui ne l'est plus, c'est rarement le SQL : c'est un volume qui a franchi un seuil, des statistiques périmées, un plan qui a basculé, ou de la contention (verrous, autre job concurrent). *Lente pour tout le monde ou pour un utilisateur ?* → paramètre atypique, données asymétriques.

Sur le **plan**, ce que je regarde en priorité c'est l'écart estimé/réel : un optimiseur qui croit lire 100 lignes et en lit 10 millions choisira une *nested loop* catastrophique. Corriger les statistiques est souvent plus efficace que réécrire la requête.

Sur les **index**, la nuance qui distingue : un index n'est pas gratuit. Il ralentit chaque écriture, occupe de l'espace, et sur une table très écrite il peut coûter plus qu'il ne rapporte. L'ordre des colonnes d'un index composite compte (la colonne la plus sélective, ou celle utilisée en égalité, d'abord). Un index partiel sur le sous-ensemble réellement interrogé est souvent le meilleur rapport coût/bénéfice.

Et surtout : **le levier dépend du moteur**. Sur du transactionnel (PostgreSQL, MySQL), oui, index. Sur de l'analytique colonne (BigQuery, Snowflake, Spark, Trino), l'index n'existe pas ou presque : les vrais leviers sont le **partitionnement**, le **clustering / Z-order**, le format de fichier, la taille des fichiers (le *small files problem* tue les performances), et le *predicate pushdown*. J'ai vu des équipes chercher des index pendant des jours sur un lakehouse où le vrai problème était 400 000 fichiers Parquet de 2 Ko.

Enfin, si la requête est intrinsèquement coûteuse et rejouée souvent, la bonne réponse n'est pas de l'optimiser mais de **pré-calculer** : table agrégée, vue matérialisée, modèle dbt incrémental.

</details>

> ⚠️ **Le piège** — Proposer un correctif avant d'avoir lu un plan d'exécution. Le recruteur veut voir une **méthode de diagnostic**, pas un catalogue d'astuces.
>
> 📘 **Pour approfondir** : [07 · SQL](/modules/beginner__07_sql_for_data_engineers/) · [20 · Spark SQL](/modules/intermediate__20_spark_sql_deep_dive/)
>
> 🇬🇧 *query plan, sequential scan, cardinality estimate, sargable, predicate pushdown, materialized view*

---

## 3. Comment historises-tu les changements d'une dimension (SCD Type 2) ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *How do you implement a Slowly Changing Dimension Type 2?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Au lieu d'écraser la ligne quand une valeur change, on ajoute une nouvelle ligne pour garder l'historique.

*L'intuition est bonne. Il manque le mécanisme : comment sait-on quelle ligne est la version courante ?*

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

J'ajoute des colonnes de validité et un indicateur de version courante :

| customer_key | customer_id | ville | valid_from | valid_to | is_current |
|---|---|---|---|---|---|
| 1001 | C001 | Abidjan | 2024-01-01 | 2025-06-30 | false |
| 1002 | C001 | Dakar | 2025-07-01 | 9999-12-31 | true |

`customer_id` est la clé métier, `customer_key` une **clé de substitution** (surrogate key) propre à chaque version. Quand une valeur change, un `MERGE` ferme l'ancienne ligne (`valid_to`, `is_current = false`) et insère la nouvelle. La table de faits référence `customer_key` : on retrouve ainsi la ville du client **au moment de la commande**, et pas sa ville actuelle.

En pratique, sur un projet dbt, j'utilise les **snapshots** qui implémentent ce pattern (`strategy: check` ou `timestamp`).

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Trois décisions déterminent si un SCD2 vieillit bien ou devient ingérable.

**Quelles colonnes déclenchent une version ?** C'est le point le plus sous-estimé. Si tu versionnes sur *toutes* les colonnes, un champ techniquement bruité (un `last_seen_at` mis à jour en continu) crée une nouvelle version à chaque run : ta dimension de 100 000 clients atteint 40 millions de lignes en six mois. Je choisis explicitement les attributs suivis, et je compare via un **hash** de ces colonnes seulement.

**Le temps métier n'est pas le temps technique.** `valid_from` doit refléter la date à laquelle le changement a eu lieu *dans le monde réel*, pas la date à laquelle mon pipeline l'a vu. Sinon, une donnée en retard de trois jours (*late-arriving*) crée un historique faux. Et quand la source corrige rétroactivement une valeur, il faut décider : on réécrit l'historique (*restatement*, les rapports passés changent — dangereux en environnement réglementé) ou on ajoute une correction datée. En banque, cette décision se prend avec la conformité, pas seul.

**Le coût en aval.** Joindre une table de faits à un SCD2 impose une jointure sur intervalle (`fact.date BETWEEN dim.valid_from AND dim.valid_to`), bien plus coûteuse qu'une égalité. C'est pourquoi on stocke `customer_key` directement dans le fait au moment de l'ingestion : la jointure redevient une égalité.

Enfin, la question que je pose systématiquement : **quelqu'un a-t-il vraiment besoin de cet historique ?** Un SCD2 « au cas où » sur 40 dimensions, c'est de la complexité pure. Souvent, la vraie demande est « je veux le CA par région historique » — un SCD2 sur *une* dimension suffit. Et si le CDC brut est conservé en Bronze, l'historique reste reconstructible sans le porter partout.

</details>

> ⚠️ **Le piège** — Décrire le schéma sans expliquer *pourquoi* : le SCD2 existe pour répondre à « quelle était la valeur **à ce moment-là** ». Un candidat qui ne relie pas ça à un besoin métier n'a jamais implémenté le pattern.
>
> 📘 **Pour approfondir** : [06 · Bases relationnelles](/modules/beginner__06_intro_relational_databases/) · [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/)
>
> 🇬🇧 *slowly changing dimension, surrogate key, effective dating, late-arriving data, restatement*

---

## 4. Normalisation ou dénormalisation ? Explique le modèle en étoile.

`fréquente` · `🌍 international` `🏦 local` · **EN** — *When would you normalize versus denormalize? Explain star schema.*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

La normalisation évite la redondance en découpant les données en plusieurs tables reliées par des clés. Le modèle en étoile, c'est une table de faits au centre entourée de tables de dimensions.

*Correct, mais purement descriptif. La question porte sur le choix.*

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Ça dépend de l'usage. **OLTP** (l'application) : normalisé (3NF) — on optimise l'écriture et l'intégrité, chaque information est stockée une fois. **OLAP** (l'analyse) : dénormalisé en étoile — on optimise la lecture, on accepte la redondance pour réduire le nombre de jointures.

Le modèle en étoile, c'est une table de **faits** (les événements mesurables : une vente, une transaction) entourée de **dimensions** (le contexte : client, produit, date, agence). Les faits contiennent les mesures numériques et les clés étrangères ; les dimensions contiennent les attributs descriptifs.

La décision fondatrice est le **grain** de la table de faits : qu'est-ce qu'une ligne représente exactement ? Une ligne de commande, ou une commande entière ? Se tromper de grain oblige à tout refaire.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le grain, comme dit, est LA décision — et je la formule toujours en une phrase testable : « une ligne = un article vendu, dans une commande, à une date ». Si on ne sait pas l'écrire, le modèle n'est pas prêt.

Ce qui a changé ces dernières années, c'est le **coût de la jointure**. Kimball a conçu l'étoile quand joindre coûtait cher. Sur un moteur colonne moderne (Snowflake, BigQuery, Spark), joindre une grande table de faits à une petite dimension est quasi gratuit (*broadcast join*). D'où la mode de la *one big table* : tout aplati, zéro jointure. C'est très rapide en lecture — mais on paie ailleurs : mettre à jour un libellé de catégorie devient un `UPDATE` sur des milliards de lignes, et le stockage explose.

Mon arbitrage : l'étoile reste le bon défaut, **pour une raison qui n'est pas la performance mais la lisibilité**. Un modèle en étoile est compréhensible par un analyste métier et exploitable en self-service dans un outil BI. Une *one big table* de 300 colonnes ne l'est pas. Je réserve l'aplatissement à des tables de service pour un dashboard précis, construites *au-dessus* de l'étoile.

Le flocon (dimensions elles-mêmes normalisées) se justifie rarement aujourd'hui : on gagne un peu de stockage et on perd en lisibilité et en performance. Le **Data Vault** a sa place quand on intègre beaucoup de sources hétérogènes avec une forte exigence d'auditabilité (typiquement en banque, où l'on doit prouver d'où vient chaque chiffre) — mais c'est verbeux et il faut une équipe qui le maîtrise vraiment.

Enfin, le critère qu'on oublie : **qui va maintenir ce modèle ?** Une équipe de deux personnes n'a pas les moyens d'un Data Vault. Le meilleur modèle est celui que l'équipe sait faire évoluer.

</details>

> ⚠️ **Le piège** — Réciter « 1NF, 2NF, 3NF » comme un cours. Personne ne te demandera de normaliser une base en entretien DE ; on veut savoir si tu sais **arbitrer** selon l'usage.
>
> 📘 **Pour approfondir** : [06 · Bases relationnelles](/modules/beginner__06_intro_relational_databases/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/) · [🛠️ Atelier Data Vault](/ateliers/data-vault/)
>
> 🇬🇧 *star schema, grain, fact table, dimension, denormalization, one big table, broadcast join*

---

## 5. Quels pièges connais-tu avec les valeurs NULL ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *What are the classic pitfalls with NULL values in SQL?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

`NULL` représente une valeur absente. On ne peut pas le comparer avec `=`, il faut utiliser `IS NULL`.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

`NULL` n'est pas une valeur, c'est un **inconnu** : toute comparaison avec lui renvoie `UNKNOWN`, pas `TRUE`/`FALSE`. D'où plusieurs pièges concrets :

- `COUNT(colonne)` **ignore** les `NULL`, alors que `COUNT(*)` les compte. Deux résultats différents sur la même table.
- `AVG(colonne)` ignore aussi les `NULL` : le dénominateur n'est pas le nombre de lignes. Si les valeurs manquantes signifiaient « zéro », la moyenne est fausse.
- `NOT IN (sous-requête)` renvoie **zéro ligne** dès que la sous-requête contient un `NULL`. Bug classique et silencieux — on utilise `NOT EXISTS`.
- Un `LEFT JOIN` suivi d'un filtre `WHERE table_droite.colonne = 'x'` se transforme en `INNER JOIN` : le filtre élimine les lignes non appariées. Le prédicat doit aller dans le `ON`.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Au-delà des pièges syntaxiques, le vrai problème est **sémantique** : `NULL` écrase trois significations très différentes — *inconnu* (on ne sait pas), *non applicable* (la question n'a pas de sens pour cette ligne), et *pas encore arrivé* (une date de livraison sur une commande en cours). Les traiter pareil produit des indicateurs faux. Un `COALESCE(montant, 0)` posé pour « nettoyer » transforme une donnée manquante en un vrai zéro, et le zéro se propage dans toutes les moyennes en aval. C'est une perte d'information irréversible, et c'est très difficile à détecter après coup.

Ma règle : `COALESCE` est une **décision métier**, jamais un réflexe technique. Si je dois en poser un, je documente pourquoi, et idéalement je conserve un indicateur (`montant_was_null`).

Sur les **clés de jointure**, un `NULL` fait disparaître la ligne silencieusement — pas d'erreur, juste un total qui ne tombe plus juste. C'est pour ça que j'impose `not_null` sur toute clé métier au niveau du contrat de données, dès la couche Silver : je préfère un pipeline qui échoue à 3 h du matin qu'un rapport faux à 9 h.

Côté distribué, deux surprises à connaître : en Spark, un `NULL` dans une colonne de partitionnement atterrit dans une partition spéciale (`__HIVE_DEFAULT_PARTITION__`), ce qui casse les filtres naïfs. Et le tri place les `NULL` différemment selon les moteurs (`NULLS FIRST`/`NULLS LAST` varie entre PostgreSQL et Spark) — ce qui, combiné à la question 1, peut rendre une déduplication non déterministe d'un environnement à l'autre.

Enfin, `NULL` est souvent le **symptôme** d'un problème en amont : un champ obligatoire non rempli, une jointure qui échoue, un parsing raté. Avant de le remplacer, je cherche d'où il vient.

</details>

> ⚠️ **Le piège** — Ne citer que « `NULL` n'est pas égal à `NULL` ». Le recruteur attend un exemple **où ça casse en production** : le `NOT IN`, ou le `LEFT JOIN` transformé en `INNER JOIN`.
>
> 📘 **Pour approfondir** : [07 · SQL](/modules/beginner__07_sql_for_data_engineers/) · [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/)
>
> 🇬🇧 *three-valued logic, NULL-safe comparison, data contract, silent data loss*


---

📋 [**Tous les thèmes**](/entretien-questions/)

**Thème suivant** : [🐍 Python & traitement de données](/entretien-python/) →
