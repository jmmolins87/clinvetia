"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Users, ReceiptText, PercentCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"

const meta = {
  title: "Design System/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Control deslizante con estilo **Liquid Glass** basado en Radix UI Slider.

- Track translúcido con relleno en color \`primary\`
- Thumb con borde neon y sombra
- Compatible con teclado y accesibilidad ARIA
- Usado en la **Calculadora de ROI** para configurar parámetros de clínica
        `,
      },
    },
  },
  argTypes: {
    min: { control: { type: "number" }, description: "Valor mínimo" },
    max: { control: { type: "number" }, description: "Valor máximo" },
    step: { control: { type: "number" }, description: "Incremento por paso" },
    disabled: { control: "boolean", description: "Deshabilita el slider" },
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories base ──────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
  },
  parameters: {
    docs: {
      description: { story: "Slider básico con valor inicial en 50." },
    },
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: [40],
    min: 0,
    max: 100,
    disabled: true,
  },
  parameters: {
    docs: {
      description: { story: "Estado deshabilitado — no interactivo, opacidad reducida." },
    },
  },
}

// ── SliderField — composite usado en la Calculadora ROI ───────────────────────

interface SliderFieldProps {
  label: string
  icon: React.ReactNode
  value: number
  min: number
  max: number
  step: number
  minLabel: string
  maxLabel: string
  color: "primary" | "secondary" | "destructive"
  hint: string
  formatValue?: (v: number) => string
}

const colorMap = {
  primary:     "text-primary",
  secondary:   "text-neon-pink",
  destructive: "text-destructive",
}

const dotMap = {
  primary:     "bg-primary",
  secondary:   "bg-neon-pink",
  destructive: "bg-destructive",
}

function SliderField({
  label, icon, value: initialValue, min, max, step,
  minLabel, maxLabel, color, hint,
  formatValue = (v) => String(v),
}: SliderFieldProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-sm font-medium flex items-center gap-2 ${colorMap[color]}`}>
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotMap[color]}`} />
          <span className="text-foreground/80">{label}</span>
          {icon}
        </label>
        <span className={`text-base font-bold tabular-nums ${colorMap[color]}`}>{formatValue(value)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => setValue(v)}
        min={min}
        max={max}
        step={step}
        className="py-1"
      />
      <div className="flex items-center justify-between text-base text-muted-foreground">
        <span>{minLabel}</span>
        <span className="text-center opacity-60 text-sm">{hint}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

function GlassWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl space-y-8">
      {children}
    </div>
  )
}

export const PacientesMes: Story = {
  name: "SliderField — Pacientes / mes",
  parameters: {
    docs: {
      description: {
        story: "Control de pacientes mensuales. Color primary (verde dark / cyan light).",
      },
    },
  },
  render: () => (
    <GlassWrap>
      <SliderField
        label="Pacientes / mes"
        icon={<Users className="w-4 h-4" />}
        value={300}
        min={50}
        max={1000}
        step={10}
        minLabel="50"
        maxLabel="1.000"
        color="primary"
        hint="Número total de consultas o visitas que gestiona tu clínica al mes."
      />
    </GlassWrap>
  ),
}

export const TicketMedio: Story = {
  name: "SliderField — Ticket Medio",
  parameters: {
    docs: {
      description: {
        story: "Control de ticket medio en euros. Color secondary (pink-magenta).",
      },
    },
  },
  render: () => (
    <GlassWrap>
      <SliderField
        label="Ticket Medio"
        icon={<ReceiptText className="w-4 h-4" />}
        value={50}
        min={20}
        max={200}
        step={5}
        minLabel="20€"
        maxLabel="200€"
        color="secondary"
        hint="Ingreso medio por visita o consulta (consulta + productos)."
        formatValue={(v) => `${v}€`}
      />
    </GlassWrap>
  ),
}

export const PerdidaConversion: Story = {
  name: "SliderField — % Pérdida de conversión",
  parameters: {
    docs: {
      description: {
        story: "Control del porcentaje de pérdida de conversión. Color destructive (rojo) para señalar impacto negativo.",
      },
    },
  },
  render: () => (
    <GlassWrap>
      <SliderField
        label="% Pérdida de conversión"
        icon={<PercentCircle className="w-4 h-4" />}
        value={20}
        min={0}
        max={60}
        step={1}
        minLabel="0%"
        maxLabel="60%"
        color="destructive"
        hint="Porcentaje de consultas que no se convierten en cita por falta de respuesta."
        formatValue={(v) => `${v}%`}
      />
    </GlassWrap>
  ),
}

export const CalculadoraCompleta: Story = {
  name: "SliderField — Los tres juntos (Calculadora ROI)",
  parameters: {
    docs: {
      description: {
        story: "Los tres controles de la Calculadora ROI combinados, tal como aparecen en `/calculadora`.",
      },
    },
  },
  render: () => (
    <GlassWrap>
      <SliderField
        label="Pacientes / mes"
        icon={<Users className="w-4 h-4" />}
        value={300}
        min={50}
        max={1000}
        step={10}
        minLabel="50"
        maxLabel="1.000"
        color="primary"
        hint="Número total de consultas o visitas que gestiona tu clínica al mes."
      />
      <SliderField
        label="Ticket Medio"
        icon={<ReceiptText className="w-4 h-4" />}
        value={50}
        min={20}
        max={200}
        step={5}
        minLabel="20€"
        maxLabel="200€"
        color="secondary"
        hint="Ingreso medio por visita o consulta (consulta + productos)."
        formatValue={(v) => `${v}€`}
      />
      <SliderField
        label="% Pérdida de conversión"
        icon={<PercentCircle className="w-4 h-4" />}
        value={20}
        min={0}
        max={60}
        step={1}
        minLabel="0%"
        maxLabel="60%"
        color="destructive"
        hint="Porcentaje de consultas que no se convierten en cita por falta de respuesta."
        formatValue={(v) => `${v}%`}
      />
    </GlassWrap>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <GlassWrap>
      <SliderField
        label="Pacientes / mes"
        icon={<Users className="w-4 h-4" />}
        value={300}
        min={50}
        max={1000}
        step={10}
        minLabel="50"
        maxLabel="1.000"
        color="primary"
        hint="Número total de consultas o visitas."
      />
      <SliderField
        label="Ticket Medio"
        icon={<ReceiptText className="w-4 h-4" />}
        value={50}
        min={20}
        max={200}
        step={5}
        minLabel="20€"
        maxLabel="200€"
        color="secondary"
        hint="Ingreso medio por visita."
        formatValue={(v) => `${v}€`}
      />
      <SliderField
        label="% Pérdida de conversión"
        icon={<PercentCircle className="w-4 h-4" />}
        value={20}
        min={0}
        max={60}
        step={1}
        minLabel="0%"
        maxLabel="60%"
        color="destructive"
        hint="Pérdida por falta de respuesta."
        formatValue={(v) => `${v}%`}
      />
    </GlassWrap>
  ),
}
