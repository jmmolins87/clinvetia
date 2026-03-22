import type { Metadata } from "next"

import { SeoLandingPage } from "@/components/marketing/seo-landing-page"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("marketing-digital-para-veterinarios")

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

export default function MarketingDigitalParaVeterinariosPage() {
  return <SeoLandingPage config={config} />
}
