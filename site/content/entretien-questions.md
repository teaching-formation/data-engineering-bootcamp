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

# ⚡ Spark & calcul distribué

## 11. Explique la lazy evaluation dans Spark. Quelle est la différence entre une transformation et une action ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Explain lazy evaluation in Spark. What's the difference between a transformation and an action?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Spark n'exécute rien tant qu'on ne demande pas le résultat. Les **transformations** (`filter`, `select`, `join`) sont paresseuses : elles décrivent le calcul. Les **actions** (`count`, `collect`, `write`) déclenchent réellement l'exécution.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Les transformations construisent un **graphe de dépendances** (DAG) sans rien calculer. C'est seulement à l'action que Spark soumet un *job*, le découpe en *stages* (séparés par les shuffles), eux-mêmes découpés en *tasks*.

L'intérêt est l'**optimisation globale** : comme Catalyst voit tout l'enchaînement avant d'exécuter, il peut faire descendre les filtres au plus près de la lecture (*predicate pushdown*), ne lire que les colonnes utiles (*column pruning*), réordonner des jointures. Écrire un `filter` en dernier ou en premier donne souvent le même plan.

Deux conséquences pratiques : le temps « passé » sur une ligne de code ne veut rien dire (tout se déclenche à l'action) ; et une erreur dans une transformation ne surgit qu'au moment de l'action, parfois des dizaines de lignes plus loin.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le piège opérationnel majeur, c'est le **recalcul**. Un DataFrame n'est pas un résultat, c'est une recette. Si tu réutilises le même DataFrame dans deux actions sans le matérialiser, Spark **rejoue tout le lignage** — y compris la lecture de la source — deux fois. Sur un pipeline qui lit 200 Go, ça double la facture sans qu'aucune ligne de code ne le laisse deviner. D'où `cache()` / `persist()`, mais avec discernement : le cache occupe de la mémoire qui manquera à l'exécution, il peut être évincé silencieusement (et donc recalculé quand même), et sérialiser coûte. Je ne cache que si un DataFrame est réutilisé **au moins deux fois** et que son calcul est cher.

Corollaire fréquent en revue de code : un `count()` glissé au milieu d'un pipeline « juste pour vérifier » déclenche un job complet. En développement c'est acceptable, en production c'est une dépense pure.

Pour déboguer, `df.explain(True)` donne les plans logique, logique optimisé et physique. Mais depuis Spark 3, il faut savoir que le plan statique ne dit plus tout : **AQE** (*Adaptive Query Execution*) modifie le plan **pendant** l'exécution — il fusionne les partitions post-shuffle, peut basculer un *sort-merge join* en *broadcast join* si les statistiques réelles s'y prêtent, et gère certains cas de skew. C'est pour ça que le Spark UI est plus fiable que le plan imprimé.

Dernier piège classique : appeler une action dans une boucle Python. On obtient N jobs séquentiels au lieu d'un seul job parallèle — la logique doit être exprimée en une seule transformation (`union`, `when`, jointure), pas en itération côté driver.

</details>

> ⚠️ **Le piège** — Réciter « transformation = lazy, action = eager » sans expliquer *à quoi ça sert*. Le recruteur attend l'optimisation par Catalyst et le problème du recalcul.
>
> 📘 **Pour approfondir** : [11 · PySpark](/modules/beginner__11_pyspark_for_data_engineering/) · [20 · Spark SQL](/modules/intermediate__20_spark_sql_deep_dive/)
>
> 🇬🇧 *lazy evaluation, DAG, stage, predicate pushdown, column pruning, lineage, adaptive query execution*

---

## 12. C'est quoi un shuffle et pourquoi ça coûte cher ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *What is a shuffle in Spark and why is it expensive?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

C'est quand Spark doit redistribuer les données entre les executors, par exemple pour un `groupBy` ou une jointure. C'est lent parce que ça passe par le réseau.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Il faut distinguer deux familles de transformations :

- **Narrow** (`map`, `filter`, `select`) : chaque partition de sortie ne dépend que d'une partition d'entrée. Aucun mouvement de données, tout reste local, et plusieurs opérations s'enchaînent dans le même *stage*.
- **Wide** (`groupBy`, `join`, `distinct`, `repartition`) : une partition de sortie dépend de **toutes** les partitions d'entrée, puisqu'il faut regrouper les lignes par clé. C'est le shuffle.

Concrètement, chaque executor écrit des fichiers intermédiaires sur son disque local (*shuffle write*), puis les autres executors viennent les lire par le réseau (*shuffle read*). On paie donc de la sérialisation, de l'I/O disque **et** du réseau. C'est le coût dominant de la plupart des jobs Spark.

Pour le réduire : filtrer et agréger **avant** le shuffle, préférer un *broadcast join* quand un côté est petit, et supprimer les `repartition` inutiles.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le shuffle n'est pas seulement lent : c'est **le point de fragilité** du job. C'est là que ça déborde sur disque (*spill*), que la mémoire explose, et que la perte d'un executor coûte le plus cher — un *fetch failure* oblige à recalculer tout le stage amont, pas juste la tâche perdue. Un job qui échoue au bout de 40 minutes échoue presque toujours dans un shuffle.

Le réglage que je vérifie systématiquement, c'est `spark.sql.shuffle.partitions`, dont la valeur par défaut (200) est absurde dans les deux sens. Sur 1 Go de données, on crée 200 tâches minuscules dont le coût d'ordonnancement dépasse le travail utile. Sur 1 To, on crée des partitions de 5 Go qui *spillent* systématiquement. Ma règle : viser des partitions de l'ordre de 128 à 256 Mo. Depuis Spark 3, AQE fusionne automatiquement les partitions post-shuffle (`coalescePartitions`), ce qui rend ce réglage moins critique — encore faut-il l'avoir activé.

Sur le **broadcast join** : le seuil par défaut (`autoBroadcastJoinThreshold`, 10 Mo) est souvent trop conservateur ; monter à 100–200 Mo élimine beaucoup de shuffles. Mais broadcaster une table trop grosse fait tomber le driver en OOM, et le seuil se base sur des statistiques parfois fausses — d'où l'intérêt du hint explicite `broadcast(df)` quand on sait ce qu'on fait.

Le vrai levier, cependant, est **architectural, pas paramétrique** : le shuffle le moins cher est celui qu'on ne fait pas. Si les deux tables sont déjà partitionnées (ou *bucketées*) sur la clé de jointure au niveau du stockage, les données sont co-localisées et Spark peut joindre sans redistribuer. C'est un choix de modélisation du lakehouse, en amont du job.

Enfin, savoir lire le Spark UI : dans l'onglet Stages, je regarde *Shuffle Read/Write*, et surtout la distribution des durées de tâches (min / médiane / max). Un `max` dix fois supérieur à la médiane, ce n'est pas un problème de shuffle — c'est du skew, et le remède est différent.

</details>

> ⚠️ **Le piège** — Dire « c'est lent à cause du réseau » et s'arrêter là. Le shuffle écrit aussi sur disque et sérialise ; et c'est le point où le job casse.
>
> 📘 **Pour approfondir** : [19 · PySpark avancé](/modules/intermediate__19_pyspark_advanced/) · [20 · Spark SQL](/modules/intermediate__20_spark_sql_deep_dive/)
>
> 🇬🇧 *shuffle, narrow/wide transformation, spill, fetch failure, broadcast join, bucketing*

---

## 13. Un stage de ton job traîne à cause d'un data skew. Comment tu diagnostiques et corriges ?

`fréquente` · `🌍 international` · **EN** — *One stage of your Spark job is stuck because of data skew. How do you diagnose and fix it?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Certaines partitions contiennent beaucoup plus de données que les autres, donc certaines tâches mettent beaucoup plus de temps. On peut essayer de repartitionner les données.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Le symptôme est caractéristique : dans un stage, 199 tâches finissent en 10 secondes et **une seule** tourne pendant 40 minutes. Le job n'est pas lent, il attend une tâche.

Le diagnostic se fait en comptant les occurrences de la clé de jointure ou de groupement :

```python
df.groupBy("customer_id").count().orderBy(F.desc("count")).show(10)
```

Si les dix premières clés représentent une part énorme du volume, c'est confirmé.

Les remèdes classiques : activer le *skew join* d'AQE (`spark.sql.adaptive.skewJoin.enabled`), *broadcaster* l'autre table si elle est petite, ou faire du **salting** — ajouter un suffixe aléatoire à la clé chaude pour l'éclater sur plusieurs partitions, joindre, puis ré-agréger.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Avant les remèdes, je confirme dans le Spark UI que c'est bien du skew et pas autre chose : je compare la durée **médiane** et la durée **max** des tâches du stage, ainsi que le *Shuffle Read* par tâche. Un ratio max/médiane supérieur à 5, c'est du skew ; si toutes les tâches sont uniformément lentes, le problème est ailleurs (volume, spill, sous-dimensionnement).

Mon ordre de préférence pour corriger, du moins au plus intrusif :

1. **AQE skew join** — gratuit, sans changement de code, il découpe automatiquement les partitions anormalement grosses. Depuis Spark 3, il règle la majorité des cas.
2. **Broadcast** de l'autre côté si sa taille le permet : plus de shuffle, donc plus de skew.
3. **Isoler les clés chaudes** : traiter séparément les trois clés qui représentent 60 % du volume, puis `union` avec le reste. C'est plus verbeux mais nettement plus lisible et débogable que le salting.
4. **Salting** en dernier recours. Il complique le code et impose de choisir un facteur : trop faible, il ne corrige rien ; trop élevé, il multiplie les partitions et le coût de la ré-agrégation.

Mais le point que la plupart des candidats manquent : **le skew vient très souvent d'une valeur sentinelle sans signification métier** — `NULL`, chaîne vide, `'UNKNOWN'`, `'0000000'`. Toutes les lignes non appariées se retrouvent sur la même clé. Le bon correctif n'est alors ni le salting ni AQE, c'est de **filtrer ou traiter ces valeurs avant la jointure**, parce qu'elles ne portent aucune information. J'ai vu un job passer de trois heures à huit minutes juste en excluant les `NULL` de la clé de jointure — aucun tuning n'aurait donné ça.

Enfin, le skew existe aussi **en écriture** : un `partitionBy` sur une colonne déséquilibrée produit un dossier énorme et des milliers de dossiers minuscules. Le remède est un `repartition` sur la même colonne juste avant l'écriture (voir question suivante).

</details>

> ⚠️ **Le piège** — Sauter directement au salting. C'est la technique la plus connue et la moins souvent nécessaire. Le recruteur veut voir le **diagnostic** avant le remède.
>
> 📘 **Pour approfondir** : [19 · PySpark avancé](/modules/intermediate__19_pyspark_advanced/) · [21 · Spark on K8s](/modules/intermediate__21_spark_on_kubernetes/)
>
> 🇬🇧 *data skew, hot key, salting, adaptive query execution, straggler task*

---

## 14. `repartition` ou `coalesce` ? Et comment choisis-tu le nombre de partitions ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *`repartition` vs `coalesce` — and how do you pick the number of partitions?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

`repartition` change le nombre de partitions et `coalesce` sert à le réduire. `coalesce` est moins coûteux parce qu'il évite un shuffle complet.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

`repartition(n)` fait un **shuffle complet** : les données sont redistribuées uniformément, et on peut augmenter ou diminuer le nombre de partitions. `coalesce(n)` **fusionne** des partitions existantes sans redistribution globale (transformation *narrow*) : c'est bien moins cher, mais uniquement pour réduire, et le résultat peut rester déséquilibré.

Le piège majeur est `coalesce(1)` avant une écriture, pour obtenir un seul fichier : comme c'est une transformation narrow, la réduction du parallélisme **remonte dans tout le stage amont**. Le calcul entier finit par s'exécuter sur un seul cœur. Si un fichier unique est vraiment nécessaire, `repartition(1)` est souvent préférable : on paie un shuffle, mais le parallélisme est préservé jusque-là.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Pour dimensionner, deux repères que j'utilise ensemble : viser des partitions de **128 à 256 Mo**, et un nombre total de partitions de l'ordre de **2 à 4 fois le nombre de cœurs** du cluster, pour que l'ordonnanceur ait de quoi lisser les tâches inégales.

Les deux excès coûtent. Trop de partitions : chaque tâche a un coût fixe d'ordonnancement (quelques dizaines de millisecondes), et en sortie on fabrique le *small files problem* — des milliers de fichiers minuscules qui rendront ensuite chaque lecture lente et qui saturent le metastore. Trop peu : pas de parallélisme, *spill*, et OOM.

L'usage le plus rentable — et le plus méconnu — c'est le `repartition` **par colonne juste avant un `write.partitionBy()`** :

```python
(df.repartition("country")
   .write.partitionBy("country")
   .mode("overwrite").parquet(path))
```

Sans cela, chaque partition Spark écrit dans chaque dossier de sortie : avec 200 partitions et 8 pays, on obtient 1 600 fichiers au lieu de 8. C'est la cause n°1 du *small files problem*, et une ligne suffit à l'éviter.

Depuis Spark 3, AQE fusionne automatiquement les partitions post-shuffle, ce qui rend le réglage manuel de `spark.sql.shuffle.partitions` beaucoup moins critique. Je fixe quand même une borne raisonnable plutôt que de laisser 200 par défaut.

Un mot de prudence pour finir : **mesurer avant de régler**. J'ai vu bien plus de jobs dégradés par du sur-tuning — des dizaines de paramètres copiés d'un article de blog, jamais mesurés — que de jobs cassés par les valeurs par défaut.

</details>

> ⚠️ **Le piège** — `coalesce(1)` pour « avoir un seul fichier ». C'est le cas d'école où l'optimisation apparente sérialise tout le job en amont.
>
> 📘 **Pour approfondir** : [19 · PySpark avancé](/modules/intermediate__19_pyspark_advanced/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *repartition, coalesce, partition sizing, small files problem, scheduling overhead*

---

## 15. Ton job Spark tombe en `OutOfMemory`. Comment tu procèdes ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *Your Spark job fails with an OutOfMemory error. How do you approach it?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

J'augmente la mémoire allouée aux executors (`spark.executor.memory`) et je relance.

*Parfois ça marche. Mais c'est le dernier levier, pas le premier.*

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Première question : **le driver ou un executor ?** Le message le dit, et le diagnostic est complètement différent.

- **Driver OOM** : presque toujours un `collect()` ou un `toPandas()` sur un gros DataFrame, ou un broadcast trop volumineux. C'est un problème de conception, pas de dimensionnement — on remplace par un `write`, un `take(n)`, ou une agrégation côté cluster.
- **Executor OOM** : partitions trop grosses, skew, cache excessif, ou UDF gourmande.

Pour un executor, le premier réflexe n'est pas d'ajouter de la mémoire mais **d'augmenter le nombre de partitions** : des partitions plus petites tiennent en mémoire. Ensuite seulement, ajuster `executor.memory` et `memoryOverhead`.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Augmenter la mémoire est le remède le plus cher et celui qui masque le problème : le job repasse, et six mois plus tard il retombe avec plus de données. Je traite la cause.

Un détail spécifique à **PySpark** que beaucoup ignorent : le message `Container killed by YARN for exceeding memory limits` n'est généralement **pas** un manque de heap JVM, mais un `memoryOverhead` trop faible. C'est cet overhead qui couvre les processus Python hors JVM — donc dès qu'on utilise des UDF Python, il faut le monter (10 % de l'executor par défaut, souvent insuffisant). Chercher la solution du côté de `executor.memory` dans ce cas ne donne rien.

Sur le **cache** : `MEMORY_ONLY` évince silencieusement quand la mémoire manque, et Spark recalcule — on croit avoir optimisé, on a en fait ajouté de la pression mémoire pour rien. `MEMORY_AND_DISK` est plus sûr par défaut. Et un `unpersist()` explicite quand le DataFrame n'est plus utile évite d'affamer la suite du job.

Contre-intuitif mais important : **plus de mémoire par executor n'est pas toujours mieux**. Au-delà d'environ 32 Go de heap, on perd les *compressed oops* (les pointeurs passent sur 8 octets, l'empreinte mémoire augmente) et les pauses de GC s'allongent, ce qui peut ralentir le job. Plusieurs executors moyens valent souvent mieux qu'un gros.

Enfin, la question de fond, la même qu'à la question 6 : **est-ce que ce job a vraiment besoin de Spark ?** Un OOM sur un traitement de 5 Go, c'est le signe qu'on utilise un marteau-pilon mal réglé là où DuckDB ou Polars feraient le travail sur une seule machine, sans JVM et sans tuning.

</details>

> ⚠️ **Le piège** — Répondre « j'augmente la mémoire » sans distinguer driver et executor. C'est la question qui sépare ceux qui ont exploité Spark en production de ceux qui l'ont suivi en tutoriel.
>
> 📘 **Pour approfondir** : [19 · PySpark avancé](/modules/intermediate__19_pyspark_advanced/) · [21 · Spark on K8s](/modules/intermediate__21_spark_on_kubernetes/)
>
> 🇬🇧 *driver vs executor, memory overhead, garbage collection, spill, compressed oops*

---

# 📨 Streaming & Kafka

## 16. Batch, micro-batch, streaming : quelles différences, et comment tu choisis ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Batch, micro-batch, streaming: what's the difference and how do you choose?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Le batch traite les données par lots à intervalles réguliers (toutes les heures, toutes les nuits). Le streaming les traite au fil de l'eau, dès qu'elles arrivent.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Trois modèles, avec des latences très différentes :

| Modèle | Latence typique | Outils |
|---|---|---|
| **Batch** | minutes à heures | Spark, dbt, Airflow |
| **Micro-batch** | secondes | Spark Structured Streaming |
| **Streaming événementiel** | millisecondes | Flink, Kafka Streams |

Le micro-batch est un compromis intéressant : Spark découpe le flux en petits lots (par exemple toutes les 10 secondes) et le modèle de programmation reste **identique au batch** — même API, même code, ce qui réduit énormément le coût d'apprentissage et de maintenance.

Le choix se fait sur la latence réellement exigée par le métier, pas sur la mode.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

En entretien comme en projet, je ne demande jamais « voulez-vous du temps réel ? » — la réponse est toujours oui. Je demande : **« que faites-vous différemment si la donnée arrive en 5 secondes plutôt qu'en 15 minutes ? »**. Dans la grande majorité des cas, la réponse honnête est « rien » : le rapport est lu le matin, la décision se prend en réunion hebdomadaire. Et alors le batch est objectivement meilleur — plus simple, moins cher, rejouable, testable, débogable à froid.

Le streaming a un coût opérationnel que les candidats sous-estiment : de l'état à gérer et à faire vieillir, des checkpoints à ne pas corrompre, des montées de version délicates (un changement de schéma d'état peut rendre le checkpoint illisible), un débogage sur un job qui tourne en continu, et une astreinte — un pipeline batch qui échoue à 3 h peut attendre 8 h ; un pipeline de détection de fraude, non.

Les cas où le streaming se justifie vraiment : détection de fraude, alerting opérationnel, tarification dynamique, supervision technique, et les usages où la donnée perd sa valeur en quelques secondes. En mobile money par exemple, bloquer une transaction frauduleuse doit se faire pendant la transaction — là, c'est légitime.

Deux nuances qui font la différence. D'abord, ne pas confondre **latence** et **fraîcheur perçue** : un pipeline « temps réel » qui alimente un dashboard rafraîchi toutes les 15 minutes ne sert à rien — on a payé la complexité sans acheter de valeur. Ensuite, la migration batch → streaming est bien plus facile dans ce sens que l'inverse : commencer en batch, mesurer, et ne passer au streaming que sur le périmètre qui le justifie, est presque toujours la bonne trajectoire.

</details>

> ⚠️ **Le piège** — Vendre le streaming comme intrinsèquement supérieur. Un bon Data Engineer se distingue par sa capacité à **ne pas** utiliser la technologie la plus impressionnante.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/)
>
> 🇬🇧 *micro-batch, end-to-end latency, operational overhead, event-driven*

