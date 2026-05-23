import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { FAQ_ENTRIES } from "../faq";
import { DOWNLOAD_URLS, GITHUB_URL } from "../links";
import "./globals.css";

const title = "GeoHelper - GeoGuessr Steam Coordinates Helper";
const description =
  "GeoHelper helps GeoGuessr Steam players view live coordinates, country, road and postcode data for solo practice and location analysis. Free, open source and available for Windows, macOS and Linux.";
const siteUrl = "https://geohelperapp.vercel.app";
const siteName = "GeoHelper";

export const metadata: Metadata = {
  applicationName: siteName,
  title,
  description,
  keywords:
    "geohelper, geoguessr helper, geoguessr steam helper, geoguessr coordinates, geoguessr steam coordinates, geoguessr location helper, geoguessr practice tool, street view coordinates, geoguessr desktop app",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  verification: {
    google: "fH_c54D9l8Lu-cGfWCcl_Ui4rwzzdnLmURaiU9ZAF_0",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description:
      "View live coordinates and location data while practicing GeoGuessr on Steam. Free, open source, no API keys needed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GeoHelper desktop app showing live GeoGuessr coordinates",
      },
    ],
    siteName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Free desktop GeoGuessr helper for Steam coordinates, country, road and postcode data. Open source, no API keys.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: "index, follow",
  authors: [{ name: "wiktorekdev" }],
  creator: "wiktorekdev",
  publisher: siteName,
  category: "software",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const version = process.env.GEOHELPER_VERSION ?? "0.0.0";

  const person = {
    "@type": "Person",
    "@id": "https://github.com/wiktorekdev#person",
    name: "wiktorekdev",
    url: "https://github.com/wiktorekdev",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    alternateName: "GeoHelper App",
    url: `${siteUrl}/`,
    inLanguage: "en",
    publisher: person,
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#software`,
    name: siteName,
    alternateName: [
      "GeoHelper App",
      "GeoGuessr Steam Coordinates Helper",
      "GeoGuessr Coordinates Helper",
    ],
    operatingSystem: "Windows, macOS, Linux",
    applicationCategory: "GameApplication",
    description:
      "GeoHelper is a GeoGuessr Steam helper for live coordinates, country, road and postcode data during solo practice and location analysis.",
    url: siteUrl,
    downloadUrl: [
      DOWNLOAD_URLS.windows,
      DOWNLOAD_URLS.macos,
      DOWNLOAD_URLS.linux,
    ],
    installUrl: DOWNLOAD_URLS.all,
    softwareVersion: version,
    fileSize: "6MB",
    image: `${siteUrl}/og-image.png`,
    screenshot: `${siteUrl}/paris.png`,
    license: "https://opensource.org/licenses/MIT",
    sameAs: [GITHUB_URL],
    isAccessibleForFree: true,
    softwareRequirements: "GeoGuessr for Steam with localhost CDP enabled",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: person,
    publisher: person,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: FAQ_ENTRIES.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a,
      },
    })),
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [website, softwareApp, faqPage],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
