import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { DOWNLOAD_URLS, GITHUB_URL } from "../links";
import "./globals.css";

const title = "GeoHelper - GeoGuessr Steam Coordinates Helper";
const description =
  "GeoHelper helps GeoGuessr Steam players view live coordinates, country, road and postcode data for solo practice and location analysis. Free, open source and available for Windows, macOS and Linux.";
const siteUrl = "https://geohelperapp.vercel.app";

export const metadata: Metadata = {
  applicationName: "GeoHelper",
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
    siteName: "GeoHelper",
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

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GeoHelper",
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
    softwareRequirements: "GeoGuessr for Steam with localhost CDP enabled",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: "wiktorekdev",
      url: "https://github.com/wiktorekdev",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Will I get banned?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you use it in ranked or online multiplayer, eventually yes. GeoHelper is built for solo play, custom maps and training. Read GeoGuessr's ToS.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work on Mac and Linux?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Builds are produced for all three OSes. Your GeoGuessr Steam client still needs to expose CDP on localhost:9222 the same way it does on Windows. If that works for you, GeoHelper works.",
        },
      },
      {
        "@type": "Question",
        name: "Why macOS shows a security warning",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Because the build is not code-signed with an Apple Developer ID. Right-click the app and pick Open once, or run xattr -dr com.apple.quarantine on it. After that it launches normally.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work with GeoGuessr in the browser?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The browser version doesn't expose a CDP endpoint to the outside world the way the Steam client does with those launch flags. Steam only for now. A browser extension is on the roadmap.",
        },
      },
    ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
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
