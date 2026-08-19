# 🏠 Lakehouse & formats de table

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

## 21. Data lake, data warehouse, lakehouse : quelles différences ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *What's the difference between a data lake, a data warehouse and a lakehouse?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Le **data lake** stocke des données brutes dans tous les formats, à bas coût. Le **data warehouse** stocke des données structurées, optimisées pour l'analyse SQL. Le **lakehouse** combine les deux.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

La différence de fond porte sur le moment où le schéma est imposé et sur les garanties offertes.

| | Data warehouse | Data lake | Lakehouse |
|---|---|---|---|
| Schéma | *schema-on-write* | *schema-on-read* | *schema-on-write* souple |
| Transactions | ACID | aucune | ACID |
| Formats | structuré | tout | tout, tables ouvertes |
| Coût stockage | élevé | faible | faible |
| Risque | rigidité | *data swamp* | maintenance |

Le lakehouse consiste à poser un **format de table ouvert** (Delta Lake, Apache Iceberg, Hudi) au-dessus d'un stockage objet bon marché (S3, MinIO). On récupère l'ACID, le *time travel* et l'évolution de schéma, tout en gardant des fichiers Parquet lisibles par n'importe quel moteur (Spark, Trino, DuckDB).

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

L'apport décisif du lakehouse n'est pas technique, il est **économique et stratégique** : il découple le stockage du moteur de calcul. Dans un entrepôt classique, les données vivent dans le format propriétaire du fournisseur ; en sortir coûte cher, ce qui affaiblit ta position à chaque renégociation. Avec des tables Iceberg sur du stockage objet, tu peux passer de Spark à Trino puis à DuckDB **sans déplacer un octet**. C'est un argument de négociation autant qu'un choix d'architecture.

Mais je me méfie du discours qui présente le lakehouse comme supérieur en tout. Un entrepôt managé (Snowflake, BigQuery) reste plus simple à exploiter, et surtout meilleur sur les **requêtes BI courtes et concurrentes** — beaucoup d'utilisateurs, beaucoup de petites requêtes — où le lakehouse souffre. Le lakehouse, lui, exige d'assumer la compaction, l'expiration des snapshots, le catalogue, l'optimisation des fichiers : c'est un vrai coût d'exploitation récurrent, pas un « pose et oublie ».

Ma règle de décision : moins de trois Data Engineers et des volumes modérés → entrepôt managé, sans hésiter ; volumes importants, besoins ML, plusieurs moteurs, ou sensibilité au *lock-in* → lakehouse.

Un point de contexte que je sais défendre en entretien local : dans une banque ou un opérateur d'Afrique de l'Ouest, le lakehouse sur MinIO **on-premise** est souvent le seul choix viable — pas de budget cloud récurrent, et des contraintes réglementaires de souveraineté qui interdisent de sortir les données du pays. Ce n'est pas un choix par défaut faute de mieux : c'est une architecture parfaitement légitime, et savoir l'opérer est une compétence rare.

</details>

