"use client"

import * as React from "react"
import { Skeleton, SkeletonProps } from "./skeleton"
import { useGlobalLoading } from "../providers/loading-provider"
import { cn } from "@/lib/utils"

interface SkeletonWrapperProps extends SkeletonProps {
  children: React.ReactNode
  showSkeleton?: boolean
  wrapperClassName?: string
  as?: "div" | "span"
}

export function SkeletonWrapper({
  children,
  showSkeleton,
  className,
  wrapperClassName,
  variant = "primary",
  as: Component = "div",
  ...skeletonProps
}: SkeletonWrapperProps) {
  const { isLoading } = useGlobalLoading()
  const active = showSkeleton ?? isLoading

  return (
    <Component className={cn(Component === "div" ? "grid" : "inline-grid", wrapperClassName)}>
      <Component 
        className={cn(
          "col-start-1 row-start-1 transition-opacity duration-300 flex-1", 
          active ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {children}
      </Component>
      {active && (
        <Component className="col-start-1 row-start-1 animate-in fade-in duration-300">
          <Skeleton 
            variant={variant}
            className={cn("w-full h-full min-h-[1em]", className)} 
            {...skeletonProps} 
          />
        </Component>
      )}
    </Component>
  )
}
