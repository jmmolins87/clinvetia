"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: "xs" | "sm" | "default" | "lg" | "xl"
    variant?: "default" | "primary" | "secondary"
    initials?: string
  }
>(({ className, size = "default", variant = "default", initials, ...props }, ref) => {
  const sizeClasses = {
    xs:      "h-6 w-6 text-xs",
    sm:      "h-8 w-8 text-sm",
    default: "h-10 w-10 text-sm",
    lg:      "h-12 w-12 text-base",
    xl:      "h-16 w-16 text-lg",
  }

  const variantClasses = {
    default:   "bg-white/10 border-white/20 text-foreground",
    primary:   "bg-primary/15 border-primary/40 text-primary",
    secondary: "bg-neon-pink/15 border-neon-pink/40 text-neon-pink",
  }

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border liquid-glass items-center justify-center font-semibold select-none",
        sizeClasses[size as keyof typeof sizeClasses],
        variantClasses[variant as keyof typeof variantClasses],
        className
      )}
      {...props}
    >
      {initials && (
        <span>{initials}</span>
      )}
    </AvatarPrimitive.Root>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// ── AvatarGroup ───────────────────────────────────────────────────────────────

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  children: React.ReactNode
}

export function AvatarGroup({ max, size = "default", children, className, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children)
  const visible = max ? items.slice(0, max) : items
  const overflow = max ? Math.max(0, items.length - max) : 0

  const sizeClasses = {
    xs:      "h-6 w-6 text-xs",
    sm:      "h-8 w-8 text-sm",
    default: "h-10 w-10 text-sm",
    lg:      "h-12 w-12 text-base",
    xl:      "h-16 w-16 text-lg",
  }

  const overlapClasses = {
    xs:      "-ml-2",
    sm:      "-ml-2.5",
    default: "-ml-3",
    lg:      "-ml-3.5",
    xl:      "-ml-4",
  }

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visible.map((child, i) => (
        <div
          key={i}
          className={cn("ring-2 ring-background rounded-full", i !== 0 && overlapClasses[size])}
          style={{ zIndex: visible.length - i }}
        >
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, { size })
            : child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "ring-2 ring-background rounded-full",
            "inline-flex items-center justify-center",
            "bg-white/10 border border-white/20 font-semibold text-muted-foreground",
            overlapClasses[size],
            sizeClasses[size],
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
