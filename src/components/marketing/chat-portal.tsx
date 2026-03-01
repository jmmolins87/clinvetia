"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle, Sparkles, Send, X } from "lucide-react"

import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ChatPortal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const update = () => setIsDesktop(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const handleOpenChat = () => setOpen(true)
    window.addEventListener("clinvetia:open-chat", handleOpenChat)
    return () => window.removeEventListener("clinvetia:open-chat", handleOpenChat)
  }, [])

  if (pathname?.startsWith("/admin")) {
    return null
  }

  const chatBody = (
    <>
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-[rgba(var(--white-rgb),0.10)] bg-background/60 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SheetTitle className="text-xl">Chat ClinvetIA</SheetTitle>
            <SheetDescription className="text-sm">
              Respuestas rápidas con contexto de tu clínica.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Cerrar chat"
            >
              <Icon icon={X} size="sm" variant="muted" />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-4 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="h-[72px] w-[72px] overflow-hidden rounded-full border border-primary/40 bg-primary/15">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/videos/avatar/avatar-dog.webm" type="video/webm" />
              <source src="/videos/avatar/avatar-dog.mp4" type="video/mp4" />
              <source src="/videos/avatar/avatar-dog.ogv" type="video/ogg" />
            </video>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] px-4 py-3 text-sm text-foreground">
            Hola, soy tu asistente. ¿Quieres que revisemos los números de tu ROI?
          </div>
        </div>

        <div className="flex items-start gap-3 justify-end">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            Sí, ¿qué información necesitas?
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(var(--white-rgb),0.10)] px-4 py-4">
        <div className="flex items-center gap-2">
          <Input
            className="h-11 flex-1 rounded-xl border border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
            placeholder="Escribe tu mensaje..."
          />
          <Button size="icon" className="h-11 w-11 rounded-xl">
            <Icon icon={Send} size="sm" />
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <div data-clinvetia-chat-portal>
      {isDesktop && (
        <Sheet open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "fixed bottom-6 right-6 z-[40] hidden lg:block transition-opacity duration-200",
            open && "pointer-events-none opacity-0"
          )}
        >
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Abrir chat"
              className={cn(
                "group relative h-40 w-24 overflow-hidden rounded-[26px] border cursor-pointer",
                "md:h-36 md:w-28 lg:h-48 lg:w-32 xl:h-52 xl:w-36",
                "bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.35),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(var(--accent-rgb),0.25),transparent_55%)]",
                "border-[rgba(var(--primary-rgb),0.55)] backdrop-blur-xl",
                "shadow-[0_0_30px_rgba(var(--primary-rgb),0.45),0_0_70px_rgba(var(--accent-rgb),0.25)]",
                "transition-transform duration-300 hover:scale-[1.03]",
                open && "shadow-none"
              )}
            >
              <span className="absolute inset-1 rounded-[22px] border border-[rgba(var(--white-rgb),0.20)]" />
              <span className="absolute inset-2 rounded-[20px] bg-[rgba(var(--white-rgb),0.05)]" />
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--white-rgb),0.10),transparent_55%)]" />
              <div className="absolute inset-3 rounded-[18px] overflow-hidden">
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/videos/avatar/avatar-dog.webm" type="video/webm" />
                  <source src="/videos/avatar/avatar-dog.mp4" type="video/mp4" />
                  <source src="/videos/avatar/avatar-dog.ogv" type="video/ogg" />
                </video>
              </div>
              <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 border border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]">
                <Icon icon={Sparkles} size="xs" variant="primary" />
              </div>
              <div className="absolute inset-x-2 bottom-1 rounded-full border border-[rgba(var(--white-rgb),0.20)] bg-[rgba(var(--black-rgb),0.30)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(var(--white-rgb),0.80)] backdrop-blur">
                Chat
              </div>
            </button>
          </SheetTrigger>
        </div>

        <SheetContent side="right" className="sm:max-w-md p-0 overflow-hidden liquid-glass z-[300]">
          <div className="flex h-full flex-col">
            {chatBody}
          </div>
        </SheetContent>
        </Sheet>
      )}

      <div className="fixed bottom-5 right-5 z-[40] lg:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-[0_0_25px_rgba(var(--primary-rgb),0.45)]"
          onClick={() => setOpen(true)}
          aria-label="Abrir chat"
        >
          <Icon icon={MessageCircle} size="lg" variant="primary" />
        </Button>
      </div>

      {!isDesktop && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden liquid-glass z-[300]">
          <div className="flex h-full flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-[rgba(var(--white-rgb),0.10)] bg-background/60 backdrop-blur-xl">
              <DialogTitle className="text-xl">Chat ClinvetIA</DialogTitle>
              <DialogDescription className="text-sm">
                Respuestas rápidas con contexto de tu clínica.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 space-y-4 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-full border border-primary/40 bg-primary/15">
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/videos/avatar/avatar-dog.webm" type="video/webm" />
                    <source src="/videos/avatar/avatar-dog.mp4" type="video/mp4" />
                    <source src="/videos/avatar/avatar-dog.ogv" type="video/ogg" />
                  </video>
                </div>
                <div className="rounded-2xl border border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] px-4 py-3 text-sm text-foreground">
                  Hola, soy tu asistente. ¿Quieres que revisemos los números de tu ROI?
                </div>
              </div>

              <div className="flex items-start gap-3 justify-end">
                <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                  Sí, ¿qué información necesitas?
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(var(--white-rgb),0.10)] px-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  className="h-11 flex-1 rounded-xl border border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
                  placeholder="Escribe tu mensaje..."
                />
                <Button size="icon" className="h-11 w-11 rounded-xl">
                  <Icon icon={Send} size="sm" />
                </Button>
              </div>
            </div>
          </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
