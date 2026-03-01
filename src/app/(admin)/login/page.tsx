"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { useToast } from "@/components/ui/use-toast"
import { getRecaptchaToken } from "@/lib/recaptcha-client"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (searchParams.get("notice") !== "reset-requested") return
    toast({
      variant: "destructive",
      title: "Sesión cerrada",
      description: "Se solicitó un cambio de contraseña. Inicia sesión cuando hayas confirmado el cambio.",
    })
  }, [searchParams, toast])

  useEffect(() => {
    if (searchParams.get("notice") !== "reset-confirmed") return
    toast({
      variant: "success",
      title: "Cambio confirmado",
      description: "La contraseña se ha actualizado. Ya puedes iniciar sesión con la nueva contraseña.",
    })
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const recaptchaToken = await getRecaptchaToken("admin_login")
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Error al iniciar sesion")
      }

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <GlassCard className="w-full max-w-md p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary">Admin</Badge>
          <h1 className="text-2xl font-bold">Acceso al panel</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="glass"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="flex h-11 items-center rounded-full border border-[var(--field-border)] bg-[var(--field-bg)] px-3 backdrop-blur-xl shadow-[var(--field-shadow)] transition-all hover:border-[var(--field-border-hover)] focus-within:border-[var(--field-focus-border)] focus-within:shadow-[var(--field-focus-shadow)]">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-full flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="h-8 w-8 shrink-0 rounded-full border border-[var(--field-icon-border)] bg-[var(--field-icon-bg)] p-0 hover:bg-[var(--field-icon-bg-hover)]"
              >
                <Icon
                  icon={showPassword ? EyeOff : Eye}
                  size="sm"
                  variant="muted"
                />
              </Button>
            </div>
          </div>

          {error && <div className="text-xs text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
