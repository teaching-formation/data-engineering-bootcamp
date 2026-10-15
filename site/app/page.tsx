import type { Metadata } from "next";
import Link from "next/link";
import { ALL_ATELIERS, ATELIERS_ACCENT, NAV } from "@/lib/nav";
import { allAtelierSlugs, nbExercicesAtelier } from "@/lib/notebooks";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const COURSE_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Bootcamp Data Engineering — From Zero to Hero",
  description:
    "Programme complet Data Engineering, du débutant au Senior Engineer : Python, SQL, Spark, Kafka, Kubernetes, Lakehouse, dbt et Data Engineering for AI. Modules pratiques, du terminal Linux jusqu'à un pipeline RAG complet.",
  provider: {
    "@type": "Organization",
    name: "From Zero to Hero",
    url: "https://dataeng.from0tohero.dev",
  },
  url: "https://dataeng.from0tohero.dev",
  inLanguage: "fr-FR",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
};

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
  const publies = new Set(allAtelierSlugs());
  const ateliers = ALL_ATELIERS.filter((a) => publies.has(a.slug));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSE_LD) }}
      />
      <section className="hero">
        <div className="hero__grid" aria-hidden />
        <div className="hero__inner">
          <p className="hero__kicker">
            <span>⚙️</span> Bootcamp · From Zero to Hero
          </p>
          <div className="hero__divider" />
          <h1 className="hero__title">Data Engineering</h1>
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

        {ateliers.length > 0 && (
          <section className="ateliers-home" aria-labelledby="ateliers-titre">
            <div className="levels-head">
              <h2 id="ateliers-titre">🛠️ Les ateliers</h2>
              <p>Un sujet creusé à fond, à ton rythme — à côté du parcours, sans le modifier.</p>
            </div>
            <div className="levels">
              {ateliers.map((a) => {
                const n = nbExercicesAtelier(a.slug);
                return (
                  <div key={a.slug} className="level-card" style={{ ["--accent" as string]: ATELIERS_ACCENT }}>
                    <div className="level-card__head">
                      <h2>{a.title}</h2>
                      <span className="level-card__count">{n} exercices</span>
                    </div>
                    <ul className="level-card__sections">
                      <li>{a.resume}</li>
                      <li>Prérequis : {a.prerequis}</li>
                    </ul>
                    <Link className="level-card__link" href={`/ateliers/${a.slug}/`}>
                      Ouvrir l&apos;atelier →
                    </Link>
                  </div>
                );
              })}
              <div className="level-card" style={{ ["--accent" as string]: ATELIERS_ACCENT }}>
                <div className="level-card__head">
                  <h2>Comment ça marche</h2>
                  <span className="level-card__count">
                    {ateliers.length} {ateliers.length > 1 ? "ateliers" : "atelier"}
                  </span>
                </div>
                <ul className="level-card__sections">
                  <li>📓 Un notebook Jupyter autonome, qui installe lui-même ce dont il a besoin</li>
                  <li>✅ Des exercices qui se vérifient tout seuls, la solution à portée de clic</li>
                  <li>🧭 À côté du parcours : tu le fais quand tu veux, il ne change rien à ta progression</li>
                </ul>
                <Link className="level-card__link" href="/ateliers/">
                  Tous les ateliers →
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="interview-cta">
          <div className="interview-cta__text">
            <p className="interview-cta__kicker">🎯 Préparation entretien</p>
            <h2>Le programme t&apos;apprend. L&apos;entretien te juge.</h2>
            <p>
              Des questions réellement posées en entretien Data Engineer, avec <strong>trois réponses graduées</strong> —
              junior, confirmé, senior. Tu ne mémorises pas une réponse : tu comprends le niveau attendu.
            </p>
          </div>
          <Link className="btn btn--primary" href="/entretien-questions/">
            Voir les questions →
          </Link>
        </section>
      </div>
    </>
  );
}
