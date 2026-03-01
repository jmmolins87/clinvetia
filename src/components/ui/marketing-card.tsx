"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Icon as AppIcon } from "@/components/ui/icon"
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper"

interface MarketingCardProps {
  icon?: LucideIcon
  title: React.ReactNode
  description: React.ReactNode
  className?: string
  iconClassName?: string
  index?: number
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
} as const

export function MarketingCard({ 
  icon: Icon, 
  title, 
  description, 
  className, 
  iconClassName,
  index = 0 
}: MarketingCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ ...fadeUp.transition, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] backdrop-blur-lg",
        "hover:border-[rgba(var(--white-rgb),0.20)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]",
        "transition-all duration-300",
        className
      )}>
        <CardContent className="p-6 flex gap-4">
          {Icon && (
            <div className="shrink-0">
              <SkeletonWrapper shape="circle" className="h-12 w-12">
                <div className={cn(
                  "flex items-center justify-center rounded-full bg-[rgba(var(--white-rgb),0.10)] p-3 h-12 w-12",
                  iconClassName
                )}>
                  <AppIcon icon={Icon} size="lg" variant="primary" />
                </div>
              </SkeletonWrapper>
            </div>
          )}
          <div className="flex-1">
            <SkeletonWrapper className="h-6 w-3/4 mb-2">
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
            </SkeletonWrapper>
            <SkeletonWrapper shape="text" lines={2}>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </SkeletonWrapper>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
