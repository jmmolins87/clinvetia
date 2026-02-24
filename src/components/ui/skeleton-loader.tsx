"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export interface SkeletonLoaderProps {
  isLoading?: boolean
  duration?: number
  children?: React.ReactNode
  className?: string
  skeletonVariants?: ("default" | "glass" | "primary" | "secondary")[]
}

export function SkeletonLoader({
  isLoading,
  duration = 2000,
  children,
  className,
  skeletonVariants = ["default", "glass"],
}: SkeletonLoaderProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(false)

  React.useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isLoading, duration])

  if (!showSkeleton && !isLoading) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn("opacity-0", showSkeleton && "opacity-0 pointer-events-none")}>
        {children}
      </div>
      {showSkeleton && (
        <div className={cn("absolute inset-0", showSkeleton ? "animate-in fade-in duration-300" : "animate-out fade-out")}>
          {children && React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return child
            
            const variant = skeletonVariants[index % skeletonVariants.length]
            
            return React.cloneElement(child as React.ReactElement<any>, {
              className: cn(
                (child as React.ReactElement<any>).props.className,
                "opacity-0"
              )
            })
          })}
        </div>
      )}
    </div>
  )
}

export function SkeletonOverlay({ 
  isLoading, 
  duration = 2000,
  className,
  children,
}: { 
  isLoading?: boolean
  duration?: number
  className?: string
  children?: React.ReactNode 
}) {
  const [showSkeleton, setShowSkeleton] = React.useState(false)

  React.useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isLoading, duration])

  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative", className)}>
      {showSkeleton ? (
        <div className="animate-in fade-in duration-300">
          {children && React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null
            
            const childElement = child as React.ReactElement<any>
            const { className: childClassName, children: childContent, ...childProps } = childElement.props
            
            if (childContent && typeof childContent === 'object' && childContent.length !== undefined) {
              return (
                <Skeleton key={index} variant="primary" className={cn("h-8 w-full rounded-lg", childClassName)} />
              )
            }
            
            return (
                <Skeleton key={index} variant="primary" className={cn("h-8 w-full rounded-lg", childClassName)} />
            )
          })}
        </div>
      ) : (
        <div className="opacity-0">{children}</div>
      )}
    </div>
  )
}
