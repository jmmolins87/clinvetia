import type { Meta, StoryObj } from "@storybook/react"

import { Toggle } from "./toggle"

const meta = {
  title: "Design System/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
    layout: "centered",
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toggle defaultPressed variant="accent">Accent</Toggle>
      <Toggle variant="outline">Outline</Toggle>
      <Toggle variant="warning">Warning</Toggle>
      <Toggle variant="secondary">Secondary</Toggle>
      <Toggle variant="destructive">Destructive</Toggle>
    </div>
  ),
}

