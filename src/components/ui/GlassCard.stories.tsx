import type { Meta, StoryObj } from "@storybook/react"
import { GlassCard } from "@/components/ui/GlassCard"

const meta = {
  title: "Design System/GlassCard",
  component: GlassCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Tarjeta contenedora con estilo **Liquid Glass** — superficie de cristal translúcido 3D:

- **Fondo tintado**: tinte de color según variante
- **Backdrop blur**: efecto de desenfoque del fondo
- **Borde luminoso**: rim de color neon
- **Highlight interno**: curvatura del cristal (inset shadow)
- **Glow exterior**: resplandor multicapa

Ideal para agrupar contenido relacionado en secciones visuales destacadas.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary"],
      description: "Controla el tinte, borde luminoso y glow exterior",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    title:    {
      control: "text",
      description: "Título de la tarjeta",
    },
    subtitle: {
      control: "text",
      description: "Subtítulo descriptivo",
    },
  },
} satisfies Meta<typeof GlassCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant:  "default",
    title:    "Glass Card",
    subtitle: "Default · superficie neutra",
    children: "Superficie liquid-glass sin tinte de color. Backdrop-blur + highlight interno.",
  },
  parameters: {
    docs: {
      source: {
        code: `import { GlassCard } from "@/components/ui/GlassCard"

<GlassCard
  variant="default"
  title="Glass Card"
  subtitle="Default · superficie neutra"
>
  Superficie liquid-glass sin tinte de color. Backdrop-blur + highlight interno.
</GlassCard>`,
      },
    },
  },
}

export const Primary: Story = {
  args: {
    variant:  "primary",
    title:    "Primary Glass",
    subtitle: "Tinte cian · glow azul",
    children: "Borde rgba(79,172,254,0.35) con glow exterior multicapa.",
  },
  parameters: {
    docs: {
      source: {
        code: `import { GlassCard } from "@/components/ui/GlassCard"

<GlassCard
  variant="primary"
  title="Primary Glass"
  subtitle="Tinte cian · glow azul"
>
  Borde rgba(79,172,254,0.35) con glow exterior multicapa.
</GlassCard>`,
      },
    },
  },
}

export const Secondary: Story = {
  args: {
    variant:  "secondary",
    title:    "Secondary Glass",
    subtitle: "Tinte pink · glow magenta",
    children: "Borde rgba(240,147,251,0.35) con glow exterior multicapa.",
  },
  parameters: {
    docs: {
      source: {
        code: `import { GlassCard } from "@/components/ui/GlassCard"

<GlassCard
  variant="secondary"
  title="Secondary Glass"
  subtitle="Tinte pink · glow magenta"
>
  Borde rgba(240,147,251,0.35) con glow exterior multicapa.
</GlassCard>`,
      },
    },
  },
}

export const AllVariants: Story = {
  name: "All Variants",
  parameters: {
    docs: {
      source: {
        code: `import { GlassCard } from "@/components/ui/GlassCard"

<div className="flex flex-col gap-6 sm:flex-row">
  <GlassCard variant="default" title="Default" subtitle="Neutro" className="w-56">
    Sin tinte de color
  </GlassCard>
  <GlassCard variant="primary" title="Primary" subtitle="Cian → Azul" className="w-56">
    Glow primario
  </GlassCard>
  <GlassCard variant="secondary" title="Secondary" subtitle="Pink → Magenta" className="w-56">
    Glow secundario
  </GlassCard>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6 sm:flex-row">
      <GlassCard variant="default" title="Default" subtitle="Neutro" className="w-56">
        Sin tinte de color
      </GlassCard>
      <GlassCard variant="primary" title="Primary" subtitle="Cian → Azul" className="w-56">
        Glow primario
      </GlassCard>
      <GlassCard variant="secondary" title="Secondary" subtitle="Pink → Magenta" className="w-56">
        Glow secundario
      </GlassCard>
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
        code: `import { GlassCard } from "@/components/ui/GlassCard"

<div className="flex flex-col gap-4">
  <GlassCard variant="default" title="Default" subtitle="Neutro" className="w-64">
    Superficie base sin tinte
  </GlassCard>
  <GlassCard variant="primary" title="Primary" subtitle="Cian glow" className="w-64">
    Borde luminoso cian
  </GlassCard>
  <GlassCard variant="secondary" title="Secondary" subtitle="Pink glow" className="w-64">
    Borde luminoso magenta
  </GlassCard>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <GlassCard variant="default" title="Default" subtitle="Neutro" className="w-64">
        Superficie base sin tinte
      </GlassCard>
      <GlassCard variant="primary" title="Primary" subtitle="Cian glow" className="w-64">
        Borde luminoso cian
      </GlassCard>
      <GlassCard variant="secondary" title="Secondary" subtitle="Pink glow" className="w-64">
        Borde luminoso magenta
      </GlassCard>
    </div>
  ),
}
