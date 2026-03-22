import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"
import { getSeoLandingConfig } from "@/lib/seo-landings"

const config = getSeoLandingConfig("whatsapp-para-clinicas-veterinarias")

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "WhatsApp veterinario",
    title: config.metaTitle,
    description: config.metaDescription,
    footerLabel: "WhatsApp y citas",
  })
}
