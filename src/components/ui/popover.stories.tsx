import type { Meta, StoryObj } from "@storybook/react"
import { Info, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const meta = {
  title: "Design System/Popover",
  component: Popover,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex min-h-[220px] items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon icon={Info} size="sm" />
          Ver detalle
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[240px]">
        Texto completo de apoyo cuando el contenido no cabe dentro de una caja o acción.
      </PopoverContent>
    </Popover>
  ),
}

export const SummaryLabel: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-[120px] rounded-xl border border-accent/60 bg-[rgba(var(--accent-rgb),0.18)] px-3 py-2 text-left"
        >
          <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-accent">
            Reagendadas con seguimiento interno
          </span>
          <span className="mt-1 block text-lg font-semibold text-accent">14</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-[240px]">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Icon icon={CalendarDays} size="xs" variant="accent" />
          Reagendadas con seguimiento interno
        </div>
      </PopoverContent>
    </Popover>
  ),
}
