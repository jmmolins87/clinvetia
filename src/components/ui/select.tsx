"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full appearance-none rounded-full px-5 py-2.5 pr-12 text-sm text-foreground ring-offset-background transition-all duration-250",
      "bg-[var(--field-bg)] backdrop-blur-xl border border-[var(--field-border)]",
      "shadow-[var(--field-shadow)]",
      "placeholder:text-muted-foreground/60 hover:border-[var(--field-border-hover)] hover:shadow-[var(--field-shadow-hover)]",
      "focus-visible:outline-none focus-visible:border-[var(--field-focus-border)] focus-visible:ring-0",
      "focus-visible:shadow-[var(--field-focus-shadow)]",
      "bg-no-repeat [background-position:right_1rem_center] [background-size:14px]",
      "[background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
))

Select.displayName = "Select"

export { Select }
