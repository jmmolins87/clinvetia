"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10",
        accent:
          "border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10",
        warning:
          "border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10",
        secondary:
          "border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10",
        destructive:
          "border-white/10 bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10",
        outline:
          "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-9 px-3.5",
      },
      pressed: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "default", pressed: true, className: "border-primary/40 bg-primary/10 text-primary" },
      { variant: "accent", pressed: true, className: "border-accent/40 bg-accent/10 text-accent" },
      { variant: "warning", pressed: true, className: "border-warning/40 bg-warning/10 text-warning" },
      { variant: "secondary", pressed: true, className: "border-secondary/40 bg-secondary/10 text-secondary" },
      { variant: "destructive", pressed: true, className: "border-destructive/40 bg-destructive/10 text-destructive" },
      { variant: "outline", pressed: true, className: "border-white/20 bg-white/10 text-foreground" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      pressed: false,
    },
  }
)

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    Omit<VariantProps<typeof toggleVariants>, "pressed"> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed = false, onPressedChange, onClick, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      className={cn(toggleVariants({ variant, size, pressed }), className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) onPressedChange?.(!pressed)
      }}
      {...props}
    />
  )
)

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }

