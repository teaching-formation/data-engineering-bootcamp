import React from "react";
import { Composition } from "remotion";
import { Short } from "./Short";
import { FPS, LARGEUR, HAUTEUR } from "./theme";
import timings from "./data/timings.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    durationInFrames={Math.ceil(timings.total_s * FPS)}
    fps={FPS}
    width={LARGEUR}
    height={HAUTEUR}
  />
);
