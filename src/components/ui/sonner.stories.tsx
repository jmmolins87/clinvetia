import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "@/components/ui/button"

import { Sonner, toast } from "./sonner"

const meta = {
  title: "Design System/Sonner",
  component: Sonner,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex min-h-[220px] items-center justify-center p-10">
        <Story />
        <Sonner />
      </div>
    ),
  ],
} satisfies Meta<typeof Sonner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success("Cita creada", {
          description: "La cita se ha creado y enviado correctamente.",
        })
      }
    >
      Lanzar Sonner
    </Button>
  ),
}

export const ErrorState: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() =>
        toast.error("No se pudo reagendar", {
          description: "Revisa los datos de la cita e inténtalo de nuevo.",
        })
      }
    >
      Lanzar Error
    </Button>
  ),
}
