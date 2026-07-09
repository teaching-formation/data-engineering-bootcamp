import Link from "next/link";
import { NAV } from "@/lib/nav";

const SKILLS = [
  { icon: "🐍", name: "Python", desc: "pandas · PySpark · FastAPI" },
  { icon: "🗄️", name: "SQL", desc: "PostgreSQL · modélisation" },
  { icon: "⚡", name: "Spark", desc: "batch & streaming distribué" },
  { icon: "🐳", name: "Docker & K8s", desc: "conteneurs · orchestration" },
  { icon: "📨", name: "Kafka", desc: "streaming temps réel" },
  { icon: "🏠", name: "Lakehouse", desc: "Delta · Iceberg · dbt" },
  { icon: "🤖", name: "Data for AI", desc: "RAG · pipelines IA" },
];

export default function Home() {
  const totalModules = NAV.reduce((n, l) => n + l.sections.reduce((m, s) => m + s.items.length, 0), 0);

  return (
    <>
      <section className="hero">
        <div className="hero__grid" aria-hidden />
        <div className="hero__inner">
          <p className="hero__kicker">
            <span>⚙️</span> Bootcamp Data Engineering
          </p>
          <div className="hero__divider" />
          <h1 className="hero__title">From Zero to Hero</h1>
          <p className="hero__sub">
            Du débutant au Senior Data Engineer — {totalModules} modules pratiques, du terminal Linux jusqu&apos;à un
            pipeline RAG complet.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary" href="/modules/beginner__01_intro_data_engineering/">
              🚀 Commencer le bootcamp
            </Link>
            <Link className="btn btn--hero-ghost" href="/curriculum/">
              📚 Voir le programme
            </Link>
          </div>
        </div>
      </section>

      <section className="skills-strip">
        <div className="skills-strip__inner">
          {SKILLS.map((s) => (
            <div key={s.name} className="skill">
              <span className="skill__icon">{s.icon}</span>
              <span className="skill__name">{s.name}</span>
              <span className="skill__desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="home">
        <div className="levels-head">
          <h2>Le parcours complet</h2>
          <p>3 niveaux progressifs + un parcours transverse Data Engineering for AI.</p>
        </div>

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
    </>
  );
}
