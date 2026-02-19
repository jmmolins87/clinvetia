import * as React from "react"
import { cn } from "@/lib/utils"

const variantStyles = {
  default: {
    wrapper: "liquid-glass",
    title: "text-foreground",
  },
  primary: {
    wrapper: "liquid-glass-primary",
    title: "text-gradient-primary",
  },
  secondary: {
    wrapper: "liquid-glass-secondary",
    title: "text-gradient-secondary",
  },
} as const

export type GlassCardVariant = keyof typeof variantStyles

/**
 * Props del componente GlassCard
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante visual: default (neutro), primary (green/cyan), secondary (pink) */
  variant?: GlassCardVariant
  /** Título de la tarjeta */
  title?: string
  /** Subtítulo descriptivo */
  subtitle?: string
  /** Contenido de la tarjeta */
  children?: React.ReactNode
  /** Clases CSS adicionales */
  className?: string
}

/**
 * Tarjeta contenedora con efecto Liquid Glass — superficie de cristal translúcido 3D
 * con highlight interno y glow exterior.
 * 
 * @example
 * ```tsx
 * // Tarjeta básica
 * <GlassCard title="Título" subtitle="Descripción">
 *   Contenido
 * </GlassCard>
 * 
 * // Con variante primary
 * <GlassCard variant="primary" title="Destacado">
 *   Contenido destacado
 * </GlassCard>
 * ```
 */
export function GlassCard({
  variant = "default",
  title,
  subtitle,
  children,
  className,
  onClick,
  ...props
}: GlassCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:-translate-y-1",
        styles.wrapper,
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h3 className={cn("text-lg font-semibold leading-tight", styles.title)}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {children && (
        <div className="text-sm text-foreground/80">{children}</div>
      )}
    </div>
  )
}
