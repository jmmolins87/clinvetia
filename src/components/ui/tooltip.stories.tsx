import type { Meta, StoryObj } from "@storybook/react"
import { HelpCircle, Clock } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
import { Button } from "./button"
import { Icon } from "./icon"

/**
 * Tooltip inteligente con soporte para variantes de cristal neón.
 */
const meta = {
  title: "Design System/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex h-32 items-center justify-center">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <Icon icon={HelpCircle} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Información de ayuda estándar</p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const Warning: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning cursor-pointer">
          <Clock className="h-6 w-6" />
        </div>
      </TooltipTrigger>
      <TooltipContent variant="warning" className="flex items-center gap-2">
        <Clock className="h-3 w-3" />
        <p className="font-bold">Reserva a punto de expirar</p>
      </TooltipContent>
    </Tooltip>
  ),
}
