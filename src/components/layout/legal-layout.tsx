import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"

interface LegalSection {
  title: string
  content: string
}

export interface LegalLayoutProps {
  badge: string
  title: string
  description: string
  sections: LegalSection[]
  lastUpdated: string
}

export function LegalLayout({ badge, title, description, sections, lastUpdated }: LegalLayoutProps) {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center">
          <Badge variant="default" className="mb-5">
            {badge}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: {lastUpdated}
          </p>
        </div>

        <div className="mt-10 grid gap-6">
          {sections.map((section) => (
            <GlassCard key={section.title} className="p-6 md:p-8">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {section.content}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
