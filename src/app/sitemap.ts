import type { MetadataRoute } from "next"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"

const routes = [
  "",
  "/demo",
  "/calculadora",
  "/contacto",
  "/solucion",
  "/como-funciona",
  "/escenarios",
  "/privacy",
  "/terms",
  "/security",
  "/cookies",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return routes.map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/demo" || path === "/calculadora" || path === "/contacto" ? 0.9 : 0.7,
  }))
}

