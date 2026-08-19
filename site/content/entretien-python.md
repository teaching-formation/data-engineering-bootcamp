# 🐍 Python & traitement de données

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

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

← **Thème précédent** : [🗄️ SQL & modélisation](/entretien-sql/)

📋 [**Tous les thèmes**](/entretien-questions/)

**Thème suivant** : [⚡ Spark & calcul distribué](/entretien-spark/) →
