import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "btn-liquid",
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold tracking-wide",
    "transition-all duration-200",
    "cursor-pointer",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "ring-offset-background",
    "disabled:opacity-40 disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary/15",
          "border-2 border-primary/70",
          "text-primary",
          "shadow-[0_0_20px_rgba(var(--primary-rgb),0.50),0_0_60px_rgba(var(--primary-rgb),0.20),inset_0_1px_0_rgba(255,255,255,0.20)]",
          "hover:bg-primary/22",
          "hover:border-primary",
          "hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.70),0_0_80px_rgba(var(--primary-rgb),0.30),inset_0_1px_0_rgba(255,255,255,0.25)]",
        ].join(" "),

        secondary: [
          "btn-secondary",
          "border-2",
        ].join(" "),

        destructive: [
          "btn-destructive",
          "border-2",
        ].join(" "),

        accent: [
          "btn-accent",
          "border-2",
        ].join(" "),

        ghost: [
          "btn-ghost-base",
          "border text-foreground",
        ].join(" "),

        outline: [
          "bg-transparent",
          "border-2 border-primary/50",
          "text-primary",
          "hover:bg-primary/10",
          "hover:border-primary",
          "hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.35),inset_0_1px_0_rgba(255,255,255,0.15)]",
        ].join(" "),

        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 rounded-md",
      },

      size: {
        default: "h-10 px-6 py-2.5",
        sm:      "h-8 px-4 text-base",
        lg:      "h-12 px-8 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
