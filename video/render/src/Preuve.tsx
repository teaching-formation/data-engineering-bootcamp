import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Terminal } from "./scenes/Terminal";
import { T } from "./theme";

/**
 * Démonstration 16:9 du terminal animé — format des vidéos longues.
 * Les sorties sont celles réellement obtenues en exécutant dbt sur le
 * mini-projet du module 25.
 */

const SEQ = [
  {
    duree: 150,
    v: {
      titre: "1. On charge les données",
      chemin: "~/dbt_duckdb_demo",
      lignes: [
        { type: "commande", texte: "dbt seed --profiles-dir ." },
        { type: "vide" },
        { type: "sortie", texte: "1 of 3 OK loaded seed file main_raw.raw_customers ...... [INSERT 200]", couleur: "vert" },
        { type: "sortie", texte: "2 of 3 OK loaded seed file main_raw.raw_orders ......... [INSERT 1000]", couleur: "vert" },
        { type: "sortie", texte: "3 of 3 OK loaded seed file main_raw.raw_order_items .... [INSERT 2525]", couleur: "vert" },
        { type: "vide" },
        { type: "sortie", texte: "Done. PASS=3  WARN=0  ERROR=0  TOTAL=3", couleur: "vert" },
      ],
      legende: "3 725 lignes chargées",
      accent: "#22c55e",
    },
  },
  {
    duree: 165,
    v: {
      titre: "2. On construit les modèles",
      chemin: "~/dbt_duckdb_demo",
      lignes: [
        { type: "commande", texte: "dbt run --profiles-dir ." },
        { type: "vide" },
        { type: "sortie", texte: "1 of 6 OK created sql view model  main.stg_customers ....... [OK]", couleur: "vert" },
        { type: "sortie", texte: "2 of 6 OK created sql view model  main.stg_orders .......... [OK]", couleur: "vert" },
        { type: "sortie", texte: "3 of 6 OK created sql view model  main.stg_order_items ..... [OK]", couleur: "vert" },
        { type: "sortie", texte: "4 of 6 OK created sql table model main.fct_orders .......... [OK]", couleur: "vert" },
        { type: "sortie", texte: "5 of 6 OK created sql table model main.customer_segments ... [OK]", couleur: "vert" },
        { type: "sortie", texte: "6 of 6 OK created incremental    main.daily_sales ......... [OK]", couleur: "vert" },
        { type: "vide" },
        { type: "sortie", texte: "Done. PASS=6  WARN=0  ERROR=0  TOTAL=6", couleur: "vert" },
      ],
      legende: "staging → marts, dans l'ordre du DAG",
      accent: "#0ea5e9",
    },
  },
  {
    duree: 185,
    v: {
      titre: "3. On casse volontairement la donnée",
      chemin: "~/dbt_duckdb_demo",
      lignes: [
        { type: "sortie", texte: "# status 'delivered' remplacé par 'livré' dans raw_orders.csv", couleur: "gris" },
        { type: "commande", texte: "dbt test --profiles-dir ." },
        { type: "vide" },
        { type: "sortie", texte: "2 of 21 FAIL 1 accepted_values_stg_orders_status ....... [FAIL 1]", couleur: "rouge" },
        { type: "vide" },
        { type: "sortie", texte: "Completed with 1 error:", couleur: "rouge" },
        { type: "sortie", texte: "  Failure in test accepted_values_stg_orders_status", couleur: "rouge" },
        { type: "sortie", texte: "  Got 1 result, configured to fail if != 0", couleur: "rouge" },
        { type: "vide" },
        { type: "sortie", texte: "Done. PASS=20  WARN=0  ERROR=1  TOTAL=21", couleur: "rouge" },
      ],
      legende: "⚠️  le test bloque la mauvaise donnée",
      accent: "#ef4444",
    },
  },
  {
    duree: 140,
    v: {
      titre: "4. On corrige, tout repasse au vert",
      chemin: "~/dbt_duckdb_demo",
      lignes: [
        { type: "commande", texte: "python generate_seeds.py && dbt build --profiles-dir ." },
        { type: "vide" },
        { type: "sortie", texte: "Done. PASS=30  WARN=0  ERROR=0  TOTAL=30", couleur: "vert" },
        { type: "vide" },
        { type: "sortie", texte: "3 seeds + 6 modèles + 21 tests", couleur: "gris" },
      ],
      legende: "✅  30 contrôles verts",
      accent: "#22c55e",
    },
  },
];

export const Preuve: React.FC = () => {
  let t = 0;
  return (
    <AbsoluteFill style={{ background: T.fond }}>
      {SEQ.map((s, i) => {
        const from = t;
        t += s.duree;
        return (
          <Sequence key={i} from={from} durationInFrames={s.duree}>
            <Terminal v={s.v} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const PREUVE_FRAMES = SEQ.reduce((n, s) => n + s.duree, 0);
