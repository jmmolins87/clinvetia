import type { Meta, StoryObj } from "@storybook/react"
import { Spinner, LoadingOverlay, LoadingDots, LoadingRing } from "@/components/ui/spinner"

const meta = {
  title: "Design System/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
    docs: {
      description: {
        component: `
Componentes de carga con estilo **Liquid Glass Neon**:

- **Spinner**: Icono de carga básico con variants de color
- **LoadingOverlay**: Pantalla completa con efecto glass
- **LoadingDots**: Tres puntos animados con efecto bounce
- **LoadingRing**: Anillo giratorio con borde transparente

Variantes de color disponibles: \`default\`, \`primary\`, \`secondary\`, \`accent\`.
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg", "xl"],
      description: "Tamaño del spinner",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "accent"],
      description: "Variante de color (neon glow)",
      table: {
        defaultValue: { summary: "default" },
      },
    },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const SpinnerDefault: Story = {
  name: "Spinner · Default",
  args: { size: "default", variant: "default" },
  parameters: {
    docs: {
      source: {
        code: `import { Spinner } from "@/components/ui/spinner"

<Spinner size="default" variant="default" />`,
      },
    },
  },
}

export const SpinnerPrimary: Story = {
  name: "Spinner · Primary",
  args: { size: "default", variant: "primary" },
  parameters: {
    docs: {
      description: {
        story: "Variante primary con glow verde (dark) / cyan (light).",
      },
      source: {
        code: `import { Spinner } from "@/components/ui/spinner"

<Spinner size="default" variant="primary" />`,
      },
    },
  },
}

export const SpinnerSecondary: Story = {
  name: "Spinner · Secondary",
  args: { size: "default", variant: "secondary" },
  parameters: {
    docs: {
      source: {
        code: `import { Spinner } from "@/components/ui/spinner"

<Spinner size="default" variant="secondary" />`,
      },
    },
  },
}

export const SpinnerSizes: Story = {
  name: "Spinner · All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: sm, default, lg, xl.",
      },
      source: {
        code: `import { Spinner } from "@/components/ui/spinner"

<div className="flex items-center gap-8">
  <Spinner size="sm" variant="primary" />
  <Spinner size="default" variant="primary" />
  <Spinner size="lg" variant="primary" />
  <Spinner size="xl" variant="primary" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-8">
      <Spinner size="sm" variant="primary" />
      <Spinner size="default" variant="primary" />
      <Spinner size="lg" variant="primary" />
      <Spinner size="xl" variant="primary" />
    </div>
  ),
}

export const OverlayDefault: Story = {
  name: "LoadingOverlay · Premium",
  parameters: {
    docs: {
      description: {
        story: "Nueva versión premium con branding, glow y desenfoque profundo para transiciones de página.",
      },
      layout: "fullscreen",
      source: {
        code: `import { LoadingOverlay } from "@/components/ui/spinner"

// Overlay relativo a un contenedor
<div className="relative h-96 w-full overflow-hidden rounded-2xl">
  {/* Contenido de fondo */}
  <div className="absolute inset-0 p-8">
    <h2 className="text-xl font-bold mb-4">Contenido de fondo</h2>
  </div>
  <LoadingOverlay message="Clinvetia" variant="primary" className="absolute" />
</div>

// Overlay de página completa
<LoadingOverlay message="Cargando..." variant="primary" />`,
      },
    },
  },
  render: () => (
    <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-white/5 bg-background">
      <div className="absolute inset-0 p-8">
        <h2 className="text-xl font-bold mb-4">Contenido de fondo</h2>
        <p className="text-muted-foreground">
          Este contenido se desenfoca cuando el overlay está activo.
        </p>
      </div>
      <LoadingOverlay message="Clinvetia" variant="primary" className="absolute" />
    </div>
  ),
}

export const OverlaySecondary: Story = {
  name: "LoadingOverlay · Secondary",
  parameters: {
    layout: "fullscreen",
    docs: {
      source: {
        code: `import { LoadingOverlay } from "@/components/ui/spinner"

<div className="relative h-96 w-full overflow-hidden rounded-2xl">
  <LoadingOverlay message="Preparando..." variant="secondary" className="absolute" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-white/5 bg-background">
      <LoadingOverlay message="Preparando..." variant="secondary" className="absolute" />
    </div>
  ),
}

export const DotsDefault: Story = {
  name: "LoadingDots",
  args: { size: "default", variant: "primary" },
  parameters: {
    docs: {
      source: {
        code: `import { LoadingDots } from "@/components/ui/spinner"

<LoadingDots size="default" variant="primary" />`,
      },
    },
  },
}

export const DotsSecondary: Story = {
  name: "LoadingDots · Secondary",
  args: { size: "default", variant: "secondary" },
  parameters: {
    docs: {
      source: {
        code: `import { LoadingDots } from "@/components/ui/spinner"

<LoadingDots size="default" variant="secondary" />`,
      },
    },
  },
}

export const DotsSizes: Story = {
  name: "LoadingDots · All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: sm, default, lg.",
      },
      source: {
        code: `import { LoadingDots } from "@/components/ui/spinner"

<div className="flex items-center gap-8">
  <LoadingDots size="sm" variant="primary" />
  <LoadingDots size="default" variant="primary" />
  <LoadingDots size="lg" variant="primary" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-8">
      <LoadingDots size="sm" variant="primary" />
      <LoadingDots size="default" variant="primary" />
      <LoadingDots size="lg" variant="primary" />
    </div>
  ),
}

export const RingDefault: Story = {
  name: "LoadingRing",
  args: { size: "default", variant: "primary" },
  parameters: {
    docs: {
      source: {
        code: `import { LoadingRing } from "@/components/ui/spinner"

<LoadingRing size="default" variant="primary" />`,
      },
    },
  },
}

export const RingSecondary: Story = {
  name: "LoadingRing · Secondary",
  args: { size: "default", variant: "secondary" },
  parameters: {
    docs: {
      source: {
        code: `import { LoadingRing } from "@/components/ui/spinner"

<LoadingRing size="default" variant="secondary" />`,
      },
    },
  },
}

export const RingSizes: Story = {
  name: "LoadingRing · All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: sm, default, lg, xl.",
      },
      source: {
        code: `import { LoadingRing } from "@/components/ui/spinner"

<div className="flex items-center gap-8">
  <LoadingRing size="sm" variant="primary" />
  <LoadingRing size="default" variant="primary" />
  <LoadingRing size="lg" variant="primary" />
  <LoadingRing size="xl" variant="primary" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-8">
      <LoadingRing size="sm" variant="primary" />
      <LoadingRing size="default" variant="primary" />
      <LoadingRing size="lg" variant="primary" />
      <LoadingRing size="xl" variant="primary" />
    </div>
  ),
}

export const AllVariants: Story = {
  name: "All Loading Variants",
  parameters: {
    docs: {
      description: {
        story: "Comparativa de todos los componentes de carga.",
      },
      source: {
        code: `import { Spinner, LoadingRing, LoadingDots } from "@/components/ui/spinner"

<div className="flex flex-wrap items-center justify-center gap-12">
  <div className="flex flex-col items-center gap-2">
    <Spinner size="lg" variant="primary" />
    <span className="text-sm text-muted-foreground">Spinner</span>
  </div>
  <div className="flex flex-col items-center gap-2">
    <LoadingRing size="lg" variant="primary" />
    <span className="text-sm text-muted-foreground">Ring</span>
  </div>
  <div className="flex flex-col items-center gap-2">
    <LoadingDots size="lg" variant="primary" />
    <span className="text-sm text-muted-foreground">Dots</span>
  </div>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" variant="primary" />
        <span className="text-sm text-muted-foreground">Spinner</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingRing size="lg" variant="primary" />
        <span className="text-sm text-muted-foreground">Ring</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingDots size="lg" variant="primary" />
        <span className="text-sm text-muted-foreground">Dots</span>
      </div>
    </div>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      source: {
        code: `import { Spinner, LoadingRing, LoadingDots } from "@/components/ui/spinner"

<div className="flex flex-col gap-8">
  <div className="flex gap-4">
    <Spinner variant="primary" />
    <LoadingRing variant="primary" />
    <LoadingDots variant="primary" />
  </div>
  <div className="flex gap-4">
    <Spinner variant="secondary" />
    <LoadingRing variant="secondary" />
    <LoadingDots variant="secondary" />
  </div>
  <div className="flex gap-4">
    <Spinner variant="accent" />
    <LoadingRing variant="accent" />
    <LoadingDots variant="accent" />
  </div>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm font-medium">Primary</p>
        <div className="flex gap-4">
          <Spinner variant="primary" />
          <LoadingRing variant="primary" />
          <LoadingDots variant="primary" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Secondary</p>
        <div className="flex gap-4">
          <Spinner variant="secondary" />
          <LoadingRing variant="secondary" />
          <LoadingDots variant="secondary" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Accent</p>
        <div className="flex gap-4">
          <Spinner variant="accent" />
          <LoadingRing variant="accent" />
          <LoadingDots variant="accent" />
        </div>
      </div>
    </div>
  ),
}
