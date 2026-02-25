import type { Meta, StoryObj } from "@storybook/react"
import { Skeleton } from "@/components/ui/skeleton"

const meta = {
  title: "Design System/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
    docs: {
      description: {
        component: `
Componente **Skeleton** para estados de carga con estilo **Liquid Glass Neon**:

- **Default**: Fondo neutro que funciona en ambos temas
- **Glass**: Variante con efecto cristal translúcido
- **Primary**: Gradiente animado con color primario (verde/cyan)
- **Secondary**: Gradiente animado con color secundario (magenta)

Usa la propiedad \`variant\` para elegir entre estilos.
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
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Skeleton · Default",
  args: {
    className: "h-4 w-full",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-full" />`,
      },
    },
  },
}

export const Glass: Story = {
  name: "Skeleton · Glass",
  args: {
    variant: "glass",
    className: "h-4 w-full",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<Skeleton variant="glass" className="h-4 w-full" />`,
      },
    },
  },
}

export const Primary: Story = {
  name: "Skeleton · Primary",
  args: {
    variant: "primary",
    className: "h-4 w-full",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<Skeleton variant="primary" className="h-4 w-full" />`,
      },
    },
  },
}

export const Secondary: Story = {
  name: "Skeleton · Secondary",
  args: {
    variant: "secondary",
    className: "h-4 w-full",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<Skeleton variant="secondary" className="h-4 w-full" />`,
      },
    },
  },
}

export const Sizes: Story = {
  name: "Skeleton · Sizes",
  parameters: {
    docs: {
      description: {
        story: "Diferentes tamaños de skeleton.",
      },
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<div className="space-y-4 w-full max-w-sm">
  <Skeleton className="h-3 w-1/3" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
  <Skeleton className="h-4 w-4/6" />
</div>`,
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

export const VariantsShowcase: Story = {
  name: "Skeleton · All Variants",
  parameters: {
    docs: {
      description: {
        story: "Todas las variantes de skeleton disponibles.",
      },
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

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
</div>`,
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

export const CardSkeleton: Story = {
  name: "Skeleton · Card",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando una tarjeta de contenido.",
      },
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

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
</div>`,
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

export const AvatarSkeleton: Story = {
  name: "Skeleton · Avatar",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando un avatar.",
      },
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<div className="flex items-center gap-4 w-full max-w-sm">
  <Skeleton variant="primary" className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton variant="primary" className="h-4 w-32" />
    <Skeleton variant="secondary" className="h-3 w-24" />
  </div>
</div>`,
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

export const ListSkeleton: Story = {
  name: "Skeleton · List",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando una lista de elementos.",
      },
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<div className="space-y-3 w-full max-w-sm">
  {[1, 2, 3].map((i) => (
    <div key={i} className="flex items-center gap-3">
      <Skeleton variant="primary" className="h-10 w-10 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="default" className="h-3 w-full" />
        <Skeleton variant="glass" className="h-2 w-2/3" />
      </div>
    </div>
  ))}
</div>`,
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

export const TableSkeleton: Story = {
  name: "Skeleton · Table",
  parameters: {
    docs: {
      description: {
        story: "Skeleton simulando una tabla.",
      },
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 space-y-3 w-full max-w-lg">
  {/* Header */}
  <div className="flex gap-4">
    <Skeleton variant="primary" className="h-4 w-1/4" />
    <Skeleton variant="secondary" className="h-4 w-1/4" />
    <Skeleton variant="glass" className="h-4 w-1/4" />
  </div>
  {/* Rows */}
  {[1, 2, 3, 4].map((i) => (
    <div key={i} className="flex gap-4">
      <Skeleton variant="default" className="h-8 w-1/4" />
      <Skeleton variant="glass" className="h-8 w-1/4" />
      <Skeleton variant="primary" className="h-8 w-1/4" />
      <Skeleton variant="secondary" className="h-8 w-1/4" />
    </div>
  ))}
</div>`,
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

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      source: {
        code: `import { Skeleton } from "@/components/ui/skeleton"

<div className="flex flex-col gap-8 w-full max-w-sm">
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
  <div className="space-y-2">
    <Skeleton variant="primary" className="h-4 w-full" />
    <Skeleton variant="primary" className="h-4 w-3/4" />
  </div>
  <div className="space-y-2">
    <Skeleton variant="secondary" className="h-4 w-full" />
    <Skeleton variant="secondary" className="h-4 w-3/4" />
  </div>
</div>`,
      },
    },
  },
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
