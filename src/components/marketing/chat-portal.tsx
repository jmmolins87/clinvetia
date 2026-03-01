"use client"

import { FormEvent, KeyboardEvent, RefObject, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessageCircle, Send, Sparkles, X } from "lucide-react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { storage } from "@/lib/storage"
import { createSession } from "@/lib/api"
import { getRecaptchaToken } from "@/lib/recaptcha-client"
import { useROIStore } from "@/store/roi-store"
import { BookingCalendar } from "@/components/marketing/booking-calendar"

type ChatMessage = {
  role: "assistant" | "user"
  content: string
}

type ChatState = {
  intent?: "book" | "reschedule" | "cancel" | "none"
  step?: "idle" | "await_timezone" | "await_booking_id" | "await_slot" | "await_email" | "await_email_confirm" | "await_phone" | "await_phone_confirm" | "await_more_help"
  proposedSlots?: Array<{ date: string; time: string; label: string }>
  selectedSlot?: { date: string; time: string; label: string } | null
  email?: string | null
  phone?: string | null
  targetBookingId?: string | null
  targetBookingToken?: string | null
  city?: string | null
  objectionAttempts?: number
  qualificationStage?: number
  leadContext?: string | null
}

type ChatApiResponse = {
  reply: string
  openCalendar?: boolean
  openRoiCalculator?: boolean
  state?: ChatState
  booking?:
    | {
        bookingId: string
        accessToken: string
        date: string
        time: string
        duration: number
      }
    | null
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hola, te ayudo a reservar, reagendar o cancelar tu cita. Dime que necesitas.",
}

function RoiDialog({
  open,
  onOpenChange,
  monthlyPatients,
  averageTicket,
  conversionLoss,
  onMonthlyPatients,
  onAverageTicket,
  onConversionLoss,
  onContinue,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthlyPatients: number
  averageTicket: number
  conversionLoss: number
  onMonthlyPatients: (value: number) => void
  onAverageTicket: (value: number) => void
  onConversionLoss: (value: number) => void
  onContinue: () => void
  isSubmitting: boolean
}) {
  const perdidaMensual = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)
  const roi = Math.round(((recuperacionEstimada - 297) / 297) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-chat-scrollable="true" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calcula tu ROI antes de reservar</DialogTitle>
          <DialogDescription>
            Necesitamos estos datos para personalizar el resumen que recibiras por correo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Pacientes/mes</span>
              <span className="font-semibold">{monthlyPatients}</span>
            </div>
            <Slider value={[monthlyPatients]} onValueChange={([v]) => onMonthlyPatients(v)} min={0} max={1000} step={10} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Ticket medio</span>
              <span className="font-semibold">{averageTicket}€</span>
            </div>
            <Slider value={[averageTicket]} onValueChange={([v]) => onAverageTicket(v)} min={0} max={200} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Perdida de conversion</span>
              <span className="font-semibold">{conversionLoss}%</span>
            </div>
            <Slider value={[conversionLoss]} onValueChange={([v]) => onConversionLoss(v)} min={0} max={60} step={1} />
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            ROI estimado: <span className="font-bold text-success">{roi}%</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={onContinue} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChatPanel({
  messages,
  input,
  isSending,
  onInputChange,
  onInputKeyDown,
  onSubmit,
  onClose,
  textareaRef,
  isOnline,
  showTyping,
  canClose,
}: {
  messages: ChatMessage[]
  input: string
  isSending: boolean
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose?: () => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  isOnline: boolean
  showTyping: boolean
  canClose: boolean
}) {
  const messagesScrollAreaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const viewport = messagesScrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null
    if (!viewport) return
    requestAnimationFrame(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
    })
  }, [messages.length, showTyping])

  return (
    <>
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-[rgba(var(--white-rgb),0.10)] bg-background/60 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SheetTitle className="text-xl">Chat ClinvetIA</SheetTitle>
            <SheetDescription className="text-sm">
              Gestión de tus citas sin perder el tiempo.
            </SheetDescription>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  isOnline ? "bg-success shadow-[0_0_10px_rgba(var(--success-rgb),0.7)]" : "bg-destructive shadow-[0_0_10px_rgba(var(--destructive-rgb),0.7)]",
                )}
              />
              {isOnline ? "En línea" : "Offline"}
            </div>
          </div>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Cerrar chat"
              onClick={onClose}
              disabled={!canClose}
            >
              <Icon icon={X} size="sm" variant="muted" />
            </Button>
          ) : (
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Cerrar chat"
                disabled={!canClose}
              >
                <Icon icon={X} size="sm" variant="muted" />
              </Button>
            </SheetClose>
          )}
        </div>
      </SheetHeader>

      <ScrollArea
        ref={messagesScrollAreaRef}
        data-chat-scrollable="true"
        className="min-h-0 flex-1"
        onWheel={(event) => {
          const viewport = messagesScrollAreaRef.current?.querySelector(
            "[data-radix-scroll-area-viewport]",
          ) as HTMLDivElement | null
          if (!viewport) return
          viewport.scrollTop += event.deltaY
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className="space-y-4 px-6 py-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" && "justify-end",
              )}
            >
              {message.role === "assistant" && (
                <div className="h-[56px] w-[56px] overflow-hidden rounded-full border border-primary/40 bg-primary/15">
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
              )}
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl border px-4 py-3 text-sm",
                  message.role === "assistant"
                    ? "border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] text-foreground"
                    : "border-primary/30 bg-primary/10 text-primary",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {showTyping && (
            <div className="flex items-start gap-3">
              <div className="h-[56px] w-[56px] overflow-hidden rounded-full border border-primary/40 bg-primary/15">
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
              <div className="rounded-2xl border border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] px-4 py-3 text-sm text-muted-foreground">
                escribiendo...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form className="border-t border-[rgba(var(--white-rgb),0.10)] px-4 py-4" onSubmit={onSubmit}>
        <div className="flex w-full items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            rows={1}
            className="min-h-14 max-h-none flex-1 resize-none overflow-hidden rounded-xl border border-[rgba(var(--white-rgb),0.10)] bg-[rgba(var(--white-rgb),0.05)] px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/40"
            placeholder="Escribe tu mensaje..."
            disabled={isSending}
          />
          <Button size="icon" className="h-11 w-11 rounded-xl" type="submit" disabled={isSending || !input.trim()}>
            <Icon icon={Send} size="sm" />
          </Button>
        </div>
      </form>
    </>
  )
}

