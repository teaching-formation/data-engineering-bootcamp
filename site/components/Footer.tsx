import Link from "next/link";

const GITHUB = "https://github.com/teaching-formation/data-engineering-bootcamp";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__cols">
        <div className="site-footer__col">
          <h4>Apprendre</h4>
          <Link href="/modules/beginner__01_intro_data_engineering/">Programme</Link>
          <Link href="/curriculum/">Programme complet</Link>
        </div>
        <div className="site-footer__col">
          <h4>Ressources</h4>
          <Link href="/documentation/">Documentation</Link>
          <Link href="/setup/">Setup environnement</Link>
          <Link href="/faq/">FAQ</Link>
          <Link href="/links/">Liens utiles</Link>
        </div>
        <div className="site-footer__col">
          <h4>Pour Organisations</h4>
          <Link href="/consulting/">Consulting</Link>
          <Link href="/formations/">Formations</Link>
          <Link href="/support/">Soutenir le projet</Link>
        </div>
        <div className="site-footer__col">
          <h4>Communauté</h4>
          <a href="https://t.me/fromzerotoherodataeng" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href={GITHUB} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://dataana.from0tohero.dev" target="_blank" rel="noreferrer">
            📊 Bootcamp Data Analyst ↗
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>
          Créé par <strong>MAMADOU YOUSSOUF DIAKITE</strong> · © 2026 From Zero to Hero
        </p>
        <p>Contenu sous licence CC BY-NC-SA 4.0 · Usage commercial interdit</p>
      </div>
    </footer>
  );
}
