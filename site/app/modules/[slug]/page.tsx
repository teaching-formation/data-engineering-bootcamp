import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allSlugs, getNotebook } from "@/lib/notebooks";
import { prevNext, levelOf } from "@/lib/nav";
import TableOfContents from "@/components/TableOfContents";
import CopyButtons from "@/components/CopyButtons";
import PrintButton from "@/components/PrintButton";
import Comments from "@/components/Giscus";

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
    openGraph: { title: nb.title, description: `${nb.item.title} — Bootcamp Data Engineering.` },
  };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nb = getNotebook(slug);
  if (!nb) notFound();

  const { prev, next } = prevNext(slug);
  const level = levelOf(slug);

  return (
    <div className="doc">
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

        <Comments />
      </article>

      <TableOfContents toc={nb.toc} />
    </div>
  );
}
