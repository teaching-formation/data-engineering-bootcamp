import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";

/**
 * Terminal animé : la commande se tape caractère par caractère,
 * puis la sortie défile ligne par ligne.
 *
 * Les sorties affichées sont de VRAIES sorties capturées en exécutant
 * les commandes — pas des maquettes.
 */

type Ligne =
  | { type: "commande"; texte: string }
  | { type: "sortie"; texte: string; couleur?: "vert" | "rouge" | "gris" | "orange" }
  | { type: "vide" };

const COULEURS = {
  vert: "#4ade80",
  rouge: "#f87171",
  orange: "#fbbf24",
  gris: "#94a3b8",
  defaut: "#e2e8f0",
};

const FRAMES_PAR_CARACTERE = 1.2;
const FRAMES_PAR_LIGNE_SORTIE = 5;
const PAUSE_APRES_COMMANDE = 10;

/** Calcule à quelle frame chaque ligne commence, et sa durée de frappe. */
const planifier = (lignes: Ligne[]) => {
  let f = 6;
  return lignes.map((l) => {
    const debut = f;
    let duree = 0;
    if (l.type === "commande") {
      duree = l.texte.length * FRAMES_PAR_CARACTERE;
      f += duree + PAUSE_APRES_COMMANDE;
    } else if (l.type === "sortie") {
      duree = 1;
      f += FRAMES_PAR_LIGNE_SORTIE;
    } else {
      f += 3;
    }
    return { ligne: l, debut, duree };
  });
};

export const Terminal: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const plan = planifier(v.lignes as Ligne[]);

  // défilement automatique quand le contenu dépasse
  const visibles = plan.filter((p) => frame >= p.debut).length;
  const maxLignes = v.maxLignes ?? 18;
  const decalage = Math.max(0, visibles - maxLignes) * 46;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 0%, #11203a 0%, ${T.fond} 70%)`,
        fontFamily: T.police,
        justifyContent: "center",
        alignItems: "center",
        padding: 70,
      }}
    >
      {v.titre && (
        <div style={{ fontSize: 46, fontWeight: 800, color: T.texte, marginBottom: 28 }}>
          {v.titre}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 1640,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid #27364d",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          background: "#0a1120",
        }}
      >
        {/* barre de fenêtre */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "16px 22px", background: "#111c2f", borderBottom: "1px solid #27364d",
        }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 15, height: 15, borderRadius: "50%", background: c }} />
          ))}
          <div style={{
            flex: 1, textAlign: "center", color: T.texteDoux,
            fontFamily: T.policeMono, fontSize: 25, marginRight: 50,
          }}>
            {v.chemin ?? "~/dbt_duckdb_demo"}
          </div>
        </div>

        {/* contenu */}
        <div style={{
          padding: "28px 34px",
          height: v.hauteur ?? 760,
          overflow: "hidden",
          fontFamily: T.policeMono,
          fontSize: 31,
          lineHeight: "46px",
        }}>
          <div style={{ transform: `translateY(${-decalage}px)` }}>
            {plan.map((p, i) => {
              if (frame < p.debut) return null;
              const l = p.ligne;

              if (l.type === "vide") return <div key={i}>&nbsp;</div>;

              if (l.type === "commande") {
                const n = Math.floor(
                  interpolate(frame, [p.debut, p.debut + p.duree], [0, l.texte.length], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp",
                  })
                );
                const fini = n >= l.texte.length;
                return (
                  <div key={i} style={{ color: COULEURS.defaut }}>
                    <span style={{ color: T.orange, fontWeight: 700 }}>$ </span>
                    {l.texte.slice(0, n)}
                    {!fini && <span style={{
                      background: T.texte, color: T.fond,
                      opacity: Math.floor(frame / 8) % 2 ? 1 : 0.25,
                    }}>▏</span>}
                  </div>
                );
              }

              return (
                <div key={i} style={{ color: COULEURS[l.couleur ?? "defaut"] }}>
                  {l.texte}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {v.legende && (
        <div style={{
          marginTop: 30, fontSize: 38, fontWeight: 700,
          color: v.accent ?? T.sky,
        }}>
          {v.legende}
        </div>
      )}
    </AbsoluteFill>
  );
};
