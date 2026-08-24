import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { LanguageProvider } from "../components/LanguageProvider";
import { SITE_READY } from "../lib/data";
import { THEME_BOOT_SCRIPT } from "../lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Strategic counsel for complex matters — ASP | Arifudin Susanto Partnership",
    template: "%s — ASP | Arifudin Susanto Partnership",
  },
  description:
    "Arifudin Susanto Partnership advises on bankruptcy, PKPU, restructuring, litigation and arbitration in Indonesia.",
  // Phase 3 build: content is still incomplete in real places (21 of 23
  // lawyer bios, 12 practice overviews, all articles — see
  // docs/content-requests.md). Never let a search engine index that.
  // Flip with SITE_READY once Phases 6/7 close, per docs/07-qa.md §8.
  robots: SITE_READY ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Sets data-theme before first paint — no flash of the wrong theme.
            Identical on every route; picked up by the CSP hash build step
            automatically (see lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Lora:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="is-ready">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
