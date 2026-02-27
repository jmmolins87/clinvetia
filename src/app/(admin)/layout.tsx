"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, CalendarDays, FileClock, Inbox, LayoutGrid, LogOut, Menu, Settings, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { BrandName } from "@/components/ui/brand-name"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/bookings", label: "Citas", icon: CalendarDays },
  { href: "/admin/contacts", label: "Contactos", icon: Inbox },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/audit", label: "Auditoría", icon: FileClock },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string; role: string } | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadMe = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setAdmin(data.admin ?? null)
      } catch {}
    }
    loadMe()
    return () => {
      cancelled = true
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(var(--primary-rgb),0.12),transparent_35%),radial-gradient(circle_at_100%_20%,rgba(var(--secondary-rgb),0.10),transparent_40%)]">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 md:px-5 md:py-6">
        <div className="mb-4 lg:hidden">
          <GlassCard className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Administración</div>
                <div className="truncate text-sm font-semibold">Centro de operaciones Clinvetia</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="shrink-0">Interno</Badge>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                      <Icon icon={Menu} size="sm" />
                      <span className="sr-only">Abrir navegación</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="border-white/10 bg-background/95 backdrop-blur-xl">
                    <SheetHeader className="pr-8">
                      <SheetTitle>Panel de Clinvetia</SheetTitle>
                      <SheetDescription>
                        Navegación interna y accesos rápidos de gestión.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-5">
                      <div className="space-y-2">
                        {navItems.map((item) => {
                          const active = pathname === item.href
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all",
                                active
                                  ? "border-primary/40 bg-primary/10 text-foreground"
                                  : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Icon icon={item.icon} size="sm" variant={active ? "primary" : "muted"} />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          )
                        })}
                      </div>

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
                            <Button variant="ghost" size="sm" className="justify-start border border-white/10 !w-full" asChild>
                              <Link href="/admin/users">Gestionar usuarios</Link>
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
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="mt-3 -mx-1 overflow-x-auto">
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
          </GlassCard>
        </div>

        <div className="flex items-start gap-5 md:gap-6">
        <aside className="hidden w-[280px] shrink-0 self-start sticky top-6 lg:block">
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
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
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all",
                      active
                        ? "border-primary/40 bg-primary/10 text-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)]"
                        : "border-white/5 bg-white/0 text-muted-foreground hover:border-white/10 hover:bg-white/5 hover:text-foreground"
                    )}
                  >
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
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                    <Icon icon={BarChart3} size="sm" variant="accent" />
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

        <div className="min-w-0 flex-1">
          <GlassCard className="mb-5 hidden p-5 md:p-6 lg:block">
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
                  <Button variant="ghost" size="sm" className="!w-auto shrink-0 border border-white/10" asChild>
                    <Link href="/admin/users">Gestionar usuarios</Link>
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

          <div className="space-y-5">{children}</div>
        </div>
        </div>
      </div>
    </div>
  )
}
