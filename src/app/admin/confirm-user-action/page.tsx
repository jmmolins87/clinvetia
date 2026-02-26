"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ConfirmUserActionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null)

  useEffect(() => {
    setResult(null)
  }, [token])

  useEffect(() => {
    if (!result?.ok) return
    const timeout = window.setTimeout(() => {
      router.push("/admin")
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [result, router])

  const confirm = async () => {
    if (!token) {
      setResult({ ok: false, message: "Token no válido" })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/users/actions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error || "No se pudo confirmar la solicitud")
      }
      setResult({
        ok: true,
        message:
          payload?.type === "invite_user"
            ? "Usuario activado correctamente. Ya puedes iniciar sesión con las credenciales recibidas."
            : "Cambio de password confirmado correctamente.",
      })
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "Error al confirmar" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <GlassCard className="w-full max-w-lg p-6 md:p-8 space-y-5">
        <div className="space-y-2 text-center">
          <Badge variant="accent" className="mx-auto w-fit">Verificación</Badge>
          <h1 className="text-2xl font-semibold">Confirmar solicitud</h1>
          <p className="text-sm text-muted-foreground">
            Confirma la solicitud para activar el usuario o aplicar el cambio de password.
          </p>
        </div>

        {result && (
          <div className={result.ok ? "rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm" : "rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"}>
            {result.message}
            {result.ok && <div className="mt-2 text-xs text-muted-foreground">Redirigiendo al login...</div>}
          </div>
        )}

        {!result?.ok && (
          <Button className="w-full" onClick={confirm} disabled={loading || !token}>
            {loading ? "Confirmando..." : "Confirmar solicitud"}
          </Button>
        )}

        {result?.ok && (
          <Button className="w-full" variant="accent" onClick={() => router.push("/admin")}>
            Ir al login
          </Button>
        )}
      </GlassCard>
    </div>
  )
}
