import type { Meta, StoryObj } from "@storybook/react"
import { Zap, Circle, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"

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
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<Badge variant="default">Primary</Badge>`,
      },
    },
  },
}

export const Secondary: Story = {
  args: { children: "Glass", variant: "secondary" },
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<Badge variant="secondary">Glass</Badge>`,
      },
    },
  },
}

export const Destructive: Story = {
  args: { children: "Error", variant: "destructive" },
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<Badge variant="destructive">Error</Badge>`,
      },
    },
  },
}

export const Outline: Story = {
  args: { children: "Outline", variant: "outline" },
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<Badge variant="outline">Outline</Badge>`,
      },
    },
  },
}

export const Accent: Story = {
  args: { children: "Active", variant: "accent" },
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<Badge variant="accent">Active</Badge>`,
      },
    },
  },
}

export const Warning: Story = {
  args: { children: "Warning", variant: "warning" },
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<Badge variant="warning">Warning</Badge>`,
      },
    },
  },
}

export const WithIcon: Story = {
  name: "With Icons",
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Zap, Circle, AlertTriangle, CheckCircle } from "lucide-react"

<div className="flex flex-wrap gap-3">
  <Badge variant="default" className="gap-1.5"><Icon icon={Zap} size="xs" variant="primary" />Powered</Badge>
  <Badge variant="accent" className="gap-1.5"><Icon icon={Circle} size="xs" variant="success" className="fill-current" />Online</Badge>
  <Badge variant="destructive" className="gap-1.5"><Icon icon={AlertTriangle} size="xs" variant="destructive" />Critical</Badge>
  <Badge variant="warning" className="gap-1.5"><Icon icon={AlertTriangle} size="xs" variant="warning" />Caution</Badge>
  <Badge variant="secondary" className="gap-1.5"><Icon icon={CheckCircle} size="xs" variant="secondary" />Verified</Badge>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default" className="gap-1.5"><Icon icon={Zap} size="xs" variant="primary" />Powered</Badge>
      <Badge variant="accent" className="gap-1.5"><Icon icon={Circle} size="xs" variant="success" className="fill-current" />Online</Badge>
      <Badge variant="destructive" className="gap-1.5"><Icon icon={AlertTriangle} size="xs" variant="destructive" />Critical</Badge>
      <Badge variant="warning" className="gap-1.5"><Icon icon={AlertTriangle} size="xs" variant="warning" />Caution</Badge>
      <Badge variant="secondary" className="gap-1.5"><Icon icon={CheckCircle} size="xs" variant="secondary" />Verified</Badge>
    </div>
  ),
}

export const AllVariants: Story = {
  name: "All Variants",
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<div className="flex flex-wrap gap-3 p-4">
  <Badge variant="default">default</Badge>
  <Badge variant="secondary">secondary</Badge>
  <Badge variant="destructive">destructive</Badge>
  <Badge variant="outline">outline</Badge>
  <Badge variant="accent">accent</Badge>
  <Badge variant="warning">warning</Badge>
</div>`,
      },
    },
  },
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
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { Circle, Zap, AlertTriangle } from "lucide-react"

<div className="liquid-glass rounded-xl p-6 w-80 space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm text-foreground">API Status</span>
    <Badge variant="accent" className="gap-1.5"><Icon icon={Circle} size="xs" variant="success" className="fill-current" />Operational</Badge>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm text-foreground">Deploy</span>
    <Badge variant="default" className="gap-1.5"><Icon icon={Zap} size="xs" variant="primary" />v2.4.1</Badge>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm text-foreground">Database</span>
    <Badge variant="warning">High Load</Badge>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm text-foreground">Auth Service</span>
    <Badge variant="destructive" className="gap-1.5"><Icon icon={AlertTriangle} size="xs" variant="destructive" />Degraded</Badge>
  </div>
</div>`,
      },
    },
  },
  render: () => (
    <div className="liquid-glass rounded-xl p-6 w-80 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">API Status</span>
        <Badge variant="accent" className="gap-1.5"><Icon icon={Circle} size="xs" variant="success" className="fill-current" />Operational</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Deploy</span>
        <Badge variant="default" className="gap-1.5"><Icon icon={Zap} size="xs" variant="primary" />v2.4.1</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Database</span>
        <Badge variant="warning">High Load</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Auth Service</span>
        <Badge variant="destructive" className="gap-1.5"><Icon icon={AlertTriangle} size="xs" variant="destructive" />Degraded</Badge>
      </div>
    </div>
  ),
}

// ── Dark + Light side-by-side ─────────────────────────────────────────────────
export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@/components/ui/badge"

<div className="flex flex-wrap gap-3 p-4">
  <Badge variant="default">default</Badge>
  <Badge variant="secondary">secondary</Badge>
  <Badge variant="destructive">destructive</Badge>
  <Badge variant="outline">outline</Badge>
  <Badge variant="accent">accent</Badge>
  <Badge variant="warning">warning</Badge>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(["default", "secondary", "destructive", "outline", "accent", "warning"] as const).map(
        (v) => <Badge key={v} variant={v}>{v}</Badge>
      )}
    </div>
  ),
}
