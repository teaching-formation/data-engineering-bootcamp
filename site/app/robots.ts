import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://dataeng.from0tohero.dev/sitemap.xml",
    host: "https://dataeng.from0tohero.dev",
  };
}
