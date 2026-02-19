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

// ═══════════════════════════════════════════════════════════════════════════════
// SPINNER
// ═══════════════════════════════════════════════════════════════════════════════

export const SpinnerDefault: Story = {
  name: "Spinner · Default",
  args: { size: "default", variant: "default" },
}

export const SpinnerPrimary: Story = {
  name: "Spinner · Primary",
  args: { size: "default", variant: "primary" },
  parameters: {
    docs: {
      description: {
        story: "Variante primary con glow verde (dark) / cyan (light).",
      },
    },
  },
}

export const SpinnerSecondary: Story = {
  name: "Spinner · Secondary",
  args: { size: "default", variant: "secondary" },
}

export const SpinnerSizes: Story = {
  name: "Spinner · All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: sm, default, lg, xl.",
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

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

export const OverlayDefault: Story = {
  name: "LoadingOverlay",
  parameters: {
    docs: {
      description: {
        story: "Pantalla completa con efecto glass para estados de carga.",
      },
    },
    layout: "fullscreen",
  },
  render: () => (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border border-white/10">
      <div className="absolute inset-0 bg-background/50" />
      <p className="absolute top-4 left-4 text-muted-foreground">
        Contenido debajo del overlay...
      </p>
      <LoadingOverlay message="Cargando datos..." variant="primary" />
    </div>
  ),
}

export const OverlayNoMessage: Story = {
  name: "LoadingOverlay · Sin mensaje",
  parameters: {
    docs: {
      description: {
        story: "Overlay sin texto, solo el spinner.",
      },
    },
    layout: "fullscreen",
  },
  render: () => (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border border-white/10">
      <LoadingOverlay variant="secondary" />
    </div>
  ),
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING DOTS
// ═══════════════════════════════════════════════════════════════════════════════

export const DotsDefault: Story = {
  name: "LoadingDots",
  args: { size: "default", variant: "primary" },
}

export const DotsSecondary: Story = {
  name: "LoadingDots · Secondary",
  args: { size: "default", variant: "secondary" },
}

export const DotsSizes: Story = {
  name: "LoadingDots · All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: sm, default, lg.",
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

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING RING
// ═══════════════════════════════════════════════════════════════════════════════

export const RingDefault: Story = {
  name: "LoadingRing",
  args: { size: "default", variant: "primary" },
}

export const RingSecondary: Story = {
  name: "LoadingRing · Secondary",
  args: { size: "default", variant: "secondary" },
}

export const RingSizes: Story = {
  name: "LoadingRing · All Sizes",
  parameters: {
    docs: {
      description: {
        story: "Tamaños disponibles: sm, default, lg, xl.",
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

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARATIVA
// ═══════════════════════════════════════════════════════════════════════════════

export const AllVariants: Story = {
  name: "All Loading Variants",
  parameters: {
    docs: {
      description: {
        story: "Comparativa de todos los componentes de carga.",
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

// ═══════════════════════════════════════════════════════════════════════════════
// DARK + LIGHT
// ═══════════════════════════════════════════════════════════════════════════════

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
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
