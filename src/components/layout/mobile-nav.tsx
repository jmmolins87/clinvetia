"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight, Calendar } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/solucion", label: "Solución" },
  { href: "/escenarios", label: "Escenarios" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/contacto", label: "Contacto" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden -mr-2 h-9 w-9"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-sm bg-background/95 backdrop-blur-xl border-l border-white/10 p-0"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-semibold text-lg">Menú</span>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 -mr-2"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                        {link.href !== "/contacto" && (
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        )}
                      </Link>
                    </SheetClose>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10 space-y-3">
            <SheetClose asChild>
              <Button asChild className="w-full gap-2">
                <Link href="/contacto">
                  <Calendar className="h-4 w-4" />
                  Reservar Demo
                </Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
