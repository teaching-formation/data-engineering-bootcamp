import path from "node:path";
import fs from "node:fs";
import { ALL_ITEMS, findItem, type NavItem } from "./nav";
import { renderNotebook, type RenderedNotebook } from "./render";

/** Racine du repo (le dossier parent de `site/`), où vivent les notebooks. */
const REPO_ROOT = path.join(process.cwd(), "..");

export function slugToFile(slug: string): string {
  const rel = slug.replace(/__/g, "/");
  return path.join(REPO_ROOT, "notebooks", `${rel}.ipynb`);
}

export function allSlugs(): string[] {
  return ALL_ITEMS.filter((i) => fs.existsSync(slugToFile(i.slug))).map((i) => i.slug);
}

export function getNotebook(slug: string): (RenderedNotebook & { item: NavItem }) | null {
  const item = findItem(slug);
  if (!item) return null;
  const file = slugToFile(slug);
  if (!fs.existsSync(file)) return null;
  return { ...renderNotebook(file), item };
}
