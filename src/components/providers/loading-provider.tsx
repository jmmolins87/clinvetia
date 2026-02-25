"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = React.createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
})

export function useGlobalLoading() {
  return React.useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const pathname = usePathname()

  // Reset loading on pathname change or simulate initial load
  React.useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
