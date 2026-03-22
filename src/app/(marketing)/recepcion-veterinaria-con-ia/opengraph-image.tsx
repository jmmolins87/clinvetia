import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("recepcion-veterinaria-con-ia")

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "SEO Landing",
    title: config.metaTitle,
    description: config.metaDescription,
  })
}
