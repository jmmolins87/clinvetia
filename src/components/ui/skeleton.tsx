import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "primary" | "secondary"
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        variant === "default" && "bg-black/70 dark:bg-white/30",
        variant === "glass" && "bg-black/60 dark:bg-white/20 border border-black/40 dark:border-white/10",
        variant === "primary" && "bg-gradient-to-r from-primary/60 via-primary/80 to-primary/60 dark:from-primary/30 dark:via-primary/60 dark:to-primary/30",
        variant === "secondary" && "bg-gradient-to-r from-secondary/60 via-secondary/80 to-secondary/60 dark:from-secondary/30 dark:via-secondary/60 dark:to-secondary/30",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
