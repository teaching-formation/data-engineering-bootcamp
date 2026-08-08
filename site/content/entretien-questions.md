# 🎯 Questions d'entretien Data Engineer

**Ne mémorise pas des réponses — comprends le niveau attendu.**

Chaque question ci-dessous est accompagnée de **trois réponses graduées** : ce que répond un junior, un confirmé, un senior. C'est la différence entre les trois qui compte : elle te montre exactement ce qui te sépare du poste que tu vises.

## Comment utiliser cette page

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

# 🗄️ SQL & modélisation

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
> 📘 **Pour approfondir** : [06 · Bases relationnelles](/modules/beginner__06_intro_relational_databases/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/)
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

# 🐍 Python & traitement de données

## 6. pandas, Polars ou Spark : comment choisis-tu ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *pandas, Polars or Spark — how do you choose?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

pandas pour les petits volumes, Spark quand les données sont trop grosses pour tenir en mémoire. Polars est une alternative plus rapide à pandas.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Je raisonne d'abord en ordre de grandeur, puis en coût opérationnel.

- **pandas** : mono-thread, tout en mémoire. Confortable jusqu'à quelques Go, à condition d'avoir environ 5 à 10× le volume du fichier en RAM (les copies intermédiaires coûtent cher). Écosystème imbattable.
- **Polars** : multi-thread, basé sur Arrow, avec une **API lazy** qui optimise le plan avant exécution (projection et *predicate pushdown*). En mode *streaming*, il traite des volumes supérieurs à la RAM. Sur une seule machine, souvent 5 à 20× plus rapide que pandas.
- **Spark** : distribué sur plusieurs machines. La bonne réponse à partir de la dizaine de To, ou quand le cluster existe déjà.

Le critère décisif n'est pas seulement le volume : c'est le **coût opérationnel**. Spark apporte un cluster à administrer, une JVM, des temps de démarrage, et un débogage nettement plus pénible.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Mon opinion, formée sur le terrain : **la majorité des jobs Spark en production traitent moins de 10 Go et n'auraient jamais dû être en Spark**. On paie un cluster, une complexité de déploiement et des heures de débogage pour un traitement qu'une seule machine ferait en deux minutes avec DuckDB ou Polars. C'est le choix par réflexe le plus coûteux du métier.

Ce que je regarde vraiment, dans cet ordre :

**1 — Le volume par exécution, pas le volume total.** Une table de 5 To interrogée en incrémental sur une journée, c'est 8 Go par run. Le dimensionnement se fait sur le run, pas sur l'historique.

**2 — L'existant.** Si l'équipe opère déjà un cluster Spark, le coût marginal d'un job de plus est quasi nul, et l'homogénéité a de la valeur. L'inverse — introduire Spark pour un seul pipeline — est très cher. Le meilleur outil est souvent celui que l'équipe sait déjà exploiter à 3 h du matin.

**3 — Le scale-up avant le scale-out.** Une instance à 128 Go de RAM coûte souvent moins cher qu'un cluster de cinq nœuds, et supprime tout le shuffle réseau. C'est contre-intuitif après dix ans de discours « distribué », mais depuis que DuckDB et Polars existent, la fenêtre où le mono-machine suffit s'est énormément élargie.

**4 — La nature du calcul.** Certaines opérations (jointures massives entre deux très grandes tables, ML distribué) exigent réellement du distribué. D'autres (filtres, agrégations, colonnes dérivées) passent très bien en mono-machine avec du Parquet partitionné.

**5 — Le contexte économique.** Sur le marché local, où l'on ne peut pas juste « prendre une plus grosse instance » et où la facture cloud est scrutée, savoir faire tenir un traitement sur une machine modeste est une compétence différenciante — pas une régression.

En entretien, je réponds toujours par une question : *quel volume par run, à quelle fréquence, avec quelle équipe pour maintenir ?*

</details>

