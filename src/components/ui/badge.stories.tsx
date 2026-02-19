import type { Meta, StoryObj } from "@storybook/react"
import { Zap, Circle, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "Design System/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Badge (etiqueta) con estilo **Liquid Glass** — indicador visual compacto para:
- Estados (online, offline, error)
- Categorías (tipo de plan, nivel)
- Contadores y notificaciones

Usa las mismas capas visuales que Button pero en escala reducida.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "accent", "warning"],
      description: "Variante visual del badge",
      table: {
        defaultValue: { summary: "default" },
      },
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Primary", variant: "default" },
}

export const Secondary: Story = {
  args: { children: "Glass", variant: "secondary" },
}

export const Destructive: Story = {
  args: { children: "Error", variant: "destructive" },
}

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
}

export const Accent: Story = {
  args: { children: "Active", variant: "accent" },
}

export const Warning: Story = {
  args: { children: "Warning", variant: "warning" },
}

export const WithIcon: Story = {
  name: "With Icons",
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default"><Zap className="size-3" />Powered</Badge>
      <Badge variant="accent"><Circle className="size-3 fill-current" />Online</Badge>
      <Badge variant="destructive"><AlertTriangle className="size-3" />Critical</Badge>
      <Badge variant="warning"><AlertTriangle className="size-3" />Caution</Badge>
      <Badge variant="secondary"><CheckCircle className="size-3" />Verified</Badge>
    </div>
  ),
}

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(["default", "secondary", "destructive", "outline", "accent", "warning"] as const).map(
        (v) => <Badge key={v} variant={v}>{v}</Badge>
      )}
    </div>
  ),
}

export const InContext: Story = {
  name: "Status Dashboard Context",
  render: () => (
    <div className="liquid-glass rounded-xl p-6 w-80 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">API Status</span>
        <Badge variant="accent"><Circle className="size-2 fill-current" />Operational</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Deploy</span>
        <Badge variant="default"><Zap className="size-3" />v2.4.1</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Database</span>
        <Badge variant="warning">High Load</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Auth Service</span>
        <Badge variant="destructive"><AlertTriangle className="size-3" />Degraded</Badge>
      </div>
    </div>
  ),
}

// ── Dark + Light side-by-side ─────────────────────────────────────────────────
export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(["default", "secondary", "destructive", "outline", "accent", "warning"] as const).map(
        (v) => <Badge key={v} variant={v}>{v}</Badge>
      )}
    </div>
  ),
}
