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
            "flex h-11 w-full rounded-full px-5 py-2.5 text-sm text-foreground ring-offset-background transition-all duration-250 bg-[var(--field-bg)] backdrop-blur-xl border border-[var(--field-border)] shadow-[var(--field-shadow)] placeholder:text-muted-foreground/60 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:border-[var(--field-border-hover)] hover:shadow-[var(--field-shadow-hover)] focus-visible:outline-none focus-visible:border-[var(--field-focus-border)] focus-visible:shadow-[var(--field-focus-shadow)] disabled:cursor-not-allowed disabled:opacity-40",
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