> ⚠️ **Le piège** — Répondre « Spark parce que c'est du Big Data » sans jamais parler du coût. Sur-dimensionner est aussi disqualifiant que sous-dimensionner.
>
> 📘 **Pour approfondir** : [17 · Polars](/modules/intermediate__17_polars_for_data_engineering/) · [11 · PySpark](/modules/beginner__11_pyspark_for_data_engineering/)
>
> 🇬🇧 *single-node vs distributed, lazy evaluation, out-of-core, scale-up vs scale-out, operational overhead*

---

## 7. Comment traites-tu un fichier de 50 Go sur une machine qui a 8 Go de RAM ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *How would you process a 50 GB file on a machine with 8 GB of RAM?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Je lis le fichier par morceaux au lieu de tout charger d'un coup, par exemple avec `chunksize` dans pandas, et je traite chaque morceau l'un après l'autre.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Plusieurs leviers combinés :

- **Lire en flux** plutôt qu'en bloc : `pd.read_csv(..., chunksize=100_000)`, ou un générateur qui parcourt le fichier ligne à ligne.
- **Ne lire que le nécessaire** : sélectionner les colonnes utiles (`usecols`) et forcer des types compacts (`category` plutôt que `object`, `int32` plutôt que `int64`) — souvent 50 à 80 % de mémoire en moins.
- **Changer de format** : convertir le CSV en **Parquet** (colonne, compressé). On ne lit alors que les colonnes nécessaires et les filtres descendent au niveau des fichiers (*predicate pushdown*).
- **Utiliser un moteur out-of-core** : DuckDB ou Polars en mode *streaming* traitent des volumes supérieurs à la RAM en écrivant sur disque quand nécessaire.

```python
import duckdb
duckdb.sql("""
    SELECT country, SUM(amount) AS total
    FROM read_csv_auto('transactions.csv')
    GROUP BY country
""").write_parquet('agg.parquet')
```

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ma première question : **pourquoi est-ce un CSV de 50 Go ?** Si je peux agir en amont, convertir en Parquet partitionné règle le problème plus sûrement que n'importe quelle astuce de lecture — typiquement 5 à 10× plus petit, et surtout on cesse de lire ce dont on n'a pas besoin. Beaucoup de « problèmes de volumétrie » sont en réalité des problèmes de format.

Ensuite, tout dépend de **l'opération**, et c'est ce que les candidats manquent :

- **Filtre ou projection** : trivial en streaming, la mémoire ne croît pas.
- **Agrégation** : possible en une passe si l'agrégat est *additif* (somme, min, max, count) — on cumule par morceau puis on combine. Mais attention aux agrégats **non additifs** : une médiane ou un `COUNT(DISTINCT)` exacts ne se combinent pas ainsi. Il faut soit un passage supplémentaire, soit une structure approximative (HyperLogLog pour le distinct, t-digest pour les quantiles) — et alors on assume une marge d'erreur, ce qui est une **décision métier** à faire valider.
- **Tri global ou jointure** : c'est le cas réellement difficile. On passe par un partitionnement par hash sur disque (tri externe / *grace hash join*), et là je laisse DuckDB ou Polars faire — réimplémenter ça à la main est une mauvaise idée.

Le point souvent oublié : la RAM n'est pas la seule contrainte. Il faut de l'**espace disque temporaire** pour le débordement, et le disque devient le goulot d'étranglement (un SSD NVMe change tout par rapport à un disque réseau).

Enfin, l'arbitrage économique. Sur un cloud, la réponse honnête est parfois « je prends une instance à 64 Go pendant vingt minutes » : quelques euros contre une journée d'ingénierie. Mais dans un contexte où l'infrastructure est fixe — beaucoup d'entreprises locales, on-prem —, savoir faire tenir le traitement dans 8 Go est une vraie compétence. Je précise toujours ce contexte avant de choisir.

</details>

> ⚠️ **Le piège** — Répondre « j'utilise Spark ». Sur une seule machine avec 8 Go, Spark n'apporte rien et ajoute une JVM. Le recruteur teste si tu comprends la différence entre *parallélisme* et *traitement out-of-core*.
>
> 📘 **Pour approfondir** : [05 · Python data processing](/modules/beginner__05_python_data_processing_for_data_engineers/) · [18 · High performance Python](/modules/intermediate__18_high_performance_python/)
>
> 🇬🇧 *out-of-core, streaming, chunking, predicate pushdown, spill to disk, approximate aggregation*

