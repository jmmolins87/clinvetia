import Link from "next/link"
import { cn } from "@/lib/utils"
import { BrandName } from "@/components/ui/brand-name"

// ── Datos ─────────────────────────────────────────────────────────────────────

const FOOTER_COLUMNS = [
  {
    heading: "Producto",
    links: [
      { href: "/solucion",   label: "Solución"       },
      { href: "/escenarios", label: "Escenarios"     },
      { href: "/#roi",      label: "Calculadora ROI"},
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
  return (
    <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
      <Link
        href="/"
        aria-label="Inicio Clinvetia"
        className="flex w-fit items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.80)]"
        />
        <BrandName className="text-lg font-bold tracking-tight" />
      </Link>

      <p className="max-w-[200px] text-sm leading-relaxed text-muted-foreground">
        Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo.
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
        {heading}
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
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer
      aria-label="Pie de página de Clinvetia"
      className={cn(
        "border-t border-white/10",
        "bg-black/40 backdrop-blur-sm",
        "py-14",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Grid 4 columnas — 2 en mobile */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
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
            © {new Date().getFullYear()} <BrandName />. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con{" "}
            <span aria-label="amor" className="text-destructive">♥</span>
            {" "}para veterinarias de habla hispana.
          </p>
        </div>

      </div>
    </footer>
  )
}
