import type { Meta, StoryObj } from "@storybook/react"
import { Label } from "./label"
import { Input } from "./input"

/**
 * Etiqueta accesible para elementos de formulario.
 */
const meta = {
  title: "Design System/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email de contacto</Label>
      <Input type="email" id="email" placeholder="doctor@clinica.com" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-destructive">
        Nombre de la Clínica
      </Label>
      <Input type="text" id="name" placeholder="Veterinaria Central" />
    </div>
  ),
}