> ⚠️ **Le piège** — Réciter la définition marketing (« le meilleur des deux mondes ») sans citer un seul coût. Le lakehouse transfère de la complexité du fournisseur vers ton équipe.
>
> 📘 **Pour approfondir** : [22 · Cloud & object storage](/modules/intermediate__22_cloud_and_object_storage/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *schema-on-read, open table format, vendor lock-in, decoupled storage and compute*

---

## 22. Explique l'architecture médaillon. Qu'est-ce qu'on met dans Bronze, Silver et Gold ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Explain the medallion architecture. What goes into Bronze, Silver and Gold?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

**Bronze** contient les données brutes telles qu'elles arrivent, **Silver** les données nettoyées et validées, **Gold** les données agrégées prêtes pour l'analyse et les tableaux de bord.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Chaque couche a un **contrat** différent :

- **Bronze** — copie fidèle de la source, en *append only*, sans aucune transformation. On y ajoute seulement des métadonnées techniques (horodatage d'ingestion, nom du fichier source). Son rôle : l'auditabilité et la capacité à rejouer.
- **Silver** — typage explicite, déduplication, validation, jointure avec les référentiels. Une table par entité métier (clients, commandes). C'est la « vérité » exploitable.
- **Gold** — agrégats orientés usage, souvent dénormalisés, prêts pour la BI ou le ML.

Le découpage évite de refaire le nettoyage dans chaque rapport et rend le lignage lisible.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La règle que je pose et que je défends : **Bronze ne se modifie jamais, et ne se supprime jamais**. C'est le filet de sécurité de toute la plateforme. Si Silver est faux, on rejoue depuis Bronze ; si Bronze est faux ou incomplet, la donnée est définitivement perdue. C'est pourquoi il faut écrire en Bronze **avant** toute transformation, même en apparence anodine : un `cast` qui échoue silencieusement sur 2 % des lignes suffit à perdre de l'information qu'on ne pourra jamais reconstituer.

Les trois erreurs que je vois le plus souvent :

1. **Mettre de la logique métier en Bronze** « pour gagner une étape » — on perd la capacité de rejeu, qui était toute la raison d'être de la couche.
2. **Sauter Silver** et aller de Bronze directement à Gold : la logique de nettoyage se retrouve dupliquée dans chaque agrégat, et deux tableaux de bord finissent par afficher deux chiffres différents pour la même métrique.
3. **Multiplier les tables Gold** parce que chaque équipe veut la sienne : coûts de calcul en hausse et incohérence des indicateurs. La couche Gold doit être gouvernée, pas ouverte à tous les vents.

Sur le nombre de couches : trois est une convention, pas un dogme. J'ai travaillé avec une couche intermédiaire supplémentaire pour matérialiser une jointure très coûteuse réutilisée partout, et sur d'autres projets Silver suffisait. Ce qui compte, c'est que chaque couche ait un contrat explicite.

Deux points de gouvernance rarement évoqués mais qui font la différence en entretien. D'abord, **c'est Gold qu'on expose** : les SLA, les contrats de données et la documentation se posent là, pas en Bronze — un consommateur qui lit Bronze contourne toutes les garanties. Ensuite, **la rétention de Bronze est une décision de coût à prendre tôt** : conserver indéfiniment le brut d'un flux volumineux devient très cher. Je définis une politique dès le départ (par exemple 90 jours en accès chaud, puis archivage froid), sinon on la découvre le jour où la facture de stockage devient un sujet de direction.

</details>

> ⚠️ **Le piège** — Décrire les trois couches sans dire *pourquoi* Bronze existe. Sa justification n'est pas le stockage : c'est la capacité de **rejouer** et de prouver ce qu'on a reçu.
>
> 📘 **Pour approfondir** : [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/) · [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/)
>
> 🇬🇧 *medallion architecture, append-only, replayability, data contract, retention policy*

---

## 23. Comment Delta Lake ou Iceberg apportent-ils l'ACID sur du stockage objet ?

`fréquente` · `🌍 international` · **EN** — *How do Delta Lake and Iceberg provide ACID guarantees on object storage?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Ce sont des formats de table qui ajoutent des fonctionnalités de base de données au-dessus de fichiers Parquet : transactions, historique des versions, évolution du schéma.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Le mécanisme repose sur un **journal de transactions** stocké à côté des données.

- **Delta Lake** : un répertoire `_delta_log/` contenant des fichiers JSON (une entrée par commit) et des points de contrôle Parquet périodiques.
- **Iceberg** : une arborescence de métadonnées — fichier de métadonnées → *manifest list* → *manifests* → fichiers de données.

Dans les deux cas, la table « à un instant T » n'est rien d'autre que **la liste des fichiers référencés par la dernière version des métadonnées**. Écrire consiste à déposer de nouveaux fichiers de données, puis à publier atomiquement une nouvelle version des métadonnées. Tant que cette publication n'a pas eu lieu, les lecteurs continuent de voir l'ancienne version : c'est l'isolation par *snapshot*. Et comme les anciennes versions restent référencées, on obtient le *time travel* gratuitement.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le point difficile — et c'est ce que la question cherche vraiment — c'est **comment rendre le commit atomique** sur un stockage objet qui n'offre pas partout un *put-if-absent* fiable. Les deux formats répondent différemment : Delta s'est longtemps appuyé sur les garanties du système de fichiers, ce qui posait problème sur S3 en écriture concurrente (d'où le recours à DynamoDB comme *LogStore*) ; Iceberg délègue au **catalogue** (REST catalog, Hive Metastore, Glue), qui effectue un *compare-and-swap* sur le pointeur de métadonnées. C'est pour cette raison que le choix du catalogue est structurant avec Iceberg — un point systématiquement sous-estimé dans les comparatifs.

Sur les différences pratiques, deux avantages réels d'Iceberg : le **hidden partitioning** (le partitionnement est une propriété de la table, l'utilisateur filtre sur le timestamp et le *pruning* fonctionne, sans avoir à connaître une colonne dérivée) et l'**évolution du partitionnement sans réécriture** de l'historique. Delta a longtemps eu l'avantage de l'intégration Databricks et d'un écosystème Spark plus mûr. Les deux convergent aujourd'hui.

Mon critère de choix n'est donc pas la liste de fonctionnalités mais **l'écosystème** : quel moteur, quel catalogue, quel fournisseur, quelles compétences dans l'équipe ? Multi-moteurs ouvert (Spark + Trino + DuckDB) → Iceberg. Plateforme Databricks → Delta. Répondre « Iceberg parce que c'est mieux » sans ce raisonnement est un mauvais signal.

Enfin, le point d'exploitation qui distingue immédiatement quelqu'un qui a opéré ces tables : **sans maintenance, elles se dégradent**. Le journal grandit, les petits fichiers s'accumulent, les métadonnées deviennent coûteuses à lire. Compaction et expiration des snapshots ne sont pas optionnelles — ce sont des jobs planifiés, avec leur propre budget.

</details>

> ⚠️ **Le piège** — Répondre « c'est du Parquet avec des transactions » sans savoir expliquer le **journal de métadonnées**. C'est précisément le mécanisme que la question teste.
>
> 📘 **Pour approfondir** : [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/) · [22 · Cloud & object storage](/modules/intermediate__22_cloud_and_object_storage/)
>
> 🇬🇧 *transaction log, snapshot isolation, optimistic concurrency, compare-and-swap, hidden partitioning, time travel*

---

## 24. C'est quoi le *small files problem* et comment tu le règles ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *What is the small files problem and how do you fix it?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Quand une table est composée de milliers de tout petits fichiers, la lecture devient lente parce qu'il faut tous les ouvrir. On les compacte en fichiers plus gros.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Chaque fichier a un **coût fixe** indépendant de sa taille : ouverture, lecture du *footer* Parquet, appel réseau sur le stockage objet, entrée dans les métadonnées. Lire 10 000 fichiers de 100 Ko est bien plus lent que lire un fichier de 1 Go, à volume identique.

Les causes habituelles : écritures en streaming fréquentes (chaque micro-batch produit un fichier par partition), trop de partitions Spark au moment de l'écriture, et partitionnement trop fin.

Les remèdes : `repartition` avant l'écriture, compaction périodique (`OPTIMIZE` en Delta, `rewrite_data_files` en Iceberg), déclencheurs plus espacés en streaming. On vise des fichiers de **128 à 512 Mo**.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

C'est le premier problème d'exploitation d'un lakehouse, et sa dangerosité vient de son caractère **progressif** : le job qui prenait trois minutes en prend quarante six mois plus tard, sans qu'une seule ligne de code ait changé. Personne ne l'a cassé — il s'est érodé.

Le coût dépasse le temps de lecture. Sur un stockage objet, chaque fichier représente au moins un appel d'API facturé (`LIST`, `GET`) : la facture grimpe indépendamment du volume. Et les **métadonnées elles-mêmes** deviennent énormes — le `_delta_log` ou les manifests Iceberg doivent être lus **avant** toute donnée. J'ai vu des tables où lire la métadonnée coûtait plus longtemps que lire les données.

Le remède structurel est en amont : **ne pas sur-partitionner**. Ma règle simple — une partition doit contenir au moins environ 1 Go. Partitionner par jour une table qui reçoit 10 Mo par jour est une erreur de conception : il faut passer au mois, ou renoncer au partitionnement au profit d'un bon clustering.

En streaming, l'arbitrage doit être explicite : un déclencheur toutes les 10 secondes offre de la fraîcheur et fabrique 8 640 fichiers par jour et par partition ; toutes les 5 minutes, 288. La compaction devient alors un **job à part entière**, avec son coût — et c'est précisément la ligne que les équipes oublient dans leur budget.

Dernier piège, celui qui surprend le plus : compacter pendant que des lecteurs travaillent est sûr grâce à l'isolation par snapshot, **mais les anciens fichiers restent référencés** tant qu'on n'a pas expiré les snapshots (`VACUUM` en Delta, `expire_snapshots` en Iceberg). Sans cette étape, on paie le stockage de toutes les versions successives, et on découvre une facture qui a triplé sans qu'aucune donnée n'ait été ajoutée.

</details>

> ⚠️ **Le piège** — Ne parler que de compaction. Sans corriger le **sur-partitionnement** en amont, on compacte indéfiniment un problème qu'on continue de fabriquer.
>
> 📘 **Pour approfondir** : [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/) · [19 · PySpark avancé](/modules/intermediate__19_pyspark_advanced/)
>
> 🇬🇧 *small files problem, compaction, OPTIMIZE, vacuum, snapshot expiration, metadata overhead*

---

## 25. Comment partitionnes-tu une table de plusieurs téraoctets ?

`fréquente` · `🌍 international` · **EN** — *How would you partition a multi-terabyte table?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

En général on partitionne par date, souvent par jour, pour que les requêtes ne lisent que la période demandée.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Le partitionnement découpe physiquement la table en dossiers ; un filtre sur la colonne de partition permet le ***partition pruning*** — on ne lit que les dossiers concernés.

On choisit la colonne d'après les filtres les plus fréquents, très souvent une date. Deux règles :

- **Éviter la haute cardinalité** : partitionner par `customer_id` (des millions de valeurs) crée des millions de dossiers minuscules — c'est exactement le *small files problem*.
- **Pour les autres colonnes**, utiliser le clustering plutôt que le partitionnement : `ZORDER` en Delta, *sort order* en Iceberg. Les données sont co-localisées sans créer de dossiers.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Mon raisonnement suit trois étapes, dans cet ordre.

**1. Quels sont les prédicats réels ?** On partitionne pour les requêtes qu'on a, pas pour celles qu'on imagine. Je regarde les logs de requêtes avant de décider — c'est le genre de vérification que peu de gens font, et qui invalide souvent l'intuition de départ.

**2. Quelle taille par partition ?** Viser au moins 1 Go, idéalement quelques Go. Une table de 3 To sur trois ans partitionnée par jour donne ~1 095 partitions de 3 Go : très bien. Une table de 50 Go sur la même période donne 45 Mo par partition : erreur, il faut passer au mois.

**3. La colonne va-t-elle rester stable ?** Changer de partitionnement impose une réécriture complète de la table — sauf avec Iceberg, dont l'évolution de partition n'oblige pas à réécrire l'historique. C'est un argument concret en faveur d'Iceberg sur une table dont on sait qu'elle grossira.

Le piège que je vois le plus souvent : **partitionner sur la date de traitement au lieu de la date métier**. Les requêtes filtrent sur la date de la transaction ; le pruning ne s'applique donc jamais, et chaque requête lit toute la table — sans aucune erreur visible, juste des coûts multipliés.

Sur le multi-colonnes, `(pays, jour)` multiplie le nombre de dossiers par le nombre de pays. Ça ne vaut le coup que si les requêtes filtrent **presque toujours** sur les deux. Dans le cas contraire, la bonne réponse est généralement : partitionner par jour et **clusteriser** par pays.

Enfin, le *hidden partitioning* d'Iceberg résout un irritant réel : en Hive ou Delta classique, si tu partitionnes sur une colonne dérivée (`year`, `month`), l'utilisateur doit filtrer explicitement sur cette colonne pour bénéficier du pruning — sinon il déclenche un *full scan* sans s'en rendre compte. Iceberg applique la transformation en interne : filtrer sur le timestamp suffit. C'est un gain de robustesse pour toute l'organisation, pas juste un confort.

</details>

> ⚠️ **Le piège** — Répondre « par jour » par réflexe, sans regarder ni le volume par partition ni les filtres réellement utilisés. Le sur-partitionnement fait plus de dégâts que l'absence de partitionnement.
>
> 📘 **Pour approfondir** : [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/) · [20 · Spark SQL](/modules/intermediate__20_spark_sql_deep_dive/)
>
> 🇬🇧 *partition pruning, cardinality, Z-order, clustering, hidden partitioning, full scan*

---

← **Thème précédent** : [📨 Streaming & Kafka](/entretien-streaming/)

📋 [**Tous les thèmes**](/entretien-questions/)

**Thème suivant** : [🔄 Orchestration & CI/CD](/entretien-orchestration/) →