---

## 17. Explique topics, partitions et consumer groups dans Kafka. Comment garantir l'ordre des messages ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Explain Kafka topics, partitions and consumer groups. How do you guarantee message ordering?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Un **topic** est un canal de messages, découpé en **partitions**. Les consommateurs d'un même **consumer group** se répartissent les partitions pour lire en parallèle.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

La partition est à la fois l'unité de **parallélisme** et l'unité d'**ordre**. Kafka garantit l'ordre **à l'intérieur** d'une partition, jamais entre partitions.

Le placement se fait par la **clé** du message : `partition = hash(clé) % nb_partitions`. Tous les messages portant la même clé (par exemple un `customer_id`) atterrissent donc dans la même partition et sont ordonnés entre eux. Sans clé, la répartition est round-robin : bonne distribution, aucune garantie d'ordre.

Dans un consumer group, chaque partition est assignée à **exactement un** consommateur. Conséquence directe : ajouter plus de consommateurs que de partitions ne sert à rien, les consommateurs excédentaires restent inactifs.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le **choix de la clé** est la décision structurante, et elle est difficile à revenir en arrière. Une clé trop grossière crée une *hot partition* — c'est exactement le problème de skew de la question 13, transposé à Kafka : un consommateur saturé pendant que les autres dorment.

