//app/sitemap.js

import { httpService } from "@/services/httpService";
import { APP_COUNTRY } from "@/app/config";

// Sitemap configuration
export const dynamic = 'force-dynamic'; // To ensure dynamic generation of the sitemap

export default async function getSitemap() {
  const { ok, data } = await httpService.post(`/search?timestamp=${new Date().getTime()}`);

  const extension = APP_COUNTRY === "nl" ? APP_COUNTRY : "es";

  // Array to hold all URLs
  const urls = [
    {
      url: `https://findyourcofounder.${extension}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `https://findyourcofounder.${extension}/gdpr`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `https://findyourcofounder.${extension}/concept`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `https://findyourcofounder.${extension}/legale`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    }
  ];

  // Loop through dynamic users and add to URLs array
  (data?.users || []).forEach((item) => {
    urls.push({
      url: `https://findyourcofounder.${extension}/contact/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
  });

  return urls

  // Return the correct structure for the sitemap
  // return urls.map(({ url, lastModified, changeFrequency, priority }) => ({
  //   loc: url,
  //   lastmod: lastModified.toISOString(),
  //   changefreq: changeFrequency,
  //   priority,
  // }));
}