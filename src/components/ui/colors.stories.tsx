import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"

const meta = {
  title: "Design System/Colors",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
# Paleta de Colores — Liquid Glass Design System

Todos los colores se definen como **variables CSS** en \`globals.css\` y se mapean a Tailwind mediante \`@theme inline\`.

## Temas disponibles
- **Dark Neon** (tema principal): Primary = Neon Green \`#43e97b\`
- **Light Frost**: Primary = Neon Cyan \`#00f2fe\`

## Uso en componentes

\`\`\`tsx
// Colores semánticos
className="bg-primary text-primary-foreground"
className="text-secondary"
className="text-destructive"

// Neon directos
className="text-neon-green bg-neon-cyan"

// RGB para transparencias
style={{ backgroundColor: \`rgba(var(--primary-rgb), 0.15)\` }}
\`\`\`
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ── Helpers ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground tracking-wide uppercase opacity-60">{title}</h2>
      {children}
    </div>
  )
}

function Swatch({ name, variable, hex }: { name: string; variable: string; hex?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-xl border border-white/10 shadow-md"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <p className="text-base font-semibold text-foreground leading-tight">{name}</p>
      <p className="text-base font-mono text-muted-foreground">{variable}</p>
      {hex && <p className="text-base font-mono text-muted-foreground opacity-70">{hex}</p>}
    </div>
  )
}

function GradientSwatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-xl border border-white/10 shadow-md"
        style={{ background: `var(${variable})` }}
      />
      <p className="text-base font-semibold text-foreground">{name}</p>
      <p className="text-base font-mono text-muted-foreground">{variable}</p>
    </div>
  )
}

function GlowSwatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"
        style={{ boxShadow: `var(${variable})` }}
      >
        <span className="text-base font-medium text-foreground/80">{name}</span>
      </div>
      <p className="text-base font-mono text-muted-foreground">{variable}</p>
    </div>
  )
}

function RGBSwatch({ name, variable, value }: { name: string; variable: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div
        className="h-9 w-9 rounded-lg border border-white/10 shrink-0"
        style={{ backgroundColor: `rgba(var(${variable}), 1)` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-foreground">{name}</p>
        <p className="text-base font-mono text-muted-foreground">{variable}</p>
      </div>
      <code className="text-base font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded shrink-0">
        {value}
      </code>
    </div>
  )
}

// ── Paleta Dark Neon ─────────────────────────────────────────

function DarkPaletteContent() {
  return (
    <div className="space-y-10 p-6 rounded-2xl" style={{ background: "var(--color-background, #0a0a0f)", color: "var(--color-foreground, #ededed)" }}>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-primary">Dark Neon</h1>
        <p className="text-base text-muted-foreground">Tema principal — Primary = Neon Green</p>
      </div>

      <Section title="Marca">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Swatch name="Primary" variable="--primary" hex="#43e97b" />
          <Swatch name="Secondary" variable="--secondary" hex="#f093fb" />
          <Swatch name="Accent FG" variable="--accent-foreground" hex="#00f2fe" />
          <Swatch name="Destructive" variable="--destructive" hex="#f5576c" />
          <Swatch name="Success" variable="--success" hex="#43e97b" />
          <Swatch name="Warning" variable="--warning" hex="#f59e0b" />
        </div>
      </Section>

      <Section title="Neon Colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Swatch name="Neon Green" variable="--neon-green" hex="#43e97b" />
          <Swatch name="Neon Cyan" variable="--neon-cyan" hex="#00f2fe" />
          <Swatch name="Neon Pink" variable="--neon-pink" hex="#f093fb" />
          <Swatch name="Neon Red" variable="--neon-red" hex="#f5576c" />
          <Swatch name="Neon Amber" variable="--neon-amber" hex="#f59e0b" />
          <Swatch name="Neon Blue" variable="--neon-blue" hex="#4facfe" />
        </div>
      </Section>

      <Section title="Superficies">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Swatch name="Background" variable="--background" hex="#0a0a0f" />
          <Swatch name="Card" variable="--card" hex="#0f0f1a" />
          <Swatch name="Popover" variable="--popover" hex="#12121f" />
          <Swatch name="Muted" variable="--muted" hex="#1a1a2e" />
        </div>
      </Section>

      <Section title="Field Surface Tokens">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Swatch name="Field BG" variable="--field-bg" />
          <Swatch name="Field Border" variable="--field-border" />
          <Swatch name="Field Icon BG" variable="--field-icon-bg" />
          <Swatch name="Field Icon Border" variable="--field-icon-border" />
          <Swatch name="Field Icon BG Hover" variable="--field-icon-bg-hover" />
        </div>
      </Section>

      <Section title="Tipografía">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Swatch name="Foreground" variable="--foreground" hex="#ededed" />
          <Swatch name="Muted FG" variable="--muted-foreground" hex="#8892a4" />
          <Swatch name="Primary FG" variable="--primary-foreground" hex="#0a0a0f" />
        </div>
      </Section>

      <Section title="Gradientes">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GradientSwatch name="Primary" variable="--gradient-primary" />
          <GradientSwatch name="Secondary" variable="--gradient-secondary" />
          <GradientSwatch name="Accent" variable="--gradient-accent" />
          <GradientSwatch name="Surface" variable="--gradient-surface" />
        </div>
      </Section>

      <Section title="Glows">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlowSwatch name="Primary" variable="--glow-primary" />
          <GlowSwatch name="Secondary" variable="--glow-secondary" />
          <GlowSwatch name="Accent" variable="--glow-accent" />
          <GlowSwatch name="Destructive" variable="--glow-destructive" />
        </div>
      </Section>

      <Section title="RGB Channels">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 divide-y divide-white/5">
          <RGBSwatch name="Primary RGB" variable="--primary-rgb" value="67, 233, 123" />
          <RGBSwatch name="Secondary RGB" variable="--secondary-rgb" value="240, 147, 251" />
          <RGBSwatch name="Accent RGB" variable="--accent-rgb" value="0, 242, 254" />
          <RGBSwatch name="Destructive RGB" variable="--destructive-rgb" value="245, 87, 108" />
          <RGBSwatch name="Success RGB" variable="--success-rgb" value="67, 233, 123" />
          <RGBSwatch name="Warning RGB" variable="--warning-rgb" value="245, 158, 11" />
          <RGBSwatch name="White RGB" variable="--white-rgb" value="255, 255, 255" />
          <RGBSwatch name="Black RGB" variable="--black-rgb" value="0, 0, 0" />
        </div>
      </Section>
    </div>
  )
}

// ── Paleta Light Frost ───────────────────────────────────────

function LightPaletteContent() {
  return (
    <div className="space-y-10 p-6 rounded-2xl" style={{ background: "#f0f4f8", color: "#0d1117" }}>
      <div className="space-y-1">
        <h1 className="text-xl font-bold" style={{ color: "#0891b2" }}>Light Frost</h1>
        <p className="text-base" style={{ color: "#64748b" }}>Tema claro — Primary = Neon Cyan</p>
      </div>

      <Section title="Marca">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <SwatchLight name="Primary" hex="#00f2fe" variable="--primary" />
          <SwatchLight name="Secondary" hex="#e2e8f0" variable="--secondary" dark />
          <SwatchLight name="Accent" hex="#dbeafe" variable="--accent" dark />
          <SwatchLight name="Destructive" hex="#ef4444" variable="--destructive" />
          <SwatchLight name="Success" hex="#43e97b" variable="--success" />
          <SwatchLight name="Warning" hex="#f59e0b" variable="--warning" />
        </div>
      </Section>

      <Section title="Neon Colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <SwatchLight name="Neon Green" hex="#43e97b" variable="--neon-green" />
          <SwatchLight name="Neon Cyan" hex="#00f2fe" variable="--neon-cyan" />
          <SwatchLight name="Neon Pink" hex="#f093fb" variable="--neon-pink" />
          <SwatchLight name="Neon Red" hex="#ef4444" variable="--neon-red" />
          <SwatchLight name="Neon Amber" hex="#f59e0b" variable="--neon-amber" />
          <SwatchLight name="Neon Blue" hex="#4facfe" variable="--neon-blue" />
        </div>
      </Section>

      <Section title="Superficies">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SwatchLight name="Background" hex="#f0f4f8" variable="--background" dark />
          <SwatchLight name="Card" hex="#ffffff" variable="--card" dark />
          <SwatchLight name="Muted" hex="#e8edf3" variable="--muted" dark />
          <SwatchLight name="Border" hex="#cbd5e1" variable="--border" dark />
        </div>
      </Section>

      <Section title="Field Surface Tokens">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SwatchLight name="Field BG" hex="rgba(255,255,255,0.05)" variable="--field-bg" dark />
          <SwatchLight name="Field Border" hex="rgba(255,255,255,0.14)" variable="--field-border" dark />
          <SwatchLight name="Field Icon BG" hex="rgba(255,255,255,0.05)" variable="--field-icon-bg" dark />
          <SwatchLight name="Field Icon Border" hex="rgba(255,255,255,0.10)" variable="--field-icon-border" dark />
          <SwatchLight name="Field Icon BG Hover" hex="rgba(255,255,255,0.10)" variable="--field-icon-bg-hover" dark />
        </div>
      </Section>

      <Section title="Tipografía">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SwatchLight name="Foreground" hex="#0d1117" variable="--foreground" dark />
          <SwatchLight name="Muted FG" hex="#64748b" variable="--muted-foreground" />
          <SwatchLight name="Accent FG" hex="#1e40af" variable="--accent-foreground" />
        </div>
      </Section>

      <Section title="Gradientes (Light)">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Primary (Cyan→Blue)", from: "#00f2fe", to: "#4facfe" },
            { name: "Secondary (Pink→Red)", from: "#f093fb", to: "#f5576c" },
            { name: "Accent (Blue→Indigo)", from: "#4facfe", to: "#3b82f6" },
            { name: "Surface", from: "rgba(255,255,255,0.10)", to: "rgba(255,255,255,0.04)" },
          ].map((g) => (
            <div key={g.name} className="flex flex-col gap-2">
              <div
                className="h-14 w-full rounded-xl border border-black/10 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
              />
              <p className="text-base font-medium text-foreground">{g.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="RGB Channels">
        <div className="rounded-xl border border-black/10 bg-black/5 px-4 divide-y divide-black/5">
          {[
            { name: "Primary RGB", value: "0, 242, 254", hex: "#00f2fe" },
            { name: "Secondary RGB", value: "240, 147, 251", hex: "#f093fb" },
            { name: "Accent RGB", value: "79, 172, 254", hex: "#4facfe" },
            { name: "Destructive RGB", value: "239, 68, 68", hex: "#ef4444" },
            { name: "Success RGB", value: "67, 233, 123", hex: "#43e97b" },
            { name: "Warning RGB", value: "245, 158, 11", hex: "#f59e0b" },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0">
              <div
                className="h-9 w-9 rounded-lg border border-black/10 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-foreground">{c.name}</p>
              </div>
              <code className="text-base font-mono bg-black/5 px-2 py-1 rounded shrink-0 text-muted-foreground">
                {c.value}
              </code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function SwatchLight({ name, hex, variable }: { name: string; hex: string; variable: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-xl shadow-sm border border-black/10"
        style={{ backgroundColor: hex }}
      />
      <p className="text-base font-semibold leading-tight text-foreground">{name}</p>
      <p className="text-base font-mono text-muted-foreground">{variable}</p>
      <p className="text-base font-mono text-muted-foreground/70">{hex}</p>
    </div>
  )
}

// ── Stories ──────────────────────────────────────────────────

export const DarkNeon: Story = {
  name: "Dark Neon",
  parameters: {
    backgrounds: { default: "dark-neon" },
    docs: {
      description: {
        story: "Paleta completa del tema **Dark Neon** — Primary = Neon Green `#43e97b`. Es el tema por defecto de la aplicación.",
      },
      source: {
        code: `// Uso de tokens de color — Dark Neon
className="bg-primary text-primary-foreground"
className="text-secondary"
className="text-destructive"
className="text-muted-foreground"
className="bg-background"

// Neon directos
className="text-neon-green bg-neon-cyan"

// RGB para transparencias con opacidad
style={{ backgroundColor: \`rgba(var(--primary-rgb), 0.15)\` }}
style={{ boxShadow: \`0 0 20px rgba(var(--primary-rgb), 0.4)\` }}`,
      },
    },
  },
  render: () => <DarkPaletteContent />,
}

