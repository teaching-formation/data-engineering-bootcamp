import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { useVideoConfig } from "remotion";
import { SCENES } from "./scenes/Scenes";
import { T } from "./theme";
import { imagesAffichees } from "./timeline";
import script from "./data/script.json";
import timings from "./data/timings.json";

/**
 * Format long 16:9 pour les cours dont les visuels viennent d'un artifact web.
 *
 * Volontairement plus nu que Cours.tsx : les scènes de l'artifact occupent déjà
 * tout le cadre et portent leur propre texte. On n'incruste donc PAS de
 * sous-titres — ils recouvriraient le contenu. Ils partent dans un .srt séparé,
 * que YouTube rend sélectionnable et traduisible.
 *
 * Ne reste qu'un repère de progression et la marque, logés dans la marge que
 * l'artifact laisse libre (ses scènes ont un padding de 4.5cqw).
 */

const Progression: React.FC<{ chapitre: number; total: number }> = ({ chapitre, total }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "#1b2740" }}>
    <div
      style={{
        height: "100%",
        width: `${(chapitre / total) * 100}%`,
        background: `linear-gradient(90deg, ${T.orange}, ${T.sky})`,
      }}
    />
  </div>
);

const Marque: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 26,
      right: 34,
      padding: "7px 14px",
      borderRadius: 999,
      background: "rgba(5,10,20,0.55)",
      border: "1px solid rgba(255,255,255,0.07)",
      fontFamily: T.police,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 0.4,
      color: T.texteDoux,
    }}
  >
    From<span style={{ color: T.orange }}>Zero</span>To<span style={{ color: T.sky }}>Hero</span>
  </div>
);

export const Tuto: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const segs = script.segments as any[];
  const parId = Object.fromEntries(segs.map((s) => [s.id, s]));
  const totalChap = Math.max(...segs.map((s) => s.chapitre ?? 0), 1);

  return (
    <AbsoluteFill style={{ background: T.fond }}>
      <Audio src={staticFile("audio/narration.wav")} />

      {(timings.segments as any[]).map((seg, i) => {
        const src = parId[seg.id];
        const Scene = SCENES[src?.visuel?.type];
        if (!Scene) return null;

        const from = Math.round(seg.debut_s * fps);
        const affiche = imagesAffichees(timings.segments, i, durationInFrames, fps);

        // La scène a besoin de sa durée MESURÉE pour remapper les délais que
        // l'artifact avait écrits contre sa propre estimation. Elle n'est connue
        // qu'ici, donc on la joint au visuel.
        const v = { ...src.visuel, _duree_s: seg.duree_s };

        return (
          <Sequence key={seg.id} from={from} durationInFrames={affiche} name={src.visuel.titre}>
            <Scene v={v} />
            <Progression chapitre={src.chapitre ?? 0} total={totalChap} />
            <Marque />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
