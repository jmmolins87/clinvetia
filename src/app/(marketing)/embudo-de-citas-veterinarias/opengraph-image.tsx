import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("embudo-de-citas-veterinarias")

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "Embudo comercial",
    title: config.metaTitle,
    description: config.metaDescription,
    footerLabel: "Embudo de citas",
  })
}
