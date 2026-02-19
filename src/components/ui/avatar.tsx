import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// ── Avatar ────────────────────────────────────────────────────────────────────

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  variant?: "default" | "primary" | "secondary"
}

const sizeClasses = {
  xs:      "h-6 w-6 text-sm",
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

export function Avatar({
  src, alt, initials, size = "default", variant = "default", className, ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-full border font-semibold",
        "overflow-hidden select-none",
        "liquid-glass",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          className="object-cover"
          sizes="64px"
        />
      ) : (
        <span aria-label={alt}>{initials}</span>
      )}
    </div>
  )
}

// ── AvatarGroup ───────────────────────────────────────────────────────────────

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarProps["size"]
  children: React.ReactNode
}

export function AvatarGroup({ max, size = "default", children, className, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children)
  const visible = max ? items.slice(0, max) : items
  const overflow = max ? Math.max(0, items.length - max) : 0

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
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
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
