"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import Search from "./Search";

const GITHUB = "https://github.com/teaching-formation/data-engineering-bootcamp";

export default function Header() {
  function toggleSidebar() {
    document.body.classList.toggle("sidebar-open");
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button className="hamburger" onClick={toggleSidebar} aria-label="Ouvrir le menu">
          ☰
        </button>
        <Link href="/" className="brand" aria-label="Accueil — Bootcamp Data Engineering">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand__logo" src="/logo-navbar.svg" alt="DE Bootcamp — Data Engineering" width={160} height={32} />
        </Link>

        <nav className="site-header__nav">
          <Link href="/">Accueil</Link>
          <Link href="/modules/beginner__01_intro_data_engineering/">Programme</Link>

          <div className="nav-dd">
            <button className="nav-dd__btn" type="button">Ressources ▾</button>
            <div className="nav-dd__menu">
              <Link href="/curriculum/">📊 Programme complet</Link>
              <Link href="/documentation/">📚 Documentation</Link>
              <Link href="/setup/">🔧 Setup environnement</Link>
              <Link href="/faq/">❓ FAQ</Link>
              <Link href="/links/">🔗 Liens utiles</Link>
            </div>
          </div>

          <div className="nav-dd">
            <button className="nav-dd__btn" type="button">Pour Organisations ▾</button>
            <div className="nav-dd__menu">
              <Link href="/consulting/">👔 Consulting</Link>
              <Link href="/formations/">🎓 Formations</Link>
            </div>
          </div>

          <div className="nav-dd">
            <button className="nav-dd__btn" type="button">Communauté ▾</button>
            <div className="nav-dd__menu">
              <a href="https://t.me/fromzerotoherodataeng" target="_blank" rel="noreferrer">💬 Telegram</a>
              <Link href="/support/">☕ Soutenir le projet</Link>
            </div>
          </div>
        </nav>

        <div className="site-header__actions">
          <Search />
          <ThemeToggle />
          <a className="icon-btn" href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
            {/* GitHub mark */}
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
