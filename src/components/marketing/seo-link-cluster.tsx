import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"

export interface SeoLinkClusterItem {
  href: string
  title: string
  description: string
}

export interface SeoLinkClusterProps {
  badge?: string
  title: string
  description?: string
  items: SeoLinkClusterItem[]
}

export function SeoLinkCluster({
  badge = "Recursos relacionados",
  title,
  description,
  items,
}: SeoLinkClusterProps) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge variant="secondary">{badge}</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
            {description ? (
              <p className="mt-4 text-muted-foreground">{description}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <GlassCard key={item.href} className="h-full p-5 transition-colors hover:border-primary/30">
                <Link href={item.href} className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
