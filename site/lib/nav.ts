/**
 * Arborescence de navigation du bootcamp.
 * Reprend fidèlement la structure du sidebar Quarto (_quarto.yml).
 * Chaque item pointe vers un notebook via son chemin relatif à `notebooks/`.
 */

export type NavItem = { slug: string; title: string; file: string };
export type NavSection = { title: string; items: NavItem[] };
export type NavLevel = { id: string; label: string; accent: string; sections: NavSection[] };

/** `path` = chemin sous notebooks/ sans extension, ex "beginner/03_git_for_data_engineers" */
function item(path: string, title: string): NavItem {
  return { slug: path.replace(/\//g, "__"), title, file: path };
}

export const NAV: NavLevel[] = [
  {
    id: "beginner",
    label: "🟦 Niveau 1 : Débutant",
    accent: "#3b82f6",
    sections: [
      {
        title: "📌 Fondations",
        items: [
          item("beginner/01_intro_data_engineering", "01 · Introduction au Data Engineering"),
          item("beginner/02_bash_for_data_engineers", "02 · Linux & Bash"),
          item("beginner/03_git_for_data_engineers", "03 · Git & Versioning"),
        ],
      },
      {
        title: "🐍 Python",
        items: [
          item("beginner/04_python_basics_for_data_engineers", "04 · Python Fondamental"),
          item("beginner/05_python_data_processing_for_data_engineers", "05 · Python Data Processing"),
        ],
      },
      {
        title: "🗄️ Bases de Données",
        items: [
          item("beginner/06_intro_relational_databases", "06 · Introduction aux BDD Relationnelles"),
          item("beginner/07_sql_for_data_engineers", "07 · SQL pour Data Engineers"),
        ],
      },
      {
        title: "📊 Big Data & NoSQL",
        items: [
          item("beginner/08_intro_big_data_distributed", "08 · Introduction Big Data"),
          item("beginner/09_mongodb_for_data_engineers", "09 · MongoDB"),
          item("beginner/10_elasticsearch_for_data_engineers", "10 · Elasticsearch"),
        ],
      },
      {
        title: "⚡ Spark & Orchestration",
        items: [
          item("beginner/11_pyspark_for_data_engineering", "11 · Introduction PySpark"),
          item("beginner/12_orchestration_pipelines", "12 · Orchestration de Pipelines"),
        ],
      },
      {
        title: "🎁 Bonus",
        items: [
          item("beginner/13_fastapi_for_data_engineers", "13 · FastAPI pour Data Engineers"),
        ],
      },
      {
        title: "🎮 Projet",
        items: [
          item("beginner/projet_debutant", "Projet Débutant"),
        ],
      },
    ],
  },
  {
    id: "intermediate",
    label: "🟩 Niveau 2 : Intermédiaire",
    accent: "#22c55e",
    sections: [
      {
        title: "🐳 Containers & Cloud",
        items: [
          item("intermediate/14_docker_for_data_engineers", "14 · Docker pour Data Engineers"),
          item("intermediate/15_kubernetes_fundamentals", "15 · Kubernetes Fondamentaux"),
          item("intermediate/16_k8s_for_data_workloads", "16 · K8s pour Data Workloads"),
        ],
      },
      {
        title: "🚀 High Performance Python",
        items: [
          item("intermediate/17_polars_for_data_engineering", "17 · Polars pour Data Engineering"),
          item("intermediate/18_high_performance_python", "18 · High Performance Python"),
        ],
      },
      {
        title: "⚡ Spark Avancé",
        items: [
          item("intermediate/19_pyspark_advanced", "19 · PySpark Avancé"),
          item("intermediate/20_spark_sql_deep_dive", "20 · Spark SQL Deep Dive"),
          item("intermediate/21_spark_on_kubernetes", "21 · Spark on Kubernetes"),
        ],
      },
      {
        title: "🏠 Lakehouse & Streaming",
        items: [
          item("intermediate/22_cloud_and_object_storage", "22 · Cloud Object Storage"),
          item("intermediate/23_table_formats_delta_iceberg", "23 · Table Formats (Delta, Iceberg)"),
          item("intermediate/24_kafka_streaming", "24 · Kafka & Streaming"),
        ],
      },
      {
        title: "🔧 Industrialisation",
        items: [
          item("intermediate/25_dbt_data_quality", "25 · dbt & Data Quality"),
        ],
      },
      {
        title: "📦 Projet",
        items: [
          item("intermediate/26_projet_integrateur", "26 · Projet Intermédiaire (Olist)"),
        ],
      },
    ],
  },
  {
    id: "advanced",
    label: "🟥 Niveau 3 : Avancé",
    accent: "#ef4444",
    sections: [
      {
        title: "☸️ Infrastructure Avancée",
        items: [
          item("advanced/27_kubernetes_deep_dive", "27 · Kubernetes Deep Dive"),
          item("advanced/28_advanced_orchestration", "28 · Orchestration Avancée"),
          item("advanced/29_distributed_messaging", "29 · Messaging Distribué (Kafka, Pulsar)"),
        ],
      },
      {
        title: "⚡ Processing Avancé",
        items: [
          item("advanced/30_spark_scala_deep_dive", "30 · Spark & Scala Deep Dive"),
        ],
      },
      {
        title: "🤖 ML & Analytics",
        items: [
          item("advanced/31_data_engineering_for_ml", "31 · Data Engineering pour le ML"),
          item("advanced/33_realtime_olap_dashboards", "33 · Realtime OLAP & Dashboards"),
        ],
      },
      {
        title: "🏛️ Architecture & Governance",
        items: [
          item("advanced/32_data_mesh_contracts", "32 · Data Mesh & Contracts"),
          item("advanced/34_architecture_patterns_decisions", "34 · Patterns & Décisions d'Architecture"),
        ],
      },
      {
        title: "👔 Leadership",
        items: [
          item("advanced/35_leadership_tradeoffs", "35 · Leadership & Trade-offs"),
        ],
      },
    ],
  },
  {
    id: "ai",
    label: "🤖 Data Engineering for AI",
    accent: "#a855f7",
    sections: [
      {
        title: "🧭 Fondations",
        items: [
          item("ai/module1_introduction_data_centric_ai", "1 · Introduction — Data-Centric AI"),
        ],
      },
      {
        title: "🔧 Pipeline de données",
        items: [
          item("ai/module2_stocker", "2 · Stocker les données"),
          item("ai/module3_transformer", "3 · Transformer les données"),
          item("ai/module4_enrichir", "4 · Enrichir les données"),
          item("ai/module5_automatiser", "5 · Automatiser le pipeline"),
        ],
      },
      {
        title: "🚀 Projet",
        items: [
          item("ai/module6_projet_rag", "6 · Projet Final — RAG Knowledge Base"),
        ],
      },
    ],
  },
];

/** Tous les items à plat, dans l'ordre de lecture. */
export const ALL_ITEMS: NavItem[] = NAV.flatMap((l) => l.sections.flatMap((s) => s.items));

export function findItem(slug: string): NavItem | undefined {
  return ALL_ITEMS.find((i) => i.slug === slug);
}

export function prevNext(slug: string): { prev?: NavItem; next?: NavItem } {
  const idx = ALL_ITEMS.findIndex((i) => i.slug === slug);
  if (idx === -1) return {};
  return { prev: ALL_ITEMS[idx - 1], next: ALL_ITEMS[idx + 1] };
}

export function levelOf(slug: string): NavLevel | undefined {
  return NAV.find((l) => l.sections.some((s) => s.items.some((i) => i.slug === slug)));
}