---

## 8. Comment tu testes un pipeline de données ?

`fréquente` · `🌍 international` · **EN** — *How do you test a data pipeline?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Je lance le pipeline sur un petit jeu de données et je vérifie que le résultat est correct, en regardant quelques lignes en sortie.

*C'est un test manuel : il ne protège de rien la prochaine fois.*

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Je distingue trois niveaux, complémentaires :

1. **Tests unitaires** sur la logique de transformation : je sépare les entrées/sorties du calcul, et je teste des fonctions pures avec de petits DataFrames écrits à la main. Rapides, exécutés à chaque commit.
2. **Tests d'intégration** : le pipeline complet sur un jeu de données réduit mais réaliste, avec les vraies dépendances (base de test, stockage local type MinIO).
3. **Tests de données** en production : ce ne sont pas les mêmes ! Le code peut être juste et la donnée fausse. Avec dbt (`unique`, `not_null`, `accepted_values`, `relationships`) ou Great Expectations, je valide le résultat à chaque exécution.

Le tout branché en CI : si un test échoue, la pull request est bloquée.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le préalable, c'est de rendre le code **testable**. Un pipeline où lecture, transformation et écriture sont entremêlées dans une seule fonction de 200 lignes n'est pas testable — et aucun framework ne rattrapera ça. J'isole systématiquement la transformation en fonctions pures (DataFrame → DataFrame) : le reste devient de la plomberie.

Ensuite, ce que je teste en priorité, ce ne sont pas les cas nominaux — ils marchent presque toujours — mais les **cas limites** : fichier vide, colonne manquante ou renommée par la source, type inattendu (un montant qui arrive en texte avec une virgule décimale), doublon, donnée en retard, caractères non-ASCII, fuseau horaire. C'est là que les pipelines cassent réellement.

Deux tests que je considère non négociables et que je vois rarement :

- **L'idempotence**, testée explicitement : exécuter deux fois le même run doit produire exactement le même état final. C'est le socle de tout rejeu et de tout *backfill*.
- **La non-régression sur incidents passés** : chaque bug de production devient un cas de test permanent. C'est ainsi qu'une suite de tests gagne en valeur avec le temps au lieu d'être un rituel.

Sur les **fixtures**, je préfère quelques dizaines de lignes écrites à la main et lisibles à un dump de production de 100 Mo : quand un test échoue, on doit comprendre pourquoi en dix secondes. Et jamais de données réelles de clients dans un dépôt — sujet RGPD, mais aussi bon sens.

Enfin, la limite à connaître et à énoncer : **100 % de couverture unitaire ne dit rien sur la qualité de la donnée en production**. Le code peut être parfait et la source envoyer des montants en centimes depuis mardi. D'où la nécessité des deux couches — tests de code en CI, tests de données à l'exécution — plus une **surveillance de fraîcheur** : une table qui ne se met plus à jour est un incident, même si tous les tests passent.

</details>

> ⚠️ **Le piège** — Ne parler que de tests unitaires. En data, un code juste peut produire une donnée fausse : si tu ne distingues pas *tests de code* et *tests de données*, tu montres que tu n'as pas opéré de pipeline en production.
>
> 📘 **Pour approfondir** : [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/) · [03 · Git](/modules/beginner__03_git_for_data_engineers/)
>
> 🇬🇧 *unit test, integration test, data test, fixture, idempotency, regression test, freshness check*

---

## 9. Pourquoi `iterrows()` est-il déconseillé ? Que fais-tu à la place ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *Why is `iterrows()` discouraged in pandas, and what do you use instead?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Parce que c'est lent : ça boucle ligne par ligne en Python. Il vaut mieux vectoriser, c'est-à-dire appliquer l'opération sur toute la colonne d'un coup.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

