"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LoadingOverlay } from "@/components/ui/spinner"

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Cuando cambia la ruta, mostramos el loader brevemente
    setLoading(true)
    
    // Simulamos un tiempo mínimo de carga para que el usuario perciba la transición premium
    // y damos tiempo a que el DOM se prepare
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

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
