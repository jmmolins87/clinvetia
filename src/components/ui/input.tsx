import * as React from "react"

import { cn } from "@/lib/utils"
import { SkeletonWrapper } from "./skeleton-wrapper"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <SkeletonWrapper className={cn("h-11 w-full rounded-full", className)}>
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-full px-5 py-2.5 text-sm text-foreground ring-offset-background transition-all duration-250 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.14)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.20)] placeholder:text-muted-foreground/60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:border-[rgba(255,255,255,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.20)] focus-visible:outline-none focus-visible:border-[rgba(var(--primary-rgb),0.70)] focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.20),0_0_20px_rgba(var(--primary-rgb),0.35),0_0_50px_rgba(var(--primary-rgb),0.15)] disabled:cursor-not-allowed disabled:opacity-40",
            className
          )}
          ref={ref}
          {...props}
        />
      </SkeletonWrapper>
    )
  }
)
Input.displayName = "Input"

export { Input }
