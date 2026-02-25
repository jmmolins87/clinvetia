import type { Meta, StoryObj } from "@storybook/react"
import { GlobalBackground } from "./global-background"
import { SectionBackground } from "./section-background"

/**
 * Sistema de fondos animados con orbes neón y mallas de puntos.
 * Proporcionan profundidad y dinamismo visual a la plataforma.
 */
const meta = {
  title: "Design System/Backgrounds",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

export const Global: StoryObj<typeof GlobalBackground> = {
  render: () => (
    <div className="relative min-h-[600px] w-full bg-background overflow-hidden border border-white/10 rounded-xl m-4">
      <GlobalBackground />
      <div className="relative z-10 p-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Fondo Global</h2>
        <p className="text-muted-foreground">Orbes flotantes y malla de puntos de 40px.</p>
      </div>
    </div>
  ),
}

export const SectionMixed: StoryObj<typeof SectionBackground> = {
  render: () => (
    <div className="relative min-h-[400px] w-full bg-background overflow-hidden border border-white/10 rounded-xl m-4">
      <SectionBackground variant="mixed" />
      <div className="relative z-10 p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Fondo de Sección (Mixed)</h2>
        <p className="text-muted-foreground">Variante con orbes de múltiples colores corporativos.</p>
      </div>
    </div>
  ),
}

export const SectionPrimary: StoryObj<typeof SectionBackground> = {
  render: () => (
    <div className="relative min-h-[400px] w-full bg-background overflow-hidden border border-white/10 rounded-xl m-4">
      <SectionBackground variant="primary" />
      <div className="relative z-10 p-12 text-center text-primary">
        <h2 className="text-2xl font-bold mb-4">Fondo Primario</h2>
      </div>
    </div>
  ),
}
