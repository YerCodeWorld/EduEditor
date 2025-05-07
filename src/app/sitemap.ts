import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://edu-text-phi.vercel.app`,
      lastModified: new Date(),
      priority: 1
    },
    {
      url: `https://edu-text-phi.vercel.app`,
      lastModified: new Date(),
      priority: 0.8
    }
  ];
}
