/**
 * Génère un identifiant d'ancre stable à partir d'un texte de titre.
 * Retire accents et emojis, conserve chiffres et lettres.
 */
export function baseSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[^\w\s-]/g, "") // emojis, ponctuation
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Crée une fonction de slugify qui déduplique les ancres identiques
 * dans un même document (title, title-1, title-2, ...).
 */
export function makeSlugger() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = baseSlugify(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}
