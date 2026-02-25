"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { useROIStore } from "@/store/roi-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Calculator, AlertCircle, ArrowLeft } from "lucide-react"
import { storage } from "@/lib/storage"

export function ExitIntentGuard() {
  const pathname = usePathname()
  const { hasAcceptedDialog, accessToken } = useROIStore()
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [hasLocalAccessToken, setHasLocalAccessToken] = useState(false)
  
  // Usamos un ref para el estado de aceptación para que los listeners tengan el valor real
  const hasAcceptedRef = useRef(hasAcceptedDialog)
  useEffect(() => {
    hasAcceptedRef.current = hasAcceptedDialog
  }, [hasAcceptedDialog])

  const isCalculatorPage = pathname === "/calculadora"

  useEffect(() => {
    const storedAccessToken = storage.get<string | null>("local", "access_token", null)
    setHasLocalAccessToken(!!storedAccessToken)
  }, [hasAcceptedDialog, accessToken, pathname])

  const handleCloseDialog = useCallback(() => {
    setShowExitDialog(false)
    setPendingUrl(null)
  }, [])

  useEffect(() => {
    if (!isCalculatorPage || hasLocalAccessToken) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasAcceptedRef.current) return
      if (e.clientY <= 0) {
        setShowExitDialog(true)
      }
    }

    const handleInternalClick = (e: MouseEvent) => {
      if (hasAcceptedRef.current) return

      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href) {
        try {
          const url = new URL(link.href)
          const isExternal = url.origin !== window.location.origin
          const isSamePage = url.pathname === window.location.pathname
          
          if (!isExternal && !isSamePage && !url.hash.includes("roi")) {
            e.preventDefault()
            e.stopPropagation()
            setPendingUrl(link.href)
            setShowExitDialog(true)
          }
        } catch {
          // Ignorar URLs inválidas
        }
      }
    }

    const handlePopState = () => {
      if (hasAcceptedRef.current) return
      const destination = window.location.href
      setPendingUrl(destination)
      setShowExitDialog(true)
      window.history.pushState(null, "", "/calculadora")
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("click", handleInternalClick, true) // Capture phase
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("click", handleInternalClick, true)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isCalculatorPage, hasLocalAccessToken])

  const handleConfirmExit = () => {
    if (pendingUrl) {
      window.location.href = pendingUrl
    } else {
      setShowExitDialog(false)
    }
  }

  // Si no estamos en la calculadora o ya aceptó, no renderizamos el diálogo (pero mantenemos los hooks)
  if (!isCalculatorPage || hasAcceptedDialog || hasLocalAccessToken) return null

  return (
    <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 border border-warning/30 text-warning">
            <Icon icon={AlertCircle} size="lg" variant="warning" />
          </div>
          <DialogTitle className="text-center text-2xl">Antes de irte, un detalle</DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed">
            Si completas la calculadora, podremos darte una experiencia mucho mejor y una evaluación más precisa de tu clínica. Es rápido y vale la pena.
          </DialogDescription>
        </DialogHeader>
        
        <div className="rounded-xl bg-muted/50 border border-white/10 p-4 text-center text-sm text-muted-foreground italic">
          &ldquo;Así nos aseguramos de que recibas recomendaciones ajustadas a tus datos reales.&rdquo;
        </div>

        <DialogFooter className="mt-2 flex-col sm:flex-row gap-3">
          <Button 
            variant="destructive" 
            className="w-full sm:flex-1 gap-2" 
            onClick={handleConfirmExit}
          >
            <Icon icon={ArrowLeft} size="sm" variant="destructive" />
            Salir de todos modos
          </Button>
          <Button 
            variant="default" 
            className="w-full sm:flex-1 gap-2"
            onClick={handleCloseDialog}
          >
            Seguir calculando
            <Icon icon={Calculator} size="sm" variant="primary" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
