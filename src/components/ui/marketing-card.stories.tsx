import type { Meta, StoryObj } from "@storybook/react"
import { Moon, Phone, Clock, Bell } from "lucide-react"
import { MarketingCard } from "./marketing-card"

/**
 * Tarjetas informativas para secciones de marketing.
 * Incluyen animaciones de entrada y soporte para skeleton.
 */
const meta = {
  title: "Marketing/MarketingCard",
  component: MarketingCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MarketingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: Moon,
    title: "Urgencias nocturnas",
    description: "Un dueño escribe a las 23h. Si tú no estás, alguien más la atiende.",
  },
}

export const SecondaryIcon: Story = {
  args: {
    icon: Phone,
    title: "Recepción desbordada",
    description: "Tu equipo atiende consultas... Cada interrupción suma minutos.",
    iconClassName: "bg-secondary/10",
  },
}

export const Grid: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
      <MarketingCard
        icon={Moon}
        title="Urgencias nocturnas"
        description="Un dueño escribe a las 23h. Si tú no estás, alguien más la atiende."
        index={0}
      />
      <MarketingCard
        icon={Phone}
        title="Recepción desbordada"
        description="Tu equipo atiende consultas... Cada interrupción suma minutos."
        index={1}
        iconClassName="bg-secondary/10"
      />
      <MarketingCard
        icon={Clock}
        title="Citas que se escapan"
        description="Tardas 2 horas en responder... Cliente perdido."
        index={2}
      />
      <MarketingCard
        icon={Bell}
        title="Recordatorios manuales"
        description="Todo requiere llamadas... depende de la memoria."
        index={3}
        iconClassName="bg-secondary/10"
      />
    </div>
  ),
}
