import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export statique : génère un dossier `out/` déployable sur Vercel (ou tout hébergeur statique)
  output: "export",
  // Chaque route devient un dossier avec index.html (URLs propres, compatibles statique)
  trailingSlash: true,
  // Pas d'optimisation d'image serveur en export statique
  images: { unoptimized: true },
};

export default nextConfig;
