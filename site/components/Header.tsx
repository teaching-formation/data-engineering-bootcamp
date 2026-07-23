"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import Search from "./Search";


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
            <button className="nav-dd__btn" type="button">Communauté ▾</button>
            <div className="nav-dd__menu">
              <a href="https://t.me/fromzerotoherodataeng" target="_blank" rel="noreferrer">💬 Telegram</a>
              <Link href="/support/">☕ Soutenir le projet</Link>
            </div>
          </div>

          <a className="nav-cross" href="https://dataana.from0tohero.dev" target="_blank" rel="noreferrer">
            📊 Data Analyst ↗
          </a>
        </nav>

        <div className="site-header__actions">
          <Search />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
