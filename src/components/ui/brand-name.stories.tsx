import type { Meta, StoryObj } from "@storybook/react"
import { BrandName } from "./brand-name"

/**
 * Identidad visual de la marca con gradiente corporativo.
 */
const meta = {
  title: "Brand/BrandName",
  component: BrandName,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BrandName>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Large: Story = {
  args: {
    className: "text-4xl font-bold",
  },
}

export const ExtraLarge: Story = {
  args: {
    className: "text-7xl font-extrabold tracking-tighter",
  },
}
