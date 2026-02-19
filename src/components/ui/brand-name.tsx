import * as React from "react"
import { cn } from "@/lib/utils"

export interface BrandNameProps {
  className?: string
}

export function BrandName({ className }: BrandNameProps) {
  return (
    <span
      className={cn(
        "inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
        className,
      )}
    >
      ClinvetIA
    </span>
  )
}
