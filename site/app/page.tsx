import Link from "next/link";
import { NAV } from "@/lib/nav";

export default function Home() {
  const totalModules = NAV.reduce((n, l) => n + l.sections.reduce((m, s) => m + s.items.length, 0), 0);

  return (
    <div className="home">
      <section className="hero">
        <p className="hero__kicker">From Zero to Hero</p>
        <h1 className="hero__title">
          Bootcamp <span>Data Engineering</span>
        </h1>
        <p className="hero__sub">
          Du débutant au Senior Engineer. {totalModules} modules pratiques : Python, SQL, Spark, Kafka, Kubernetes,
          Lakehouse, dbt et Data Engineering for AI.
        </p>
        <div className="hero__cta">
          <Link className="btn btn--primary" href="/modules/beginner__01_intro_data_engineering/">
            Commencer le parcours →
          </Link>
          <a
            className="btn btn--ghost"
            href="https://github.com/teaching-formation/data-engineering-bootcamp"
            target="_blank"
            rel="noreferrer"
          >
            ⭐ GitHub
          </a>
        </div>
      </section>

      <section className="levels">
        {NAV.map((level) => {
          const first = level.sections[0]?.items[0];
          const count = level.sections.reduce((m, s) => m + s.items.length, 0);
          return (
            <div key={level.id} className="level-card" style={{ ["--accent" as string]: level.accent }}>
              <div className="level-card__head">
                <h2>{level.label}</h2>
                <span className="level-card__count">{count} modules</span>
              </div>
              <ul className="level-card__sections">
                {level.sections.map((s) => (
                  <li key={s.title}>{s.title}</li>
                ))}
              </ul>
              {first && (
                <Link className="level-card__link" href={`/modules/${first.slug}/`}>
                  Démarrer →
                </Link>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
