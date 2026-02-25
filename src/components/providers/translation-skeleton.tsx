"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TranslationSkeletonContextValue {
  isTranslating: boolean
  trigger: () => void
}

const TranslationSkeletonContext = createContext<TranslationSkeletonContextValue | null>(null)

export function TranslationSkeletonProvider({ children }: { children: React.ReactNode }) {
  const [isTranslating, setIsTranslating] = useState(false)

  const trigger = useCallback(() => {
    setIsTranslating(true)
    window.setTimeout(() => setIsTranslating(false), 1500)
  }, [])

  const value = useMemo(() => ({ isTranslating, trigger }), [isTranslating, trigger])

  return (
    <TranslationSkeletonContext.Provider value={value}>
      {children}
    </TranslationSkeletonContext.Provider>
  )
}

export function useTranslationSkeleton() {
  const ctx = useContext(TranslationSkeletonContext)
  if (!ctx) {
    return { isTranslating: false, trigger: () => {} }
  }
  return ctx
}

export function TranslatableText({
  text,
  className,
  lines = 1,
  skeletonClassName,
}: {
  text: string
  className?: string
  lines?: number
  skeletonClassName?: string
}) {
  const { isTranslating } = useTranslationSkeleton()

  if (!isTranslating) {
    return <span className={className}>{text}</span>
  }

  const baseWidth = Math.max(text.length, 1)

  return (
    <span className={cn("inline-flex flex-col", className)}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="default"
          className={cn("h-[1em] rounded-md", idx > 0 && "mt-2", skeletonClassName)}
          style={{ width: `${Math.max(1, baseWidth)}ch` }}
        />
      ))}
    </span>
  )
}
