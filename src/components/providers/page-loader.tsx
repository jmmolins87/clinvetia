"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LoadingOverlay } from "@/components/ui/spinner"
import { useGlobalLoading } from "./loading-provider"

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const { setIsLoading } = useGlobalLoading()

  useEffect(() => {
    // Cuando cambia la ruta, mostramos el loader brevemente
    setLoading(true)
    setIsLoading(true)
    
    // Forzamos el scroll al inicio de la página inmediatamente
    window.scrollTo(0, 0)
    document.documentElement.scrollTo(0, 0)
    document.body.scrollTo(0, 0)
    
    // Simulamos un tiempo mínimo de carga para que el usuario perciba la transición premium
    // y damos tiempo a que el DOM se prepare
    const timer = setTimeout(() => {
      setLoading(false)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pathname, searchParams, setIsLoading])

  if (!loading) return null

  return (
    <LoadingOverlay 
      message="Clinvetia" 
      variant="primary" 
      className="bg-background/95 backdrop-blur-3xl"
    />
  )
}

export function PageLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  )
}
