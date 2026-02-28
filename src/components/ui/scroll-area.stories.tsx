import type { Meta, StoryObj } from "@storybook/react"

import { ScrollArea } from "@/components/ui/scroll-area"

const meta = {
  title: "Design System/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-48 w-full rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="space-y-3 text-sm text-muted-foreground">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3">
            Elemento #{idx + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
