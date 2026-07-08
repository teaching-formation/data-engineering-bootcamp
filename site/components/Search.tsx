"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Recherche full-text via Pagefind.
 * Pagefind indexe le dossier `out/` après le build (script postbuild)
 * et expose /pagefind/pagefind-ui.js + .css chargés à la demande.
 */
export default function Search() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || initedRef.current) return;

    // Charge la CSS Pagefind
    if (!document.getElementById("pagefind-css")) {
      const link = document.createElement("link");
      link.id = "pagefind-css";
      link.rel = "stylesheet";
      link.href = "/pagefind/pagefind-ui.css";
      document.head.appendChild(link);
    }

    // Charge et instancie le script Pagefind (chemin en variable pour éviter
    // la résolution statique — le fichier n'existe qu'après le build)
    const pagefindUrl = "/pagefind/pagefind-ui.js";
    import(/* webpackIgnore: true */ pagefindUrl)
      .then((mod: any) => {
        const PagefindUI = mod.PagefindUI || (window as any).PagefindUI;
        if (PagefindUI && containerRef.current) {
          new PagefindUI({
            element: containerRef.current,
            showSubResults: true,
            resetStyles: false,
            translations: {
              placeholder: "Rechercher dans le bootcamp…",
              zero_results: "Aucun résultat pour [SEARCH_TERM]",
            },
          });
          initedRef.current = true;
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(false));
  }, [open]);

  return (
    <>
      <button className="icon-btn search-trigger" onClick={() => setOpen(true)} aria-label="Rechercher" title="Rechercher (⌘K)">
        🔍
      </button>

      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div ref={containerRef} className="search-box" />
            {!loaded && <p className="search-hint">La recherche est disponible sur le site déployé.</p>}
          </div>
        </div>
      )}
    </>
  );
}
