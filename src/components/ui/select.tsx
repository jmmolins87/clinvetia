"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, disabled, ...props }, ref) => (
  <div className="relative w-full">
    <select
      ref={ref}
      disabled={disabled}
      className={cn(
        "flex h-11 w-full appearance-none rounded-full px-5 py-2.5 pr-12 text-sm text-foreground ring-offset-background transition-all duration-250",
        "bg-[var(--field-bg)] backdrop-blur-xl border border-[var(--field-border)]",
        "shadow-[var(--field-shadow)]",
        "placeholder:text-muted-foreground/60 hover:border-[var(--field-border-hover)] hover:shadow-[var(--field-shadow-hover)]",
        "focus-visible:outline-none focus-visible:border-[var(--field-focus-border)] focus-visible:ring-0",
        "focus-visible:shadow-[var(--field-focus-shadow)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <div className={cn("pointer-events-none absolute inset-y-0 right-4 flex items-center", disabled && "opacity-50")}>
      <Icon icon={ChevronDown} size="sm" variant="muted" />
    </div>
  </div>
))

Select.displayName = "Select"

export { Select }
