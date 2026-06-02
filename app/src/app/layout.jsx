import "./globals.css";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/jetbrains-mono";
import { GeistSans } from "geist/font/sans";
import { getServerSession } from "next-auth/next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { TopBar } from "./components/top-bar";
import { Footer } from "./components/footer";
import { SmoothScroll } from "./components/smooth-scroll";

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
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KR6T4LVH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KR6T4LVH');`,
          }}
        />
        <Script
          id="gtm-hotjar"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3792495,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
          }}
        />
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
      </body>
    </html>
  );
}