Le **nombre de partitions** est encore plus engageant. On peut l'augmenter, mais cela casse le mapping `clé → partition` : les nouveaux messages d'une clé donnée partiront ailleurs, et l'ordre historique par clé est rompu. D'où la règle de sur-provisionner raisonnablement au départ. Mais sur-provisionner à l'excès coûte aussi : plus de descripteurs de fichiers et de mémoire sur les brokers, réplication plus lourde, et rééquilibrages plus longs.

En production, le vrai point douloureux est le **rebalancing** : quand un consommateur rejoint ou quitte le groupe, l'assignation est recalculée et, avec la stratégie classique, tout le groupe s'arrête le temps de la redistribution. Deux conséquences pratiques : utiliser une stratégie coopérative (`CooperativeStickyAssignor`) pour éviter le *stop-the-world*, et surveiller `max.poll.interval.ms` — si le traitement d'un lot dépasse ce délai, le broker considère le consommateur mort, déclenche un rebalancing, le consommateur revient, reprend le même lot, et repart pour un tour. On obtient une boucle infinie qui ressemble à un problème de performance alors que c'est un problème de configuration.

Enfin, sur l'ordre total : il n'existe qu'avec **une seule partition**, ce qui supprime tout parallélisme. Quand un métier exige un ordre global strict, c'est presque toujours le signe d'une modélisation à revoir : l'ordre **par entité** (par compte, par client) suffit dans la quasi-totalité des cas réels, et il est gratuit dès qu'on choisit bien la clé.

