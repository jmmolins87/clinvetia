import type { Meta, StoryObj } from "@storybook/react"
import { Separator } from "./separator"

/**
 * Separador visual entre contenidos.
 */
const meta = {
  title: "Design System/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">ClinvetIA Core</h4>
        <p className="text-sm text-muted-foreground">
          Biblioteca de componentes base.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Zustand</div>
        <Separator orientation="vertical" />
        <div>Radix UI</div>
        <Separator orientation="vertical" />
        <div>Tailwind</div>
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Opción A</div>
      <Separator orientation="vertical" />
      <div>Opción B</div>
      <Separator orientation="vertical" />
      <div>Opción C</div>
    </div>
  ),
}
