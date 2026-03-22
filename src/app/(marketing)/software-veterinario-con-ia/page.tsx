import type { Metadata } from "next"

import { SeoLandingPage } from "@/components/marketing/seo-landing-page"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("software-veterinario-con-ia")

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  alternates: {
    canonical: `/${config.slug}`,
  },
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
    url: `/${config.slug}`,
  },
  twitter: {
    card: "summary_large_image",
    title: config.metaTitle,
    description: config.metaDescription,
  },
}

export default function SoftwareVeterinarioConIaPage() {
  return <SeoLandingPage config={config} />
}
