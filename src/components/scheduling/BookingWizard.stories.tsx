import type { Meta, StoryObj } from "@storybook/react"

import { BookingWizard } from "./BookingWizard"

const meta = {
  title: "Scheduling/BookingWizard",
  component: BookingWizard,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
    layout: "centered",
  },
} satisfies Meta<typeof BookingWizard>

export default meta

type Story = StoryObj<typeof meta>

function mockAvailability() {
  return {
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "15:00", "15:30", "16:00", "16:30"],
    unavailable: ["09:30", "11:30", "15:30"],
  }
}

export const Default: Story = {
  args: {
    className: "w-[min(92vw,720px)]",
    title: "Reserva tu demo",
    subtitle: "Selecciona día, horario y confirma la videollamada",
    confirmCtaLabel: "Confirmar reserva",
    confirmingLabel: "Confirmando...",
    loadAvailability: async () => {
      await new Promise((resolve) => setTimeout(resolve, 250))
      return mockAvailability()
    },
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))
    },
  },
}

export const RescheduleAdmin: Story = {
  args: {
    className: "w-[min(92vw,760px)]",
    title: "Reagendar cita",
    subtitle: "Selecciona un nuevo día y confirma el nuevo horario",
    confirmCtaLabel: "Confirmar reagendado",
    showDurationSelector: true,
    initialDuration: 45,
    loadAvailability: async () => mockAvailability(),
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600))
    },
  },
}

