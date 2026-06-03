import "./globals.css";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/jetbrains-mono";
import { GeistSans } from "geist/font/sans";
import { getServerSession } from "next-auth/next";
import { Toaster } from "react-hot-toast";

import { TopBar } from "./components/top-bar";
import { Footer } from "./components/footer";
import { SmoothScroll } from "./components/smooth-scroll";
import { AnalyticsScripts } from "./components/analytics-scripts";
import { ConsentBanner } from "./components/consent-banner";

import Provider from "./auth-provider";
import { authOptions } from "./api/auth/[...nextauth]/route";
import {
  getSiteUrl,
  SITE_URL_NL,
  SITE_URL_ES,
  SITE_LOCALES,
} from "./utils/constants";
import { JsonLd } from "./components/json-ld";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// FYC typography — Geist (body, via the official `geist` package).
// Bricolage Grotesque (display), Instrument Serif (italic accents), and
// JetBrains Mono (small uppercase labels) ship as self-hosted woff2 via
// @fontsource packages so the build never depends on Google Fonts. The
// CSS variables `--font-bricolage`, `--font-instrument`, `--font-jetbrains`
// are defined in globals.css.

const APP_COUNTRY = process.env.APP_COUNTRY ?? "nl";
const SITE_URL = getSiteUrl(APP_COUNTRY);

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "findyourcofounder — find your co-founder",
    template: "%s · findyourcofounder",
  },
  description:
    "A curated index of founders open to meeting their co-founder. Browse by skill, city, and what they want to build — then reach out directly.",
  applicationName: "findyourcofounder",
  keywords: [
    "co-founder",
    "find a co-founder",
    "startup co-founder",
    "technical co-founder",
    "business co-founder",
    "founder matchmaking",
  ],
  authors: [{ name: "findyourcofounder" }],
  alternates: {
    canonical: "/",
    languages: {
      "en-NL": SITE_URL_NL,
      "en-ES": SITE_URL_ES,
      "x-default": SITE_URL_NL,
    },
  },
  openGraph: {
    type: "website",
    siteName: "findyourcofounder",
    url: SITE_URL,
    locale: SITE_LOCALES[APP_COUNTRY] ?? "en_NL",
    alternateLocale: ["en_NL", "en_ES"],
    title: "findyourcofounder — find your co-founder",
    description:
      "A curated index of founders open to meeting their co-founder. Browse by skill, city, and what they want to build.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  twitter: {
    card: "summary_large_image",
    title: "findyourcofounder — find your co-founder",
    description:
      "A curated index of founders open to meeting their co-founder.",
    images: [`${SITE_URL}/twitter-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1ea",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "findyourcofounder",
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  sameAs: [SITE_URL_NL, SITE_URL_ES],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "findyourcofounder",
  url: SITE_URL,
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans">
        <JsonLd data={organizationLd} />
        <JsonLd data={websiteLd} />
        <AnalyticsScripts />
        <Provider session={session}>
          <SmoothScroll>
            <TopBar />
            <Toaster position="top-center" />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </SmoothScroll>
        </Provider>
        <ConsentBanner />
      </body>
    </html>
  );
}
