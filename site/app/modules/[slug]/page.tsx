import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allSlugs, getNotebook } from "@/lib/notebooks";
import { prevNext, levelOf } from "@/lib/nav";
import TableOfContents from "@/components/TableOfContents";
import CopyButtons from "@/components/CopyButtons";
import PrintButton from "@/components/PrintButton";

export const dynamicParams = false;

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nb = getNotebook(slug);
  if (!nb) return { title: "Module introuvable" };
  return {
    title: nb.title,
    description: `${nb.item.title} — Bootcamp Data Engineering.`,
    alternates: { canonical: `/modules/${slug}/` },
    openGraph: {
      title: nb.title,
      description: `${nb.item.title} — Bootcamp Data Engineering.`,
      url: `/modules/${slug}/`,
    },
  };
}

const SITE = "https://dataeng.from0tohero.dev";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nb = getNotebook(slug);
  if (!nb) notFound();

  const { prev, next } = prevNext(slug);
  const level = levelOf(slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: level?.label ?? "Programme", item: `${SITE}/curriculum/` },
      { "@type": "ListItem", position: 3, name: nb.title, item: `${SITE}/modules/${slug}/` },
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
          <p className="module-header__crumb">{level?.label}</p>
        </div>

        <div className="module-actions">
          <PrintButton />
        </div>

        <div className="notebook-content" dangerouslySetInnerHTML={{ __html: nb.html }} />
        <CopyButtons />

        <nav className="prevnext">
          {prev ? (
            <Link className="prev" href={`/modules/${prev.slug}/`}>
              <div className="prevnext__dir">← Précédent</div>
              <div className="prevnext__title">{prev.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="next" href={`/modules/${next.slug}/`}>
              <div className="prevnext__dir">Suivant →</div>
              <div className="prevnext__title">{next.title}</div>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <aside className="community-cta">
          <p className="community-cta__title">💬 Une question sur ce module ?</p>
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
