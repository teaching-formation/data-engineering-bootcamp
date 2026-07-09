import fs from "node:fs";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import hljs from "highlight.js";
import { makeSlugger } from "./slug";

export type TocEntry = { id: string; text: string; level: number };
export type RenderedNotebook = { html: string; toc: TocEntry[]; title: string };

type NotebookCell = {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
  outputs?: unknown[];
};
type Notebook = { cells: NotebookCell[] };

function cellSource(cell: NotebookCell): string {
  return Array.isArray(cell.source) ? cell.source.join("") : cell.source;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Détecte le langage d'une cellule de code et retire la magic Jupyter (%%bash, %%python...). */
function stripMagic(source: string): { code: string; lang: string } {
  const lines = source.split("\n");
  const first = lines[0]?.trim() ?? "";
  if (first.startsWith("%%")) {
    const magic = first.slice(2).split(/\s+/)[0];
    const lang = magic === "bash" || magic === "sh" ? "bash" : magic === "python" ? "python" : magic;
    return { code: lines.slice(1).join("\n"), lang };
  }
  return { code: source, lang: "python" };
}

function highlight(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } catch {
      /* fallthrough */
    }
  }
  try {
    return hljs.highlightAuto(code).value;
  } catch {
    return escapeHtml(code);
  }
}

/** Rendu d'une cellule de code notebook → bloc pliable avec coloration. */
function renderCodeCell(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "";
  const { code, lang } = stripMagic(trimmed);
  const highlighted = highlight(code, lang);
  return (
    `<details class="code-cell" open>` +
    `<summary class="code-cell__summary"><span class="code-cell__lang">${escapeHtml(lang)}</span>Voir le code</summary>` +
    `<pre class="hljs code-cell__pre"><code class="language-${escapeHtml(lang)}">${highlighted}</code></pre>` +
    `</details>`
  );
}

/** Construit un MarkdownIt configuré (coloration des fences + ancres + collecte TOC). */
function buildMarkdown(toc: TocEntry[], slugify: (s: string) => string) {
  const md = new MarkdownIt({
    html: true, // les cellules markdown contiennent du HTML (schémas, <hr>, etc.)
    linkify: true,
    typographer: false,
    highlight(str, lang) {
      const highlighted = highlight(str, lang || "");
      return `<pre class="hljs"><code class="language-${escapeHtml(lang || "")}">${highlighted}</code></pre>`;
    },
  });

  md.use(anchor, {
    level: [1, 2, 3],
    slugify,
    permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
    callback: (token, info) => {
      const level = Number(token.tag.replace("h", ""));
      if (level >= 2 && level <= 3) {
        toc.push({ id: info.slug, text: info.title, level });
      }
    },
  });

  return md;
}

/** Rend un notebook complet en HTML + TOC. `file` = chemin absolu du .ipynb */
export function renderNotebook(file: string): RenderedNotebook {
  const nb = JSON.parse(fs.readFileSync(file, "utf8")) as Notebook;
  const toc: TocEntry[] = [];
  const slugify = makeSlugger();
  const md = buildMarkdown(toc, slugify);

  let title = "";
  const parts: string[] = [];

  for (const cell of nb.cells) {
    if (cell.cell_type === "markdown") {
      const src = cellSource(cell);
      if (!title) {
        const m = src.match(/^\s*#\s+(.+)$/m);
        if (m) title = m[1].replace(/[#*`]/g, "").trim();
      }
      parts.push(md.render(src));
    } else if (cell.cell_type === "code") {
      parts.push(renderCodeCell(cellSource(cell)));
    }
    // raw cells ignorées (aucune dans ce corpus)
  }

  return { html: parts.join("\n"), toc, title: title || "Module" };
}

/** Rend une page markdown simple (pages info : consulting, faq, etc.). */
export function renderMarkdownString(markdown: string): RenderedNotebook {
  const toc: TocEntry[] = [];
  const slugify = makeSlugger();
  const md = buildMarkdown(toc, slugify);
  let title = "";
  const m = markdown.match(/^\s*#\s+(.+)$/m);
  if (m) title = m[1].replace(/[#*`]/g, "").trim();
  return { html: md.render(markdown), toc, title: title || "Page" };
}
