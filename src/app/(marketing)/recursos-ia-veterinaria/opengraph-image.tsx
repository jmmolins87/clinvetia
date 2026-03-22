import { createSeoSocialImage, socialImageContentType, socialImageSize } from "@/components/marketing/seo-social-image"

export const size = socialImageSize
export const contentType = socialImageContentType

export default function OpenGraphImage() {
  return createSeoSocialImage({
    eyebrow: "Hub SEO",
    title: "Recursos de IA veterinaria",
    description: "Hub de Clinvetia con páginas sobre automatización, citas, triaje, recepción, chatbot y captación para clínicas veterinarias.",
  })
}
