import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../theme";

/* ───────────────── helpers ───────────────── */

const useApparition = (delai = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delai, fps, config: { damping: 200 }, durationInFrames: 18 });
};

const Cadre: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 30%, ${accent ?? T.sky}18 0%, ${T.fond} 60%)`,
      fontFamily: T.police,
      color: T.texte,
      padding: "140px 80px 420px",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

const Etiquette: React.FC<{ texte: string; accent: string }> = ({ texte, accent }) => {
  const a = useApparition(0);
  return (
    <div
      style={{
        opacity: a,
        transform: `translateY(${(1 - a) * 20}px)`,
        background: `${accent}22`,
        border: `2px solid ${accent}`,
        color: accent,
        padding: "12px 30px",
        borderRadius: 999,
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: 2,
        marginBottom: 54,
      }}
    >
      {texte}
    </div>
  );
};

const Code: React.FC<{ children: string; accent: string; delai?: number }> = ({
  children, accent, delai = 10,
}) => {
  const a = useApparition(delai);
  return (
    <div
      style={{
        opacity: a,
        transform: `scale(${0.96 + a * 0.04})`,
        marginTop: 54,
        background: "#0f172a",
        border: `1px solid ${accent}55`,
        borderRadius: 20,
        padding: "30px 38px",
        fontFamily: T.policeMono,
        fontSize: 38,
        color: T.texte,
        maxWidth: 900,
      }}
    >
      {children}
    </div>
  );
};

/* ───────────────── scènes ───────────────── */

export const Hook: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const a = useApparition(0);
  const pulse = 1 + Math.sin(frame / 7) * 0.015;
  return (
    <Cadre accent={v.accent}>
      <div
        style={{
          fontSize: 230,
          fontWeight: 900,
          color: v.accent,
          lineHeight: 1,
          transform: `scale(${a * pulse})`,
          textShadow: `0 0 90px ${v.accent}70`,
        }}
      >
        {v.titre}
      </div>
      <div
        style={{
          marginTop: 50,
          fontSize: 62,
          fontWeight: 700,
          lineHeight: 1.25,
          whiteSpace: "pre-line",
          opacity: useApparition(8),
        }}
      >
        {v.sous_titre}
      </div>
    </Cadre>
  );
};

/** Partitions : 4 blocs en haut, 4 en bas, flèches parallèles (narrow) ou croisées (wide). */
export const Partitions: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const croise = v.flux === "croise";
  const n = 4;
  const progression = interpolate(frame, [14, 46], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const Bloc = ({ i, bas }: { i: number; bas?: boolean }) => (
    <div
      style={{
        width: 150, height: 92, borderRadius: 16,
        background: bas ? `${v.accent}26` : T.fondDoux,
        border: `2px solid ${bas ? v.accent : "#334155"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.policeMono, fontSize: 30, color: bas ? v.accent : T.texteDoux,
        opacity: bas ? progression : 1,
      }}
    >
      P{i}
    </div>
  );

  return (
    <Cadre accent={v.accent}>
      <Etiquette texte={v.etiquette} accent={v.accent} />

      <div style={{ display: "flex", gap: 26 }}>
        {Array.from({ length: n }, (_, i) => <Bloc key={i} i={i + 1} />)}
      </div>

      {/* flèches */}
      <svg width={760} height={190} style={{ margin: "14px 0" }}>
        {Array.from({ length: n }, (_, i) => {
          const xDep = 75 + i * 176;
          const xArr = croise ? 75 + (n - 1 - i) * 176 : xDep;
          const yFin = 20 + progression * 150;
          return (
            <line
              key={i}
              x1={xDep} y1={20}
              x2={xDep + (xArr - xDep) * progression} y2={yFin}
              stroke={v.accent}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}
      </svg>

      <div style={{ display: "flex", gap: 26 }}>
        {Array.from({ length: n }, (_, i) => <Bloc key={i} i={i + 1} bas />)}
      </div>

      <Code accent={v.accent} delai={4}>{v.code}</Code>
    </Cadre>
  );
};

export const Etapes: React.FC<{ v: any }> = ({ v }) => (
  <Cadre accent={v.accent}>
    {v.etapes.map((e: string, i: number) => {
      const a = useApparition(i * 12);
      return (
        <div
          key={e}
          style={{
            opacity: a,
            transform: `translateX(${(1 - a) * -40}px)`,
            display: "flex", alignItems: "center", gap: 30,
            background: T.fondDoux,
            border: `2px solid ${v.accent}44`,
            borderRadius: 22,
            padding: "34px 44px",
            marginBottom: 28,
            width: 860,
          }}
        >
          <div style={{
            minWidth: 72, height: 72, borderRadius: "50%",
            background: `${v.accent}22`, border: `2px solid ${v.accent}`,
            color: v.accent, fontSize: 38, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{i + 1}</div>
          <div style={{ fontSize: 50, fontWeight: 600, textAlign: "left" }}>{e}</div>
        </div>
      );
    })}
    <div style={{
      opacity: useApparition(42), marginTop: 26,
      fontSize: 44, color: v.accent, fontWeight: 800,
    }}>
      ↑ {v.note}
    </div>
  </Cadre>
);

export const Conseils: React.FC<{ v: any }> = ({ v }) => (
  <Cadre accent={v.accent}>
    <div style={{
      opacity: useApparition(0),
      fontSize: 72, fontWeight: 900, lineHeight: 1.2,
      whiteSpace: "pre-line", marginBottom: 64, color: v.accent,
    }}>
      {v.titre}
    </div>
    {v.conseils.map((c: string, i: number) => {
      const a = useApparition(16 + i * 14);
      return (
        <div key={c} style={{
          opacity: a, transform: `translateY(${(1 - a) * 24}px)`,
          display: "flex", alignItems: "center", gap: 24,
          fontSize: 50, fontWeight: 600, marginBottom: 30,
        }}>
          <span style={{ color: v.accent, fontSize: 56 }}>✓</span>
          <span>{c}</span>
        </div>
      );
    })}
  </Cadre>
);

export const Cta: React.FC<{ v: any }> = ({ v }) => {
  const a = useApparition(0);
  return (
    <Cadre accent={v.accent}>
      <div style={{
        opacity: a, transform: `scale(${0.9 + a * 0.1})`,
        fontSize: 76, fontWeight: 900, marginBottom: 44,
      }}>
        {v.texte}
      </div>
      <div style={{
        opacity: useApparition(10),
        background: `linear-gradient(135deg, ${T.orange}, ${T.sky})`,
        padding: "26px 56px", borderRadius: 999,
        fontSize: 46, fontWeight: 800,
      }}>
        {v.url}
      </div>
      <div style={{
        opacity: useApparition(20), marginTop: 40,
        fontSize: 36, color: T.texteDoux,
      }}>
        Lien en description ↓
      </div>
    </Cadre>
  );
};

/** Parcours vertical : la donnée descend d'une étape à l'autre. */
export const Parcours: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const n = v.etapes.length;
  const avance = interpolate(frame, [10, 70], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <Cadre accent={v.accent}>
      <div style={{ position: "relative", width: 840 }}>
        {/* rail */}
        <div style={{
          position: "absolute", left: 76, top: 60, bottom: 60,
          width: 6, background: "#1e293b", borderRadius: 3,
        }} />
        <div style={{
          position: "absolute", left: 76, top: 60, width: 6,
          height: `${avance * 100}%`, maxHeight: "calc(100% - 120px)",
          background: `linear-gradient(${v.accent}, ${T.orange})`,
          borderRadius: 3, boxShadow: `0 0 26px ${v.accent}`,
        }} />

        {v.etapes.map((e: any, i: number) => {
          const seuil = i / Math.max(1, n - 1);
          const actif = avance >= seuil - 0.02;
          return (
            <div key={e.titre} style={{
              display: "flex", alignItems: "center", gap: 36,
              marginBottom: i < n - 1 ? 110 : 0,
              opacity: actif ? 1 : 0.32,
              transform: `scale(${actif ? 1 : 0.94})`,
            }}>
              <div style={{
                minWidth: 158, height: 158, borderRadius: "50%",
                background: actif ? `${v.accent}26` : T.fondDoux,
                border: `3px solid ${actif ? v.accent : "#334155"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 72,
                boxShadow: actif ? `0 0 46px ${v.accent}55` : "none",
              }}>{e.icone}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 52, fontWeight: 800 }}>{e.titre}</div>
                <div style={{ fontSize: 36, color: T.texteDoux, marginTop: 8 }}>{e.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Cadre>
  );
};

/** Domaines : plusieurs secteurs qui convergent vers un même problème. */
export const Domaines: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const convergence = interpolate(frame, [26, 62], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <Cadre accent={v.accent}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center", maxWidth: 900 }}>
        {v.domaines.map((d: any, i: number) => {
          const a = useApparition(i * 9);
          return (
            <div key={d.label} style={{
              opacity: a,
              transform: `translateY(${(1 - a) * 26}px)`,
              width: 390, padding: "34px 20px",
              background: T.fondDoux,
              border: `2px solid ${v.accent}44`,
              borderRadius: 24,
              display: "flex", alignItems: "center", gap: 24,
            }}>
              <div style={{ fontSize: 76 }}>{d.icone}</div>
              <div style={{ fontSize: 46, fontWeight: 700, textAlign: "left" }}>{d.label}</div>
            </div>
          );
        })}
      </div>

      {/* flèches de convergence */}
      <svg width={880} height={150} style={{ marginTop: 10 }}>
        {[-300, -100, 100, 300].map((dx, i) => (
          <line
            key={i}
            x1={440 + dx} y1={10}
            x2={440 + dx * (1 - convergence)} y2={10 + convergence * 120}
            stroke={v.accent} strokeWidth={5} strokeLinecap="round"
            opacity={convergence * 0.9}
          />
        ))}
      </svg>

      <div style={{
        opacity: convergence,
        transform: `scale(${0.9 + convergence * 0.1})`,
        fontSize: 72, fontWeight: 900, color: v.accent,
        textShadow: `0 0 60px ${v.accent}55`,
      }}>
        {v.titre}
      </div>
    </Cadre>
  );
};

/** Punch : une phrase, en grand, qui reste. */
export const Punch: React.FC<{ v: any }> = ({ v }) => {
  const a = useApparition(0);
  const frame = useCurrentFrame();
  return (
    <Cadre accent={v.accent}>
      <div style={{
        opacity: a,
        transform: `scale(${0.92 + a * 0.08})`,
        fontSize: 86, fontWeight: 900, lineHeight: 1.25,
        whiteSpace: "pre-line",
        textShadow: `0 0 70px ${v.accent}40`,
      }}>
        {v.texte}
      </div>
      <div style={{
        marginTop: 56, width: interpolate(frame, [16, 44], [0, 420], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }),
        height: 8, borderRadius: 4,
        background: `linear-gradient(90deg, ${T.orange}, ${T.sky})`,
      }} />
    </Cadre>
  );
};

export const SCENES: Record<string, React.FC<{ v: any }>> = {
  hook: Hook,
  partitions: Partitions,
  etapes: Etapes,
  conseils: Conseils,
  domaines: Domaines,
  parcours: Parcours,
  punch: Punch,
  cta: Cta,
};
