"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { BookingCalendar, BookingSection } from "@/components/marketing/booking-calendar"

const meta = {
  title: "Marketing/BookingCalendar",
  component: BookingCalendar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Calendario de reserva de demo con estilo **Liquid Glass**.

Flujo de 3 pasos:
1. **Calendario** — el usuario elige mes, duración y día disponible (L–V)
2. **Horarios** — selecciona una franja horaria libre
3. **Confirmación** — resumen antes de confirmar
4. **Éxito** — pantalla de confirmación final

Componentes DS utilizados internamente: \`GlassCard\`, \`Button\`, \`Badge\`, \`Avatar\`, \`AvatarGroup\`.
        `,
      },
    },
  },
} satisfies Meta<typeof BookingCalendar>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Estado inicial — ningún día seleccionado. El panel de horarios muestra el placeholder.",
      },
    },
  },
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <BookingCalendar />
    </div>
  ),
}

export const WithCallback: Story = {
  name: "Con callback onBooked",
  parameters: {
    docs: {
      description: {
        story: "Completa el flujo y observa el `onBooked` en el panel Actions de Storybook.",
      },
    },
  },
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <BookingCalendar
        onBooked={(date, time, duration) => {
          console.log("Demo reservada:", { date, time, duration })
        }}
      />
    </div>
  ),
}

export const AsSection: Story = {
  name: "BookingSection (con encabezado)",
  parameters: {
    docs: {
      description: {
        story: "Versión completa con encabezado de sección, badge y descripción — lista para integrar en cualquier página.",
      },
    },
  },
  render: () => (
    <div className="min-h-screen bg-background">
      <BookingSection id="demo" />
    </div>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <BookingCalendar />
    </div>
  ),
}
