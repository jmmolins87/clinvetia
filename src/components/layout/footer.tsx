"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BrandName } from "@/components/ui/brand-name"
import { SkeletonWrapper } from "@/components/ui/skeleton-wrapper"
import { TranslatableText, useTranslationSkeleton } from "@/components/providers/translation-skeleton"

// ── Datos ─────────────────────────────────────────────────────────────────────

const FOOTER_COLUMNS = [
  {
    heading: "Producto",
    links: [
      { href: "/solucion",      label: "Solución"       },
      { href: "/escenarios",    label: "Escenarios"     },
      { href: "/como-funciona", label: "Cómo funciona"  },
      { href: "/calculadora",   label: "Calculadora ROI"},
    ],
  },
  {
    heading: "Compañía",
    links: [
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy",   label: "Privacidad"      },
      { href: "/terms",     label: "Términos de uso" },
      { href: "/cookies",   label: "Cookies"         },
      { href: "/security",  label: "Seguridad"       },
    ],
  },
] as const

const SOCIAL_LINKS = [
  { href: "https://twitter.com/clinvetia",           label: "X (Twitter)" },
  { href: "https://linkedin.com/company/clinvetia",  label: "LinkedIn"    },
  { href: "https://github.com/clinvetia",            label: "GitHub"      },
] as const

// ── Sub-componentes ───────────────────────────────────────────────────────────

function FooterLogo() {
  const { t } = useTranslationSkeleton()

  return (
    <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
      <Link
        href="/"
        aria-label={t("Inicio Clinvetia")}
        className="flex w-fit items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.80)]"
        />
        <BrandName className="text-lg font-bold tracking-tight" />
      </Link>

      <p className="max-w-[240px] text-sm leading-relaxed text-muted-foreground">
        <TranslatableText text="Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo." />
      </p>

      {/* Social */}
      <div className="flex flex-wrap gap-3">
        {SOCIAL_LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
              "text-sm text-muted-foreground",
              "transition-colors duration-200",
              "hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string
  links: ReadonlyArray<{ href: string; label: string }>
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
        <TranslatableText text={heading} />
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "text-sm text-muted-foreground",
                "transition-colors duration-200",
                "hover:text-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
              )}
            >
              <TranslatableText text={label} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslationSkeleton()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer
      aria-label={t("Pie de página de Clinvetia")}
      className={cn(
        "border-t border-white/10",
        "bg-white dark:bg-black/40 backdrop-blur-sm",
        "py-14",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Grid 4 columnas — 2 en mobile */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          <FooterLogo />
          {FOOTER_COLUMNS.map((col) => (
            <FooterColumn key={col.heading} heading={col.heading} links={col.links} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className={cn(
          "mt-12 pt-6",
          "border-t border-white/8",
          "flex flex-col items-center justify-between gap-3 sm:flex-row",
        )}>
          <p className="text-sm text-muted-foreground">
            <SkeletonWrapper as="span" wrapperClassName="inline-grid" className="h-[1.2em] w-[15em] rounded-md">
              © {mounted ? new Date().getFullYear() : "2026"} <BrandName />.{" "}
              <TranslatableText text="Todos los derechos reservados." />
            </SkeletonWrapper>
          </p>
          <p className="text-sm text-muted-foreground">
            <SkeletonWrapper as="span" wrapperClassName="inline-grid" className="h-[1.2em] w-[12em] rounded-md">
              <TranslatableText text="Hecho con" />{" "}
              <span aria-label="amor" className="text-destructive">♥</span>{" "}
              <TranslatableText text="para veterinarias." />
            </SkeletonWrapper>
          </p>
        </div>

      </div>
    </footer>
  )
}
