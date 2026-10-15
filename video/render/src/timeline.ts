/**
 * Nombre d'images pendant lesquelles un segment reste à l'écran : jusqu'au
 * début du suivant, pas seulement le temps de sa narration. La voix laisse un
 * silence entre deux segments ; si le visuel s'arrêtait avec elle, l'écran
 * resterait vide pendant ce silence (30 trous de 0,45 s sur la leçon L01).
 */
export const imagesAffichees = (
  segments: { debut_s: number }[], i: number, totalImages: number, fps: number,
): number => {
  const debut = Math.round(segments[i].debut_s * fps);
  const fin = i + 1 < segments.length ? Math.round(segments[i + 1].debut_s * fps) : totalImages;
  return fin - debut;
};
