import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon, LucideProps } from "lucide-react"

import { cn } from "@/lib/utils"

const iconVariants = cva(
  "shrink-0 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        foreground: "text-foreground",
        primary: "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.50)]",
        secondary: "icon-glow-secondary",
        destructive: "text-destructive drop-shadow-[0_0_8px_rgba(var(--destructive-rgb),0.50)]",
        warning: "text-warning drop-shadow-[0_0_8px_rgba(var(--warning-rgb),0.50)]",
        success: "text-success drop-shadow-[0_0_8px_rgba(var(--success-rgb),0.50)]",
        accent: "icon-glow-accent",
        muted: "text-muted-foreground",
      },
      size: {
        xs: "size-3",
        sm: "size-4",
        default: "size-5",
        lg: "size-6",
        xl: "size-8",
        "2xl": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IconProps
  extends Omit<LucideProps, "size">,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, icon: IconComponent, variant, size, ...props }, ref) => {
    if (!IconComponent) {
      console.warn("Icon component: icon prop is required")
      return null
    }
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Icon.displayName = "Icon"

export { Icon, iconVariants }
