import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://homes.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects", "/projects/", "/about", "/contact", "/services", "/blogs"],
        disallow: ["/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
