import type { MetadataRoute } from "next";

const siteUrl = "https://geohelperapp.vercel.app";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date("2026-05-23"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
