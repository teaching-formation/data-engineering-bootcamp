import path from "node:path";
import fs from "node:fs";
import { ALL_ATELIERS, ALL_ITEMS, findAtelier, findItem, type Atelier, type NavItem } from "./nav";
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

function atelierFile(atelier: Atelier): string {
  return path.join(REPO_ROOT, "notebooks", `${atelier.file}.ipynb`);
}

export function allAtelierSlugs(): string[] {
  return ALL_ATELIERS.filter((a) => fs.existsSync(atelierFile(a))).map((a) => a.slug);
}

export function getAtelier(slug: string): (RenderedNotebook & { atelier: Atelier }) | null {
  const atelier = findAtelier(slug);
  if (!atelier || !fs.existsSync(atelierFile(atelier))) return null;
  return { ...renderNotebook(atelierFile(atelier)), atelier };
}
