import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clinvetia",
    short_name: "Clinvetia",
    description: "Software veterinario potenciado con IA para atención, triaje y agenda.",
    start_url: "/",
    display: "standalone",
    background_color: "#070b11",
    theme_color: "#43e97b",
    lang: "es-ES",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
