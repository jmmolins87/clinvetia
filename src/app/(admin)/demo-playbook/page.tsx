import { ArrowRight, CalendarClock, Inbox, Mail, TriangleAlert, Users, WandSparkles } from "lucide-react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

const flowSteps = [
  {
    title: "Dashboard",
    description: "Abre con visión global: volumen, conversión y carga operativa.",
    href: "/admin/dashboard",
    cta: "Ver Dashboard",
    icon: WandSparkles,
    variant: "accent" as const,
  },
  {
    title: "Citas",
    description: "Pasa a ejecución: aceptar, reagendar y cancelar en tiempo real.",
    href: "/admin/bookings",
    cta: "Ir a Citas",
    icon: CalendarClock,
    variant: "primary" as const,
  },
  {
    title: "Contactos",
    description: "Prioriza leads por contexto y potencial de conversión.",
    href: "/admin/contacts",
    cta: "Abrir Contactos",
    icon: Inbox,
    variant: "secondary" as const,
  },
  {
    title: "Correos",
    description: "Demuestra seguimiento comercial completo con bandeja y filtros.",
    href: "/admin/mail",
    cta: "Abrir Correos",
    icon: Mail,
    variant: "secondary" as const,
  },
  {
    title: "Usuarios",
    description: "Cierra la demo con gobernanza: roles, estados y seguridad.",
    href: "/admin/users",
    cta: "Ir a Usuarios",
    icon: Users,
    variant: "warning" as const,
  },
]

const painPoints = [
  "Reservas que se quedan en pendientes demasiado tiempo.",
  "Leads sin seguimiento estructurado por canal.",
  "Correos comerciales dispersos y sin trazabilidad clara.",
]

export default function AdminDemoPlaybookPage() {
  return (
    <div className="space-y-5">
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-14 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Modo demo</Badge>
            <Badge variant="outline">Presentación tipo slides</Badge>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Clinvetia en 5 minutos
          </h2>
          <p className="mt-3 max-w-4xl text-sm text-muted-foreground md:text-base">
            Guion visual para presentar el dashboard como una historia: problema, solución, operación diaria y cierre
            comercial con llamada a acción.
          </p>
          <div className="mt-5 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Button asChild variant="default" size="sm" className="w-full px-4 sm:!w-auto">
              <Link href="/admin/dashboard">Empezar demo</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full sm:!w-auto">
              <Link href="/admin/bookings">Ir directo a Citas</Link>
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon icon={TriangleAlert} size="sm" variant="warning" />
          <h3 className="text-xl font-semibold">Slide 1 · El problema</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((item) => (
            <div key={item} className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon icon={WandSparkles} size="sm" variant="accent" />
          <h3 className="text-xl font-semibold">Slide 2 · La solución</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Un único panel para captación, agenda, seguimiento y gestión de equipo. Todo conectado y accionable.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {flowSteps.map((step) => (
            <Link
              key={`chip-${step.title}`}
              href={step.href}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all hover:border-primary/35 hover:bg-primary/10"
            >
              {step.title}
            </Link>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon icon={ArrowRight} size="sm" variant="primary" />
          <h3 className="text-xl font-semibold">Slide 3 · Flujo operativo</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-3 2xl:grid-cols-5">
          {flowSteps.map((step, index) => (
            <GlassCard key={step.title} className="h-full p-4 [&>div]:h-full">
              <div className="flex h-full flex-col">
                <div className="mb-2 text-xs text-muted-foreground">Paso {index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="rounded-md border border-white/10 bg-white/5 p-1.5">
                      <Icon
                        icon={step.icon}
                        size="sm"
                        variant={step.title === "Dashboard" ? "default" : step.variant}
                        className={step.title === "Dashboard" ? "text-foreground" : undefined}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold">{step.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                      <div className="mt-3">
                        <Button asChild variant="ghost" size="sm" className="w-full">
                          <Link href={step.href} className="flex w-full items-center justify-center gap-2">
                            {step.cta}
                            <Icon icon={ArrowRight} size="xs" variant="default" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Slide 4 · Cierre y CTA</h3>
            <p className="text-sm text-muted-foreground">
              Mensaje final recomendado: “Esto no es una demo de pantalla, es un flujo operativo listo para vender más y perder menos citas”.
            </p>
          </div>
          <div className="flex w-full justify-end">
            <div className="w-full sm:w-auto">
              <Button asChild variant="default" size="sm" className="w-full px-4 sm:!w-auto">
                <Link href="/admin/dashboard">Iniciar presentación</Link>
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {flowSteps.slice(0, 4).map((step) => (
          <GlassCard key={`quick-${step.title}`} className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <Icon icon={step.icon} size="default" variant={step.variant} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                <Button asChild variant="ghost" size="sm" className="mt-4 !w-auto">
                  <Link href={step.href}>
                    {step.cta}
                    <Icon icon={ArrowRight} size="xs" variant="default" />
                  </Link>
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