`iterrows()` fait deux choses coûteuses : il exécute une boucle **Python** (donc interprétée, avec le GIL) et il crée une `Series` **par ligne**, ce qui alloue de la mémoire à chaque itération — et fait au passage perdre les types (tout remonte en `object` si les colonnes sont hétérogènes).

À la place, on utilise des opérations vectorisées, exécutées en C sur des tableaux contigus :

```python
# ❌ lent
for idx, row in df.iterrows():
    df.at[idx, 'ttc'] = row['ht'] * 1.18

# ✅ vectorisé
df['ttc'] = df['ht'] * 1.18

# ✅ conditionnel vectorisé
df['segment'] = np.where(df['montant'] > 1000, 'premium', 'standard')
```

L'écart est typiquement de deux à trois ordres de grandeur. Autre réflexe : quand on boucle pour aller chercher une valeur dans une autre table, la bonne réponse est un `merge`, pas une boucle. Et `apply` n'est **pas** vectorisé : c'est une boucle déguisée, un peu plus lisible seulement.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La hiérarchie réelle, du plus rapide au plus lent : opération vectorisée native > NumPy > `itertuples()` > `apply()` > `iterrows()`. Si je dois vraiment itérer, `itertuples()` est nettement meilleur (namedtuples, types préservés).

Mais voici ce que je réponds surtout en entretien, parce que c'est le vrai enseignement : **en data engineering, le goulot d'étranglement est rarement le CPU**. Il est dans l'I/O, la sérialisation et le réseau. Optimiser une boucle sur 10 000 lignes pendant que le job lit 200 Go de CSV non partitionné, c'est optimiser au mauvais endroit — un gain de 3 secondes sur un traitement de 40 minutes. Je profile avant d'optimiser (`cProfile`, `%%timeit`, l'onglet Stages du Spark UI) ; l'intuition se trompe très souvent.

Il y a aussi des cas où la boucle est **légitime** : un volume faible et une logique séquentielle irréductible (une machine à états, un calcul dépendant de la ligne précédente qu'on ne peut pas exprimer en fenêtrage). Écrire du code vectorisé illisible pour gagner 200 ms sur un DataFrame de 500 lignes est une mauvaise décision d'ingénierie — la lisibilité a une valeur.

L'équivalent en Spark mérite d'être mentionné, car c'est le même piège à plus grande échelle : une **UDF Python** force la sérialisation de chaque ligne entre la JVM et un interpréteur Python, et rend le traitement opaque à l'optimiseur Catalyst (qui ne peut plus pousser de filtres). Une fonction native est souvent 10 à 100× plus rapide. Si une UDF est inévitable, on utilise une **pandas UDF** (vectorisée, via Arrow) pour limiter les dégâts.

</details>

> ⚠️ **Le piège** — Dire « `apply` est vectorisé ». C'est faux, et c'est une erreur qui se repère immédiatement. `apply` boucle, il est juste plus lisible.
>
> 📘 **Pour approfondir** : [18 · High performance Python](/modules/intermediate__18_high_performance_python/) · [19 · PySpark avancé](/modules/intermediate__19_pyspark_advanced/)
>
> 🇬🇧 *vectorization, GIL, UDF overhead, serialization, pandas UDF, Arrow, profiling*

---

## 10. Comment structures-tu un projet Python de data engineering ?

`fréquente` · `🌍 international` · **EN** — *How do you structure a production-grade Python data engineering project?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Je mets mes scripts dans un dossier, avec un `requirements.txt` pour les dépendances et un `README` pour expliquer comment lancer.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Une structure type :

```text
projet/
├── pyproject.toml          # dépendances + métadonnées (uv / poetry)
├── Dockerfile
├── README.md
├── src/pipeline/
│   ├── extract.py          # I/O en entrée
│   ├── transform.py        # logique métier — pure, testable
│   ├── load.py             # I/O en sortie
│   └── config.py           # configuration via variables d'environnement
├── tests/
└── dags/                   # orchestration (Airflow)
```

Les principes : configuration **externalisée** (jamais de chemin ni de mot de passe en dur), séparation nette entre logique métier et I/O pour pouvoir tester, dépendances **verrouillées** par un lockfile, conteneurisation pour un environnement reproductible, et qualité automatisée en CI (`ruff`, `black`, `mypy`, `pytest`).

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La structure doit suivre le **mode de déploiement**, pas un modèle recopié d'un article de blog. Un job packagé en image Docker et lancé par Airflow n'a pas la même arborescence qu'une bibliothèque partagée entre quinze pipelines.

Les points sur lesquels je ne transige pas :

**Le DAG ne contient pas de logique.** Un fichier Airflow doit décrire un enchaînement, appeler des fonctions et rien d'autre. Dès qu'on met des transformations dans le DAG, on ne peut plus tester sans Airflow — et le scheduler parse ces fichiers en boucle, donc tout import lourd dégrade tout l'ordonnanceur.

**Un lockfile, sinon le build n'est pas reproductible.** Un `requirements.txt` sans versions figées signifie qu'une mise à jour transitive peut casser la production un mardi matin sans qu'aucun commit n'ait été fait. C'est l'incident le plus stupide et le plus fréquent.

**Monorepo ou un dépôt par pipeline ?** Le monorepo facilite le partage de code et le refactoring transverse, mais impose une CI plus fine (ne rebuilder que ce qui change) et couple les cycles de livraison. Un dépôt par pipeline isole bien mais duplique la plomberie et laisse dériver les versions. À moins de cinq pipelines, monorepo sans hésiter.

**Les secrets ne sont jamais dans le code**, ni dans un `.env` commité, ni dans une variable Airflow en clair : un gestionnaire de secrets, ou à défaut des variables d'environnement injectées au déploiement. Et une rotation possible sans redéployer.

Un détail spécifique au métier : le **packaging pour Spark**. Envoyer ses dépendances avec `--py-files` fonctionne mal dès qu'il y a des paquets compilés ; construire une image contenant l'environnement est plus fiable, au prix d'une image plus lourde (d'où le multi-stage build).

