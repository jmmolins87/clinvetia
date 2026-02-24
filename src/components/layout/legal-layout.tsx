"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface LegalSection {
  title: string
  content: React.ReactNode
}

interface LegalLayoutProps {
  badge: string
  title: string
  description: string
  sections: LegalSection[]
  lastUpdated: string
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export function LegalLayout({ badge, title, description, sections, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="min-h-screen py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div 
            {...fadeUp}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-6">{badge}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{description}</p>
            <p className="text-sm text-muted-foreground/60 italic">Última actualización: {lastUpdated}</p>
          </motion.div>

          {/* Content */}
          <motion.div 
            {...fadeUp} 
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-2 md:p-4">
              <Accordion type="single" collapsible className="w-full">
                {sections.map((section, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`section-${idx}`}
                    last={idx === sections.length - 1}
                  >
                    <AccordionTrigger className="px-4 py-6 text-lg">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-6 text-base leading-relaxed">
                      {section.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>
          </motion.div>

          {/* Contact help */}
          <motion.p 
            {...fadeUp}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center text-muted-foreground"
          >
            Si tienes alguna duda sobre estos términos, contacta con nosotros en{" "}
            <a href="mailto:legal@clinvetia.com" className="text-primary hover:underline font-medium">
              legal@clinvetia.com
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
