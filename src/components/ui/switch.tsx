"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

// ── Switch ────────────────────────────────────────────────────────────────────
// Root: pill translúcido — unchecked usa bg-input/50 (glass), checked usa
// bg-primary con glow neon.
// Thumb: círculo blanco que brilla al activarse mediante box-shadow.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      // ── Layout & forma ──────────────────────────────────────────────────
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      "border-2 border-white/10",
      "transition-colors duration-200",

      // ── Estados de foco ─────────────────────────────────────────────────
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "ring-offset-background",

      // ── Deshabilitado ────────────────────────────────────────────────────
      "disabled:cursor-not-allowed disabled:opacity-50",

      // ── Colores por estado ───────────────────────────────────────────────
      // unchecked: vidrio oscuro semitransparente
      "data-[state=unchecked]:bg-white/10",
      // checked: color primario con glow exterior sutil
      "data-[state=checked]:bg-primary",
      "data-[state=checked]:shadow-[0_0_12px_rgba(var(--primary-rgb),0.60)]",

      className,
    )}
    ref={ref}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        // ── Base del thumb ────────────────────────────────────────────────
        "pointer-events-none block h-5 w-5 rounded-full",
        "bg-white",
        "shadow-lg ring-0",
        "transition-all duration-200",

        // ── Posición según estado ─────────────────────────────────────────
        "data-[state=unchecked]:translate-x-0",
        "data-[state=checked]:translate-x-5",

        // ── Glow del thumb cuando está activo ─────────────────────────────
        "data-[state=checked]:shadow-[0_0_10px_rgba(255,255,255,0.85),0_0_20px_rgba(var(--primary-rgb),0.40)]",
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

// ── SwitchWithLabel ───────────────────────────────────────────────────────────
// Switch con borde que envuelve el componente + labels opcionales a ambos lados
export interface SwitchWithLabelProps {
  labelLeft?: React.ReactNode
  labelRight?: React.ReactNode
  className?: string
  switchClassName?: string
  labelClassName?: string
}

const SwitchWithLabel = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchWithLabelProps & React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ labelLeft, labelRight, className, switchClassName, labelClassName, ...props }, ref) => (
  <div
    className={cn(
      "inline-flex items-center gap-2 rounded-xl p-1.5",
      "bg-white/5 border border-white/10",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)]",
      className
    )}
  >
    {labelLeft && (
      <span className={cn("text-base font-medium text-muted-foreground", labelClassName)}>
        {labelLeft}
      </span>
    )}
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent",
        "transition-colors duration-200",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=unchecked]:bg-white/10",
        "data-[state=checked]:bg-primary",
        "data-[state=checked]:shadow-[0_0_12px_rgba(var(--primary-rgb),0.60)]",
        switchClassName
      )}
      ref={ref}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full",
          "bg-white",
          "shadow-lg ring-0",
          "transition-all duration-200",
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-5",
          "data-[state=checked]:shadow-[0_0_10px_rgba(255,255,255,0.85),0_0_20px_rgba(var(--primary-rgb),0.40)]"
        )}
      />
    </SwitchPrimitive.Root>
    {labelRight && (
      <span className={cn("text-base font-medium text-muted-foreground", labelClassName)}>
        {labelRight}
      </span>
    )}
  </div>
))
SwitchWithLabel.displayName = "SwitchWithLabel"

export { Switch, SwitchWithLabel }
