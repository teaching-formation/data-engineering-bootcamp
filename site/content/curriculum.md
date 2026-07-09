# 📊 Curriculum Complet

> **🎯 Objectif du Programme**
>
> Ce bootcamp vous emmène de **zéro à Senior Data Engineer** à travers 35 modules progressifs, 2 projets intégrateurs et des centaines d'exercices pratiques.

---

## 🗺️ Vue d'Ensemble du Parcours

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   🟦 DÉBUTANT ──────► 🟩 INTERMÉDIAIRE ──────► 🟥 AVANCÉ ──────► 🏆        │
│                                                                             │
│   Modules 01-13        Modules 14-26            Modules 27-35     SENIOR   │
│   + Projet 🎮          + Projet 📦              Spécialisation    READY    │
│                                                                             │
│   🤖 DATA ENGINEERING FOR AI  ──►  Modules 1-6  ·  transverse (RAG)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🟦 Niveau 1 : Débutant — Fondations & Premiers Pipelines

> 💡 **Prérequis**
>
> Aucun prérequis technique. Une curiosité pour les données et une motivation à apprendre suffisent !

**🎯 Objectif** : Construire des bases solides en Python, SQL, et découvrir l'écosystème Big Data.

### 📚 Modules

| # | Module | Thèmes Clés |
|:--|:-------|:------------|
| 01 | [Introduction au Data Engineering](/modules/beginner__01_intro_data_engineering/) | Rôle du DE, écosystème, architectures Lambda/Kappa/Lakehouse |
| 02 | [Linux & Bash](/modules/beginner__02_bash_for_data_engineers/) | Commandes essentielles, scripting, cron, permissions |
| 03 | [Git & Versioning](/modules/beginner__03_git_for_data_engineers/) | Branches, merge, rebase, workflows collaboratifs |
| 04 | [Python Fondamental](/modules/beginner__04_python_basics_for_data_engineers/) | Syntaxe, structures de données, fichiers, exceptions |
| 05 | [Python Data Processing](/modules/beginner__05_python_data_processing_for_data_engineers/) | POO, décorateurs, générateurs, context managers |
| 06 | [Introduction BDD Relationnelles](/modules/beginner__06_intro_relational_databases/) | Concepts SGBD, modélisation, normalisation |
| 07 | [SQL pour Data Engineers](/modules/beginner__07_sql_for_data_engineers/) | Requêtes, jointures, window functions, optimisation |
| 08 | [Introduction Big Data](/modules/beginner__08_intro_big_data_distributed/) | Hadoop, HDFS, MapReduce, systèmes distribués |
| 09 | [MongoDB](/modules/beginner__09_mongodb_for_data_engineers/) | NoSQL, CRUD, agrégations, indexation |
| 10 | [Elasticsearch](/modules/beginner__10_elasticsearch_for_data_engineers/) | Recherche full-text, indexation, requêtes DSL |
| 11 | [Introduction PySpark](/modules/beginner__11_pyspark_for_data_engineering/) | RDD, DataFrame, transformations, actions |
| 12 | [Orchestration de Pipelines](/modules/beginner__12_orchestration_pipelines/) | Concepts, scheduling, dépendances |
| 13 | [**Bonus** : FastAPI](/modules/beginner__13_fastapi_for_data_engineers/) | API REST pour exposer vos données |

### 🎮 Projet Intégrateur Débutant — Video Games Analytics

> **Pipeline complet** : Kaggle CSV → Web Scraping → DuckDB + Elasticsearch → PySpark → FastAPI → Streamlit Dashboard
>
> [🚀 Accéder au projet](/modules/beginner__projet_debutant/)

