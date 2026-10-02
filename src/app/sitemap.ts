import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://robo-city.vercel.app";
  const routes = [
    "",
    "/leaderboard",
    "/register",
    "/missions",
    "/gallery",
    "/team",
    "/workshops",
    "/about",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" || route === "/leaderboard" ? "hourly" : "daily",
    priority: route === "" ? 1.0 : route === "/leaderboard" || route === "/register" ? 0.9 : 0.7,
  }));
}
