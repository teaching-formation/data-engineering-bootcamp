import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SCENES } from "./scenes/Scenes";
import { Subtitles } from "./Subtitles";
import { T } from "./theme";
import script from "./data/script.json";
import timings from "./data/timings.json";

const Progression: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "#1e293b" }}>
      <div
        style={{
          height: "100%",
          background: `linear-gradient(90deg, ${T.orange}, ${T.sky})`,
          width: "100%",
          transformOrigin: "left",
          animation: "none",
        }}
      />
    </div>
  );
};

const Marque: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 110,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: T.police,
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: 1,
      color: T.texteDoux,
    }}
  >
    From<span style={{ color: T.orange }}>Zero</span>To<span style={{ color: T.sky }}>Hero</span>
  </div>
);

export const Short: React.FC = () => {
  const { fps } = useVideoConfig();

  const narrations: Record<string, string> = Object.fromEntries(
    script.segments.map((s: any) => [s.id, s.narration])
  );
  const visuels: Record<string, any> = Object.fromEntries(
    script.segments.map((s: any) => [s.id, s.visuel])
  );

  return (
    <AbsoluteFill style={{ background: T.fond }}>
      <Audio src={staticFile("audio/narration.wav")} />

      {timings.segments.map((seg: any) => {
        const v = visuels[seg.id];
        const Scene = SCENES[v?.type];
        if (!Scene) return null;
        return (
          <Sequence
            key={seg.id}
            from={Math.round(seg.debut_s * fps)}
            durationInFrames={Math.round(seg.duree_s * fps)}
          >
            <Scene v={v} />
          </Sequence>
        );
      })}

      <Subtitles segments={timings.segments as any} narrations={narrations} />
      <Marque />
      <Progression />
    </AbsoluteFill>
  );
};
