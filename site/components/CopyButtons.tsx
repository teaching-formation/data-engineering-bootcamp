"use client";
import { useEffect } from "react";

/** Ajoute un bouton "Copier" sur chaque bloc de code après le rendu. */
export default function CopyButtons() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLPreElement>(".notebook-content pre"));
    const cleanups: Array<() => void> = [];

    for (const pre of blocks) {
      if (pre.querySelector(".copy-btn")) continue;
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "Copier";
      btn.setAttribute("aria-label", "Copier le code");

      const onClick = async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "Copié ✓";
          setTimeout(() => (btn.textContent = "Copier"), 1500);
        } catch {
          btn.textContent = "Erreur";
          setTimeout(() => (btn.textContent = "Copier"), 1500);
        }
      };

      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
