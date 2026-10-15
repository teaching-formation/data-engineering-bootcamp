import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allAtelierSlugs, getAtelier } from "@/lib/notebooks";
import { prevNextAtelier } from "@/lib/nav";
import TableOfContents from "@/components/TableOfContents";
import CopyButtons from "@/components/CopyButtons";
import PrintButton from "@/components/PrintButton";

export const dynamicParams = false;

export function generateStaticParams() {
  return allAtelierSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nb = getAtelier(slug);
  if (!nb) return { title: "Atelier introuvable" };
  return {
    title: nb.title,
    description: `Atelier ${nb.atelier.title} — ${nb.atelier.resume}`,
    alternates: { canonical: `/ateliers/${slug}/` },
    openGraph: {
      title: nb.title,
      description: `Atelier ${nb.atelier.title} — ${nb.atelier.resume}`,
      url: `/ateliers/${slug}/`,
    },
  };
}

const SITE = "https://dataeng.from0tohero.dev";

export default async function AtelierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nb = getAtelier(slug);
  if (!nb) notFound();

  const { prev, next } = prevNextAtelier(slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Ateliers", item: `${SITE}/ateliers/` },
      { "@type": "ListItem", position: 3, name: nb.title, item: `${SITE}/ateliers/${slug}/` },
    ],
  };

  return (
    <div className="doc">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <article className="doc__main">
        <div className="module-header">
          <p className="module-header__crumb">
            <Link href="/ateliers/">🛠️ Atelier</Link> · {nb.atelier.title}
          </p>
        </div>

        <div className="module-actions">
          <PrintButton />
        </div>

        <div className="notebook-content" dangerouslySetInnerHTML={{ __html: nb.html }} />
        <CopyButtons />

        {(prev || next) && (
          <nav className="prevnext">
            {prev ? (
              <Link className="prev" href={`/ateliers/${prev.slug}/`}>
                <div className="prevnext__dir">← Atelier précédent</div>
                <div className="prevnext__title">{prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="next" href={`/ateliers/${next.slug}/`}>
                <div className="prevnext__dir">Atelier suivant →</div>
                <div className="prevnext__title">{next.title}</div>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <aside className="community-cta">
          <p className="community-cta__title">💬 Une question sur cet atelier ?</p>
          <p className="community-cta__text">
            Rejoins la communauté pour échanger, poser tes questions et progresser avec d&apos;autres apprenants.
          </p>
          <a
            className="btn btn--primary community-cta__btn"
            href="https://t.me/fromzerotoherodataeng"
            target="_blank"
            rel="noreferrer"
          >
            Rejoindre la communauté Telegram →
          </a>
        </aside>
      </article>

      <TableOfContents toc={nb.toc} />
    </div>
  );
}
