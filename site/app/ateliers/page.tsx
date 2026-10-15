import Link from "next/link";
import type { Metadata } from "next";
import { ATELIERS, ATELIERS_ACCENT } from "@/lib/nav";
import { allAtelierSlugs } from "@/lib/notebooks";

export const metadata: Metadata = {
  title: "Ateliers",
  description:
    "Un sujet de Data Engineering creusé à fond, à ton rythme : des notebooks d'exercices vérifiés, à côté du parcours.",
  alternates: { canonical: "/ateliers/" },
};

export default function AteliersPage() {
  const publies = new Set(allAtelierSlugs());

  return (
    <div className="doc">
      <article className="doc__main">
        <div className="notebook-content">
          <h1>🛠️ Ateliers</h1>
          <p>
            <strong>Un sujet, creusé à fond, à ton rythme.</strong> Le parcours survole certains sujets en quelques
            lignes ; un atelier les reprend de zéro et te les fait construire, exercice après exercice. Chaque
            exercice se vérifie tout seul, et sa solution est à portée de clic.
          </p>
          <p>
            Les ateliers ne changent rien au parcours : fais-les quand tu veux, dans l&apos;ordre que tu veux. Chacun
            s&apos;ouvre dans Google Colab, sans rien installer.
          </p>
        </div>

        {ATELIERS.map((section) => (
          <section key={section.title} style={{ marginTop: 28 }}>
            <div className="notebook-content">
              <h2>{section.title}</h2>
            </div>
            <div className="levels">
              {section.items
                .filter((a) => publies.has(a.slug))
                .map((a) => (
                  <div key={a.slug} className="level-card" style={{ ["--accent" as string]: ATELIERS_ACCENT }}>
                    <div className="level-card__head">
                      <h2>{a.title}</h2>
                    </div>
                    <ul className="level-card__sections">
                      <li>{a.resume}</li>
                      <li>Prérequis : {a.prerequis}</li>
                    </ul>
                    <Link className="level-card__link" href={`/ateliers/${a.slug}/`}>
                      Ouvrir l&apos;atelier →
                    </Link>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
