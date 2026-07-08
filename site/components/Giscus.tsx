"use client";
import GiscusReact from "@giscus/react";
import { useEffect, useState } from "react";

/**
 * Commentaires Giscus (GitHub Discussions).
 * Reprend la configuration du _quarto.yml.
 */
export default function Comments() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  return (
    <section className="comments" aria-label="Commentaires">
      <GiscusReact
        repo="diakite-data/data-engineering-bootcamp"
        repoId="R_kgDOQjHMsg"
        category="General"
        categoryId="DIC_kwDOQjHMss4CzeOO"
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="fr"
        loading="lazy"
      />
    </section>
  );
}
