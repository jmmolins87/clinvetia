import * as React from "react"
import { cn } from "@/lib/utils"
import { SkeletonWrapper } from "./skeleton-wrapper"

export interface BrandNameProps {
  className?: string
}

export function BrandName({ className }: BrandNameProps) {
  return (
    <SkeletonWrapper 
      as="span"
      className="h-[1.1em] w-[4em] rounded-md" 
      wrapperClassName="inline-grid"
    >
      <span
        className={cn(
          "inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
          className,
        )}
      >
        ClinvetIA
      </span>
    </SkeletonWrapper>
  )
}
