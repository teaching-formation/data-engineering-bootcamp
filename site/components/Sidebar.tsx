"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, levelOf } from "@/lib/nav";

function currentSlug(pathname: string): string {
  const m = pathname.match(/\/modules\/([^/]+)/);
  return m ? m[1] : "";
}

export default function Sidebar() {
  const pathname = usePathname();
  const slug = currentSlug(pathname);
  const activeLevel = slug ? levelOf(slug)?.id : undefined;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  // État de repli mémorisé → s'applique à toutes les pages
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
    } catch {}
  }, []);

  // Classe sur <body> pour élargir le contenu quand la sidebar est repliée
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    return () => document.body.classList.remove("sidebar-collapsed");
  }, [collapsed]);

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  function isLevelOpen(id: string): boolean {
    return open[id] ?? id === activeLevel;
  }

  function closeDrawer() {
    document.body.classList.remove("sidebar-open");
  }

  return (
    <>
      <div className="sidebar-backdrop" onClick={closeDrawer} aria-hidden />
      <aside className="sidebar" aria-label="Navigation du cours">
        <button
          className="sidebar__collapse"
          onClick={toggleCollapse}
          aria-expanded={!collapsed}
          title={collapsed ? "Afficher le menu" : "Réduire le menu"}
        >
          <span className="sidebar__collapse-chevron" aria-hidden>{collapsed ? "»" : "«"}</span>
          <span className="sidebar__collapse-label">Réduire le menu</span>
        </button>

        <nav>
          {NAV.map((level) => {
            const opened = isLevelOpen(level.id);
            return (
              <div key={level.id} className="sidebar__level">
                <button
                  className="sidebar__level-btn"
                  style={{ ["--accent" as string]: level.accent }}
                  aria-expanded={opened}
                  onClick={() => setOpen((o) => ({ ...o, [level.id]: !opened }))}
                >
                  <span>{level.label}</span>
                  <span className="sidebar__chevron">{opened ? "▾" : "▸"}</span>
                </button>
                {opened && (
                  <div className="sidebar__sections">
                    {level.sections.map((section) => (
                      <div key={section.title} className="sidebar__section">
                        <p className="sidebar__section-title">{section.title}</p>
                        <ul>
                          {section.items.map((it) => (
                            <li key={it.slug}>
                              <Link
                                href={`/modules/${it.slug}/`}
                                className={`sidebar__link ${slug === it.slug ? "is-active" : ""}`}
                                onClick={closeDrawer}
                              >
                                {it.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
