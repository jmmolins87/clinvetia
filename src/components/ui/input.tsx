import * as React from "react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Liquid Glass Input
// Efecto de "lente" aplicado al campo de texto:
// - Fondo translúcido con backdrop-blur (cristal esmerilado)
// - Highlight interno superior (inset top) para simular curvatura del cristal
// - Borde luminoso en focus con glow exterior de color cian
// ---------------------------------------------------------------------------

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // ── Structure ──────────────────────────────────────────────────
          "flex h-11 w-full rounded-full",
          "px-5 py-2.5",
          "text-sm text-foreground",
          "ring-offset-background",
          "transition-all duration-250",

          // ── Liquid Glass surface ───────────────────────────────────────
          // Fondo muy translúcido + blur fuerte = efecto lente real
          "bg-[rgba(255,255,255,0.05)] backdrop-blur-xl",

          // ── Borde en reposo — rim sutil ────────────────────────────────
          "border border-[rgba(255,255,255,0.14)]",

          // ── Highlight interno ──────────────────────────────────────────
          // Línea brillante en el borde superior = curvatura del cristal
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.20)]",

          // ── Placeholder ────────────────────────────────────────────────
          "placeholder:text-muted-foreground/60",

          // ── File input reset ───────────────────────────────────────────
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",

          // ── Hover — borde más visible ──────────────────────────────────
          "hover:border-[rgba(255,255,255,0.25)]",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.20)]",

          // ── Focus — glow neon + borde luminoso ────────────────────────
          "focus-visible:outline-none",
          "focus-visible:border-[rgba(var(--primary-rgb),0.70)]",
          "focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.20),0_0_20px_rgba(var(--primary-rgb),0.35),0_0_50px_rgba(var(--primary-rgb),0.15)]",

          // ── Disabled ───────────────────────────────────────────────────
          "disabled:cursor-not-allowed disabled:opacity-40",

          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
