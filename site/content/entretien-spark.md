# ⚡ Spark & calcul distribué

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

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

← **Thème précédent** : [🐍 Python & traitement de données](/entretien-python/)

📋 [**Tous les thèmes**](/entretien-questions/)

**Thème suivant** : [📨 Streaming & Kafka](/entretien-streaming/) →