Enfin, l'arbitrage contextuel : une équipe d'une personne n'a pas besoin de la même industrialisation qu'une équipe de dix. Imposer un monorepo, mypy strict et une CI en quatre étapes à un DE seul dans une PME, c'est de la cérémonie qui ralentit sans protéger. Je calibre selon l'équipe et la criticité — et je sais expliquer pourquoi.

</details>

> ⚠️ **Le piège** — Décrire une arborescence sans jamais expliquer *pourquoi*. La question teste ta maturité d'ingénieur logiciel : reproductibilité, testabilité, sécurité.
>
> 📘 **Pour approfondir** : [14 · Docker](/modules/intermediate__14_docker_for_data_engineers/) · [12 · Orchestration](/modules/beginner__12_orchestration_pipelines/)
>
> 🇬🇧 *lockfile, reproducible build, separation of concerns, monorepo, secrets management, multi-stage build*

---

## 🚧 La suite arrive

Cette page s'enrichit par lots. Prochains thèmes en préparation :

| Thème | Questions |
|---|---|
| ⚡ Spark & calcul distribué | shuffle, data skew, partitionnement, OOM |
| 📨 Streaming & Kafka | garanties de livraison, watermark, late data |
| 🏠 Lakehouse & formats de table | Delta vs Iceberg, MERGE, small files |
| 🔄 Orchestration & CI/CD | Airflow, backfill, environnements |
| ✅ Data Quality & gouvernance | contrats, incidents, RGPD |
| 💬 Comportemental & posture | incidents, désaccords, questions à poser |

> 💬 **Une question t'a été posée en entretien et elle n'est pas là ?** Partage-la dans la [communauté Telegram](https://t.me/fromzerotoherodataeng) — les meilleures seront ajoutées.

---

> 📌 **Prépare aussi la pratique.** Les questions valident ta compréhension ; un projet valide ta capacité à livrer. Enchaîne avec le [projet intégrateur](/modules/intermediate__26_projet_integrateur/) et le [mini-projet dbt exécutable](/modules/intermediate__25_dbt_data_quality/).
