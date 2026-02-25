import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "primary" | "secondary"
  shape?: "rect" | "circle" | "text"
  lines?: number
}

function Skeleton({
  className,
  variant = "default",
  shape = "rect",
  lines = 1,
  ...props
}: SkeletonProps) {
  const isText = shape === "text"
  
  // Maximum visibility variants
  const variantClasses = cn(
    variant === "default" && "bg-black/15 dark:bg-white/25",
    variant === "glass" && "bg-white/40 dark:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/25",
    variant === "primary" && "bg-primary/25 dark:bg-primary/35 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30",
    variant === "secondary" && "bg-secondary/25 dark:bg-secondary/35 bg-gradient-to-r from-secondary/30 via-secondary/60 to-secondary/30"
  )

  if (isText && lines > 1) {
    return (
      <div className="flex flex-col gap-2 w-full py-0.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse rounded",
              variantClasses,
              "h-[0.7em] min-h-[10px]",
              i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
            )}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "animate-pulse",
        shape === "circle" ? "rounded-full" : "rounded-md",
        variantClasses,
        isText && "h-[0.8em] min-h-[12px]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
