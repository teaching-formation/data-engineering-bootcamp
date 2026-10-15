import type { MetadataRoute } from "next";
import { allAtelierSlugs, allSlugs } from "@/lib/notebooks";
import { allPageSlugs } from "@/lib/pages";

const BASE = "https://dataeng.from0tohero.dev";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-12");
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];
  for (const slug of allPageSlugs()) {
    entries.push({ url: `${BASE}/${slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const slug of allSlugs()) {
    entries.push({ url: `${BASE}/modules/${slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }
  entries.push({ url: `${BASE}/ateliers/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  for (const slug of allAtelierSlugs()) {
    entries.push({ url: `${BASE}/ateliers/${slug}/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }
  return entries;
}
