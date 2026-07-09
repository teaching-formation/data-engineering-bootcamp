"use client";
import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/render";

export default function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);

  // État de pli mémorisé → s'applique à toutes les pages
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("toc-collapsed") === "1");
    } catch {}
  }, []);

  // Synchronise une classe sur <body> pour élargir le contenu quand replié
  useEffect(() => {
    document.body.classList.toggle("toc-collapsed", collapsed);
    return () => document.body.classList.remove("toc-collapsed");
  }, [collapsed]);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("toc-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  useEffect(() => {
    if (toc.length === 0) return;
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav className={`toc ${collapsed ? "is-collapsed" : ""}`} aria-label="Sommaire">
      <button
        className="toc__toggle"
        onClick={toggle}
        aria-expanded={!collapsed}
        title={collapsed ? "Afficher le sommaire" : "Réduire le sommaire"}
      >
        <span className="toc__title">
          <span className="toc__ico" aria-hidden>📑</span>
          <span className="toc__label">Sur cette page</span>
        </span>
        <span className="toc__chevron" aria-hidden>{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && (
        <ul>
          {toc.map((t) => (
            <li key={t.id} className={`toc__item toc__l${t.level} ${active === t.id ? "is-active" : ""}`}>
              <a href={`#${t.id}`}>{t.text}</a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
