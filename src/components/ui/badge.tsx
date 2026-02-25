import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { SkeletonWrapper } from "./skeleton-wrapper"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-full",
    "px-3 py-1",
    "text-base font-semibold tracking-wide",
    "transition-all duration-200",
    "backdrop-blur-md",
    "border",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "badge-default",
        primary: "badge-default",
        secondary: "badge-secondary",
        destructive: "badge-destructive",
        outline: [
          "bg-transparent",
          "border-white/25",
          "text-foreground",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
          "hover:bg-white/8",
        ].join(" "),
        accent: "badge-success",
        warning: "badge-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <SkeletonWrapper className={cn(badgeVariants({ variant }), "rounded-full")} wrapperClassName="inline-flex">
      <div className={cn(badgeVariants({ variant }), className)} {...props} />
    </SkeletonWrapper>
  )
}

export { Badge, badgeVariants }
