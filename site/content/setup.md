# 🔧 Setup Environnement

> **📌 Installation Progressive**
>
> Installez uniquement les outils du niveau que vous commencez. Vous ajouterez les autres au fur et à mesure de votre progression.

---

## 📋 Prérequis Système

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| **OS** | macOS 12+, Ubuntu 20.04+, Windows 10+ (WSL2) | macOS 13+, Ubuntu 22.04+ |
| **RAM** | 8 Go | 16 Go |
| **CPU** | 4 cœurs | 8 cœurs |
| **Disque** | 50 Go libres | 100 Go SSD |

> ⚠️ **Windows Users**
>
> Utilisez **WSL2** (Windows Subsystem for Linux) pour une meilleure compatibilité. [Guide d'installation WSL2](https://docs.microsoft.com/fr-fr/windows/wsl/install)

---

# 🟦 Niveau 1 : Débutant

> **Outils requis** : Git, Python, Jupyter, VS Code, PostgreSQL, MongoDB

---

## 1.1 Git

## macOS

```bash
brew install git
```

## Ubuntu/Debian

```bash
sudo apt update
sudo apt install git
```

## Windows (WSL2)

```bash
sudo apt update
sudo apt install git
```

### Configuration initiale

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
git config --global init.defaultBranch main

# Vérifier
git --version  # ✓ 2.30+
```

---

## 1.2 Python

## macOS

```bash
brew install python@3.11
```

## Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

## Windows (WSL2)

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

### Environnement virtuel

```bash
# Créer le venv
python3 -m venv ~/bootcamp-env

# Activer (Linux/macOS)
source ~/bootcamp-env/bin/activate

# Activer (Windows PowerShell)
.\bootcamp-env\Scripts\Activate.ps1

# Mettre à jour pip
pip install --upgrade pip

# Packages Niveau Débutant
pip install pandas numpy matplotlib seaborn requests
```

```bash
# Vérifier
python3 --version  # ✓ 3.10+
```

---

## 1.3 Jupyter Notebook

```bash
# Activer votre venv
source ~/bootcamp-env/bin/activate

# Installer Jupyter
pip install jupyter jupyterlab notebook ipykernel

# Enregistrer le kernel
python -m ipykernel install --user --name=bootcamp --display-name="Python (Bootcamp)"
```

### Lancer Jupyter

```bash
# JupyterLab (recommandé)
jupyter lab

# Ou Notebook classique
jupyter notebook
```

> **💡 Astuce**
>
> JupyterLab s'ouvre sur `http://localhost:8888`. Utilisez `--port=8889` si le port est occupé.

---

## 1.4 VS Code

### Installation

## macOS

```bash
brew install --cask visual-studio-code
```

## Ubuntu

```bash
sudo snap install code --classic
```

## Windows

Télécharger depuis [code.visualstudio.com](https://code.visualstudio.com/)

### Extensions Niveau Débutant

| Extension | ID | Description |
|-----------|-----|-------------|
| **Python** | `ms-python.python` | Support Python |
| **Jupyter** | `ms-toolsai.jupyter` | Notebooks dans VS Code |
| **Pylance** | `ms-python.vscode-pylance` | IntelliSense |
| **GitLens** | `eamodio.gitlens` | Git avancé |
| **SQL Tools** | `mtxr.sqltools` | Client SQL |

```bash
# Installation en ligne de commande
code --install-extension ms-python.python
code --install-extension ms-toolsai.jupyter
code --install-extension ms-python.vscode-pylance
code --install-extension eamodio.gitlens
code --install-extension mtxr.sqltools
```

### Configuration VS Code

Ajoutez dans Settings JSON (`Ctrl+,` → Open Settings JSON) :

```json
{
  "python.defaultInterpreterPath": "~/bootcamp-env/bin/python",
  "editor.formatOnSave": true,
  "editor.fontSize": 14,
  "files.autoSave": "afterDelay"
}
```

---

## 1.5 PostgreSQL

```bash
# Option 1 : Installation locale
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

```bash
# Option 2 : Avec Docker (si vous l'avez déjà)
docker run -d \
  --name postgres \
  -e POSTGRES_USER=bootcamp \
  -e POSTGRES_PASSWORD=bootcamp \
  -e POSTGRES_DB=bootcamp \
  -p 5432:5432 \
  postgres:15
```

---

## 1.6 MongoDB

```bash
# Option 1 : MongoDB Atlas (recommandé - gratuit, cloud)
# Créer un compte sur https://www.mongodb.com/atlas
# Créer un cluster gratuit M0
```

```bash
# Option 2 : Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  mongo:7
```

```bash
# Client Python
pip install pymongo
```

---

## ✅ Checklist Niveau Débutant

```bash
echo "=== 🟦 Vérification Niveau Débutant ==="
git --version
python3 --version
jupyter --version | head -1
code --version | head -1
echo "=== ✅ Done ==="
```

---

# 🟩 Niveau 2 : Intermédiaire

> **Nouveaux outils** : Docker, Kubernetes, Spark, Kafka, MinIO, dbt, Polars

> 📌 **Prérequis**
>
> Avoir installé tous les outils du Niveau Débutant.

---

## 2.1 Docker

## macOS

```bash
brew install --cask docker

# Lancer Docker Desktop depuis Applications
```

## Ubuntu

```bash
# Installer Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Permissions (éviter sudo)
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose
sudo apt install docker-compose-plugin
```

## Windows

Installer [Docker Desktop](https://www.docker.com/products/docker-desktop) avec WSL2 backend.

### Vérification

```bash
docker --version          # ✓ 24+
docker compose version    # ✓ 2.20+
docker run hello-world
```

---

## 2.2 Kubernetes (kubectl + minikube)

### kubectl

## macOS

```bash
brew install kubectl
```

## Ubuntu

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl
```

### minikube

## macOS

```bash
brew install minikube
minikube start --memory=4096 --cpus=2 --driver=docker
```

## Ubuntu

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

minikube start --memory=4096 --cpus=2 --driver=docker
```

### Vérification

```bash
kubectl version --client  # ✓ 1.28+
minikube status
kubectl get nodes
```

---

## 2.3 Java (requis pour Spark)

## macOS

```bash
brew install openjdk@11

# Ajouter à ~/.zshrc
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
export PATH="$JAVA_HOME/bin:$PATH"

source ~/.zshrc
```

## Ubuntu

```bash
sudo apt install openjdk-11-jdk

# Ajouter à ~/.bashrc
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"

source ~/.bashrc
```

```bash
java -version  # ✓ 11+
```

---

## 2.4 Apache Spark

```bash
# Activer votre venv
source ~/bootcamp-env/bin/activate

# Installer PySpark
pip install pyspark==3.5.0

# Vérifier
pyspark --version  # ✓ 3.5+
```

### Test rapide

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("test").getOrCreate()
df = spark.createDataFrame([(1, "ok")], ["id", "status"])
df.show()
spark.stop()
```

---

## 2.5 Apache Kafka

Créez `docker-compose-kafka.yml` :

```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui
    depends_on:
      - kafka
    ports:
      - "8090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
```

```bash
docker compose -f docker-compose-kafka.yml up -d

# UI disponible sur http://localhost:8090
```

```bash
# Client Python
pip install kafka-python confluent-kafka
```

---

## 2.6 MinIO (S3 local)

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -v minio_data:/data \
  minio/minio server /data --console-address ":9001"

# Console sur http://localhost:9001
```

---

## 2.7 Polars & Delta Lake

```bash
source ~/bootcamp-env/bin/activate

pip install polars pyarrow delta-spark deltalake
```

---

## 2.8 dbt

```bash
pip install dbt-core dbt-postgres dbt-duckdb

dbt --version  # ✓ 1.7+
```

---

## 2.9 Extensions VS Code Niveau Intermédiaire

```bash
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools
code --install-extension redhat.vscode-yaml
```

---

## ✅ Checklist Niveau Intermédiaire

```bash
echo "=== 🟩 Vérification Niveau Intermédiaire ==="
docker --version
docker compose version
kubectl version --client | head -1
java -version 2>&1 | head -1
python3 -c "import pyspark; print('PySpark:', pyspark.__version__)"
python3 -c "import polars; print('Polars:', polars.__version__)"
dbt --version | head -1
echo "=== ✅ Done ==="
```

---

# 🟥 Niveau 3 : Avancé

> **Nouveaux outils** : Helm, k9s, Airflow, Scala, outils monitoring

> 📌 **Prérequis**
>
> Avoir installé tous les outils des Niveaux Débutant et Intermédiaire.

---

## 3.1 Helm

## macOS

```bash
brew install helm
```

## Ubuntu

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

```bash
helm version  # ✓ 3.13+
```

---

## 3.2 k9s (Terminal UI pour Kubernetes)

## macOS

```bash
brew install k9s
```

## Ubuntu

```bash
curl -sS https://webinstall.dev/k9s | bash
```

```bash
# Lancer k9s
k9s
```

---

## 3.3 Apache Airflow

```bash
# Avec pip (développement local)
pip install apache-airflow==2.8.0

# Initialiser la DB
airflow db init

# Créer un user admin
airflow users create \
  --username admin \
  --password admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com

# Lancer
airflow webserver --port 8080 &
airflow scheduler &

# UI sur http://localhost:8080
```

### Avec Docker (recommandé pour production-like)

```bash
# Télécharger le docker-compose officiel
curl -LfO 'https://airflow.apache.org/docs/apache-airflow/2.8.0/docker-compose.yaml'

# Initialiser
mkdir -p ./dags ./logs ./plugins ./config
echo -e "AIRFLOW_UID=$(id -u)" > .env

docker compose up airflow-init
docker compose up -d
```

---

## 3.4 Scala (pour Spark Scala)

## macOS

```bash
brew install scala@2.12 sbt
```

## Ubuntu

```bash
# Scala
sudo apt install scala

# sbt (build tool)
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x99E82A75642AC823" | sudo apt-key add
sudo apt update
sudo apt install sbt
```

```bash
scala -version  # ✓ 2.12.x (compatible Spark 3.5)
```

---

## 3.5 Outils Monitoring

### Prometheus & Grafana (via Docker)

```yaml
# docker-compose-monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

```bash
docker compose -f docker-compose-monitoring.yml up -d

# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

---

## 3.6 ClickHouse (OLAP)

```bash
docker run -d \
  --name clickhouse \
  -p 8123:8123 \
  -p 9000:9000 \
  clickhouse/clickhouse-server
```

```bash
# Client Python
pip install clickhouse-connect
```

---

## 3.7 MLflow

```bash
pip install mlflow

# Lancer le serveur
mlflow server --host 0.0.0.0 --port 5000

# UI sur http://localhost:5000
```

---

## 3.8 Extensions VS Code Niveau Avancé

```bash
code --install-extension scala-lang.scala
code --install-extension scalameta.metals
code --install-extension ms-vscode-remote.remote-ssh
code --install-extension rangav.vscode-thunder-client
```

---

## ✅ Checklist Niveau Avancé

```bash
echo "=== 🟥 Vérification Niveau Avancé ==="
helm version | head -1
k9s version 2>/dev/null | head -1 || echo "k9s: lancer 'k9s' pour vérifier"
airflow version 2>/dev/null || echo "Airflow: vérifier avec 'airflow version'"
scala -version 2>&1 | head -1
echo "=== ✅ Done ==="
```

---

# 📁 Structure de Projet Recommandée

```
~/data-engineering-bootcamp/
├── .venv/                  # Environnement virtuel
├── data/
│   ├── raw/               # Données brutes
│   ├── processed/         # Données transformées
│   └── output/            # Résultats
├── notebooks/              # Jupyter notebooks
├── spark_jobs/             # Scripts PySpark/Scala
├── dbt_project/            # Projet dbt
├── docker/                 # Docker Compose files
├── k8s/                    # Manifests Kubernetes
├── airflow/
│   └── dags/              # DAGs Airflow
├── tests/                  # Tests unitaires
├── .gitignore
└── README.md
```

```bash
# Créer la structure
mkdir -p ~/data-engineering-bootcamp/{data/{raw,processed,output},notebooks,spark_jobs,dbt_project,docker,k8s,airflow/dags,tests}

cd ~/data-engineering-bootcamp
git init

# .gitignore
cat << 'EOF' > .gitignore
.venv/
__pycache__/
.ipynb_checkpoints/
*.pyc
.DS_Store
*.log
EOF
```

---

# 🆘 Problèmes Courants

### Docker : permission denied

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Spark : Java not found

```bash
echo $JAVA_HOME  # Doit afficher un chemin
# Sinon, configurer JAVA_HOME (voir section 2.3)
```

### Jupyter : kernel not found

```bash
python -m ipykernel install --user --name=bootcamp --display-name="Python (Bootcamp)"
```

### minikube : not enough memory

```bash
minikube delete
minikube start --memory=4096 --cpus=2 --driver=docker
```

### VS Code : Python interpreter not found

`Ctrl+Shift+P` → "Python: Select Interpreter" → Choisir `~/bootcamp-env/bin/python`

---

# 🚀 Prêt à démarrer !

<div style="text-align: center; margin: 30px 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
  <a href="../notebooks/beginner/01_intro_data_engineering.ipynb" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
    🟦 Commencer Niveau 1
  </a>
  <a href="../notebooks/intermediate/14_docker_for_data_engineers.ipynb" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">
    🟩 Commencer Niveau 2
  </a>
  <a href="../notebooks/advanced/27_kubernetes_deep_dive.ipynb" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
    🟥 Commencer Niveau 3
  </a>
</div>

---

[🏠 Retour à l'accueil](/){.btn .btn-secondary}
