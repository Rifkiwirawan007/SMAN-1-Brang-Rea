import type { MetadataRoute } from "next";
import { URL_SITUS } from "@/lib/situs-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/masuk", "/api"] },
    sitemap: `${URL_SITUS}/sitemap.xml`,
  };
}
