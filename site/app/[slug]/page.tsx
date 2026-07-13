import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allPageSlugs, getPage } from "@/lib/pages";
import TableOfContents from "@/components/TableOfContents";
import CopyButtons from "@/components/CopyButtons";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return { title: "Page introuvable" };
  return {
    title: page.title,
    description: `${page.title} — Bootcamp Data Engineering.`,
    alternates: { canonical: `/${slug}/` },
  };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <div className="doc">
      <article className="doc__main">
        <div className="notebook-content" dangerouslySetInnerHTML={{ __html: page.html }} />
        <CopyButtons />
      </article>
      <TableOfContents toc={page.toc} />
    </div>
  );
}
