import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "highlight.js/styles/base16/dracula.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import GoogleTranslate from "@/components/GoogleTranslate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

const GA_ID = "G-NZSBZFMZN7";

export const metadata: Metadata = {
  metadataBase: new URL("https://dataeng.from0tohero.dev"),
  title: {
    default: "Bootcamp Data Engineering — From Zero to Hero",
    template: "%s · Bootcamp Data Engineering",
  },
  description:
    "Programme complet Data Engineering — Du débutant au Senior Engineer. Python, SQL, Spark, Kafka, Kubernetes, Lakehouse, dbt et Data Engineering for AI.",
  keywords: ["data engineering", "spark", "kafka", "python", "kubernetes", "lakehouse", "dbt", "bootcamp", "formation"],
  authors: [{ name: "Mamadou Youssouf Diakité" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Bootcamp Data Engineering",
    title: "Bootcamp Data Engineering — From Zero to Hero",
    description: "Du débutant au Senior Engineer : Python, SQL, Spark, Kafka, Kubernetes, Lakehouse et IA.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Bootcamp Data Engineering — From Zero to Hero" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@diakite_data",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ReadingProgress />
        <Header />
        <main>{children}</main>
        <div style={{ display: "none" }}>
          <GoogleTranslate />
        </div>
        <Footer />
        <BackToTop />

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