</details>

> ⚠️ **Le piège** — Affirmer « Kafka garantit l'ordre ». Il le garantit **par partition**. Cette nuance est exactement ce que la question teste.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [29 · Messaging distribué](/modules/advanced__29_distributed_messaging/)
>
> 🇬🇧 *partition key, consumer group, rebalancing, hot partition, ordering guarantee*

---

## 18. At-least-once, at-most-once, exactly-once : que choisis-tu, et à quel coût ?

`fréquente` · `🌍 international` · **EN** — *At-least-once, at-most-once, exactly-once — which do you choose, and at what cost?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

**At-most-once** : le message peut être perdu. **At-least-once** : il peut être traité plusieurs fois (doublons). **Exactly-once** : exactement une fois, c'est le plus fiable.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

En pratique, tout se joue sur le **moment du commit de l'offset** :

- Commit **avant** traitement → at-most-once. Si le consommateur tombe après le commit, le message est perdu.
- Commit **après** traitement → at-least-once. Si le consommateur tombe entre le traitement et le commit, le message sera relu au redémarrage : doublon.

L'exactly-once dans Kafka repose sur les **transactions** : producteur idempotent (`enable.idempotence`), `transactional.id`, et écriture atomique du résultat **et** de l'offset. Côté lecteur, il faut `isolation.level=read_committed`. Le prix : débit réduit, latence supplémentaire, complexité de reprise.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ma réponse en entretien est nette : **at-least-once + traitement idempotent**. C'est le design de la grande majorité des systèmes fiables, et ce n'est pas un compromis au rabais — c'est plus simple, plus robuste et plus facile à opérer que l'exactly-once.

