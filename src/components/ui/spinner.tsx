"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
  variant?: "default" | "primary" | "secondary" | "accent"
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

const variantClasses = {
  default: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
    </div>
  )
)
Spinner.displayName = "Spinner"

// ── Loading Overlay ───────────────────────────────────────────────────────────────
// Pantalla completa con efecto glass para estados de carga
export interface LoadingOverlayProps {
  message?: string
  variant?: "default" | "primary" | "secondary" | "accent"
}

export function LoadingOverlay({
  message = "Cargando...",
  variant = "primary",
  className,
}: LoadingOverlayProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8",
        "bg-background/60 backdrop-blur-xl",
        "transition-all duration-500 animate-in fade-in",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow background */}
        <div className={cn(
          "absolute h-24 w-24 rounded-full blur-3xl opacity-20",
          variant === "primary" && "bg-primary",
          variant === "secondary" && "bg-secondary",
          variant === "accent" && "bg-accent",
          variant === "default" && "bg-muted-foreground"
        )} />
        
        {/* Main Spinner Ring */}
        <LoadingRing size="xl" variant={variant} className="h-20 w-20 border-[4px]" />
        
        {/* Center brand dot */}
        <div className={cn(
          "absolute h-3 w-3 rounded-full",
          variant === "primary" && "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]",
          variant === "secondary" && "bg-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.8)]",
          variant === "accent" && "bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.8)]",
          variant === "default" && "bg-muted-foreground"
        )} />
      </div>

      <div className="flex flex-col items-center gap-2">
        {message && (
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground/80 animate-pulse">
            {message}
          </p>
        )}
        <LoadingDots size="sm" variant={variant} className="opacity-50" />
      </div>
    </div>
  )
}

// ── Loading Dots ────────────────────────────────────────────────────────────────
export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "primary" | "secondary" | "accent"
}

const dotsSizeClasses = {
  sm: "h-1.5 w-1.5",
  default: "h-2 w-2",
  lg: "h-3 w-3",
}

const dotsVariantClasses = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
}

export function LoadingDots({
  size = "default",
  variant = "primary",
  className,
}: LoadingDotsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            dotsSizeClasses[size],
            dotsVariantClasses[variant]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ── Loading Ring ─────────────────────────────────────────────────────────────────
export interface LoadingRingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl"
  variant?: "default" | "primary" | "secondary" | "accent"
}

const ringSizeClasses = {
  sm: "h-6 w-6 border-2",
  default: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
  xl: "h-16 w-16 border-[3px]",
}

const ringVariantClasses = {
  default: "border-muted-foreground/20 border-t-muted-foreground",
  primary: "border-primary/20 border-t-primary",
  secondary: "border-secondary/20 border-t-secondary",
  accent: "border-accent/20 border-t-accent",
}

export function LoadingRing({
  size = "default",
  variant = "primary",
  className,
}: LoadingRingProps) {
  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        ringSizeClasses[size],
        ringVariantClasses[variant],
        className
      )}
    />
  )
}
