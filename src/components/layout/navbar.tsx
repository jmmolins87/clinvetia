"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { CalendarDays, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SwitchWithLabel } from "@/components/ui/switch"
import { BrandName } from "@/components/ui/brand-name"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Icon } from "@/components/ui/icon"
import { useROIStore } from "@/store/roi-store"
import { cn } from "@/lib/utils"

// ── Datos ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/solucion",       label: "Solución"        },
  { href: "/escenarios",     label: "Escenarios"      },
  { href: "/como-funciona",  label: "Cómo funciona"  },
  { href: "/contacto",      label: "Contacto"       },
] as const

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      href="/"
      aria-label="Ir al inicio de Clinvetia"
      className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src="/logo.png"
        alt="Clinvetia"
        width={32}
        height={32}
        className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
      />
      <BrandName className="text-xl font-bold tracking-tight" />
    </Link>
  )
}

function NavLinks() {
  const pathname = usePathname()
  
  return (
    <nav
      aria-label="Navegación principal"
      className="hidden md:flex items-center gap-0.5"
    >
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href
        
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-full px-4 py-1.5",
              "text-sm font-medium",
              "transition-colors duration-200",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/8",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100]",
        "bg-background/60 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/20",
        "border-b border-white/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(255,255,255,0.04)]",
      )}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        <Logo />

        {/* ── Nav links + Acciones ────────────────────── */}
        <div className="flex items-center gap-2">

          <NavLinks />

          {/* Selector de idioma — Oculto en mobile */}
          <div className="hidden md:flex">
            <SwitchWithLabel labelLeft="ES" labelRight="EN" />
          </div>

          {/* ThemeSwitcher — Oculto en mobile */}
          <div className="hidden md:flex">
            <ThemeSwitcher />
          </div>

          {/* Calculadora ROI — Oculto en mobile */}
          <div className="hidden md:flex">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              asChild
            >
              <Link href="/calculadora">
                <Icon icon={Calculator} size="sm" variant="secondary" aria-hidden />
                <span>Calculadora ROI</span>
              </Link>
            </Button>
          </div>

          {/* CTA principal — Oculto en mobile */}
          <div className="hidden md:flex">
            <Button size="sm" asChild>
              <Link href="/demo" className="flex items-center gap-2">
                <Icon icon={CalendarDays} size="sm" variant="primary" aria-hidden />
                <span>Reservar demo</span>
              </Link>
            </Button>
          </div>

          {/* Menú Mobile — Único visible junto al logo en mobile */}
          <MobileNav />

        </div>
      </div>
    </header>
  )
}
