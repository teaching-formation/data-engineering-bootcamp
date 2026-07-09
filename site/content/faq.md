# ❓ FAQ

> **💡 Vous ne trouvez pas votre réponse ?**
>
> Posez votre question dans les [GitHub Discussions](https://github.com/diakite-data/data-engineering-bootcamp/discussions) ou utilisez les commentaires Giscus en bas de chaque page.

---

# 📚 Questions Générales

## Qu'est-ce qu'un Data Engineer ?

Un **Data Engineer** conçoit, construit et maintient les infrastructures et pipelines de données qui permettent aux entreprises de collecter, stocker, transformer et analyser leurs données à grande échelle.

```
Data Engineer = Architecte + Développeur + DevOps pour la Data
```

**Responsabilités principales :**

- Construire des pipelines de données (batch et streaming)
- Concevoir des architectures data (Lakehouse, Data Mesh)
- Optimiser les performances et les coûts
- Garantir la qualité et la gouvernance des données

---

## Quelle est la différence entre Data Engineer, Data Scientist et Data Analyst ?

| Rôle | Focus | Outils | Salaire (FR) |
|------|-------|--------|--------------|
| **Data Engineer** | Infrastructure & Pipelines | Spark, Kafka, Airflow, K8s | 45-90K€ |
| **Data Scientist** | Modèles & Prédictions | Python, ML, TensorFlow | 45-80K€ |
| **Data Analyst** | Insights & Reporting | SQL, Power BI, Tableau | 38-60K€ |
| **Analytics Engineer** | Transformation & Modélisation | dbt, SQL, Looker | 45-75K€ |

---

## À qui s'adresse ce bootcamp ?

| Profil | Niveau recommandé | Prérequis |
|--------|-------------------|-----------|
| Étudiant / Débutant complet | 🟦 Niveau 1 | Motivation uniquement |
| Développeur Python/Java | 🟦 Niveau 1 (rapide) ou 🟩 Niveau 2 | Bases programmation |
| Analyste BI / SQL | 🟦 Niveau 1 | SQL basique |
| Data Analyst expérimenté | 🟩 Niveau 2 | Python + SQL solides |
| Data Engineer junior | 🟩 Niveau 2 ou 🟥 Niveau 3 | Spark + Docker basics |

---

## Combien de temps faut-il pour finir le bootcamp ?

| Niveau | Modules | Durée estimée | Rythme |
|--------|---------|---------------|--------|
| 🟦 Débutant | 01-13 | 8-10 semaines | 10-15h/semaine |
| 🟩 Intermédiaire | 14-26 | 10-12 semaines | 10-15h/semaine |
| 🟥 Avancé | 27-35 | 8-10 semaines | 10-15h/semaine |
| **Total** | **35 modules** | **6-8 mois** | ~500 heures |

> **⏱️ À votre rythme**
>
> Ces durées sont indicatives. Certains terminent plus vite, d'autres prennent plus de temps. L'important est la compréhension, pas la vitesse.

---

## Dois-je suivre les modules dans l'ordre ?

**Oui, fortement recommandé.** Chaque module s'appuie sur les concepts du précédent.

Exceptions possibles :

- Si vous maîtrisez déjà Python/SQL → Survolez les modules 04-07
- Si vous connaissez Docker → Survolez le module 14
- Les modules **Bonus** (13, etc.) sont optionnels

---

# 💻 Questions Techniques

## Ai-je besoin d'un ordinateur puissant ?

| Niveau | RAM | CPU | Disque |
|--------|-----|-----|--------|
| 🟦 Débutant | 8 Go | 4 cœurs | 30 Go |
| 🟩 Intermédiaire | 16 Go | 4 cœurs | 50 Go |
| 🟥 Avancé | 16 Go+ | 6+ cœurs | 100 Go |

> **⚠️ Niveau Intermédiaire et +**
>
> Docker, Kubernetes et Spark consomment beaucoup de ressources. 16 Go de RAM sont vraiment recommandés à partir du niveau 2.

---

## Puis-je suivre le bootcamp sur Windows ?

**Oui**, avec **WSL2** (Windows Subsystem for Linux).

```bash
# Installer WSL2
wsl --install

# Choisir Ubuntu
wsl --install -d Ubuntu-22.04

# Puis suivre les instructions Linux du setup
```

WSL2 est même recommandé car la plupart des outils Data sont conçus pour Linux.

---

## Quelle version de Python utiliser ?

**Python 3.11** est recommandé (stable et compatible PySpark 3.5).

| Version | Statut | Compatibilité |
|---------|--------|---------------|
| 3.9 | ✅ OK | Fonctionne |
| 3.10 | ✅ Recommandé | Optimal |
| 3.11 | ✅ Recommandé | Optimal |
| 3.12 | ⚠️ Attention | Problèmes possibles avec certaines libs |

---

## Docker Desktop ou Docker Engine ?

| Option | OS | Avantages |
|--------|-----|-----------|
| **Docker Desktop** | macOS, Windows | Interface graphique, facile |
| **Docker Engine** | Linux | Léger, natif |

Pour le bootcamp, les deux fonctionnent parfaitement.

---

## minikube, kind ou k3s ?

| Outil | RAM | Facilité | Usage |
|-------|-----|----------|-------|
| **minikube** | ~2 Go | ⭐⭐⭐⭐⭐ | Recommandé pour le bootcamp |
| **kind** | ~1 Go | ⭐⭐⭐⭐ | Alternative légère |
| **k3s** | ~512 Mo | ⭐⭐⭐ | Pour Raspberry Pi / Edge |

Le bootcamp utilise **minikube** dans les exemples.

---

# ⚡ Questions sur Spark

## PySpark ou Scala ?

| Langage | Avantages | Quand l'utiliser |
|---------|-----------|------------------|
| **PySpark** | Facile, écosystème Python riche | 90% des cas |
| **Scala** | Performance, API native Spark | Optimisation fine, contributions Spark |

Le bootcamp utilise **PySpark** aux niveaux 1-2, et introduit **Scala** au [module 30](/modules/advanced__30_spark_scala_deep_dive/).

---

## Spark local vs cluster ?

| Mode | Quand | Configuration |
|------|-------|---------------|
| **Local** | Apprentissage, dev, tests | `master("local[*]")` |
| **Standalone** | Petit cluster dédié | Spark Master/Workers |
| **Kubernetes** | Production cloud-native | Spark Operator |
| **YARN** | Hadoop existant | Cluster Hadoop |

Pour le bootcamp, le **mode local** suffit. Le [module 21](/modules/intermediate__21_spark_on_kubernetes/) couvre Spark sur Kubernetes.

---

## Delta Lake, Iceberg ou Hudi ?

| Format | Forces | Écosystème |
|--------|--------|------------|
| **Delta Lake** | Mature, optimisé Spark | Databricks, Spark |
| **Iceberg** | Multi-engine, open | Trino, Flink, Spark |
| **Hudi** | CDC, upserts rapides | Kafka, Flink |

Le bootcamp couvre **Delta Lake** en priorité ([module 23](/modules/intermediate__23_table_formats_delta_iceberg/)) avec une introduction à Iceberg.

> **💡 Conseil**
>
> En 2024-2025, Delta Lake et Iceberg sont les plus demandés. Maîtrisez-en un, comprenez l'autre.

---

# 🔄 Questions sur les Pipelines

## Airflow, Dagster ou Prefect ?

| Outil | Adoption | Forces | Faiblesses |
|-------|----------|--------|------------|
| **Airflow** | 🥇 90%+ | Standard industrie | Complexe, legacy |
| **Dagster** | 🥈 Croissant | Moderne, testable | Moins adopté |
| **Prefect** | 🥉 Niche | Simple, cloud-native | Moins de features |

Le bootcamp enseigne **Airflow** ([module 28](/modules/advanced__28_advanced_orchestration/)) car c'est le standard de l'industrie.

---

## Batch ou Streaming ?

| Type | Latence | Complexité | Cas d'usage |
|------|---------|------------|-------------|
| **Batch** | Minutes → Heures | ⭐⭐ | Reporting, analytics, ML training |
| **Micro-batch** | Secondes → Minutes | ⭐⭐⭐ | Near real-time dashboards |
| **Streaming** | Millisecondes | ⭐⭐⭐⭐⭐ | Alerting, fraud detection |

> **📌 Règle d'or**
>
> Commencez **toujours** par du batch. Passez au streaming uniquement si le business le justifie (et le budget aussi).

---

## C'est quoi le Lakehouse ?

Le **Lakehouse** combine le meilleur des deux mondes :

| Data Lake | Data Warehouse | Lakehouse |
|-----------|----------------|-----------|
| ✅ Stockage pas cher | ✅ Performance SQL | ✅ Les deux |
| ✅ Données brutes | ✅ ACID transactions | ✅ Les deux |
| ❌ Pas de ACID | ❌ Coûteux | ✅ Résolu |
| ❌ Query lent | ❌ Données structurées only | ✅ Résolu |

**Architecture Medallion** : Bronze (raw) → Silver (cleaned) → Gold (business-ready)

Voir [module 23](/modules/intermediate__23_table_formats_delta_iceberg/) pour la mise en pratique.

---

## C'est quoi le Data Mesh ?

Le **Data Mesh** est une approche organisationnelle où chaque domaine métier est responsable de ses propres données.

| Concept | Description |
|---------|-------------|
| **Domain Ownership** | Chaque équipe gère ses data products |
| **Data as a Product** | Les données sont traitées comme un produit |
| **Self-serve Platform** | Plateforme mutualisée pour tous |
| **Federated Governance** | Gouvernance distribuée mais cohérente |

Voir [module 32](/modules/advanced__32_data_mesh_contracts/) pour approfondir.

---

# 🎯 Questions sur la Carrière

## Quel salaire peut-on espérer ?

| Niveau | France | Suisse | USA | Remote (€) |
|--------|--------|--------|-----|------------|
| Junior (0-2 ans) | 40-50K€ | 80-100K CHF | $90-120K | 45-65K€ |
| Confirmé (2-5 ans) | 50-70K€ | 100-130K CHF | $120-160K | 65-100K€ |
| Senior (5+ ans) | 65-90K€ | 130-170K CHF | $160-220K | 90-140K€ |
| Staff/Principal | 85K+€ | 170K+ CHF | $220K+ | 130K+€ |

*Données 2024-2025, variables selon entreprise et localisation.*

---

## Quelles certifications sont utiles ?

| Certification | Valeur marché | Coût | Difficulté |
|---------------|---------------|------|------------|
| **Databricks Data Engineer** | ⭐⭐⭐⭐⭐ | ~$200 | Moyenne |
| **AWS Data Analytics Specialty** | ⭐⭐⭐⭐ | ~$300 | Difficile |
| **GCP Professional Data Engineer** | ⭐⭐⭐⭐ | ~$200 | Difficile |
| **dbt Analytics Engineering** | ⭐⭐⭐ | Gratuit | Facile |
| **Confluent Kafka** | ⭐⭐⭐ | ~$200 | Moyenne |

> **💡 Conseil**
>
> Les certifications sont un **plus**, pas un **must**. Un bon portfolio GitHub + expérience pratique > certifications.

---

## Comment préparer les entretiens ?

### 1. Technique (60%)

| Domaine | À maîtriser |
|---------|-------------|
| **SQL** | Window functions, CTEs, optimisation |
| **Python** | Pandas, PySpark, clean code |
| **Spark** | Partitioning, caching, broadcast, plans d'exécution |
| **Architecture** | Lakehouse, streaming, batch patterns |

### 2. System Design (30%)

Savoir concevoir un pipeline end-to-end :

- Sources → Ingestion → Transformation → Serving
- Choix technologiques justifiés
- Trade-offs (coût, latence, complexité)

### 3. Soft Skills (10%)

- Communication claire
- Collaboration avec Data Scientists, Analysts
- Gestion de projet technique

> **📦 Portfolio**
>
> Les **projets intégrateurs** du bootcamp sont conçus pour être présentés en entretien. Mettez-les sur GitHub !

---

# 🆘 Problèmes Courants

## Spark : "Java gateway process exited"

```bash
# Vérifier que Java est installé
java -version

# Si non installé :
# macOS
brew install openjdk@11
export JAVA_HOME=$(/usr/libexec/java_home -v 11)

# Ubuntu
sudo apt install openjdk-11-jdk
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

# Ajouter à ~/.bashrc ou ~/.zshrc pour persister
```

---

## Docker : "permission denied"

```bash
# Ajouter votre user au groupe docker
sudo usermod -aG docker $USER

# Appliquer immédiatement
newgrp docker

# Ou logout/login
```

---

## Kafka : "broker not available"

```bash
# 1. Vérifier les logs
docker compose logs zookeeper
docker compose logs kafka

# 2. Redémarrer proprement
docker compose down -v
docker compose up -d

# 3. Attendre 30 secondes que Kafka soit prêt
```

---

## Jupyter : "Kernel not found"

```bash
# Réinstaller le kernel
source ~/bootcamp-env/bin/activate
python -m ipykernel install --user --name=bootcamp --display-name="Python (Bootcamp)"

# Redémarrer Jupyter
```

---

## minikube : "not enough memory"

```bash
# Supprimer et recréer avec plus de ressources
minikube delete
minikube start --memory=4096 --cpus=2 --driver=docker
```

---

## PySpark : "Py4JJavaError"

```bash
# Vérifier la compatibilité des versions
python -c "import pyspark; print(pyspark.__version__)"
java -version

# PySpark 3.5 → Java 11 ou 17
# PySpark 3.4 → Java 11
```

---

# 📞 Obtenir de l'aide

| Canal | Usage | Lien |
|-------|-------|------|
| **GitHub Issues** | Bugs, erreurs dans les notebooks | [Issues](https://github.com/diakite-data/data-engineering-bootcamp/issues) |
| **GitHub Discussions** | Questions générales, aide | [Discussions](https://github.com/diakite-data/data-engineering-bootcamp/discussions) |
| **Commentaires Giscus** | Questions sur un module spécifique | En bas de chaque page |

### Avant de poser une question :

1. ✅ Vérifier cette FAQ
2. ✅ Chercher dans les Issues/Discussions existantes
3. ✅ Googler l'erreur exacte
4. ✅ Consulter la documentation officielle de l'outil

### Quand vous posez une question :

- Décrivez le **contexte** (module, étape)
- Copiez le **message d'erreur complet**
- Mentionnez votre **OS** et **versions** des outils
- Montrez ce que vous avez **déjà essayé**

---

<div style="text-align: center; margin: 30px 0;">
  <a href="/" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);">
    🏠 Retour à l'accueil
  </a>
</div>
