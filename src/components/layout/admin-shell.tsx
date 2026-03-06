"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, CalendarDays, FileClock, Inbox, LayoutGrid, LogOut, Mail, Menu, Settings, Sparkles, Users, X } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { BrandName } from "@/components/ui/brand-name"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ContentScroll } from "@/components/ui/content-scroll"
import { useToast } from "@/components/ui/use-toast"
import { ADMIN_ROLES, allowedCreatableRoles, type AdminRole } from "@/lib/admin-roles"
import { sanitizeInput } from "@/lib/security"
import { cn } from "@/lib/utils"

const baseNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/bookings", label: "Citas", icon: CalendarDays },
  { href: "/admin/contacts", label: "Contactos", icon: Inbox },
  { href: "/admin/mail", label: "Correos", icon: Mail },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/audit", label: "Auditoría", icon: FileClock },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string; role: AdminRole } | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState<AdminRole>("worker")
  const [editTouched, setEditTouched] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMobileNavHint, setShowMobileNavHint] = useState(false)
  const mobileNavScrollRef = useRef<HTMLDivElement | null>(null)
  const isDashboard = pathname === "/admin/dashboard"
  const editableRoles = useMemo(() => (admin ? allowedCreatableRoles(admin.role) : []), [admin])
  const navItems = useMemo(() => {
    const items = [...baseNavItems]
    if (admin?.role === "demo") {
      items.push({ href: "/admin/demo-playbook", label: "Presentación", icon: Sparkles })
    }
    return items
  }, [admin?.role])

  const updateMobileNavHint = useCallback(() => {
    const el = mobileNavScrollRef.current
    if (!el) return
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft
    setShowMobileNavHint(remaining > 2)
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadMe = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" })
        if (res.status === 401) {
          router.push("/admin/login")
          return
        }
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setAdmin(data.admin ?? null)
      } catch {}
    }
    loadMe()
    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "clinvetia:password-reset-confirmed") return
      router.refresh()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [router])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== "clinvetia:password-reset-confirmed") return
      router.refresh()
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [router])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    updateMobileNavHint()
    const el = mobileNavScrollRef.current
    if (el) {
      el.addEventListener("scroll", updateMobileNavHint, { passive: true })
    }
    window.addEventListener("resize", updateMobileNavHint)
    return () => {
      if (el) {
        el.removeEventListener("scroll", updateMobileNavHint)
      }
      window.removeEventListener("resize", updateMobileNavHint)
    }
  }, [pathname, updateMobileNavHint])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } finally {
      router.push("/admin")
      router.refresh()
      setLoggingOut(false)
    }
  }

  useEffect(() => {
    if (!editOpen || !admin) return
    setEditName(admin.name)
    setEditRole(admin.role)
    setEditTouched(false)
    setEditError(null)
  }, [editOpen, admin])

  useEffect(() => {
    if (!admin || editableRoles.length === 0) return
    if (!editableRoles.includes(editRole)) {
      setEditRole(editableRoles[0])
    }
  }, [admin, editableRoles, editRole])

  const saveAdminProfile = async () => {
    if (!admin) return
    const nextName = editName.trim()
    if (!nextName || nextName.length < 2 || nextName.length > 80) {
      setEditError("El nombre debe tener entre 2 y 80 caracteres")
      setEditTouched(true)
      return
    }
    setEditLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(admin.id)}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName, role: editRole }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error || "No se pudo actualizar")
      }
      setAdmin((prev) => (prev ? { ...prev, name: nextName, role: editRole } : prev))
      toast({ title: "Usuario actualizado", description: "Los cambios se han guardado correctamente." })
      setEditOpen(false)
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="admin-no-glow h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(var(--primary-rgb),0.12),transparent_35%),radial-gradient(circle_at_100%_20%,rgba(var(--secondary-rgb),0.10),transparent_40%)] no-scroll-dashboard">
      <div className="mx-auto flex h-full w-full max-w-[1920px] flex-col px-3 py-4 md:px-5 md:py-6 2xl:px-8">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="glass sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogDescription>
                Actualiza tu nombre y rol. No podrás asignar un rol superior al tuyo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="admin-name">Nombre</label>
                <Input
                  id="admin-name"
                  value={editName}
                  onChange={(e) => {
                    const value = sanitizeInput(e.target.value)
                    setEditName(value)
                    if (editTouched) {
                      setEditError(value.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : null)
                    }
                  }}
                  onBlur={(e) => {
                    setEditTouched(true)
                    const value = e.target.value.trim()
                    setEditError(value.length < 2 || value.length > 80 ? "El nombre debe tener entre 2 y 80 caracteres" : null)
                  }}
                  className={editError ? "glass border-destructive/50" : "glass"}
                  disabled={editLoading}
                />
                {editTouched && editError && <div className="text-xs text-destructive">{editError}</div>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="admin-role">Rol</label>
                <Select
                  id="admin-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="glass"
                  disabled={editLoading || editableRoles.length === 0}
                >
                  {ADMIN_ROLES.filter((role) => editableRoles.includes(role)).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
              </div>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2 sm:[&>*]:flex-none">
              <Button variant="ghost" className="w-full" onClick={() => setEditOpen(false)} disabled={editLoading}>
                Cancelar
              </Button>
              <Button className="w-full" onClick={saveAdminProfile} disabled={editLoading}>
                {editLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="mb-4 xl:hidden">
          <GlassCard className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Administración</div>
                <div className="truncate text-sm font-semibold">Centro de operaciones Clinvetia</div>
              </div>
              <div className="flex items-center">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 -mr-1">
                      <Icon icon={Menu} size="sm" />
                      <span className="sr-only">Abrir navegación</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-screen max-w-none border-0 bg-background/95 p-0 backdrop-blur-3xl [&>button]:hidden">
                    <SheetHeader className="flex h-16 flex-row items-center justify-between border-b border-white/5 px-6 text-left">
                      <SheetTitle className="text-xl">
                        Panel de <BrandName />
                      </SheetTitle>
                      <SheetDescription>
                        Navegación interna
                      </SheetDescription>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Cerrar navegación"
                      >
                        <Icon icon={X} size="sm" variant="muted" />
                      </Button>
                    </SheetHeader>

                    <ContentScroll className="h-[calc(100dvh-4rem)] px-5 py-5 sm:px-6 sm:py-6">
                      <div className="grid gap-6 pt-2 sm:grid-cols-[minmax(0,1fr)_280px] sm:items-start">
                        <div className="space-y-5">
                          {navItems.map((item) => {
                            const active = pathname === item.href
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "flex items-center justify-between text-4xl font-bold tracking-tight transition-colors sm:text-5xl",
                                  active
                                    ? "text-primary"
                                    : "text-foreground/60 hover:text-primary"
                                )}
                              >
                                <span>{item.label}</span>
                                {active && <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.8)]" />}
                              </Link>
                            )
                          })}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <Icon icon={CalendarDays} size="sm" variant="primary" />
                              <span className="text-sm font-medium">Gestión rápida</span>
                            </div>
                            <div className="grid gap-2">
                              <Button variant="ghost" size="sm" className="justify-start border border-primary/20 hover:bg-primary/10" asChild>
                                <Link href="/admin/bookings" onClick={() => setMobileMenuOpen(false)}>Gestionar citas</Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="justify-start border border-warning/20 hover:bg-warning/10 hover:text-warning" asChild>
                                <Link href="/admin/contacts" onClick={() => setMobileMenuOpen(false)}>Gestionar leads</Link>
                              </Button>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <Icon icon={Settings} size="sm" variant="accent" />
                              <span className="text-sm font-medium">Configuración</span>
                            </div>
                            <div className="space-y-2">
                              <div className="rounded-lg border border-white/10 bg-black/10 px-2.5 py-2 text-xs">
                                <div className="truncate font-semibold">{admin?.name || "Usuario interno"}</div>
                                <div className="truncate text-muted-foreground">{admin?.email || "..."}</div>
                              </div>
                              <div className="grid gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start border border-white/10 !w-full"
                                  onClick={() => {
                                    setMobileMenuOpen(false)
                                    if (isDashboard) {
                                      setEditOpen(true)
                                    } else {
                                      router.push("/admin/users")
                                    }
                                  }}
                                >
                                  Gestionar usuarios
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="justify-start !w-full"
                                  onClick={handleLogout}
                                  disabled={loggingOut}
                                >
                                  <Icon icon={LogOut} size="xs" variant="destructive" />
                                  {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ContentScroll>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="relative mt-3 -mx-1 overflow-hidden rounded-xl">
              <div ref={mobileNavScrollRef} className="overflow-x-auto">
                <div className="flex min-w-max gap-2 px-1 pb-1">
                {navItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                        active
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon icon={item.icon} size="xs" variant={active ? "primary" : "muted"} />
                      {item.label}
                    </Link>
                  )
                })}
                </div>
              </div>
              {showMobileNavHint && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-primary/25 via-primary/10 to-transparent xl:hidden" />
              )}
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-1 min-h-0 items-start gap-4 lg:gap-5 xl:gap-6">
        <aside className="hidden w-[250px] shrink-0 self-start xl:sticky xl:top-6 xl:block 2xl:w-[280px]">
          <div>
              <GlassCard className="flex flex-col p-5">
            <div className="space-y-4 border-b border-white/10 pb-5">
              <div className="space-y-2.5">
                <div className="text-lg font-semibold leading-tight">
                  Panel de <BrandName />
                </div>
                <p className="text-xs text-muted-foreground">
                  Operaciones, gestión de citas y seguimiento comercial
                </p>
              </div>

            </div>

            <nav className="mt-5 flex-1 space-y-2.5">
              {navItems.map((item) => {
                const active = pathname === item.href
                const auditDisabled = item.href === "/admin/audit" && ["manager", "worker"].includes(admin?.role || "")
                const className = cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all",
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)]"
                    : "border-white/5 bg-white/0 text-muted-foreground hover:border-white/10 hover:bg-white/5 hover:text-foreground",
                  auditDisabled && "cursor-not-allowed border-white/5 bg-white/0 text-muted-foreground/60 hover:border-white/5 hover:bg-white/0 hover:text-muted-foreground/60"
                )
                if (auditDisabled) {
                  return (
                    <div key={item.href} className={className} aria-disabled="true" title="No disponible para tu rol">
                      <Icon icon={item.icon} size="sm" variant="muted" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  )
                }
                return (
                  <Link key={item.href} href={item.href} className={className}>
                    <Icon icon={item.icon} size="sm" variant={active ? "primary" : "muted"} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Icon icon={CalendarDays} size="sm" variant="primary" />
                  <span className="text-sm font-medium">Gestión rápida</span>
                </div>
                <div className="grid gap-2">
                  <Button variant="ghost" size="sm" className="justify-start border border-primary/20 hover:bg-primary/10" asChild>
                    <Link href="/admin/bookings">Gestionar citas</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start border border-warning/20 hover:bg-warning/10 hover:text-warning" asChild>
                    <Link href="/admin/contacts">Gestionar leads</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/15">
                    <Icon icon={BarChart3} size="sm" variant="default" className="text-foreground" />
                  </div>
                  <span className="text-sm font-medium">Panel de gestión</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Diseño interno orientado a operación diaria y seguimiento de agenda.
                </p>
              </div>

            </div>
              </GlassCard>
          </div>
        </aside>

        <div className={cn("min-w-0 flex-1 flex flex-col min-h-0", isDashboard && "overflow-y-auto")}>
          <GlassCard className="mb-5 hidden p-5 md:p-6 xl:block">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Administración</div>
                <div className="text-xl font-semibold tracking-tight">Centro de operaciones Clinvetia</div>
              </div>
              <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 md:w-auto md:max-w-full md:flex-nowrap">
                <div className="flex min-w-0 items-center gap-2 pl-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
                    <Icon icon={Settings} size="sm" variant="primary" />
                  </div>
                  <div className="min-w-0 text-right">
                    <div className="truncate text-sm md:text-md font-semibold leading-none">{admin?.name || "Usuario interno"}</div>
                    <div className="pt-0.5">
                      <span className="inline-flex w-fit items-center rounded-full border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                        {admin?.role || "admin"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:flex-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!w-auto shrink-0 border border-white/10"
                    onClick={() => (isDashboard ? setEditOpen(true) : router.push("/admin/users"))}
                  >
                    Gestionar usuarios
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="!w-auto shrink-0"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <Icon icon={LogOut} size="xs" variant="destructive" />
                    {loggingOut ? "Cerrando..." : "Logout"}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex-1 min-h-0 space-y-5 pb-6">
            {children}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
