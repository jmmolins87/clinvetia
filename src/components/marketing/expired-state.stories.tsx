import type { Meta, StoryObj } from "@storybook/react"
import { Clock } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

/**
 * Estado de expiración que se muestra cuando el usuario supera los 10 minutos
 * permitidos para completar el formulario tras reservar una demo.
 */
const meta = {
  title: "Marketing/ExpiredState",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta

export default meta

export const Default: StoryObj = {
  render: () => (
    <div className="w-80">
      <GlassCard className="p-8 border-warning/40 bg-warning/5 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/20 text-warning shadow-[0_0_20px_rgba(var(--warning-rgb),0.3)]">
          <Icon icon={Clock} size="lg" variant="warning" className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-warning text-xl">Reserva expirada</p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Han pasado más de 10 minutos. Para garantizar la disponibilidad del equipo, debes volver a elegir un horario.
          </p>
        </div>
        <Button variant="default" size="lg" className="w-full bg-warning hover:bg-warning/90 text-warning-foreground">
          Nueva reserva
        </Button>
      </GlassCard>
    </div>
  ),
}
