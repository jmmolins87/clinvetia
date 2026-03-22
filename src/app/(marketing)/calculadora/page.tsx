import { ROICalculator } from "@/components/marketing/roi-calculator"
import { SeoLinkCluster } from "@/components/marketing/seo-link-cluster"

const SEO_CLUSTER_ITEMS = [
  {
    href: "/automatizacion-clinica-veterinaria",
    title: "Automatización clínica veterinaria",
    description: "Conecta el cálculo económico con el sistema que genera ese ahorro y crecimiento.",
  },
  {
    href: "/captacion-de-leads-para-clinicas-veterinarias",
    title: "Captación de leads para clínicas veterinarias",
    description: "Revisa cómo mejorar el retorno desde el primer contacto comercial.",
  },
  {
    href: "/automatizacion-de-leads-veterinarios",
    title: "Automatización de leads veterinarios",
    description: "Aterriza el retorno en velocidad de respuesta, seguimiento y conversión.",
  },
  {
    href: "/recordatorios-veterinarios-automaticos",
    title: "Recordatorios veterinarios automáticos",
    description: "Evalúa el impacto de reducir ausencias y mejorar seguimiento.",
  },
  {
    href: "/gestion-de-citas-veterinarias",
    title: "Gestión de citas veterinarias",
    description: "Relaciona el ROI con una agenda mejor cerrada y mejor atendida.",
  },
  {
    href: "/embudo-de-citas-veterinarias",
    title: "Embudo de citas veterinarias",
    description: "Relaciona el retorno con un recorrido comercial más sólido hasta la agenda.",
  },
] as const

export default function CalculadoraPage() {
  return (
    <>
      <ROICalculator />
      <SeoLinkCluster
        title="Páginas relacionadas para profundizar en el retorno"
        description="Si estás calculando impacto, estas páginas te ayudan a entender de dónde sale el ahorro o el crecimiento."
        items={SEO_CLUSTER_ITEMS}
      />
    </>
  )
}
