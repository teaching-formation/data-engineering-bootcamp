import React from "react";
import { Composition } from "remotion";
import { Short } from "./Short";
import { Cours } from "./Cours";
import { FPS, LARGEUR, HAUTEUR } from "./theme";
import timings from "./data/timings.json";

const FRAMES = Math.ceil(timings.total_s * FPS);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Short" component={Short}
      durationInFrames={FRAMES} fps={FPS} width={LARGEUR} height={HAUTEUR} />
    <Composition id="Cours" component={Cours}
      durationInFrames={FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
