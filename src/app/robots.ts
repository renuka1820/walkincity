import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/login", "/auth/"] },
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
