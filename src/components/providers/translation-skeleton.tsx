"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Locale, localeStorageKey, normalizeLocale, translateText } from "@/lib/i18n"

interface TranslationSkeletonContextValue {
  locale: Locale
  isTranslating: boolean
  trigger: () => void
  setLocale: (locale: Locale) => void
  t: (text: string) => string
}

const TranslationSkeletonContext = createContext<TranslationSkeletonContextValue | null>(null)

export function TranslationSkeletonProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(localeStorageKey) : null
    if (saved) {
      setLocaleState(normalizeLocale(saved))
      return
    }
    if (typeof document !== "undefined") {
      setLocaleState(normalizeLocale(document.documentElement.lang))
      return
    }
    if (typeof navigator !== "undefined") {
      setLocaleState(normalizeLocale(navigator.language))
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(localeStorageKey, locale)
    }
  }, [locale])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  const trigger = useCallback(() => {}, [])
  const t = useCallback((text: string) => translateText(text, locale), [locale])

  const value = useMemo(
    () => ({ locale, isTranslating: false, trigger, setLocale, t }),
    [locale, trigger, setLocale, t]
  )

  return (
    <TranslationSkeletonContext.Provider value={value}>
      {children}
    </TranslationSkeletonContext.Provider>
  )
}

export function useTranslationSkeleton() {
  const ctx = useContext(TranslationSkeletonContext)
  if (!ctx) {
    return {
      locale: "es" as const,
      isTranslating: false,
      trigger: () => {},
      setLocale: () => {},
      t: (text: string) => text,
    }
  }
  return ctx
}

export function TranslatableText({
  text,
  className,
}: {
  text: string
  className?: string
  lines?: number
  skeletonClassName?: string
}) {
  const { t } = useTranslationSkeleton()
  return <span className={className}>{t(text)}</span>
}
