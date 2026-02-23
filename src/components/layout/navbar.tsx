import Link from "next/link"
import Image from "next/image"
import { CalendarDays, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SwitchWithLabel } from "@/components/ui/switch"
import { BrandName } from "@/components/ui/brand-name"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
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
  return (
    <nav
      aria-label="Navegación principal"
      className="hidden md:flex items-center gap-0.5"
    >
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-full px-4 py-1.5",
            "text-sm font-medium",
            "text-muted-foreground",
            "transition-colors duration-200",
            "hover:text-primary hover:bg-primary/8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {label}
        </Link>
      ))}
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

        {/* ── Nav links + Acciones alineados a la derecha ────────────────────── */}
        <div className="flex items-center gap-2">

          <NavLinks />

          {/* Selector de idioma — Switch ES/EN */}
          <div className="hidden md:flex">
            <SwitchWithLabel labelLeft="ES" labelRight="EN" />
          </div>

          <ThemeSwitcher />

          {/* Calculadora ROI */}
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            asChild
          >
            <Link href="/calculadora">
              <Calculator className="size-4" aria-hidden />
              <span className="hidden sm:inline">Calculadora ROI</span>
              <span className="sm:hidden">ROI</span>
            </Link>
          </Button>

          {/* CTA principal */}
          <Button size="sm" asChild>
            <Link href="/demo" className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden />
              <span>Reservar demo</span>
            </Link>
          </Button>

        </div>
      </div>
    </header>
  )
}
