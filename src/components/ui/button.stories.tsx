import type { Meta, StoryObj } from "@storybook/react"
import { Zap, Trash2, ArrowRight, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Botón con estilo **Liquid Glass** — efectos de cristal translúcido 3D con:
- Fondo tintado translúcido
- Borde luminoso neon
- Highlight interno (curvatura del cristal)
- Glow exterior multicapa en hover

El color Primary es **Green** en dark mode y **Cyan** en light mode.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "ghost", "destructive", "accent", "outline", "link"],
      description: "Variante visual del botón",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Tamaño del botón",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    disabled: { 
      control: "boolean",
      description: "Deshabilita el botón",
    },
    asChild: {
      control: false,
      description: "Usa Slot para composición con otros elementos",
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Start project", variant: "default" },
  parameters: {
    docs: {
      description: {
        story: "Variante primary con glow verde (dark) / cyan (light). Úsala para acciones principales.",
      },
    },
  },
}

export const Secondary: Story = {
  args: { children: "Secondary", variant: "secondary" },
  parameters: {
    docs: {
      description: {
        story: "Variante pink-magenta para acciones secundarias o destacadas.",
      },
    },
  },
}

export const Destructive: Story = {
  args: { children: "Delete", variant: "destructive" },
  parameters: {
    docs: {
      description: {
        story: "Variante roja para acciones destructivas (eliminar, remover).",
      },
    },
  },
}

export const Accent: Story = {
  args: { children: "Add collaborator", variant: "accent" },
  parameters: {
    docs: {
      description: {
        story: "Variante cyan para acentos o acciones especiales.",
      },
    },
  },
}

export const Ghost: Story = {
  args: { children: "Ghost", variant: "ghost" },
  parameters: {
    docs: {
      description: {
        story: "Variante neutra sin glow, ideal para acciones sutiles.",
      },
    },
  },
}

export const Outline: Story = {
  args: { children: "Outline Neon", variant: "outline" },
  parameters: {
    docs: {
      description: {
        story: "Solo borde neon sin fondo, muestra glow en hover.",
      },
    },
  },
}

export const Sizes: Story = {
  name: "All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: `sm`, `default`, `lg`, `icon`.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Icon icon={Zap} /></Button>
    </div>
  ),
}

export const WithIcons: Story = {
  name: "With Icons",
  parameters: {
    docs: {
      description: {
        story: "Combina iconos de `lucide-react` con texto para botones más expresivos.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button className="gap-2"><Icon icon={Zap} size="sm" />Launch</Button>
      <Button variant="accent" className="gap-2"><Icon icon={Plus} size="sm" />Add collaborator</Button>
      <Button variant="outline" className="gap-2"><Icon icon={ArrowRight} size="sm" />Continue</Button>
      <Button variant="destructive" className="gap-2"><Icon icon={Trash2} size="sm" />Delete</Button>
    </div>
  ),
}

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: "Estado de carga usando `Loader2` con animación `spin` y `disabled`.",
      },
    },
  },
  render: () => (
    <Button disabled className="gap-2">
      <Icon icon={Loader2} className="animate-spin" size="sm" />
      Processing...
    </Button>
  ),
}

export const AllVariants: Story = {
  name: "All Variants",
  parameters: {
    docs: {
      description: {
        story: "Comparativa de todas las variantes disponibles.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3 p-6">
      {(["default", "secondary", "accent", "ghost", "outline", "destructive", "link"] as const).map(
        (v) => <Button key={v} variant={v} className="w-52 justify-start">{v}</Button>
      )}
    </div>
  ),
}

// ── Dark + Light side-by-side ────────────────────────────────────────────────
// Usa el toolbar "Theme → Dark + Light" para verla correctamente,
// o abre esta story con el global theme = "side-by-side".
export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <div className="flex flex-col gap-3">
      {(["default", "secondary", "accent", "destructive", "ghost", "outline"] as const).map(
        (v) => <Button key={v} variant={v}>{v}</Button>
      )}
    </div>
  ),
}