La raison de fond est importante à savoir formuler : l'exactly-once « de bout en bout » est largement un argument commercial. Il est réel **à l'intérieur du périmètre Kafka** (Kafka → traitement → Kafka), parce que les offsets et les écritures peuvent participer à la même transaction. Dès que la destination est un système externe — une API, une base sans transaction partagée, un envoi de SMS — l'atomicité est impossible : il y aura toujours une fenêtre entre « j'ai écrit » et « j'ai commité ». La seule vraie protection est de rendre l'**écriture cible idempotente** : `MERGE` sur une clé métier, `upsert`, `ON CONFLICT DO NOTHING`. C'est ce qui rend le pattern `MERGE INTO` du lakehouse si central.

Le coût de l'exactly-once mérite d'être chiffré quand on le propose : baisse de débit, latence accrue (les consommateurs en `read_committed` attendent la fin des transactions), et surtout une reprise après incident plus délicate. Je le réserve aux cas où un doublon a un **coût métier réel** : facturation, paiement, mouvement comptable. En banque et en mobile money, ce sont des cas légitimes — et là, la conversation se tient avec le métier et la conformité, pas entre ingénieurs.

À l'inverse, l'at-most-once a de vrais usages qu'on oublie : télémétrie, métriques d'usage, logs d'observabilité. Perdre 0,1 % des points n'a aucun impact sur une courbe, et on gagne en latence et en simplicité. Choisir la garantie la plus faible **suffisante** est un signe de maturité, pas de négligence.

