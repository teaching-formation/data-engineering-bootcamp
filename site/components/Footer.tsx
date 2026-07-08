const GITHUB = "https://github.com/teaching-formation/data-engineering-bootcamp";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>
          Créé par <strong>MAMADOU YOUSSOUF DIAKITE</strong>
        </p>
        <p className="site-footer__center">
          © 2026 From Zero to Hero · Bootcamp Data Engineering
          <br />
          Contenu sous licence CC BY-NC-SA 4.0 · Usage commercial interdit
          <br />
          💬{" "}
          <a href="https://t.me/fromzerotoherodataeng" target="_blank" rel="noreferrer">
            Communauté Telegram
          </a>
        </p>
        <div className="site-footer__links">
          <a href={GITHUB} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://linkedin.com/in/diakite-data" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
