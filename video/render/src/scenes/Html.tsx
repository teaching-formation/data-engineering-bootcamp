import React, { useEffect, useRef, useState } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { ARTIFACT_CSS } from "../data/artifactCss";

/**
 * Rend une scène HTML/CSS reprise telle quelle d'un artifact-lecteur web.
 *
 * Deux problèmes à régler, et un seul mécanisme pour les deux.
 *
 * 1. Remotion rend image par image : il se place directement à l'image N.
 *    Une animation CSS, elle, avance sur l'horloge du navigateur — elle ne se
 *    replace donc pas toute seule au bon endroit, et le rendu sort figé ou
 *    incohérent. La parade : figer les animations (`animation-play-state:paused`)
 *    et leur donner un `animation-delay` NÉGATIF égal au temps écoulé. Le
 *    navigateur affiche alors exactement l'état qu'aurait l'animation à cet
 *    instant. Comme les 77 éléments animés partagent la classe `.a` et ne
 *    diffèrent que par leur variable `--d`, une seule règle les couvre tous.
 *
 * 2. Les délais `--d` (jusqu'à 17 s) ont été écrits contre la durée que le
 *    lecteur d'origine ESTIMAIT au nombre de mots. Notre chaîne, elle, MESURE
 *    l'audio réel. Sans correction, un élément tardif apparaîtrait après la fin
 *    de sa scène. On remappe donc le temps proportionnellement : la scène garde
 *    le rythme voulu par l'auteur, quelle que soit la durée réelle.
 */

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800" +
  "&family=Atkinson+Hyperlegible:wght@400;700" +
  "&family=JetBrains+Mono:wght@400;600" +
  "&display=block";

const A_PRECHARGER = [
  '500 100px "Bricolage Grotesque"',
  '700 100px "Bricolage Grotesque"',
  '800 100px "Bricolage Grotesque"',
  '400 40px "Atkinson Hyperlegible"',
  '700 40px "Atkinson Hyperlegible"',
  '400 30px "JetBrains Mono"',
  '600 30px "JetBrains Mono"',
];

/** Palette sombre de l'artifact. Son défaut est le thème clair ; la chaîne est
 *  sombre, donc on fixe les variables au lieu de dépendre de prefers-color-scheme,
 *  que le navigateur de rendu ne garantit pas. */
const SOMBRE: React.CSSProperties = {
  ["--page" as any]: "#0E1626",
  ["--text" as any]: "#E6ECF5",
  ["--muted" as any]: "#9AA8C0",
  ["--panel" as any]: "#16223A",
  ["--line" as any]: "#2A3A5A",
};

/**
 * Pilotage par l'horloge d'images, et neutralisation de prefers-reduced-motion :
 * si le navigateur de rendu l'annonçait, l'artifact écraserait ses durées à
 * 0,01 s et toutes les entrées deviendraient instantanées.
 */
const PILOTAGE = `
.artifact-stage .a,
.artifact-stage .draw {
  animation-play-state: paused !important;
  animation-delay: calc(var(--d, 0s) - var(--t, 0s)) !important;
}
.artifact-stage .a    { animation-duration: .7s  !important; }
.artifact-stage .draw { animation-duration: 1.1s !important; }
.artifact-stage .blink::after {
  animation-play-state: paused !important;
  animation-delay: calc(0s - var(--t, 0s)) !important;
  animation-duration: 1s !important;
}
`;

/** Charge les polices de l'artifact une fois pour toute la session de rendu.
 *  Ne bloque jamais plus de 10 s : une police de repli vaut mieux qu'un rendu
 *  qui échoue sur un délai d'attente. */
let polices: Promise<void> | null = null;
const chargerPolices = (): Promise<void> => {
  if (polices) return polices;
  polices = new Promise<void>((resolve) => {
    if (!document.getElementById("artifact-fonts")) {
      const lien = document.createElement("link");
      lien.id = "artifact-fonts";
      lien.rel = "stylesheet";
      lien.href = GOOGLE_FONTS;
      document.head.appendChild(lien);
    }
    const secours = setTimeout(resolve, 10_000);
    const fini = () => {
      clearTimeout(secours);
      resolve();
    };
    Promise.all(A_PRECHARGER.map((f) => document.fonts.load(f).catch(() => null)))
      .then(() => document.fonts.ready)
      .then(fini, fini);
  });
  return polices;
};

/** Blocs à chasse fixe que l'artifact laisse déborder : ils sont en
 *  `white-space:pre` + `overflow:hidden`, donc une ligne trop longue est
 *  coupée net au lieu d'être réduite. En 1920×1080 on perd ainsi des fins de
 *  ligne (« ... OK », « ... PASS », un commentaire Windows). */
const A_AJUSTER = "pre.code, pre.term, pre.tree, .tree";
const MARGE = 0.985;

/** Réduit la taille de police des blocs qui débordent, juste ce qu'il faut.
 *  Déterministe : ne dépend que du contenu et de la largeur du conteneur,
 *  identiques à chaque image — le texte ne « respire » donc pas d'une image
 *  à l'autre. À n'appeler qu'APRÈS le chargement des polices : les métriques
 *  de la police de repli donneraient une mesure fausse. */
const ajuster = (racine: HTMLElement | null): void => {
  if (!racine) return;
  racine.querySelectorAll<HTMLElement>(A_AJUSTER).forEach((bloc) => {
    const style = getComputedStyle(bloc);
    const gauche = parseFloat(style.paddingLeft) || 0;
    const dispo = bloc.clientWidth - gauche - (parseFloat(style.paddingRight) || 0);
    const contenu = bloc.scrollWidth - gauche;
    if (dispo <= 0 || contenu <= dispo) return;
    const taille = parseFloat(style.fontSize);
    bloc.style.fontSize = `${(taille * (dispo / contenu) * MARGE).toFixed(2)}px`;
  });
};

export const Html: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contenu = useRef<HTMLDivElement>(null);
  const [attente] = useState(() => delayRender("polices de l'artifact"));

  useEffect(() => {
    chargerPolices().then(() => {
      ajuster(contenu.current);
      continueRender(attente);
    });
  }, [attente]);

  // _duree_s est la durée MESURÉE de la scène, injectée par la composition.
  const mesuree: number = v._duree_s ?? v.duree_artifact_s ?? 1;
  const estimee: number = v.duree_artifact_s ?? mesuree;
  const t = (frame / fps) * (estimee / Math.max(mesuree, 0.001));

  return (
    <div
      className="artifact-stage stage"
      style={{
        ...SOMBRE,
        ["--t" as any]: `${t.toFixed(3)}s`,
        position: "relative",
        width: "100%",
        height: "100%",
        containerType: "inline-size",
        overflow: "hidden",
        background: "#0E1626",
      }}
    >
      <style>{ARTIFACT_CSS + PILOTAGE}</style>
      <div
        ref={contenu}
        style={{ position: "absolute", inset: 0 }}
        dangerouslySetInnerHTML={{ __html: v.html }}
      />
    </div>
  );
};
