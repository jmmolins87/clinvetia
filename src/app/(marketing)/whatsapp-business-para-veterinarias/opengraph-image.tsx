import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("whatsapp-business-para-veterinarias")

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "WhatsApp Business",
    title: config.metaTitle,
    description: config.metaDescription,
    footerLabel: "Canal conversacional",
  })
}
