"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { Icon } from "@/components/ui/icon"
import { type LucideIcon } from "lucide-react"

export interface CtaAction {
  label: string
  href: string
  variant?: "default" | "secondary" | "ghost" | "accent" | "outline" | "destructive"
  icon?: LucideIcon
}

export interface CtaSectionProps {
  badge?: string
  title: string
  description: string
  actions: [CtaAction, ...CtaAction[]]
  variant?: "glass" | "glow"
  className?: string
  id?: string
}

export function CtaSection({
  badge,
  title,
  description,
  actions,
  variant = "glass",
  className,
  id,
}: CtaSectionProps) {
  const inner = (
    <div className="text-center">
      {badge && (
        <Badge variant="default" className="mb-6">
          {badge}
        </Badge>
      )}

      <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
        {title}
      </h2>

      <p className="mx-auto mb-8 max-w-xl text-muted-foreground md:text-lg">
        {description}
      </p>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        {actions.map((action) => {
          return (
            <Button
              key={action.href}
              variant={action.variant ?? "default"}
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href={action.href} className="gap-2">
                {action.icon && <Icon icon={action.icon} size="sm" />}
                {action.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )

  if (variant === "glow") {
    return (
      <section id={id} className={cn("py-32 overflow-hidden relative", className)}>
        <div className="container mx-auto px-4">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full bg-primary/10 blur-[120px]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-2xl"
          >
            {inner}
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className={cn("py-20", className)}>
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-10 md:p-14 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            {inner}
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