</details>

> ⚠️ **Le piège** — Répondre « exactly-once, évidemment ». Le recruteur attend que tu connaisses son coût et sa **limite** dès qu'un système externe entre en jeu.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *delivery semantics, offset commit, idempotent producer, transactional write, read_committed*

---

## 19. C'est quoi un watermark ? Comment tu gères les données qui arrivent en retard ?

`fréquente` · `🌍 international` · **EN** — *What is a watermark, and how do you handle late-arriving data?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Le watermark définit jusqu'à quel point on accepte les données en retard. Au-delà de ce seuil, les événements trop anciens sont ignorés.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Tout part de la distinction entre **event time** (le moment où l'événement s'est produit) et **processing time** (le moment où on le traite). Sur un réseau instable, l'écart peut être considérable.

Quand on agrège par fenêtres (le chiffre d'affaires par tranche de 5 minutes), il faut décider **quand une fenêtre est close**. Le watermark est ce seuil : « je considère ne plus recevoir d'événement plus ancien que `(max event time observé − 10 minutes)` ». Passé ce point, la fenêtre est finalisée, son état est libéré, et les arrivées plus tardives sont rejetées.

```python
(df.withWatermark("event_time", "10 minutes")
   .groupBy(F.window("event_time", "5 minutes"), "country")
   .agg(F.sum("amount")))
```

Sans watermark, l'état grossit indéfiniment : le job finit par tomber en mémoire.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le watermark est un **arbitrage explicite entre exactitude, latence et mémoire**, et ce n'est pas une décision technique : c'est une décision métier. Un watermark de deux heures capte presque tout mais retarde les résultats et conserve beaucoup d'état (mémoire, checkpoints plus lourds, reprise plus lente). Un watermark d'une minute donne des résultats immédiats mais jette des données. La bonne façon de poser la question au métier : *« acceptez-vous que 0,3 % des transactions ne soient pas comptées dans l'agrégat pour gagner une heure de fraîcheur ? »*.

En production, le point non négociable est de **mesurer**. Je pose systématiquement deux métriques : la distribution de l'écart `processing_time − event_time`, et un compteur d'événements rejetés par le watermark. Sans cela, on perd de la donnée **silencieusement** — le pire scénario possible, parce que rien n'échoue et que les chiffres sont simplement faux.

Un piège que j'ai vu casser un pipeline : le watermark avance avec le **maximum** d'event time observé. Il suffit donc d'**un seul** message avec un horodatage aberrant dans le futur — une horloge mal réglée sur un terminal de terrain — pour que le watermark saute de plusieurs jours et invalide d'un coup toutes les données réelles qui suivent. D'où un filtre de sanité rejetant les timestamps trop en avance, avant toute agrégation.

Le contexte compte énormément pour calibrer. Sur des terminaux de paiement en zone à réseau instable, des événements peuvent remonter avec plusieurs heures de retard quand la connectivité revient : un watermark dimensionné pour une infrastructure européenne y détruirait une part significative des données.

Enfin, pour les vrais retardataires, la réponse n'est pas d'allonger indéfiniment le watermark mais d'assumer une **architecture lambda** : le streaming fournit une réponse rapide et approximative, et un batch de réconciliation nocturne recalcule la vérité. On sépare ainsi la contrainte de fraîcheur de la contrainte d'exactitude au lieu de les faire porter par un seul mécanisme.

</details>

> ⚠️ **Le piège** — Présenter le watermark comme un simple paramètre. C'est un arbitrage métier, et sans métrique sur les événements rejetés, on perd des données sans le savoir.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [33 · OLAP temps réel](/modules/advanced__33_realtime_olap_dashboards/)
>
> 🇬🇧 *event time vs processing time, watermark, windowing, late-arriving data, state store, lambda architecture*

---

## 20. Comment rends-tu un consommateur Kafka idempotent ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *How do you make a Kafka consumer idempotent?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Avant d'insérer un message, on vérifie s'il a déjà été traité, par exemple grâce à son identifiant, pour ne pas créer de doublon.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Être idempotent, c'est garantir que traiter deux fois le même message donne le **même état final**. Trois approches :

1. **Upsert sur une clé métier** : `MERGE INTO` (lakehouse), `ON CONFLICT DO NOTHING/UPDATE` (PostgreSQL). Un rejeu écrase la ligne au lieu d'en créer une seconde.
2. **Table de déduplication** des identifiants déjà traités, consultée avant traitement.
3. **Opérations naturellement idempotentes** : préférer un `SET solde = 1500` à un `INCREMENT solde + 100`, qui n'est pas rejouable.

C'est ce qui permet de fonctionner sereinement en at-least-once (question 18) sans payer le coût de l'exactly-once.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La vraie question est : **quelle est la clé d'idempotence, et d'où vient-elle ?** Elle doit être fournie par le **producteur** et être stable dans le temps. Un offset Kafka ne convient pas (il change si le message est republié), un horodatage de réception non plus. Il faut un identifiant métier : `transaction_id`, `payment_id`.

Si la source n'en fournit pas, on peut hasher un ensemble de champs — mais il faut alors énoncer clairement le risque : deux événements **légitimement identiques** (le même client achète deux fois 500 F à la même seconde, ce qui arrive réellement en mobile money) seront fusionnés à tort. C'est une perte de données, et c'est une décision à faire valider par le métier, pas un choix d'implémentation.

Sur le stockage de l'état de déduplication, le piège classique est la table qui grossit indéfiniment jusqu'à devenir plus coûteuse que le traitement lui-même. Il faut une **fenêtre de rétention** explicite (par exemple 7 jours), cohérente avec la rétention Kafka et avec le délai maximal de rejeu qu'on s'autorise. Au-delà, on assume de ne plus dédupliquer.

Le point le plus souvent manqué : l'idempotence en base ne protège pas des **effets de bord externes**. Si le traitement envoie un SMS, débite un compte via une API ou publie sur un autre topic, rejouer n'est pas neutre — le client reçoit deux SMS, ou est débité deux fois. La parade est une **clé d'idempotence côté API** : la plupart des API de paiement sérieuses acceptent un en-tête `Idempotency-Key` prévu exactement pour ça. Quand ce n'est pas disponible, on isole l'effet de bord derrière une table d'état transactionnelle (*outbox pattern*).

Enfin, l'idempotence doit être **testée**, pas supposée : dans ma CI, rejouer deux fois le même lot doit produire un état final identique. C'est le test dont je parlais à la question 8, et c'est celui qui rattrape le plus de bugs avant la production.

</details>

> ⚠️ **Le piège** — Ne parler que de la base de données. Un rejeu qui renvoie un SMS ou redébite un compte est le vrai risque, et il ne se règle pas avec un `MERGE`.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *idempotency key, upsert, deduplication window, side effects, outbox pattern*

---

## 🚧 La suite arrive

Cette page s'enrichit par lots. Prochains thèmes en préparation :

| Thème | Questions |
|---|---|
| 🏠 Lakehouse & formats de table | Delta vs Iceberg, MERGE, small files |
| 🔄 Orchestration & CI/CD | Airflow, backfill, environnements |
| ✅ Data Quality & gouvernance | contrats, incidents, RGPD |
| 💬 Comportemental & posture | incidents, désaccords, questions à poser |

> 💬 **Une question t'a été posée en entretien et elle n'est pas là ?** Partage-la dans la [communauté Telegram](https://t.me/fromzerotoherodataeng) — les meilleures seront ajoutées.

---

> 📌 **Prépare aussi la pratique.** Les questions valident ta compréhension ; un projet valide ta capacité à livrer. Enchaîne avec le [projet intégrateur](/modules/intermediate__26_projet_integrateur/) et le [mini-projet dbt exécutable](/modules/intermediate__25_dbt_data_quality/).
