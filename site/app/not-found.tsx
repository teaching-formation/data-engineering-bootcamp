import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="notfound__code">404</p>
      <h1 className="notfound__title">Page introuvable</h1>
      <p className="notfound__text">La page que tu cherches n&apos;existe pas ou a été déplacée.</p>
      <div className="notfound__cta">
        <Link className="btn btn--primary" href="/">
          ← Retour à l&apos;accueil
        </Link>
        <Link className="btn btn--ghost" href="/curriculum/">
          Voir le programme
        </Link>
      </div>
    </div>
  );
}
