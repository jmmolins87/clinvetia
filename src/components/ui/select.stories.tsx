import type { Meta, StoryObj } from "@storybook/react"

import { Select } from "./select"

const meta = {
  title: "Design System/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
    layout: "centered",
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[280px]">
      <Select defaultValue="demo">
        <option value="demo">demo</option>
        <option value="superadmin">superadmin</option>
      </Select>
    </div>
  ),
}
