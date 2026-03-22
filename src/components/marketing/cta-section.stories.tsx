import type { Meta, StoryObj } from "@storybook/react"
import { CtaSection } from "@/components/marketing/cta-section"

const meta = {
  title: "Marketing/CtaSection",
  component: CtaSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Bloque CTA reutilizable usado al final de cada página de marketing.

## Variantes

- **\`glass\`** — tarjeta \`GlassCard\` con gradiente primary→secondary. Usada en \`/solucion\` y \`/escenarios\`.
- **\`glow\`** — panel flotante con glow de fondo y blur. Usada en la home \`/\`.

## Props

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| \`title\` | string | — | Título principal |
| \`description\` | string | — | Subtítulo descriptivo |
| \`actions\` | CtaAction[] | — | Mínimo 1 botón |
| \`badge\` | string | — | Etiqueta opcional sobre el título |
| \`variant\` | \`glass\` \\| \`glow\` | \`glass\` | Estilo del contenedor |
| \`id\` | string | — | ID HTML para anclas |

## Uso

\`\`\`tsx
import { CtaSection } from "@/components/marketing/cta-section"

<CtaSection
  title="¿Listo para transformar tu clínica?"
  description="Reserva una demo y empieza en 30 minutos."
  actions={[
    { label: "Reservar demo", href: "/contacto", icon: "calendar" },
    { label: "Calcular ROI",  href: "/#roi", variant: "secondary", icon: "calculator" },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof CtaSection>

export default meta
type Story = StoryObj<typeof meta>

export const Glass: Story = {
  name: "Glass (solucion, escenarios)",
  args: {
    title: "¿Listo para transformar la atención de tu clínica?",
    description: "Reserva una demo personalizada y descubre cómo Clinvetia puede aumentar tu capacidad de atención.",
    actions: [
      { label: "Reservar demo", href: "/contacto", icon: "calendar" },
      { label: "Calcular mi ROI", href: "/#roi", variant: "secondary", icon: "calculator" },
    ],
    variant: "glass",
  },
  parameters: {
    docs: {
      description: {
        story: "Variante **glass** con `GlassCard` y gradiente primary→secondary. Usada en `/solucion` y `/escenarios`.",
      },
      source: {
        code: `import { CtaSection } from "@/components/marketing/cta-section"

<CtaSection
  title="¿Listo para transformar la atención de tu clínica?"
  description="Reserva una demo personalizada y descubre cómo Clinvetia puede aumentar tu capacidad de atención."
  actions={[
    { label: "Reservar demo", href: "/contacto", icon: "calendar" },
    { label: "Calcular mi ROI", href: "/#roi", variant: "secondary", icon: "calculator" },
  ]}
  variant="glass"
/>`,
      },
    },
  },
}

export const Glow: Story = {
  name: "Glow (home)",
  args: {
    badge: "¿Hablamos?",
    title: "Prueba Clinvetia gratis",
    description: "Configuramos tu clínica en 30 minutos. Sin compromiso.",
    actions: [
      { label: "Agendar Demo", href: "mailto:hola@clinvetia.com", icon: "calendar" },
      { label: "Chatear", href: "#", variant: "ghost", icon: "message" },
    ],
    variant: "glow",
  },
  parameters: {
    docs: {
      description: {
        story: "Variante **glow** con panel flotante y backdrop-blur. Usada en la home.",
      },
      source: {
        code: `import { CtaSection } from "@/components/marketing/cta-section"

<CtaSection
  badge="¿Hablamos?"
  title="Prueba Clinvetia gratis"
  description="Configuramos tu clínica en 30 minutos. Sin compromiso."
  actions={[
    { label: "Agendar Demo", href: "mailto:hola@clinvetia.com", icon: "calendar" },
    { label: "Chatear", href: "#", variant: "ghost", icon: "message" },
  ]}
  variant="glow"
/>`,
      },
    },
  },
}

export const SingleAction: Story = {
  name: "Un solo botón",
  args: {
    title: "¿Tu clínica vive alguna de estas situaciones?",
    description: "Descubre cómo Clinvetia puede transformar la atención de tu clínica.",
    actions: [
      { label: "Reservar demo", href: "/contacto", icon: "calendar" },
    ],
    variant: "glass",
  },
  parameters: {
    docs: {
      description: {
        story: "CTA con un único botón de acción.",
      },
      source: {
        code: `import { CtaSection } from "@/components/marketing/cta-section"

<CtaSection
  title="¿Tu clínica vive alguna de estas situaciones?"
  description="Descubre cómo Clinvetia puede transformar la atención de tu clínica."
  actions={[
    { label: "Reservar demo", href: "/contacto", icon: "calendar" },
  ]}
  variant="glass"
/>`,
      },
    },
  },
}

export const WithBadge: Story = {
  name: "Con Badge",
  args: {
    badge: "Nuevo",
    title: "¿Listo para transformar la atención de tu clínica?",
    description: "Reserva una demo personalizada y descubre cómo Clinvetia puede aumentar tu capacidad de atención.",
    actions: [
      { label: "Reservar demo", href: "/contacto", icon: "calendar" },
      { label: "Calcular mi ROI", href: "/#roi", variant: "secondary", icon: "calculator" },
    ],
    variant: "glass",
  },
  parameters: {
    docs: {
      description: {
        story: "Variante glass con badge opcional sobre el título.",
      },
      source: {
        code: `import { CtaSection } from "@/components/marketing/cta-section"

<CtaSection
  badge="Nuevo"
  title="¿Listo para transformar la atención de tu clínica?"
  description="Reserva una demo personalizada."
  actions={[
    { label: "Reservar demo", href: "/contacto", icon: "calendar" },
    { label: "Calcular mi ROI", href: "/#roi", variant: "secondary", icon: "calculator" },
  ]}
  variant="glass"
/>`,
      },
    },
  },
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  args: {
    title: "",
    description: "",
    actions: [{ label: "Reservar demo", href: "/contacto" }],
  },
  parameters: {
    docs: {
      description: {
        story: "Comparación de ambas variantes en dark y light.",
      },
      source: {
        code: `import { CtaSection } from "@/components/marketing/cta-section"

// Variante glass
<CtaSection
  title="¿Listo para transformar la atención de tu clínica?"
  description="Reserva una demo personalizada."
  actions={[
    { label: "Reservar demo", href: "/contacto", icon: "calendar" },
    { label: "Calcular mi ROI", href: "/#roi", variant: "secondary", icon: "calculator" },
  ]}
  variant="glass"
/>

// Variante glow
<CtaSection
  badge="¿Hablamos?"
  title="Prueba Clinvetia gratis"
  description="Configuramos tu clínica en 30 minutos. Sin compromiso."
  actions={[
    { label: "Agendar Demo", href: "mailto:hola@clinvetia.com", icon: "calendar" },
    { label: "Chatear", href: "#", variant: "ghost", icon: "message" },
  ]}
  variant="glow"
/>`,
      },
    },
  },
  render: () => (
    <div className="space-y-8">
      <CtaSection
        title="¿Listo para transformar la atención de tu clínica?"
        description="Reserva una demo personalizada y descubre cómo Clinvetia puede aumentar tu capacidad de atención."
        actions={[
          { label: "Reservar demo", href: "/contacto", icon: "calendar" },
          { label: "Calcular mi ROI", href: "/#roi", variant: "secondary", icon: "calculator" },
        ]}
        variant="glass"
      />
      <CtaSection
        badge="¿Hablamos?"
        title="Prueba Clinvetia gratis"
        description="Configuramos tu clínica en 30 minutos. Sin compromiso."
        actions={[
          { label: "Agendar Demo", href: "mailto:hola@clinvetia.com", icon: "calendar" },
          { label: "Chatear", href: "#", variant: "ghost", icon: "message" },
        ]}
        variant="glow"
      />
    </div>
  ),
}
