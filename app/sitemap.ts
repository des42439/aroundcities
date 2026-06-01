import type { MetadataRoute } from "next";
import { getActivePhotos } from "@/lib/photos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.aroundcities.my";

  const photos = await getActivePhotos();

  const photoPages = photos.map((photo) => ({
    url: `${baseUrl}/photo/${photo.photo_id}`,
    lastModified: photo.updated_at
      ? new Date(photo.updated_at)
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    {
      url: `${baseUrl}/kch`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    ...photoPages,
  ];
}