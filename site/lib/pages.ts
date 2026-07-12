import fs from "node:fs";
import path from "node:path";
import { renderMarkdownString, type RenderedNotebook } from "./render";

/** Pages "info/marketing" statiques, rendues depuis site/content/{slug}.md */
export type PageDef = { slug: string; title: string };

export const PAGES: PageDef[] = [
  { slug: "curriculum", title: "Programme complet" },
  { slug: "consulting", title: "Consulting" },
  { slug: "formations", title: "Formations" },
  { slug: "support", title: "Soutenir le projet" },
  { slug: "documentation", title: "Documentation" },
  { slug: "setup", title: "Setup de l'environnement" },
  { slug: "faq", title: "FAQ" },
  { slug: "links", title: "Liens utiles" },
  { slug: "mentions-legales", title: "Mentions légales & Confidentialité" },
];

const CONTENT_DIR = path.join(process.cwd(), "content");

function fileFor(slug: string): string {
  return path.join(CONTENT_DIR, `${slug}.md`);
}

export function allPageSlugs(): string[] {
  return PAGES.filter((p) => fs.existsSync(fileFor(p.slug))).map((p) => p.slug);
}

export function getPage(slug: string): (RenderedNotebook & { def: PageDef }) | null {
  const def = PAGES.find((p) => p.slug === slug);
  if (!def) return null;
  const file = fileFor(slug);
  if (!fs.existsSync(file)) return null;
  const rendered = renderMarkdownString(fs.readFileSync(file, "utf8"));
  return { ...rendered, def, title: rendered.title || def.title };
}
