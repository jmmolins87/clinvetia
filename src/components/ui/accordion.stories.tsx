import type { Meta, StoryObj } from "@storybook/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const meta = {
  title: "Design System/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Componente de accordion/colapsable estilo **Liquid Glass**.

Usa Radix UI para accesibilidad y comportamiento nativo.
- Expande/colapsa con animación suave
- Soporte para múltiples items abiertos a la vez
- Estilos glass con bordes sutiles
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
      description: "Modo de expansión: single (uno solo) o multiple (varios)",
    },
    defaultValue: {
      control: "text",
      description: "Valor inicial del item abierto",
    },
    collapsible: {
      control: "boolean",
      description: "Permite cerrar el único item abierto",
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "single",
    defaultValue: "item-1",
    collapsible: true,
    className: "w-full max-w-xl",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>¿Qué es ClinvetIA?</AccordionTrigger>
        <AccordionContent>
          ClinvetIA es un asistente de inteligencia artificial especializado para clínicas veterinarias que te ayuda a gestionar clientes, optimizar procesos y aumentar tus ingresos de forma automática.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>¿Cuánto tiempo tarda en instalarse?</AccordionTrigger>
        <AccordionContent>
          La instalación es muy rápida. En menos de 24 horas tendrás el sistema funcionando y nuestro equipo te ayudará a configurarlo según las necesidades de tu clínica.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>¿Necesito conocimientos técnicos?</AccordionTrigger>
        <AccordionContent>
          No necesitas ningún conocimiento técnico. ClinvetIA está diseñado para que cualquier persona de tu clínica pueda usarlo sin formación previa.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: Story = {
  name: "Multiple (varios abiertos)",
  args: {
    type: "multiple",
    defaultValue: ["item-1", "item-2"],
    className: "w-full max-w-xl",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>¿Qué es ClinvetIA?</AccordionTrigger>
        <AccordionContent>
          ClinvetIA es un asistente de inteligencia artificial especializado para clínicas veterinarias.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>¿Cuánto tiempo tarda en instalarse?</AccordionTrigger>
        <AccordionContent>
          La instalación es muy rápida. En menos de 24 horas tendrás el sistema funcionando.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>¿Necesito conocimientos técnicos?</AccordionTrigger>
        <AccordionContent>
          No necesitas ningún conocimiento técnico. ClinvetIA está diseñado para ser intuitivo.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  args: {
    type: "single",
    defaultValue: "item-1",
    collapsible: true,
    className: "w-full max-w-xl",
  },
  render: (args) => (
    <div className="flex flex-col gap-3 w-full max-w-xl">
      <Accordion {...args}>
        <AccordionItem value="item-1">
          <AccordionTrigger>¿Qué es ClinvetIA?</AccordionTrigger>
          <AccordionContent>
            ClinvetIA es un asistente de inteligencia artificial especializado para clínicas veterinarias.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>¿Cuánto tiempo tarda en instalarse?</AccordionTrigger>
          <AccordionContent>
            La instalación es muy rápida. En menos de 24 horas tendrás el sistema funcionando.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}