export function ChatPortal() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [chatState, setChatState] = useState<ChatState>({ intent: "none", step: "idle" })
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [roiDialogOpen, setRoiDialogOpen] = useState(false)
  const [isSavingRoi, setIsSavingRoi] = useState(false)
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false)
  const [, setConversationStarted] = useState(false)
  const [, setHasConfirmedBooking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollLockY = useRef(0)

  const {
    monthlyPatients,
    averageTicket,
    conversionLoss,
    setMonthlyPatients,
    setAverageTicket,
    setConversionLoss,
    setHasAcceptedDialog,
    setAccessToken,
  } = useROIStore()

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

  useEffect(() => {
    const updateOnline = () => setIsOnline(window.navigator.onLine)
    updateOnline()
    window.addEventListener("online", updateOnline)
    window.addEventListener("offline", updateOnline)
    return () => {
      window.removeEventListener("online", updateOnline)
      window.removeEventListener("offline", updateOnline)
    }
  }, [])

  const hasOverlayOpen = open || roiDialogOpen || calendarDialogOpen

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    window.dispatchEvent(new CustomEvent("clinvetia:scroll-lock", { detail: { locked: hasOverlayOpen } }))
    if (hasOverlayOpen) {
      scrollLockY.current = window.scrollY
      body.style.position = "fixed"
      body.style.top = `-${scrollLockY.current}px`
      body.style.left = "0"
      body.style.right = "0"
      body.style.width = "100%"
      body.style.overflow = "hidden"
      body.style.overscrollBehavior = "none"
      html.style.overflow = "hidden"
      html.style.overscrollBehavior = "none"
    } else {
      body.style.position = ""
      body.style.top = ""
      body.style.left = ""
      body.style.right = ""
      body.style.width = ""
      body.style.overflow = ""
      body.style.overscrollBehavior = ""
      html.style.overflow = ""
      html.style.overscrollBehavior = ""
      window.scrollTo(0, scrollLockY.current)
    }

    const preventBackgroundScroll = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-chat-scrollable='true']")) return
      event.preventDefault()
    }

    if (hasOverlayOpen) {
      document.addEventListener("wheel", preventBackgroundScroll, { passive: false })
      document.addEventListener("touchmove", preventBackgroundScroll, { passive: false })
    }

    return () => {
      body.style.position = ""
      body.style.top = ""
      body.style.left = ""
      body.style.right = ""
      body.style.width = ""
      body.style.overflow = ""
      body.style.overscrollBehavior = ""
      html.style.overflow = ""
      html.style.overscrollBehavior = ""
      window.dispatchEvent(new CustomEvent("clinvetia:scroll-lock", { detail: { locked: false } }))
      document.removeEventListener("wheel", preventBackgroundScroll as EventListener)
      document.removeEventListener("touchmove", preventBackgroundScroll as EventListener)
    }
  }, [hasOverlayOpen])

  if (pathname?.startsWith("/admin")) {
    return null
  }

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const content = input.trim()
    if (!content || isSending) return
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px"
    }
    setMessages((prev) => [...prev, { role: "user", content }])
    setConversationStarted(true)
    setIsSending(true)
    setShowTyping(false)

    try {
      const liveSessionToken = storage.get<string | null>("local", "roi_access_token", null)
      const liveBookingToken = storage.get<string | null>("local", "booking_access_token", null)
      const res = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          state: chatState,
          sessionToken: liveSessionToken,
          bookingToken: liveBookingToken,
        }),
      })
      const data = (await res.json()) as ChatApiResponse & { error?: string }
      if (!res.ok) {
        throw new Error(data.error || "No se pudo procesar el mensaje")
      }

      if (data.state) {
        setChatState(data.state)
      }

      const shouldOpenCalendar = Boolean(data.openCalendar && liveSessionToken)
      const shouldOpenRoiCalculator = Boolean(data.openRoiCalculator || (data.openCalendar && !liveSessionToken))

      if (data.booking === null) {
        storage.remove("local", "booking_access_token")
        storage.remove("local", "booking")
      } else if (data.booking?.accessToken) {
        storage.set("local", "booking_access_token", data.booking.accessToken)
        storage.set("local", "booking", data.booking)
        setHasConfirmedBooking(true)
        const sessionToken = liveSessionToken || storage.get<string | null>("local", "roi_access_token", null) || ""
        const params = new URLSearchParams({ booking_id: data.booking.bookingId })
        if (data.booking.accessToken) params.set("booking_token", data.booking.accessToken)
        if (sessionToken) params.set("session_token", sessionToken)
        router.push(`/contacto?${params.toString()}`)
      }

      const initialDelayMs = 5000 + Math.floor(Math.random() * 5001)
      await new Promise((resolve) => setTimeout(resolve, initialDelayMs))
      setShowTyping(true)
      const typingDurationMs = Math.min(9000, Math.max(1500, Math.floor(data.reply.length * 24)))
      await new Promise((resolve) => setTimeout(resolve, typingDurationMs))
      setShowTyping(false)
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      if (shouldOpenRoiCalculator) {
        setRoiDialogOpen(true)
      }
      if (shouldOpenCalendar) {
        setCalendarDialogOpen(true)
      }
    } catch (error) {
      const initialDelayMs = 5000 + Math.floor(Math.random() * 5001)
      await new Promise((resolve) => setTimeout(resolve, initialDelayMs))
      setShowTyping(true)
      const fallbackText = error instanceof Error ? error.message : "Ha ocurrido un error"
      const typingDurationMs = Math.min(9000, Math.max(1500, Math.floor(fallbackText.length * 24)))
      await new Promise((resolve) => setTimeout(resolve, typingDurationMs))
      setShowTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackText,
        },
      ])
    } finally {
      setShowTyping(false)
      setIsSending(false)
    }
  }

  function handleInputChange(value: string) {
    setInput(value)
    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 56)}px`
  }

  async function handleRoiContinue() {
    setIsSavingRoi(true)
    try {
      const recaptchaToken = await getRecaptchaToken("session_create")
      const session = await createSession({
        roi: {
          monthlyPatients,
          averageTicket,
          conversionLoss,
          roi: Math.round((((Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket * 0.7)) - 297) / 297) * 100),
        },
        recaptchaToken,
      })

      storage.set("local", "roi_access_token", session.accessToken)
      setHasAcceptedDialog(true)
      setAccessToken(session.accessToken)
      setRoiDialogOpen(false)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Perfecto, ya tengo tu ROI. Te abro el calendario para que elijas día y hora.",
        },
      ])
      setChatState({ intent: "book", step: "await_slot" })
      setCalendarDialogOpen(true)
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "No se pudo guardar el ROI",
        },
      ])
    } finally {
      setIsSavingRoi(false)
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const form = event.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div data-clinvetia-chat-portal>
      {isDesktop && (
        <Sheet
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
          }}
        >
          <div
            className={cn(
              "fixed bottom-6 right-6 z-[40] hidden lg:block transition-opacity duration-200",
              open && "pointer-events-none opacity-0",
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
                  open && "shadow-none",
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

          <SheetContent data-chat-scrollable="true" side="right" className="sm:max-w-md p-0 overflow-hidden liquid-glass z-[300]">
            <div className="flex h-full min-h-0 flex-col">
              <ChatPanel
                messages={messages}
                input={input}
                isSending={isSending}
                onInputChange={handleInputChange}
                onInputKeyDown={handleInputKeyDown}
                onSubmit={handleSend}
                textareaRef={textareaRef}
                isOnline={isOnline}
                showTyping={showTyping}
                canClose
              />
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
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
          }}
        >
          <DialogContent data-chat-scrollable="true" className="w-[95vw] max-w-md h-[85dvh] max-h-[85dvh] p-0 overflow-hidden liquid-glass z-[300] [&>button]:hidden">
            <div className="flex h-full min-h-0 flex-col">
              <ChatPanel
                messages={messages}
                input={input}
                isSending={isSending}
                onInputChange={handleInputChange}
                onInputKeyDown={handleInputKeyDown}
                onSubmit={handleSend}
                onClose={() => setOpen(false)}
                textareaRef={textareaRef}
                isOnline={isOnline}
                showTyping={showTyping}
                canClose
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <RoiDialog
        open={roiDialogOpen}
        onOpenChange={setRoiDialogOpen}
        monthlyPatients={monthlyPatients}
        averageTicket={averageTicket}
        conversionLoss={conversionLoss}
        onMonthlyPatients={setMonthlyPatients}
        onAverageTicket={setAverageTicket}
        onConversionLoss={setConversionLoss}
        onContinue={() => {
          void handleRoiContinue()
        }}
        isSubmitting={isSavingRoi}
      />

      <Dialog
        open={calendarDialogOpen}
        onOpenChange={(next) => {
          setCalendarDialogOpen(next)
        }}
      >
        <DialogContent data-chat-scrollable="true" className="w-[98vw] sm:max-w-5xl max-h-[94vh] overflow-y-auto p-3 md:p-5">
          <DialogHeader>
            <DialogTitle>Selecciona tu cita</DialogTitle>
            <DialogDescription>
              Elige uno de los horarios disponibles y confirma tu cita.
            </DialogDescription>
          </DialogHeader>
          <BookingCalendar
            embedded
            onBooked={() => {
              setHasConfirmedBooking(true)
              setCalendarDialogOpen(false)
              const savedBooking = storage.get<{ bookingId?: string; accessToken?: string } | null>("local", "booking", null)
              const sessionToken = storage.get<string | null>("local", "roi_access_token", null)
              if (savedBooking?.bookingId) {
                const params = new URLSearchParams({ booking_id: savedBooking.bookingId })
                if (savedBooking.accessToken) params.set("booking_token", savedBooking.accessToken)
                if (sessionToken) params.set("session_token", sessionToken)
                router.push(`/contacto?${params.toString()}`)
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