**Ce que vous allez construire :**

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  📥 SOURCES  │      │ ⚙️ PROCESSING │      │ 💾 STOCKAGE  │      │📊 DASHBOARD  │
├──────────────┤      ├──────────────┤      ├──────────────┤      ├──────────────┤
│ Kaggle CSV   │─────▶│   Pandas     │─────▶│   DuckDB     │─────▶│   FastAPI    │
│ Web Scraping │      │   PySpark    │      │Elasticsearch │      │  Streamlit   │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
```

**✅ À la fin de ce niveau, vous savez :**

- Écrire des scripts Python professionnels
- Manipuler des données avec SQL et PySpark
- Comprendre les architectures Big Data
- Versionner votre code avec Git
- **Construire un pipeline data de bout en bout**

---

## 🟩 Niveau 2 : Intermédiaire — Industrialisation & Lakehouse

> 💡 **Prérequis**
>
> Avoir complété le Niveau 1 ou équivalent (Python, SQL, bases Spark).

**🎯 Objectif** : Maîtriser les technologies d'entreprise : Docker, Kubernetes, Lakehouse, Streaming, Orchestration.

### 📚 Modules

| # | Module | Thèmes Clés |
|:--|:-------|:------------|
| 14 | [Docker pour Data Engineers](/modules/intermediate__14_docker_for_data_engineers/) | Images, containers, volumes, Dockerfile, Compose |
| 15 | [Kubernetes Fondamentaux](/modules/intermediate__15_kubernetes_fundamentals/) | Pods, Deployments, Services, ConfigMaps, Secrets |
| 16 | [K8s pour Data Workloads](/modules/intermediate__16_k8s_for_data_workloads/) | StatefulSets, Jobs, CronJobs, volumes persistants |
| 17 | [Polars pour Data Engineering](/modules/intermediate__17_polars_for_data_engineering/) | API Polars, lazy evaluation, comparaison Pandas/Spark |
| 18 | [High Performance Python](/modules/intermediate__18_high_performance_python/) | Profiling, optimisation, multiprocessing, async |
| 19 | [PySpark Avancé](/modules/intermediate__19_pyspark_advanced/) | Partitioning, caching, broadcast, UDF, optimisation |
| 20 | [Spark SQL Deep Dive](/modules/intermediate__20_spark_sql_deep_dive/) | Catalyst, plans d'exécution, tuning, AQE |
| 21 | [Spark on Kubernetes](/modules/intermediate__21_spark_on_kubernetes/) | Spark Operator, SparkApplication, scaling, monitoring |
| 22 | [Cloud Object Storage](/modules/intermediate__22_cloud_and_object_storage/) | S3, GCS, Azure Blob, MinIO, IAM, performances |
| 23 | [Table Formats (Delta, Iceberg)](/modules/intermediate__23_table_formats_delta_iceberg/) | ACID, Time Travel, Schema Evolution, MERGE INTO |
| 24 | [Kafka & Streaming](/modules/intermediate__24_kafka_streaming/) | Producers, Consumers, Topics, Partitions, Consumer Groups |
| 25 | [dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/) | Models, Tests, Documentation, Great Expectations |

### 📦 Projet Intégrateur Intermédiaire — E-commerce Olist

> **Pipeline Lakehouse** : Kafka → Spark Streaming → Delta Lake → dbt → Dashboard
>
> [🚀 Accéder au projet](/modules/intermediate__26_projet_integrateur/)

**✅ À la fin de ce niveau, vous savez :**

- Containeriser et déployer des applications avec Docker/Kubernetes
- Construire un Lakehouse avec Delta Lake ou Iceberg
- Implémenter des pipelines streaming avec Kafka
- Orchestrer des workflows complexes
- Garantir la qualité des données avec dbt

---

## 🟥 Niveau 3 : Avancé — Architecture, Optimisation & Leadership

> 💡 **Prérequis**
>
> Avoir complété le Niveau 2 ou expérience équivalente en entreprise.

**🎯 Objectif** : Atteindre le niveau **Senior Data Engineer / Architecte Data** avec une maîtrise des systèmes distribués, de l'architecture et du leadership technique.

### 📚 Modules

| # | Module | Thèmes Clés |
|:--|:-------|:------------|
| 27 | [Kubernetes Deep Dive](/modules/advanced__27_kubernetes_deep_dive/) | Operators, CRDs, Helm avancé, GitOps, troubleshooting |
| 28 | [Orchestration Avancée](/modules/advanced__28_advanced_orchestration/) | Airflow 2.x, DAGs dynamiques, KubernetesPodOperator, Dagster |
| 29 | [Messaging Distribué](/modules/advanced__29_distributed_messaging/) | Kafka internals, Pulsar, RabbitMQ, patterns de messaging |
| 30 | [Spark & Scala Deep Dive](/modules/advanced__30_spark_scala_deep_dive/) | Internals Spark, Catalyst, Tungsten, optimisation bas niveau |
| 31 | [Data Engineering pour le ML](/modules/advanced__31_data_engineering_for_ml/) | Feature Stores, pipelines ML, MLflow, model serving |
| 32 | [Data Mesh & Contracts](/modules/advanced__32_data_mesh_contracts/) | Data Products, Domain Ownership, Data Contracts, APIs |
| 33 | [Realtime OLAP & Dashboards](/modules/advanced__33_realtime_olap_dashboards/) | ClickHouse, Apache Druid, Pinot, dashboards temps réel |
| 34 | [Patterns & Décisions d'Architecture](/modules/advanced__34_architecture_patterns_decisions/) | ADR, RFC, trade-offs, design reviews, documentation |
| 35 | [Leadership & Trade-offs](/modules/advanced__35_leadership_tradeoffs/) | Communication technique, mentoring, gestion de projet |

**✅ À la fin de ce niveau, vous savez :**

- Concevoir et défendre une architecture Data complète
- Optimiser les performances à grande échelle
- Implémenter la gouvernance et la sécurité des données
- Mener des design reviews et rédiger des ADR/RFC
- Guider et mentorer une équipe technique

---

## 🤖 Data Engineering for AI — Préparer les données pour l'IA

> 💡 **Parcours transverse**
>
> Complémentaire aux trois niveaux : comment construire des pipelines de données pour les applications d'IA modernes (LLM, RAG, fine-tuning).

**🎯 Objectif** : Maîtriser la préparation, le stockage et l'enrichissement des données pour l'IA — jusqu'à un projet **RAG** (Retrieval-Augmented Generation) complet.

### 📚 Modules

| # | Module | Thèmes Clés |
|:--|:-------|:------------|
| 1 | [Introduction — Data-Centric AI](/modules/ai__module1_introduction_data_centric_ai/) | Approche data-centric, qualité des données, cycle de vie IA |
| 2 | [Stocker les données](/modules/ai__module2_stocker/) | Formats, object storage, bases vectorielles, embeddings |
| 3 | [Transformer les données](/modules/ai__module3_transformer/) | Nettoyage, chunking, normalisation pour l'IA |
| 4 | [Enrichir les données](/modules/ai__module4_enrichir/) | Embeddings, métadonnées, augmentation, labelling |
| 5 | [Automatiser le pipeline](/modules/ai__module5_automatiser/) | Orchestration, ingestion continue, monitoring |
| 6 | [Projet Final — RAG Knowledge Base](/modules/ai__module6_projet_rag/) | Pipeline RAG complet : ingest → chunk → embed → index → search → generate |

**✅ À la fin de ce parcours, vous savez :**

- Préparer des données de qualité pour des applications d'IA
- Construire un pipeline d'embeddings et une base vectorielle (ChromaDB)
- Concevoir et déployer un système **RAG** de bout en bout

---

## 🏆 Matrice des Compétences

| Compétence | 🟦 Débutant | 🟩 Intermédiaire | 🟥 Avancé |
|:-----------|:-----------:|:----------------:|:---------:|
| Python & SQL | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| PySpark | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Spark Scala | - | - | ⭐⭐⭐ |
| Docker & Kubernetes | - | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Lakehouse (Delta/Iceberg) | - | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Streaming (Kafka) | - | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Orchestration (Airflow) | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| dbt & Data Quality | - | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| OLAP & Realtime | - | - | ⭐⭐⭐⭐ |
| MLOps & Feature Stores | - | - | ⭐⭐⭐ |
| Data Mesh & Governance | - | ⭐ | ⭐⭐⭐⭐⭐ |
| Architecture & Design | - | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Leadership technique | - | - | ⭐⭐⭐⭐⭐ |

---

## 📈 Conseils pour Réussir

> **⚠️ Important**
>
> Les modules sont conçus pour être suivis **dans l'ordre**. Chaque module s'appuie sur les concepts du précédent.

1. **Pratiquez quotidiennement** — La régularité bat l'intensité
2. **Faites tous les exercices** — Pas de raccourcis
3. **Complétez les projets intégrateurs** — Ils valident vos compétences
4. **Expérimentez** — Modifiez le code, cassez des choses, apprenez des erreurs
5. **Documentez** — Prenez des notes, créez votre propre référence
6. **Construisez votre portfolio** — Les projets sont présentables en entretien

---

## 🚀 Commencer Maintenant

<div style="text-align: center; margin: 30px 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
  <a href="/modules/beginner__01_intro_data_engineering/" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
    🟦 Commencer Niveau 1
  </a>
  <a href="/modules/intermediate__14_docker_for_data_engineers/" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">
    🟩 Commencer Niveau 2
  </a>
  <a href="/modules/advanced__27_kubernetes_deep_dive/" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
    🟥 Commencer Niveau 3
  </a>
</div>

---

[🏠 Retour à l'accueil](/){.btn .btn-secondary}
