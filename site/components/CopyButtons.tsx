"use client";
import { useEffect } from "react";

/** Convertit un tableau HTML en TSV (collable dans Excel / Google Sheets). */
function tableToTSV(table: HTMLTableElement): string {
  return Array.from(table.querySelectorAll("tr"))
    .map((row) =>
      Array.from(row.querySelectorAll("th,td"))
        .map((cell) => (cell.textContent || "").trim().replace(/\s+/g, " "))
        .join("\t")
    )
    .join("\n");
}

/** Ajoute un bouton "Copier" sur les blocs de code ET les tableaux de données. */
export default function CopyButtons() {
  useEffect(() => {
    const root = document.querySelector(".notebook-content");
    if (!root) return;
    const cleanups: Array<() => void> = [];

    function attach(host: HTMLElement, getText: () => string) {
      if (host.querySelector(":scope > .copy-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "Copier";
      btn.setAttribute("aria-label", "Copier");
      const onClick = async (e: Event) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(getText());
          btn.textContent = "Copié ✓";
          btn.classList.add("is-copied");
          setTimeout(() => {
            btn.textContent = "Copier";
            btn.classList.remove("is-copied");
          }, 1500);
        } catch {
          btn.textContent = "Erreur";
          setTimeout(() => (btn.textContent = "Copier"), 1500);
        }
      };
      btn.addEventListener("click", onClick);
      host.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
      });
    }

    // Blocs de code
    root.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
      attach(pre, () => pre.querySelector("code")?.textContent ?? pre.textContent ?? "");
    });

    // Tableaux de données → on emballe dans un conteneur relatif + bouton TSV
    root.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
      const parent = table.parentElement;
      if (parent && parent.classList.contains("table-wrap")) {
        attach(parent, () => tableToTSV(table));
        return;
      }
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      table.parentNode?.insertBefore(wrap, table);
      wrap.appendChild(table);
      attach(wrap, () => tableToTSV(table));
      cleanups.push(() => {
        if (wrap.parentNode) {
          wrap.parentNode.insertBefore(table, wrap);
          wrap.remove();
        }
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
