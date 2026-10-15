import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SCENES } from "./scenes/Scenes";
import { T } from "./theme";
import { imagesAffichees } from "./timeline";
import script from "./data/script.json";
import timings from "./data/timings.json";

/** Format long 16:9 : chapitrage visible, sous-titres bas, marque discrète. */

const Sous: React.FC<{ texte: string }> = ({ texte }) => (
  <div style={{
    position: "absolute", bottom: 54, left: 140, right: 140,
    textAlign: "center", fontFamily: T.police,
  }}>
    <span style={{
      display: "inline-block",
      background: "rgba(5,10,20,0.82)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, padding: "14px 26px",
      fontSize: 34, fontWeight: 700, color: T.texte,
    }}>{texte}</span>
  </div>
);

const Bandeau: React.FC<{ chapitre: number; total: number }> = ({ chapitre, total }) => (
  <>
    <div style={{
      position: "absolute", top: 36, left: 54,
      fontFamily: T.police, fontSize: 26, fontWeight: 700,
      color: T.texteDoux, letterSpacing: 1,
    }}>
      From<span style={{ color: T.orange }}>Zero</span>To<span style={{ color: T.sky }}>Hero</span>
      <span style={{ color: "#334155" }}>  ·  </span>
      Bash pour Data Engineers
    </div>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "#1b2740" }}>
      <div style={{
        height: "100%", width: `${(chapitre / total) * 100}%`,
        background: `linear-gradient(90deg, ${T.orange}, ${T.sky})`,
        transition: "none",
      }} />
    </div>
  </>
);

const decouper = (t: string): string[] => {
  const mots = t.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < mots.length; i += 7) out.push(mots.slice(i, i + 7).join(" "));
  return out;
};

export const Cours: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const segs = script.segments as any[];
  const visuels = Object.fromEntries(segs.map((s) => [s.id, s.visuel]));
  const narr = Object.fromEntries(segs.map((s) => [s.id, s.narration]));
  const chap = Object.fromEntries(segs.map((s) => [s.id, s.chapitre ?? 0]));
  const totalChap = Math.max(...segs.map((s) => s.chapitre ?? 0), 1);

  return (
    <AbsoluteFill style={{ background: T.fond }}>
      <Audio src={staticFile("audio/narration.wav")} />

      {(timings.segments as any[]).map((seg, i) => {
        const v = visuels[seg.id];
        const Scene = SCENES[v?.type];
        if (!Scene) return null;
        const from = Math.round(seg.debut_s * fps);
        const dur = Math.round(seg.duree_s * fps); // temps de parole : cale les sous-titres
        const affiche = imagesAffichees(timings.segments, i, durationInFrames, fps);
        const groupes = decouper(narr[seg.id] ?? "");

        return (
          <Sequence key={seg.id} from={from} durationInFrames={affiche}>
            <Scene v={v} />
            <Bandeau chapitre={chap[seg.id]} total={totalChap} />
            {groupes.map((g, i) => (
              <Sequence
                key={i}
                from={Math.floor((dur * i) / groupes.length)}
                durationInFrames={Math.ceil(dur / groupes.length)}
              >
                <Sous texte={g} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
