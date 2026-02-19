"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// ── Tabs ──────────────────────────────────────────────────────────────────────
const Tabs = TabsPrimitive.Root

// ── TabsList ──────────────────────────────────────────────────────────────────
// Contenedor pill de vidrio esmerilado que agrupa los triggers.
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center",
      "rounded-full p-1",
      // Glass surface
      "bg-muted/50 backdrop-blur-sm",
      "border border-white/8",
      "text-muted-foreground",
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

// ── TabsTrigger ───────────────────────────────────────────────────────────────
// Estilo píldora: en reposo es invisible; al activarse toma bg-primary
// con shadow neon multicapa.
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // ── Layout ────────────────────────────────────────────────────────────
      "inline-flex items-center justify-center whitespace-nowrap",
      "rounded-full px-4 py-1.5",
      "text-sm font-medium",
      "ring-offset-background",
      "transition-all duration-200",

      // ── Foco ──────────────────────────────────────────────────────────────
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

      // ── Deshabilitado ──────────────────────────────────────────────────────
      "disabled:pointer-events-none disabled:opacity-50",

      // ── Activo: píldora neon ───────────────────────────────────────────────
      "data-[state=active]:bg-primary",
      "data-[state=active]:text-primary-foreground",
      "data-[state=active]:font-semibold",
      // Glow multicapa: near (blanco) + far (color primario)
      "data-[state=active]:shadow-[0_0_12px_rgba(var(--primary-rgb),0.55),0_0_30px_rgba(var(--primary-rgb),0.20),inset_0_1px_0_rgba(255,255,255,0.20)]",

      // ── Hover en triggers inactivos ────────────────────────────────────────
      "hover:text-foreground",

      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// ── TabsContent ───────────────────────────────────────────────────────────────
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4",
      "ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
