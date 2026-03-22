import type { MetadataRoute } from "next"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"

const routes = [
  { path: "", lastModified: "2026-03-21", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/demo", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/calculadora", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/contacto", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/solucion", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/como-funciona", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/escenarios", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/agencia-marketing-veterinaria", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/faqs", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/software-veterinario-con-ia", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/automatizacion-clinica-veterinaria", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/gestion-de-citas-veterinarias", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/triaje-veterinario-con-ia", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/chatbot-para-clinicas-veterinarias", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/recordatorios-veterinarios-automaticos", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/captacion-de-leads-para-clinicas-veterinarias", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/marketing-digital-para-veterinarios", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/seguimiento-comercial-para-clinicas-veterinarias", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/conversion-de-leads-veterinarios", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/whatsapp-para-clinicas-veterinarias", lastModified: "2026-03-22", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/automatizacion-de-leads-veterinarios", lastModified: "2026-03-22", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/embudo-de-citas-veterinarias", lastModified: "2026-03-22", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/crm-para-clinicas-veterinarias", lastModified: "2026-03-22", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/whatsapp-business-para-veterinarias", lastModified: "2026-03-22", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/seguimiento-postoperatorio-veterinario", lastModified: "2026-03-22", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/recepcion-veterinaria-con-ia", lastModified: "2026-03-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/recursos-ia-veterinaria", lastModified: "2026-03-21", changeFrequency: "weekly" as const, priority: 0.85 },
  { path: "/privacy", lastModified: "2026-02-01", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", lastModified: "2026-02-01", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/security", lastModified: "2026-02-01", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/cookies", lastModified: "2026-02-01", changeFrequency: "yearly" as const, priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${appUrl}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
