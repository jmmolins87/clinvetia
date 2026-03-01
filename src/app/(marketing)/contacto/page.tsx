"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, CheckCircle2, Send, ArrowRight, Info, CalendarDays, Sparkles, AlertCircle, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/GlassCard"
import { useROIStore } from "@/store/roi-store"
import { Badge } from "@/components/ui/badge"
import { BrandName } from "@/components/ui/brand-name"
import { Icon } from "@/components/ui/icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { sanitizeInput } from "@/lib/security"
import { storage } from "@/lib/storage"
import { ApiError, createBooking, getActiveBookingBySession, getAvailability, getBooking, getSession, submitContact } from "@/lib/api"
import { BookingWizard, type BookingWizardSubmitPayload } from "@/components/scheduling/BookingWizard"

interface FormData {
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
}

const initialFormData: FormData = {
  nombre: "",
  email: "",
  telefono: "",
  clinica: "",
  mensaje: "",
}

const VALIDATION_RULES: Record<string, { min?: number, max: number }> = {
  nombre:   { min: 3, max: 50 },
  email:    { max: 100 },
  telefono: { min: 9, max: 15 },
  clinica:  { min: 2, max: 60 },
  mensaje:  { min: 10, max: 500 },
}

const CONTACT_FIELDS: { id: keyof FormData, label: string, placeholder: string, required: boolean, type?: string }[] = [
  { id: "nombre",   label: "Nombre completo *",     placeholder: "Dr. Juan García", required: true },
  { id: "email",    label: "Email profesional *",   placeholder: "juan@clinica.com", required: true, type: "email" },
  { id: "telefono", label: "Teléfono *",            placeholder: "+34 612 345 678", required: true, type: "tel" },
  { id: "clinica",  label: "Nombre de la clínica *", placeholder: "Clínica Veterinaria Central", required: true },
]

