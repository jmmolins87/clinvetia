import * as React from "react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Liquid Glass Textarea — mismo lenguaje visual que Input.
// Superficie de cristal esmerilado con highlight interno y glow en focus.
// Esquinas redondeadas generosas (rounded-2xl) para coherencia con el estilo.
// ---------------------------------------------------------------------------

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // ── Structure ──────────────────────────────────────────────────
        "flex min-h-[100px] w-full rounded-2xl",
        "px-5 py-4",
        "text-sm text-foreground",
        "ring-offset-background",
        "transition-all duration-250",
        "resize-y",

        // ── Liquid Glass surface ────────────────────────────────────────
        "bg-[rgba(255,255,255,0.05)] backdrop-blur-xl",

        // ── Borde en reposo ─────────────────────────────────────────────
        "border border-[rgba(255,255,255,0.14)]",

        // ── Highlight interno ───────────────────────────────────────────
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.20)]",

        // ── Placeholder ─────────────────────────────────────────────────
        "placeholder:text-muted-foreground/60",

        // ── Hover ───────────────────────────────────────────────────────
        "hover:border-[rgba(255,255,255,0.25)]",
        "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.20)]",

        // ── Focus — glow neon + borde luminoso ──────────────────────────
        "focus-visible:outline-none",
        "focus-visible:border-[rgba(var(--primary-rgb),0.70)]",
        "focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.20),0_0_20px_rgba(var(--primary-rgb),0.35),0_0_50px_rgba(var(--primary-rgb),0.15)]",

        // ── Disabled ────────────────────────────────────────────────────
        "disabled:cursor-not-allowed disabled:opacity-40",

        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
