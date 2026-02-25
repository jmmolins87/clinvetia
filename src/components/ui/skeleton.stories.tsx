import type { Meta, StoryObj } from "@storybook/react"
import { Skeleton } from "@/components/ui/skeleton"

const meta = {
  title: "Design System/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Componente **Skeleton** para estados de carga optimizado para ambos temas:

- **Default**: Base neutra adaptativa (gris suave en light, blanco translúcido en dark)
- **Glass**: Efecto cristal con backdrop-blur
- **Primary**: Gradiente con el color de marca primario
- **Secondary**: Gradiente con el color de marca secundario

El componente utiliza \`animate-pulse\` para indicar actividad de carga.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "glass", "primary", "secondary"],
      description: "Variante visual del skeleton",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    shape: {
      control: "select",
      options: ["rect", "circle", "text"],
      description: "Forma del skeleton",
      table: {
        defaultValue: { summary: "rect" },
      },
    },
    lines: {
      control: "number",
      description: "Número de líneas (solo para shape='text')",
      table: {
        defaultValue: { summary: "1" },
      },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

// ═══════════════════════════════════════════════════════════════════════════════
// SHAPES
// ═══════════════════════════════════════════════════════════════════════════════

export const Circle: Story = {
  name: "Skeleton · Circle",
  args: {
    shape: "circle",
    className: "h-12 w-12",
  },
}

export const TextMultiline: Story = {
  name: "Skeleton · Text Multiline",
  args: {
    shape: "text",
    lines: 4,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════

export const Default: Story = {
  name: "Skeleton · Default",
  args: {
    className: "h-4 w-full",
  },
}

export const Glass: Story = {
  name: "Skeleton · Glass",
  args: {
    variant: "glass",
    className: "h-4 w-full",
  },
}

export const Primary: Story = {
  name: "Skeleton · Primary",
  args: {
    variant: "primary",
    className: "h-4 w-full",
  },
}

export const Secondary: Story = {
  name: "Skeleton · Secondary",
  args: {
    variant: "secondary",
    className: "h-4 w-full",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIZES
// ═══════════════════════════════════════════════════════════════════════════════

export const Sizes: Story = {
  name: "Skeleton · Sizes",
  parameters: {
    docs: {
      description: {
        story: "Diferentes tamaños de skeleton.",
      },
    },
  },
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTS SHOWCASE
// ═══════════════════════════════════════════════════════════════════════════════

export const VariantsShowcase: Story = {
  name: "Skeleton · All Variants",
  parameters: {
    docs: {
      description: {
        story: "Todas las variantes de skeleton disponibles.",
      },
    },
  },
  render: () => (
    <div className="space-y-6 w-full max-w-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default</p>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Glass</p>
        <Skeleton variant="glass" className="h-4 w-full" />
        <Skeleton variant="glass" className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Primary (Gradient)</p>
        <Skeleton variant="primary" className="h-4 w-full" />
        <Skeleton variant="primary" className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Secondary (Gradient)</p>
        <Skeleton variant="secondary" className="h-4 w-full" />
        <Skeleton variant="secondary" className="h-4 w-3/4" />
      </div>
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const CardSkeleton: Story = {
  name: "Skeleton · Card",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando una tarjeta de contenido.",
      },
    },
  },
  render: () => (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 space-y-4 w-full max-w-sm">
      <div className="flex items-center gap-4">
        <Skeleton variant="glass" className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="primary" className="h-4 w-3/4" />
          <Skeleton variant="secondary" className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton variant="glass" className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton variant="primary" className="h-8 w-20 rounded-lg" />
        <Skeleton variant="glass" className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const AvatarSkeleton: Story = {
  name: "Skeleton · Avatar",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando un avatar.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4 w-full max-w-sm">
      <Skeleton variant="primary" className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton variant="primary" className="h-4 w-32" />
        <Skeleton variant="secondary" className="h-3 w-24" />
      </div>
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIST SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const ListSkeleton: Story = {
  name: "Skeleton · List",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando una lista de elementos.",
      },
    },
  },
  render: () => (
    <div className="space-y-3 w-full max-w-sm">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant={i === 1 ? "primary" : "secondary"} className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="default" className="h-3 w-full" />
            <Skeleton variant="glass" className="h-2 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE SKELETON
// ═══════════════════════════════════════════════════════════════════════════════

export const TableSkeleton: Story = {
  name: "Skeleton · Table",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando una tabla.",
      },
    },
  },
  render: () => (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 space-y-3 w-full max-w-lg">
      <div className="flex gap-4">
        <Skeleton variant="primary" className="h-4 w-1/4" />
        <Skeleton variant="secondary" className="h-4 w-1/4" />
        <Skeleton variant="glass" className="h-4 w-1/4" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="default" className="h-8 w-1/4" />
          <Skeleton variant="glass" className="h-8 w-1/4" />
          <Skeleton variant="primary" className="h-8 w-1/4" />
          <Skeleton variant="secondary" className="h-8 w-1/4" />
        </div>
      ))}
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// DARK + LIGHT
// ═══════════════════════════════════════════════════════════════════════════════

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default</p>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Primary</p>
        <Skeleton variant="primary" className="h-4 w-full" />
        <Skeleton variant="primary" className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Secondary</p>
        <Skeleton variant="secondary" className="h-4 w-full" />
        <Skeleton variant="secondary" className="h-4 w-3/4" />
      </div>
    </div>
  ),
}
