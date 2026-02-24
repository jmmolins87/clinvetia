import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { SkeletonLoader, SkeletonOverlay } from "@/components/ui/skeleton-loader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "Design System/SkeletonLoader",
  component: SkeletonLoader,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
    docs: {
      description: {
        component: `
Componente **SkeletonLoader** para mostrar estados de carga skeleton durante transiciones:

- **SkeletonLoader**: Envoltorio que muestra skeleton sobre el contenido durante la carga
- **SkeletonOverlay**: Variante que reemplaza el contenido con skeletons durante la carga

Usa la propiedad \`isLoading\` para activar el estado de carga.
El contenido se mostrará durante \`duration\` (por defecto 2000ms = 2 segundos).
        `,
      },
    },
  },
  argTypes: {
    duration: {
      control: "number",
      description: "Duración del skeleton en milisegundos",
      table: {
        defaultValue: { summary: "2000" },
      },
    },
    isLoading: {
      control: "boolean",
      description: "Activar el estado de carga",
    },
  },
} satisfies Meta<typeof SkeletonLoader>

export default meta
type Story = StoryObj<typeof meta>

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════════════════════════════

export const Default: Story = {
  name: "SkeletonLoader · Default",
  args: {
    duration: 2000,
    skeletonVariants: ["default", "glass"],
  },
  render: (args) => {
    const [isLoading, setIsLoading] = useState(false)
    
    return (
      <div className="space-y-4 w-full max-w-md">
        <Button onClick={() => setIsLoading(true)} disabled={isLoading}>
          {isLoading ? "Cargando..." : "Simular carga (2s)"}
        </Button>
        
        <SkeletonLoader isLoading={isLoading} duration={args.duration} skeletonVariants={args.skeletonVariants}>
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" variant="glass" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </GlassCard>
        </SkeletonLoader>
      </div>
    )
  },
}

export const WithPrimaryGradient: Story = {
  name: "SkeletonLoader · Primary Gradient",
  args: {
    duration: 2000,
    skeletonVariants: ["primary"],
  },
  render: (args) => {
    const [isLoading, setIsLoading] = useState(false)
    
    return (
      <div className="space-y-4 w-full max-w-md">
        <Button onClick={() => setIsLoading(true)} disabled={isLoading}>
          {isLoading ? "Cargando..." : "Simular carga (2s)"}
        </Button>
        
        <SkeletonLoader isLoading={isLoading} duration={args.duration} skeletonVariants={args.skeletonVariants}>
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" variant="glass" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </GlassCard>
        </SkeletonLoader>
      </div>
    )
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

export const Overlay: Story = {
  name: "SkeletonOverlay",
  args: {
    duration: 2000,
  },
  render: (args) => {
    const [isLoading, setIsLoading] = useState(false)
    
    return (
      <div className="space-y-4 w-full max-w-md">
        <Button onClick={() => setIsLoading(true)} disabled={isLoading}>
          {isLoading ? "Cargando..." : "Simular carga (2s)"}
        </Button>
        
        <SkeletonOverlay isLoading={isLoading} duration={args.duration}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="default">Etiqueta</Badge>
              <Badge variant="secondary">Secundaria</Badge>
            </div>
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-2">Título del contenido</h3>
              <p className="text-muted-foreground">
                Este contenido se reemplazará con skeletons durante la carga.
              </p>
            </GlassCard>
            <div className="flex gap-2">
              <Button variant="secondary">Cancelar</Button>
              <Button>Confirmar</Button>
            </div>
          </div>
        </SkeletonOverlay>
      </div>
    )
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// USE CASE: LANGUAGE SWITCH
// ═══════════════════════════════════════════════════════════════════════════════

export const LanguageSwitch: Story = {
  name: "Use Case · Language Switch",
  parameters: {
    docs: {
      description: {
        story: "Caso de uso: cambiar idioma en el menú. Al togglear el switch, se muestran skeletons durante 2 segundos.",
      },
    },
  },
  render: () => {
    const [isLoading, setIsLoading] = useState(false)
    const [language, setLanguage] = useState("ES")
    
    const handleLanguageChange = () => {
      setIsLoading(true)
      setLanguage(language === "ES" ? "EN" : "ES")
      setTimeout(() => setIsLoading(false), 2000)
    }
    
    return (
      <div className="space-y-6 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <span className="text-sm font-medium">Cambiar idioma</span>
          <Button
            onClick={handleLanguageChange}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              isLoading && "cursor-wait"
            )}
          >
            {language}
          </Button>
        </div>
        
        <SkeletonLoader isLoading={isLoading} duration={2000}>
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" variant="primary" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </GlassCard>
        </SkeletonLoader>
      </div>
    )
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// DARK + LIGHT
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils"

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => {
    const [isLoading, setIsLoading] = useState(false)
    
    return (
      <div className="flex flex-col gap-8 w-full max-w-md">
        <Button onClick={() => setIsLoading(true)} disabled={isLoading}>
          {isLoading ? "Cargando..." : "Simular carga"}
        </Button>
        
        <SkeletonLoader isLoading={isLoading} duration={2000}>
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" variant="glass" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </GlassCard>
        </SkeletonLoader>
      </div>
    )
  },
}
