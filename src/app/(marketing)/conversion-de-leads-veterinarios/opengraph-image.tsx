import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("conversion-de-leads-veterinarios")

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "Conversión veterinaria",
    title: config.metaTitle,
    description: config.metaDescription,
    footerLabel: "Conversión de leads",
  })
}
