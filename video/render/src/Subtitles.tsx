import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "./theme";

/**
 * Sous-titres incrustés — indispensables : la majorité des Shorts
 * sont regardés sans le son.
 *
 * Le texte de chaque segment est découpé en courts groupes de mots,
 * répartis proportionnellement sur la durée du segment.
 */

const MOTS_PAR_GROUPE = 4;

const decouper = (texte: string): string[] => {
  const mots = texte.split(/\s+/).filter(Boolean);
  const groupes: string[] = [];
  for (let i = 0; i < mots.length; i += MOTS_PAR_GROUPE) {
    groupes.push(mots.slice(i, i + MOTS_PAR_GROUPE).join(" "));
  }
  return groupes;
};

type Seg = { id: string; debut_s: number; duree_s: number };

export const Subtitles: React.FC<{
  segments: Seg[];
  narrations: Record<string, string>;
}> = ({ segments, narrations }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const seg = segments.find((s) => t >= s.debut_s && t < s.debut_s + s.duree_s);
  if (!seg) return null;

  const groupes = decouper(narrations[seg.id] ?? "");
  if (!groupes.length) return null;

  const avancement = (t - seg.debut_s) / seg.duree_s;
  const index = Math.min(groupes.length - 1, Math.floor(avancement * groupes.length));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 250,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily: T.police,
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: "rgba(5, 10, 20, 0.82)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20,
          padding: "22px 34px",
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.3,
          color: T.texte,
          textShadow: "0 3px 14px rgba(0,0,0,0.75)",
        }}
      >
        {groupes[index]}
      </span>
    </div>
  );
};
