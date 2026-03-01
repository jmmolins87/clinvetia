"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/GlassCard"
import { cn } from "@/lib/utils"

type ConsentState = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = "cookie_consent"

function setCookie(name: string, value: string, days = 180) {
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax`
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"intro" | "customize">("intro")
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setOpen(true)
    }
  }, [])

  const persist = (next: ConsentState, scope: "all" | "none" | "custom") => {
    setCookie("cookie_consent", scope)
    setCookie("cookie_necessary", "1")
    setCookie("cookie_analytics", next.analytics ? "1" : "0")
    setCookie("cookie_marketing", next.marketing ? "1" : "0")
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ scope, ...next }))
    setOpen(false)
    setMode("intro")
  }

  const acceptAll = () => {
    const next = { ...consent, analytics: true, marketing: true }
    setConsent(next)
    persist(next, "all")
  }

  const rejectAll = () => {
    const next = { ...consent, analytics: false, marketing: false }
    setConsent(next)
    persist(next, "none")
  }

  const saveCustom = () => {
    persist(consent, "custom")
  }

  return (
    <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
      <DialogContent className="w-[96vw] sm:max-w-xl md:max-w-2xl max-h-[92vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle>Preferencias de cookies</DialogTitle>
          <DialogDescription className="text-base">
            Usamos cookies necesarias para el funcionamiento del sitio y opcionales para mejorar tu experiencia.
          </DialogDescription>
        </DialogHeader>

        {mode === "customize" ? (
          <div className="min-w-0 space-y-4">
            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Necesarias</Label>
                  <p className="text-xs text-muted-foreground">Siempre activas</p>
                </div>
                <Switch checked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Analíticas</Label>
                  <p className="text-xs text-muted-foreground">Ayudan a mejorar el sitio</p>
                </div>
                <Switch
                  checked={consent.analytics}
                  onCheckedChange={(checked) => setConsent((prev) => ({ ...prev, analytics: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Marketing</Label>
                  <p className="text-xs text-muted-foreground">Personalizan contenidos</p>
                </div>
                <Switch
                  checked={consent.marketing}
                  onCheckedChange={(checked) => setConsent((prev) => ({ ...prev, marketing: checked }))}
                />
              </div>
            </GlassCard>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            Puedes aceptar todas, rechazarlas o personalizar tus preferencias.
          </div>
        )}

        <DialogFooter className={cn("gap-2", mode === "customize" && "sm:[&>*]:flex-1")}>
          {mode === "customize" ? (
            <>
              <Button variant="ghost" onClick={() => setMode("intro")}>Volver</Button>
              <Button onClick={saveCustom}>Guardar</Button>
            </>
          ) : (
            <>
              <Button variant="destructive" onClick={rejectAll}>Cancelar todas</Button>
              <Button variant="ghost" onClick={() => setMode("customize")}>Personalizar</Button>
              <Button onClick={acceptAll}>Aceptar todas</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
