import type { Meta, StoryObj } from "@storybook/react"
import { ScrollArea } from "./scroll-area"
import { Separator } from "./separator"

/**
 * Área de scroll personalizada basada en Radix UI.
 */
const meta = {
  title: "Design System/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `Versión v1.2.${a.length - i}`
)

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border border-white/10 bg-white/5">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Logs de Sistema</h4>
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
            <Separator className="my-2 opacity-50" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border border-white/10 bg-white/5">
      <div className="flex w-max p-4 space-x-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-40 w-32 shrink-0 rounded-md bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
            <span className="text-primary font-bold">Tarjeta</span>
            <span className="text-xs opacity-60">ID: 00{i + 1}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
