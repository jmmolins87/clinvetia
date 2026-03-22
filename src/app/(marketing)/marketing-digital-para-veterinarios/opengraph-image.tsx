import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("marketing-digital-para-veterinarios")

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "Marketing veterinario",
    title: config.metaTitle,
    description: config.metaDescription,
    footerLabel: "Marketing veterinario",
  })
}
