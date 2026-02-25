"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { BrandName } from "@/components/ui/brand-name"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { SwitchWithLabel } from "@/components/ui/switch"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

import { TranslatableText, useTranslationSkeleton } from "@/components/providers/translation-skeleton"

const NAV_LINKS = [
  { href: "/solucion",       label: "Solución"        },
  { href: "/escenarios",     label: "Escenarios"      },
  { href: "/como-funciona",  label: "Cómo funciona"  },
  { href: "/contacto",      label: "Contacto"       },
] as const

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { trigger } = useTranslationSkeleton()
  const [langChecked, setLangChecked] = useState(false)

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    const html = document.documentElement
    if (isOpen) {
      document.body.style.overflow = "hidden"
      html.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      html.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      html.style.overflow = "unset"
    }
  }, [isOpen])

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Gatillo - Hamburguesa */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-10 w-10 text-foreground cursor-pointer -mr-2"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <Icon icon={Menu} size="sm" />
      </Button>

      {/* Menú Cortina */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] flex flex-col bg-background/95 backdrop-blur-3xl h-screen"
          >
            {/* Cabecera del menú */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Icon icon={Sparkles} size="sm" variant="primary" className="animate-pulse" />
                <BrandName className="text-xl font-bold" />
              </Link>
            </div>

            {/* Links de navegación */}
            <nav className="flex-1 flex flex-col justify-center px-8 space-y-8 pt-6">
              {NAV_LINKS.map((link, idx) => {
                const isActive = pathname === link.href
                
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between text-4xl font-bold tracking-tight transition-colors",
                        isActive ? "text-primary" : "text-foreground/60 hover:text-primary"
                      )}
                    >
                      <TranslatableText text={link.label} className="block" />
                      {isActive && (
                        <motion.div 
                          layoutId="active-indicator" 
                          className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.8)]" 
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Footer del menú con Ajustes y Botones */}
            <div className="p-8 space-y-6 bg-gradient-to-t from-background via-background to-transparent border-t border-white/5">
              
              {/* Ajustes: Tema e Idioma */}
              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="bg-background/50 p-1.5 rounded-lg border border-white/10">
                    <ThemeSwitcher />
                  </div>
                  <TranslatableText text="Tema" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground" />
                </div>
                <SwitchWithLabel
                  labelLeft="ES"
                  labelRight="EN"
                  checked={langChecked}
                  onCheckedChange={(checked) => {
                    setLangChecked(checked)
                    trigger()
                  }}
                />
              </div>

              {/* Botones de Acción */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <Button variant="secondary" size="lg" className="w-full h-14 text-lg" asChild>
                  <Link href="/calculadora">
                    <TranslatableText text="Calcular ROI" className="text-lg" />
                  </Link>
                </Button>

                <Button size="lg" className="w-full h-16 text-xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]" asChild>
                  <Link href="/demo">
                    <TranslatableText text="Reservar Demo" className="text-xl" />
                  </Link>
                </Button>
              </motion.div>

              {/* Botón de Cierre XL */}
              <div className="flex justify-center">
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                  onClick={() => setIsOpen(false)}
                  className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors cursor-pointer group shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                  aria-label="Cerrar menú"
                >
                  <Icon icon={X} size="xl" className="transition-transform group-hover:rotate-90 duration-300" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