const isValidAccessToken = (token: string | null) => {
  if (!token) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
}

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function ContactFormWithROI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false)
  const [pendingDialogMessage, setPendingDialogMessage] = useState("")
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorDialogMessage, setErrorDialogMessage] = useState("")
  const [expiredDialogOpen, setExpiredDialogOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [expirationHandled, setExpirationHandled] = useState(false)
  const [bookingAccessToken, setBookingAccessToken] = useState<string | null>(null)
  const [sessionAccessToken, setSessionAccessToken] = useState<string | null>(null)
  const [hasSessionROI, setHasSessionROI] = useState(false)
  const [sessionROI, setSessionROI] = useState<{
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const bookingTokenFromQuery = searchParams.get("booking_token")
  const bookingIdFromQuery = searchParams.get("booking_id")
  const sessionTokenFromQuery = searchParams.get("session_token")
  
  const [storedBooking, setStoredBooking] = useState<{
    date: string;
    time: string;
    duration: string;
    status?: string;
    formExpiresAt?: string | null;
    demoExpiresAt?: string | null;
    contactSubmitted?: boolean;
    contact?: {
      nombre: string;
      email: string;
      telefono: string;
      clinica: string;
      mensaje: string;
      createdAt?: string | null;
      roi?: {
        monthlyPatients?: number | null;
        averageTicket?: number | null;
        conversionLoss?: number | null;
        roi?: number | null;
      } | null;
    } | null;
  } | null>(null)

  const {
    accessToken,
    monthlyPatients,
    averageTicket,
    conversionLoss,
    setAccessToken,
    setClinicData,
    setFormExpiration,
    reset: resetROI
  } = useROIStore()

  const normalizeROI = useCallback((roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null) => {
    const monthlyPatients = typeof roi?.monthlyPatients === "number" ? roi.monthlyPatients : Number(roi?.monthlyPatients)
    const averageTicket = typeof roi?.averageTicket === "number" ? roi.averageTicket : Number(roi?.averageTicket)
    const conversionLoss = typeof roi?.conversionLoss === "number" ? roi.conversionLoss : Number(roi?.conversionLoss)
    const roiValue = typeof roi?.roi === "number" ? roi.roi : Number(roi?.roi)
    return {
      monthlyPatients: Number.isFinite(monthlyPatients) ? monthlyPatients : null,
      averageTicket: Number.isFinite(averageTicket) ? averageTicket : null,
      conversionLoss: Number.isFinite(conversionLoss) ? conversionLoss : null,
      roi: Number.isFinite(roiValue) ? roiValue : null,
    }
  }, [])

  const hasCompleteROI = useCallback((roi?: {
    monthlyPatients?: number | null
    averageTicket?: number | null
    conversionLoss?: number | null
    roi?: number | null
  } | null) => {
    const normalized = normalizeROI(roi)
    return (
      typeof normalized.monthlyPatients === "number" &&
      typeof normalized.averageTicket === "number" &&
      typeof normalized.conversionLoss === "number"
    )
  }, [normalizeROI])

  useEffect(() => {
    setMounted(true)
    const storedBookingToken = storage.get<string | null>("local", "booking_access_token", null)
    const storedSessionToken = storage.get<string | null>("local", "roi_access_token", null)
    const validBookingToken = isValidAccessToken(bookingTokenFromQuery)
      ? bookingTokenFromQuery
      : isValidAccessToken(storedBookingToken)
        ? storedBookingToken
        : null
    const fallbackSessionToken = isValidAccessToken(accessToken) ? accessToken : null
    const validSessionToken = isValidAccessToken(sessionTokenFromQuery)
      ? sessionTokenFromQuery
      : isValidAccessToken(storedSessionToken)
        ? storedSessionToken
        : fallbackSessionToken

    if (!validBookingToken && storedBookingToken) {
      storage.remove("local", "booking_access_token")
    }

    if (!validSessionToken && storedSessionToken) {
      storage.remove("local", "roi_access_token")
      if (accessToken) setAccessToken(null)
    }

    setBookingAccessToken(validBookingToken)
    setSessionAccessToken(validSessionToken)
    if (validBookingToken) {
      storage.set("local", "booking_access_token", validBookingToken)
    }
    if (validSessionToken) {
      storage.set("local", "roi_access_token", validSessionToken)
    }

    if (validSessionToken && !accessToken) {
      setAccessToken(validSessionToken)
    }
  }, [accessToken, bookingTokenFromQuery, sessionTokenFromQuery, setAccessToken])

  useEffect(() => {
    if (!mounted) return
    const stored = storage.get<{
      bookingId?: string
      date?: string
      time?: string
      duration?: number | string
      status?: string
      formExpiresAt?: string | null
      demoExpiresAt?: string | null
      contactSubmitted?: boolean
      contact?: {
        nombre: string
        email: string
        telefono: string
        clinica: string
        mensaje: string
        createdAt?: string | null
        roi?: {
          monthlyPatients?: number | null
          averageTicket?: number | null
          conversionLoss?: number | null
          roi?: number | null
        } | null
      } | null
    } | null>("local", "booking", null)
    const id = bookingIdFromQuery || stored?.bookingId || null
    setBookingId(id)

    if (stored?.date && stored?.time) {
      setStoredBooking({
        date: stored.date,
        time: stored.time,
        duration: String(stored.duration ?? ""),
        status: stored.status,
        formExpiresAt: stored.formExpiresAt,
        demoExpiresAt: stored.demoExpiresAt,
        contactSubmitted: stored.contactSubmitted ?? false,
        contact: stored.contact ?? null,
      })
    }
  }, [mounted, bookingIdFromQuery])

  useEffect(() => {
    if (!mounted || !sessionAccessToken) return
    if (bookingId && bookingAccessToken) return

    const recoverActiveBooking = async () => {
      try {
        const booking = await getActiveBookingBySession(sessionAccessToken)
        if (!booking || booking.active === false || !booking.accessToken) return

        setBookingId(booking.bookingId)
        setBookingAccessToken(booking.accessToken)
        setStoredBooking({
          date: booking.date,
          time: booking.time,
          duration: String(booking.duration),
          formExpiresAt: booking.formExpiresAt,
          demoExpiresAt: booking.demoExpiresAt,
          status: booking.status,
          contactSubmitted: booking.contactSubmitted ?? false,
          contact: booking.contact ?? null,
        })
        storage.set("local", "booking_access_token", booking.accessToken)
        storage.set("local", "booking", { ...booking, accessToken: booking.accessToken })

        const params = new URLSearchParams(searchParams.toString())
        params.set("booking_id", booking.bookingId)
        params.set("booking_token", booking.accessToken)
        params.set("session_token", sessionAccessToken)
        router.replace(`/contacto?${params.toString()}`)
      } catch {
        // Si no hay reserva activa en backend, no hacemos nada.
      }
    }

    recoverActiveBooking()
  }, [mounted, sessionAccessToken, bookingId, bookingAccessToken, router, searchParams])


  useEffect(() => {
    if (!mounted || !sessionAccessToken) {
      setHasSessionROI(false)
      return
    }

    const recoverROI = async () => {
      try {
        const session = await getSession(sessionAccessToken)
        const normalizedROI = normalizeROI(session.roi)
        const sessionHasROI = hasCompleteROI(normalizedROI)
        if (!sessionHasROI) {
          setHasSessionROI(false)
          setSessionROI(null)
          storage.remove("local", "roi_access_token")
          setSessionAccessToken(null)
          setAccessToken(null)
          resetROI()
          return
        }

        setHasSessionROI(true)
        setSessionROI(normalizedROI)
        setAccessToken(session.accessToken)
        if (session.expiresAt) {
          useROIStore.getState().setExpiration(session.expiresAt)
        }
        setClinicData({
          monthlyPatients: normalizedROI.monthlyPatients as number,
          averageTicket: normalizedROI.averageTicket as number,
          conversionLoss: normalizedROI.conversionLoss as number,
        })
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 410)) {
          setHasSessionROI(false)
          setSessionROI(null)
          storage.remove("local", "roi_access_token")
          setSessionAccessToken(null)
          setAccessToken(null)
          resetROI()
          return
        }
        setHasSessionROI(false)
      }
    }

    recoverROI()
  }, [mounted, sessionAccessToken, setClinicData, setAccessToken, resetROI, hasCompleteROI, normalizeROI])

  useEffect(() => {
    if (!mounted || !bookingId || !bookingAccessToken) return

    const loadBooking = async () => {
      try {
        const booking = await getBooking(bookingId, bookingAccessToken)
        setStoredBooking({
          date: booking.date,
          time: booking.time,
          duration: String(booking.duration),
          formExpiresAt: booking.formExpiresAt,
          demoExpiresAt: booking.demoExpiresAt,
          contactSubmitted: booking.contactSubmitted ?? false,
          contact: booking.contact ?? null,
        })
        storage.set("local", "booking", { ...booking, accessToken: bookingAccessToken })
      } catch {
        storage.remove("local", "booking")
        storage.remove("local", "booking_access_token")
        setBookingAccessToken(null)
        setStoredBooking(null)
      }
    }

    loadBooking()
  }, [mounted, bookingId, bookingAccessToken])

  const hasSubmittedContact = Boolean(storedBooking?.contactSubmitted || storedBooking?.contact)
  const isExpired = !hasSubmittedContact &&
    !!storedBooking?.formExpiresAt &&
    new Date(storedBooking.formExpiresAt).getTime() < Date.now()
  const isDemoExpired =
    !hasSubmittedContact &&
    (storedBooking?.status === "expired" ||
      (!!storedBooking?.demoExpiresAt && new Date(storedBooking.demoExpiresAt).getTime() <= Date.now()))

  useEffect(() => {
    if (!mounted || expirationHandled) return
    if (!isExpired && !isDemoExpired) return

    setExpirationHandled(true)
    setExpiredDialogOpen(true)
    setStoredBooking((prev) => (prev ? { ...prev, status: "expired" } : prev))

    if (bookingId && bookingAccessToken) {
      fetch("/api/booking/expire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, accessToken: bookingAccessToken }),
      }).catch(() => {})
    }

    storage.remove("local", "booking")
    storage.remove("local", "booking_access_token")
    storage.remove("local", "demo_access_token")
    setBookingAccessToken(null)
    setBookingId(null)
  }, [mounted, expirationHandled, isExpired, isDemoExpired, bookingId, bookingAccessToken])

  useEffect(() => {
    if (!mounted) return
    const onExpired = () => {
      setExpiredDialogOpen(true)
      try {
        localStorage.setItem("clinvetia:booking-expired-at", String(Date.now()))
      } catch {}
      setStoredBooking((prev) =>
        prev
          ? {
              ...prev,
              status: "expired",
              formExpiresAt: prev.formExpiresAt ?? new Date().toISOString(),
              demoExpiresAt: prev.demoExpiresAt ?? new Date().toISOString(),
            }
          : prev
      )
      setBookingAccessToken(null)
      setBookingId(null)
      if (searchParams.get("booking_id") || searchParams.get("booking_token")) {
        router.replace("/contacto")
      }
      toast({
        variant: "destructive",
        title: "La reserva ha expirado",
        description: "Vuelve a reservar una demo para continuar.",
      })
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "clinvetia:booking-expired") return
      onExpired()
    }
    window.addEventListener("clinvetia:booking-expired", onExpired)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("clinvetia:booking-expired", onExpired)
      window.removeEventListener("storage", onStorage)
    }
  }, [mounted, router, searchParams, toast])

  useEffect(() => {
    if (!mounted) return
    const expiredAt = typeof window !== "undefined" ? localStorage.getItem("clinvetia:booking-expired-at") : null
    if (!expiredAt) return
    if (searchParams.get("booking_id") || searchParams.get("booking_token")) {
      router.replace("/contacto")
    }
  }, [mounted, router, searchParams])

  // Si no hay acceso de ROI y tampoco hay reserva, mostramos el diálogo bloqueante
  if (mounted && !sessionAccessToken && !bookingAccessToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent 
            className="sm:max-w-md [&>button]:hidden" 
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30">
                <Icon icon={Calculator} size="lg" variant="destructive" />
              </div>
              <DialogTitle className="text-center text-xl">Para seguir, hagamos tu cálculo de ROI</DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed">
                En <BrandName /> queremos darte una atención cercana y útil. Con los datos de la calculadora de ROI podremos evaluar tu clínica con más claridad y darte recomendaciones personalizadas.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
              <p className="text-base font-medium text-foreground text-center">¿Por qué lo pedimos?</p>
              <p className="text-sm text-muted-foreground text-center">
                Queremos que el tiempo de tu llamada sea súper aprovechado, con cifras reales y una evaluación hecha a tu medida.
              </p>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
              <Button variant="default" className="w-full" onClick={() => router.push("/calculadora")}>
                Ir a la calculadora
                <Icon icon={Calculator} size="sm" variant="primary" className="ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const isDuplicateBookingContactBlocked = hasSubmittedContact
  const bookingDateStr = storedBooking?.date
  const bookingTime = storedBooking?.time
  const bookingDuration = storedBooking?.duration
  const bookingDate = bookingDateStr
    ? new Date(`${bookingDateStr.split("T")[0]}T00:00:00Z`)
    : null
  const hasBooking = bookingDate && bookingTime
  const hasActiveBookingSummary = hasBooking && !isDemoExpired && !isExpired
  const roiFromContact = normalizeROI(storedBooking?.contact?.roi)
  const roiFromSession = normalizeROI(sessionROI)
  const hasSessionToken = isValidAccessToken(sessionAccessToken) || isValidAccessToken(accessToken)
  const hasStoreROI = hasSessionToken && hasCompleteROI({ monthlyPatients, averageTicket, conversionLoss })
  const roiPatients =
    (typeof roiFromContact.monthlyPatients === "number" ? roiFromContact.monthlyPatients : null) ??
    (typeof roiFromSession.monthlyPatients === "number" ? roiFromSession.monthlyPatients : null) ??
    monthlyPatients
  const roiTicket =
    (typeof roiFromContact.averageTicket === "number" ? roiFromContact.averageTicket : null) ??
    (typeof roiFromSession.averageTicket === "number" ? roiFromSession.averageTicket : null) ??
    averageTicket
  const roiLoss =
    (typeof roiFromContact.conversionLoss === "number" ? roiFromContact.conversionLoss : null) ??
    (typeof roiFromSession.conversionLoss === "number" ? roiFromSession.conversionLoss : null) ??
    conversionLoss
  const hasROISummary = Boolean(
    hasCompleteROI(roiFromContact) ||
      hasCompleteROI(roiFromSession) ||
      hasStoreROI ||
      hasSessionROI
  )
  const showReturningTitle = Boolean(hasROISummary && hasActiveBookingSummary && hasSubmittedContact)
  const pageTitle = showReturningTitle ? "¿De nuevo por aquí? ¿Algún dato erróneo?" : "Cuéntanos sobre tu clínica"
  const pageDescription = showReturningTitle
    ? "Ya tenemos tu resumen ROI, tu demo y tus datos de contacto. Si necesitas ajustar algo, te ayudamos."
    : "Nuestro equipo está listo para ayudarte a transformar tu gestión veterinaria."
  const perdidaMensual = Math.round(roiPatients * (roiLoss / 100) * roiTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)
  const roi = Math.round(((recuperacionEstimada - 297) / 297) * 100)

  const formatBookingDate = (value?: string | null) => {
    if (!value) return ""
    const base = value.split("T")[0]
    const [year, month, day] = base.split("-").map(Number)
    if (!year || !month || !day) return ""
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    })
  }

  const validateField = (name: keyof FormData, value: string) => {
    const rules = VALIDATION_RULES[name]
    if (!rules) return ""
    if (!value.trim()) return "Este campo es obligatorio"
    if (rules.min && value.length < rules.min) return `Mínimo ${rules.min} caracteres`
    if (value.length > rules.max) return `Máximo ${rules.max} caracteres`
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email no válido"
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof FormData, value: string }
    const sanitizedValue = sanitizeInput(value)
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, sanitizedValue) }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof FormData, value: string }
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    let hasErrors = false
    ;(Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) { newErrors[key] = error; hasErrors = true }
    })
    if (hasErrors) { setErrors(newErrors); setTouched({ nombre: true, email: true, telefono: true, clinica: true, mensaje: true }); return }
    if (isDuplicateBookingContactBlocked) {
      setPendingDialogMessage("Ya hemos recibido tus datos para esta demo. Gestiona cambios desde el correo de confirmación.")
      setPendingDialogOpen(true)
      return
    }
    if (isExpired) {
      setExpiredDialogOpen(true)
      return
    }

    const emailToCheck = formData.email.trim().toLowerCase()
    if (emailToCheck) {
      const localActive =
        storedBooking?.contact?.email?.toLowerCase() === emailToCheck &&
        storedBooking?.demoExpiresAt &&
        new Date(storedBooking.demoExpiresAt).getTime() > Date.now()

      if (localActive) {
        setPendingDialogMessage("Este correo ya tiene una demo activa. Para evitar duplicados, espera a que termine o gestiona cambios desde el correo de confirmación.")
        setPendingDialogOpen(true)
        return
      }

      const res = await fetch(`/api/booking/check?email=${encodeURIComponent(emailToCheck)}`, { cache: "no-store" })
      if (!res.ok) {
        setPendingDialogMessage("No pudimos validar si tu correo ya tiene una demo activa. Inténtalo de nuevo.")
        setPendingDialogOpen(true)
        return
      }
      const data = await res.json()
      if (data?.active) {
        setPendingDialogMessage("Este correo ya tiene una demo activa. Para evitar duplicados, espera a que termine o gestiona cambios desde el correo de confirmación.")
        setPendingDialogOpen(true)
        return
      }
    }

    setIsSubmitting(true)
    try {

      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        clinica: formData.clinica,
        mensaje: formData.mensaje,
        roi: {
          monthlyPatients,
          averageTicket,
          conversionLoss,
          roi,
        },
      }

      if (bookingId && bookingAccessToken) {
        await submitContact({
          ...payload,
          bookingId,
          accessToken: bookingAccessToken,
        })
      } else if (sessionAccessToken) {
        await submitContact({
          ...payload,
          sessionToken: sessionAccessToken,
        })
      } else {
        setErrorDialogMessage("No pudimos validar tu sesión. Vuelve a la calculadora y repite el proceso.")
        setErrorDialogOpen(true)
        return
      }

      setFormExpiration(null)
      const persistedBooking = storage.get<Record<string, unknown> | null>("local", "booking", null)
      const bookingSnapshot = {
        ...(persistedBooking ?? {}),
        ...(storedBooking ?? {}),
        formExpiresAt: null,
        contactSubmitted: true,
        contact: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          clinica: formData.clinica,
          mensaje: formData.mensaje,
          roi: {
            monthlyPatients,
            averageTicket,
            conversionLoss,
            roi,
          },
          createdAt: new Date().toISOString(),
        },
      }
      storage.set("local", "booking", bookingSnapshot)
      setStoredBooking((prev) => ({
        ...(prev ?? {}),
        date: prev?.date ?? "",
        time: prev?.time ?? "",
        duration: prev?.duration ?? "",
        formExpiresAt: null,
        contactSubmitted: true,
        contact: {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          clinica: formData.clinica,
          mensaje: formData.mensaje,
          roi: {
            monthlyPatients,
            averageTicket,
            conversionLoss,
            roi,
          },
          createdAt: new Date().toISOString(),
        },
      }))
      window.dispatchEvent(new Event("clinvetia:contact-submitted"))
      try {
        localStorage.setItem("clinvetia:dashboard-refresh", String(Date.now()))
      } catch {}
      window.dispatchEvent(new Event("clinvetia:dashboard-refresh"))

      if (!hasBooking) resetROI()
      setIsSubmitted(true)
    } catch (error) {
      setErrorDialogMessage(error instanceof Error ? error.message : "No se pudo enviar el mensaje")
      setErrorDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 md:py-10 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20"><Icon icon={CheckCircle2} size="2xl" variant="primary" /></div>
        <h2 className="mb-2 text-2xl font-bold">¡Mensaje enviado!</h2>
        <p className="text-muted-foreground">Nuestro equipo te contactará en menos de 24 horas.</p>
        <div className="mt-8 w-fit mx-auto">
          <Button className="!w-fit !inline-flex" variant="ghost" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  const summaries = (
    <div className="space-y-4">
      {hasROISummary && (
        <GlassCard className="p-0 overflow-hidden border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <div className="bg-primary/20 px-4 py-3 border-b border-primary/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon icon={Calculator} size="xs" variant="primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Resumen ROI</span>
            </div>
            <Badge variant="primary" className="h-5 px-1.5 text-[10px]">Listo</Badge>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex justify-between"><span>Pacientes/mes</span><span className="font-semibold">{roiPatients}</span></div>
            <div className="flex justify-between"><span>Ticket medio</span><span className="font-semibold">{roiTicket}€</span></div>
            <div className="flex justify-between"><span>Pérdida de conversión</span><span className="font-semibold">{roiLoss}%</span></div>
            <div className="border-t border-white/10 pt-2 flex justify-between"><span>Pérdida mensual</span><span className="font-semibold text-destructive">-{perdidaMensual.toLocaleString("es-ES")}€</span></div>
            <div className="flex justify-between"><span>Recuperable (70%)</span><span className="font-semibold text-success">+{recuperacionEstimada.toLocaleString("es-ES")}€</span></div>
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" asChild>
              <Link href="/calculadora">Modificar ROI</Link>
            </Button>
          </div>
        </GlassCard>
      )}
      {hasBooking && storedBooking?.contactSubmitted && (
        <GlassCard className="p-0 overflow-hidden border-white/20 bg-white/5">
          <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Icon icon={CheckCircle2} size="xs" variant="accent" />
            <span className="text-xs font-bold uppercase tracking-wider">Resumen de tus datos</span>
          </div>
          <div className="p-4 space-y-3 text-sm">
            {storedBooking?.contact ? (
              <>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Nombre</span><span className="font-semibold text-right">{storedBooking.contact.nombre || "—"}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Email</span><span className="font-semibold text-right break-all">{storedBooking.contact.email || "—"}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Teléfono</span><span className="font-semibold text-right">{storedBooking.contact.telefono || "—"}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Clínica</span><span className="font-semibold text-right">{storedBooking.contact.clinica || "—"}</span></div>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <p className="text-xs uppercase text-muted-foreground mb-1">Mensaje</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{storedBooking.contact.mensaje || "Sin mensaje"}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Aún no tenemos tus datos de contacto asociados a esta reserva.
              </p>
            )}
          </div>
        </GlassCard>
      )}
      {hasActiveBookingSummary ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="p-0 overflow-hidden border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
            <div className="bg-primary/20 px-4 py-3 border-b border-primary/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Icon icon={CalendarDays} size="xs" variant="primary" /><span className="text-xs font-bold text-primary uppercase tracking-wider">Tu Reserva Demo</span></div>
              <Badge variant="primary" className="h-5 px-1.5 text-[10px]">Confirmada</Badge>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Fecha y hora</p>
                <p className="text-sm font-bold capitalize">{formatBookingDate(bookingDateStr) || bookingDate?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
                <p className="text-base font-bold text-primary">{bookingTime} ({bookingDuration} min)</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/5"><Icon icon={Sparkles} size="sm" variant="primary" /><p className="text-xs text-muted-foreground">Demo personalizada con experto</p></div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setRescheduleOpen(true)}
              >
                Modificar cita
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : isDemoExpired || isExpired ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-0 overflow-hidden border-warning/30 bg-warning/5">
            <div className="bg-warning/10 px-4 py-3 border-b border-warning/20 flex items-center gap-2">
              <Icon icon={AlertCircle} size="xs" variant="warning" />
              <span className="text-xs font-bold text-warning uppercase tracking-wider">Reserva expirada</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                El tiempo de tu reserva ha terminado. Vuelve a reservar una demo para continuar.
              </p>
              <Button variant="ghost" size="sm" className="w-full h-8 text-xs border-warning/20 hover:bg-warning/10 hover:text-warning" asChild>
                <Link href="/demo">Reservar demo ahora<Icon icon={ArrowRight} size="xs" className="ml-2" /></Link>
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-0 overflow-hidden border-warning/30 bg-warning/5">
            <div className="bg-warning/10 px-4 py-3 border-b border-warning/20 flex items-center gap-2"><Icon icon={Info} size="xs" variant="warning" /><span className="text-xs font-bold text-warning uppercase tracking-wider">Sin reserva previa</span></div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">No hemos detectado una reserva de demo activa para tu sesión.</p>
              <Button variant="ghost" size="sm" className="w-full h-8 text-xs border-warning/20 hover:bg-warning/10 hover:text-warning" asChild>
                <Link href="/demo">Reservar demo ahora<Icon icon={ArrowRight} size="xs" className="ml-2" /></Link>
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

    </div>
  )

  const submitButton = isDuplicateBookingContactBlocked ? null : (
    <Button
      type="submit"
      size="lg"
      className="w-full gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] h-14 text-lg"
      disabled={isSubmitting}
    >
      {isSubmitting ? "Enviando..." : <><Icon icon={Send} size="sm" variant="primary" />Enviar solicitud</>}
    </Button>
  )

  const rescheduleDialog = (
    <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modificar reserva</DialogTitle>
          <DialogDescription>
            Selecciona una nueva fecha y hora para tu demo.
          </DialogDescription>
        </DialogHeader>
        <BookingWizard
          className="border-white/10 bg-transparent p-0 shadow-none"
          title="Modificar reserva"
          subtitle="Elige un nuevo día, revisa los horarios y confirma la nueva fecha"
          confirmCtaLabel="Confirmar cambio"
          confirmingLabel="Actualizando..."
          initialDate={bookingDate ?? undefined}
          initialTime={bookingTime ?? undefined}
          initialDuration={bookingDuration ? Number(bookingDuration) : 45}
          initialStep="date"
          loadAvailability={async (date) => {
            const dateKey = formatLocalDateKey(date)
            const data = await getAvailability(dateKey)
            return { slots: data.slots ?? [], unavailable: data.unavailable ?? [] }
          }}
          onSubmit={async (payload: BookingWizardSubmitPayload) => {
            if (rescheduleLoading) return
            setRescheduleLoading(true)
            try {
              if (!sessionAccessToken) {
                setErrorDialogMessage("No pudimos validar tu sesión. Vuelve a la calculadora y repite el proceso.")
                setErrorDialogOpen(true)
                return
              }

              if (bookingId && bookingAccessToken) {
                await fetch("/api/booking/expire", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ bookingId, accessToken: bookingAccessToken }),
                }).catch(() => {})
              }

              const response = await createBooking({
                date: formatLocalDateKey(payload.date),
                time: payload.time,
                duration: payload.duration,
                sessionToken: sessionAccessToken,
              })

                setBookingId(response.bookingId)
                setBookingAccessToken(response.accessToken ?? null)
                setFormExpiration(response.formExpiresAt)
                const nextStored = {
                date: response.date,
                time: response.time,
                duration: String(response.duration),
                formExpiresAt: response.formExpiresAt,
                demoExpiresAt: response.demoExpiresAt,
                status: "confirmed" as const,
                contactSubmitted: storedBooking?.contactSubmitted ?? false,
                contact: storedBooking?.contact ?? null,
              }
              setStoredBooking(nextStored)
              storage.set("local", "booking_access_token", response.accessToken)
              storage.set("local", "booking", { ...response, ...nextStored, accessToken: response.accessToken })

              const params = new URLSearchParams(searchParams.toString())
              params.set("booking_id", response.bookingId)
              if (response.accessToken) {
                params.set("booking_token", response.accessToken)
              }
              if (sessionAccessToken) {
                params.set("session_token", sessionAccessToken)
              }
              router.replace(`/contacto?${params.toString()}`)
              setRescheduleOpen(false)
            } catch (error) {
              setErrorDialogMessage(error instanceof Error ? error.message : "No se pudo modificar la reserva")
              setErrorDialogOpen(true)
            } finally {
              setRescheduleLoading(false)
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )

  if (isDuplicateBookingContactBlocked) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="secondary" className="mb-6">Contacto</Badge>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground">{pageDescription}</p>
      </div>
      {rescheduleDialog}
      <Dialog open={pendingDialogOpen} onOpenChange={setPendingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 border border-warning/30">
              <Icon icon={AlertCircle} size="lg" variant="warning" />
            </div>
            <DialogTitle className="text-center text-xl">Ya existe una demo activa</DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              {pendingDialogMessage || "Hemos detectado una demo activa para este correo."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="ghost" className="w-full" onClick={() => setPendingDialogOpen(false)}>
              Entendido
            </Button>
            <Button variant="default" className="w-full" onClick={() => router.push("/demo")}>
              Volver a demo
              <Icon icon={CalendarDays} size="sm" variant="primary" className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={expiredDialogOpen} onOpenChange={setExpiredDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 border border-warning/30">
              <Icon icon={AlertCircle} size="lg" variant="warning" />
            </div>
            <DialogTitle className="text-center text-xl">Tu reserva ha expirado</DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              Para continuar, vuelve a reservar una demo y selecciona un nuevo horario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                storage.remove("local", "booking")
                storage.remove("local", "booking_access_token")
                storage.remove("local", "demo_access_token")
                setExpiredDialogOpen(false)
                router.push("/demo")
              }}
            >
              Ir a demo
              <Icon icon={CalendarDays} size="sm" variant="primary" className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30">
              <Icon icon={AlertCircle} size="lg" variant="destructive" />
            </div>
            <DialogTitle className="text-center text-xl">No pudimos enviar tu mensaje</DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              {errorDialogMessage || "Ocurrió un problema al enviar el formulario. Inténtalo de nuevo."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="ghost" className="w-full" onClick={() => setErrorDialogOpen(false)}>
              Entendido
            </Button>
            <Button variant="default" className="w-full" onClick={() => router.push("/calculadora")}>
              Ir a la calculadora
              <Icon icon={Calculator} size="sm" variant="primary" className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        <GlassCard className="p-6 md:p-8 space-y-5 border-warning/30 bg-warning/5">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">¿De nuevo por aquí? ¿Algún dato erróneo?</h2>
            <p className="text-sm text-muted-foreground">
              Ya tenemos tu envío y el resumen de tu cita. Si necesitas corregir algo, te ayudamos.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-warning/30 bg-warning/10">
              <Icon icon={AlertCircle} size="xl" variant="warning" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-warning">Ya hemos recibido tus datos para esta demo</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Para evitar duplicados, no se puede enviar otro formulario mientras la cita siga activa.
                Si hay alg&uacute;n dato incorrecto, escr&iacute;benos y lo corregimos contigo por chat.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {hasSessionROI && (
              <GlassCard className="p-6 md:p-8 space-y-5 h-full">
                <div className="flex items-center gap-2">
                  <Icon icon={Calculator} size="default" variant="primary" />
                  <h3 className="text-base font-semibold">Resumen ROI</h3>
                </div>
                <div className="space-y-3 pt-1 text-sm">
                  <div className="flex justify-between"><span>Pacientes/mes</span><span className="font-semibold">{monthlyPatients}</span></div>
                  <div className="flex justify-between"><span>Ticket medio</span><span className="font-semibold">{averageTicket}€</span></div>
                  <div className="flex justify-between"><span>Pérdida conversión</span><span className="font-semibold">{conversionLoss}%</span></div>
                  <div className="border-t border-white/10 pt-2 flex justify-between"><span>Pérdida mensual</span><span className="font-semibold text-destructive">-{perdidaMensual.toLocaleString("es-ES")}€</span></div>
                </div>
              </GlassCard>
            )}

            {hasBooking && !isDemoExpired && !isExpired && (
              <GlassCard className="p-6 md:p-8 space-y-5 h-full">
                <div className="flex items-center gap-2">
                  <Icon icon={CalendarDays} size="default" variant="primary" />
                  <h3 className="text-base font-semibold">Resumen demo</h3>
                </div>
                <div className="space-y-3 pt-1 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">Fecha</p>
                    <p className="font-semibold capitalize">
                      {bookingDate?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">Hora</p>
                    <p className="font-semibold">{bookingTime} ({bookingDuration} min)</p>
                  </div>
                  {storedBooking?.demoExpiresAt && (
                    <div className="space-y-1 border-t border-white/10 pt-2">
                      <p className="text-xs uppercase text-muted-foreground">Activa hasta</p>
                      <p className="text-muted-foreground">
                        {new Date(storedBooking.demoExpiresAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {(isDemoExpired || isExpired) && (
              <GlassCard className="p-6 md:p-8 space-y-4 h-full border-warning/30 bg-warning/5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-warning/30 bg-warning/10">
                    <Icon icon={AlertCircle} size="lg" variant="warning" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-warning">La reserva ha expirado</h3>
                    <p className="text-sm text-muted-foreground">
                      Para continuar, vuelve a reservar una demo y selecciona un nuevo horario disponible.
                    </p>
                  </div>
                </div>
                <Button variant="default" className="w-full" onClick={() => router.push("/demo")}>
                  Reservar nueva demo
                  <Icon icon={CalendarDays} size="sm" variant="primary" className="ml-2" />
                </Button>
              </GlassCard>
            )}
          </div>

          {storedBooking?.contactSubmitted && (
            <GlassCard className="p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Icon icon={CheckCircle2} size="default" variant="primary" />
                <h3 className="text-base font-semibold">Datos del cliente</h3>
              </div>
              {storedBooking.contact ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                    <div className="space-y-1"><p className="text-xs uppercase text-muted-foreground">Correo</p><p className="font-medium break-all">{storedBooking.contact.email}</p></div>
                    <div className="space-y-1"><p className="text-xs uppercase text-muted-foreground">Teléfono</p><p className="font-medium">{storedBooking.contact.telefono}</p></div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                    <div className="space-y-1"><p className="text-xs uppercase text-muted-foreground">Nombre</p><p className="font-medium">{storedBooking.contact.nombre}</p></div>
                    <div className="space-y-1"><p className="text-xs uppercase text-muted-foreground">Clínica</p><p className="font-medium">{storedBooking.contact.clinica}</p></div>
                  </div>
                  <div className="space-y-1 border-t border-white/10 pt-3">
                    <p className="text-xs uppercase text-muted-foreground">Datos del formulario (mensaje)</p>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{storedBooking.contact.mensaje}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    Hemos recibido tus datos correctamente. El detalle del formulario se est&aacute; sincronizando.
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full gap-2"
          onClick={() => {
            window.dispatchEvent(new Event("clinvetia:open-chat"))
          }}
        >
          <Icon icon={MessageCircle} size="default" variant="primary" />
          Corregir datos por chat
        </Button>
      </div>
    )
  }

  return (
    <>
      {rescheduleDialog}
      <div className="mb-12 text-center">
        <Badge variant="secondary" className="mb-6">Contacto</Badge>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground">{pageDescription}</p>
      </div>
      <form onSubmit={handleSubmit} className="no-validate" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
          <div className="md:hidden">{summaries}</div>
          <div className="space-y-8">
            <GlassCard className="p-6 md:p-8 space-y-6">
              {CONTACT_FIELDS.map((field) => (
                <div key={field.id} className="space-y-3">
                  <div className="mt-4 flex justify-between items-center">
                    <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
                    <AnimatePresence>
                      {errors[field.id] && (
                        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          <span className="hidden md:inline">{errors[field.id]}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <Input id={field.id} name={field.id} type={field.type || "text"} placeholder={field.placeholder} value={formData[field.id]} onChange={handleChange} onBlur={handleBlur} required className={cn("glass transition-all duration-200", errors[field.id] ? "border-destructive/50 ring-destructive/20 focus-visible:ring-destructive" : "")} />
                </div>
              ))}
              <div className="space-y-3">
                <div className="mt-4 flex justify-between items-center">
                  <label htmlFor="mensaje" className="text-sm font-medium">Mensaje *</label>
                  {errors.mensaje && <span className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1"><AlertCircle className="h-4 w-4" />{errors.mensaje}</span>}
                </div>
                <Textarea id="mensaje" name="mensaje" placeholder="Cuéntanos sobre tu clínica..." value={formData.mensaje} onChange={handleChange} onBlur={handleBlur} required rows={5} className={cn("glass resize-none transition-all duration-200", errors.mensaje ? "border-destructive/50 ring-destructive/20 focus-visible:ring-destructive" : "")} />
              </div>
            </GlassCard>
            <div className="md:hidden">{submitButton}</div>
          </div>
          <div className="hidden md:block space-y-6">{summaries}{submitButton}</div>
        </div>
      </form>
    </>
  )
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen py-24 md:py-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Cargando...</p></div>}>
            <ContactFormWithROI />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
