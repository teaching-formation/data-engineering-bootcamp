"use client";
import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/render";

export default function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [active, setActive] = useState<string>("");

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
    <nav className="toc" aria-label="Sommaire">
      <p className="toc__title">📑 Sur cette page</p>
      <ul>
        {toc.map((t) => (
          <li key={t.id} className={`toc__item toc__l${t.level} ${active === t.id ? "is-active" : ""}`}>
            <a href={`#${t.id}`}>{t.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