export const LightFrost: Story = {
  name: "Light Frost",
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story: "Paleta completa del tema **Light Frost** — Primary = Neon Cyan `#00f2fe`.",
      },
      source: {
        code: `// Uso de tokens de color — Light Frost
// Los mismos tokens se resuelven automáticamente según el tema activo

className="bg-primary text-primary-foreground"
className="text-secondary"
className="text-muted-foreground"
className="bg-background"

// Activar tema light en un contenedor
<div className="light">
  <Button variant="default">Primary Cyan</Button>
</div>`,
      },
    },
  },
  render: () => <LightPaletteContent />,
}

export const Comparacion: Story = {
  name: "Comparación Dark vs Light",
  parameters: {
    backgrounds: { default: "dark-neon" },
    docs: {
      description: {
        story: "Comparación lado a lado de los colores clave que cambian entre temas.",
      },
      source: {
        code: `// Tokens CSS que cambian entre temas:
// --primary:    #43e97b (dark) → #00f2fe (light)
// --secondary:  #f093fb (dark) → #e2e8f0 (light)
// --background: #0a0a0f (dark) → #f0f4f8 (light)
// --foreground: #ededed (dark) → #0d1117 (light)

// Usar siempre tokens semánticos para adaptabilidad automática:
className="bg-primary"        // verde (dark) / cyan (light)
className="text-foreground"   // blanco (dark) / negro (light)
className="bg-background"     // oscuro (dark) / claro (light)`,
      },
    },
  },
  render: () => {
    const tokens = [
      { token: "--primary",    dark: "#43e97b", light: "#00f2fe",  darkLabel: "Neon Green",  lightLabel: "Neon Cyan" },
      { token: "--secondary",  dark: "#f093fb", light: "#e2e8f0",  darkLabel: "Neon Pink",   lightLabel: "Slate 200" },
      { token: "--accent-foreground", dark: "#00f2fe", light: "#1e40af", darkLabel: "Neon Cyan", lightLabel: "Blue 800" },
      { token: "--destructive",dark: "#f5576c", light: "#ef4444",  darkLabel: "Neon Red",    lightLabel: "Red 500" },
      { token: "--background", dark: "#0a0a0f", light: "#f0f4f8",  darkLabel: "Dark Void",   lightLabel: "Slate 100" },
      { token: "--foreground", dark: "#ededed", light: "#0d1117",  darkLabel: "Near White",  lightLabel: "Near Black" },
      { token: "--muted",      dark: "#1a1a2e", light: "#e8edf3",  darkLabel: "Deep Navy",   lightLabel: "Slate 100" },
      { token: "--ring",       dark: "#43e97b", light: "#00f2fe",  darkLabel: "Neon Green",  lightLabel: "Neon Cyan" },
    ]

    return (
      <div className="p-6 space-y-4 bg-background">
        <h1 className="text-xl font-bold text-foreground">Dark vs Light</h1>
        <p className="text-base text-muted-foreground">Tokens que cambian de valor según el tema activo</p>
        <div className="space-y-2">
          {tokens.map((t) => (
            <div
              key={t.token}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-3 rounded-xl border border-white/8 bg-white/3"
            >
              <code className="text-base font-mono text-primary">{t.token}</code>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg border border-white/10" style={{ backgroundColor: t.dark }} />
                <div className="text-right">
                  <p className="text-base font-medium text-foreground">{t.darkLabel}</p>
                  <p className="text-base font-mono text-muted-foreground">{t.dark}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg border border-black/10" style={{ backgroundColor: t.light }} />
                <div className="text-right">
                  <p className="text-base font-medium text-foreground">{t.lightLabel}</p>
                  <p className="text-base font-mono text-muted-foreground">{t.light}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
}
