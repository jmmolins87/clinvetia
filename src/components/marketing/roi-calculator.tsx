"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Calculator,
  ChevronRight,
  Euro,
  Info,
  PercentCircle,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { BrandName } from "@/components/ui/brand-name"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GlassCard } from "@/components/ui/GlassCard"
import { Icon } from "@/components/ui/icon"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { useROIStore } from "@/store/roi-store"
import { createSession } from "@/lib/api"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
} as const

const CLINVETIA_MONTHLY_COST = 297

function formatEur(n: number) {
  return n.toLocaleString("es-ES") + "€"
}

export interface ROICalculatorProps {
  trigger?: ReactNode
  className?: string
}

export function ROICalculator({ trigger, className }: ROICalculatorProps) {
  const router = useRouter()
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

  const [mounted, setMounted] = useState(false)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [createSessionError, setCreateSessionError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setHasAcceptedDialog(false)
    setAccessToken(null)
    storage.remove("local", "roi_access_token")
  }, [setHasAcceptedDialog, setAccessToken])

  const calculatingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSliderChange = (setter: (v: number) => void) => (value: number) => {
    setter(value)
    if (!isCalculating) setIsCalculating(true)
    if (calculatingTimeoutRef.current) clearTimeout(calculatingTimeoutRef.current)
    calculatingTimeoutRef.current = setTimeout(() => { setIsCalculating(false) }, 1000)
  }

  const ingresosBrutos = monthlyPatients * averageTicket
  const perdidaMensual = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)
  const beneficioNeto = recuperacionEstimada - CLINVETIA_MONTHLY_COST
  const roi = Math.round(((beneficioNeto) / CLINVETIA_MONTHLY_COST) * 100)
  const paybackDays = beneficioNeto > 0 ? Math.ceil((CLINVETIA_MONTHLY_COST / (beneficioNeto / 30))) : null
  const isPositive = roi > 0

  const SLIDERS = [
    { label: "Pacientes / mes", icon: Users, value: monthlyPatients, setter: setMonthlyPatients, min: 0, max: 1000, step: 10, display: `${monthlyPatients}`, color: "primary" as const, hint: "Consultas gestionadas al mes." },
    { label: "Ticket Medio", icon: ReceiptText, value: averageTicket, setter: setAverageTicket, min: 0, max: 200, step: 5, display: `${averageTicket}€`, color: "secondary" as const, hint: "Ingreso medio por visita." },
    { label: "% Pérdida de conversión", icon: PercentCircle, value: conversionLoss, setter: setConversionLoss, min: 0, max: 60, step: 1, display: `${conversionLoss}%`, color: "destructive" as const, hint: "% consultas perdidas." },
  ] as const

  const METRICS = [
    { label: "Pérdida mensual", value: `-${formatEur(perdidaMensual)}`, icon: TrendingDown, variant: "destructive" as const },
    { label: "Recuperable", value: `+${formatEur(recuperacionEstimada)}`, icon: TrendingUp, variant: "success" as const },
    { label: "Beneficio neto", value: beneficioNeto >= 0 ? `+${formatEur(beneficioNeto)}` : `-${formatEur(Math.abs(beneficioNeto))}`, icon: Euro, variant: beneficioNeto >= 0 ? "primary" as const : "destructive" as const },
    { label: "Payback", value: paybackDays ? `${paybackDays} días` : "—", icon: Calculator, variant: "muted" as const },
  ] as const

  return (
    <div className={cn("relative", className)}>
      {trigger ? <div className="mb-8 flex justify-center">{trigger}</div> : null}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}><Badge variant="default" className="mb-6">Calculadora de rentabilidad</Badge></motion.div>
          <motion.h1 {...fadeUp} transition={{ delay: 0.2 }} className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">¿Cuánto dinero pierdes <span className="text-gradient-primary">cada mes</span>?</motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.3 }} className="mx-auto max-w-2xl text-lg text-muted-foreground">Ajusta los valores a tu clínica y descubre el ROI real que obtendrías con <BrandName />.</motion.p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="space-y-6">
              <GlassCard className="p-6 md:p-8 space-y-8">
                {SLIDERS.map((s) => (
                  <SliderField key={s.label} {...s} onChange={handleSliderChange(s.setter)} />
                ))}
              </GlassCard>

              {mounted && (
                <GlassCard className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon icon={Info} size="sm" className="text-muted-foreground" />
                    <p className="text-base font-medium text-muted-foreground">Cómo se calcula el ROI</p>
                  </div>
                  <div className="space-y-3">
                    <FormulaRow label="Ingresos brutos" formula={`${monthlyPatients} pac × ${averageTicket}€`} result={formatEur(ingresosBrutos)} color="text-foreground" isCalculating={isCalculating} />
                    <FormulaRow label="Pérdida mensual" formula={`${monthlyPatients} × ${conversionLoss}% × ${averageTicket}€`} result={`-${formatEur(perdidaMensual)}`} color="text-destructive" isCalculating={isCalculating} />
                    <FormulaRow label="Recuperación (70%)" formula={`${formatEur(perdidaMensual)} × 0.70`} result={`+${formatEur(recuperacionEstimada)}`} color="text-success" isCalculating={isCalculating} />
                    <div className="border-t border-white/10 pt-3"><FormulaRow label="Coste mensual" formula="Tarifa plana" result={`-${formatEur(CLINVETIA_MONTHLY_COST)}`} color="text-muted-foreground" /></div>
                    <div className="border-t border-white/10 pt-3">
                      <FormulaRow label="Beneficio neto" formula="Recuperado − Coste" result={beneficioNeto >= 0 ? `+${formatEur(beneficioNeto)}` : `-${formatEur(Math.abs(beneficioNeto))}`} color={beneficioNeto >= 0 ? "text-primary font-semibold" : "text-destructive font-semibold"} isCalculating={isCalculating} />
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="space-y-4">
              {mounted && (
                <>
                  <GlassCard className="p-6 text-center space-y-2">
                    <p className="text-base text-muted-foreground font-medium">Tu ROI con ClinvetIA</p>
                    <AnimatePresence mode="wait">
                      {isCalculating ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-[3.75rem]"><Spinner size="lg" variant="primary" /></motion.div>
                      ) : (
                        <motion.p key={roi} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-6xl font-bold tabular-nums ${isPositive ? "text-success drop-shadow-[0_0_20px_rgba(var(--success-rgb),0.5)]" : "text-destructive"}`}>{roi > 0 ? "+" : ""}{roi}%</motion.p>
                      )}
                    </AnimatePresence>
                    <p className="text-base text-muted-foreground">{isCalculating ? "Calculando..." : isPositive ? "ROI positivo — muy rentable" : "Ajusta los valores"}</p>
                  </GlassCard>

                  <div className="grid grid-cols-2 gap-3">
                    {METRICS.map((m) => (
                      <MetricCard key={m.label} {...m} isCalculating={isCalculating} />
                    ))}
                  </div>

                  <GlassCard className={cn("p-4 bg-gradient-to-br border-success/30", isPositive ? "from-success/10 via-background to-primary/5" : "from-background/60")}>
                    <p className="text-base text-center">Por <span className="font-bold">1€</span> invertido, recuperas {isCalculating ? <Spinner size="sm" variant="default" className="inline-flex align-middle" /> : <span className={cn("font-bold", isPositive ? "text-success" : "")}>{(roi / 100 + 1).toFixed(1)}€</span>}</p>
                  </GlassCard>
                </>
              )}

              <GlassCard className="p-5 space-y-4">
                <p className="text-lg font-medium">¿Quieres ver estos números en tu clínica?</p>
                <p className="text-base text-muted-foreground leading-relaxed">Analizamos tu caso concreto en una llamada de 30 min. Recibirás tu proyección real sin compromiso.</p>
                <div className="mt-3 border-t border-white/10 pt-4 text-center font-semibold text-success">Demo gratuita</div>
              </GlassCard>

              <Button size="lg" className="w-full gap-2" onClick={() => setShowSkipDialog(true)}>
                Hablar con el equipo
                <Icon icon={ChevronRight} size="sm" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <ResultDialog
        open={showSkipDialog}
        onOpenChange={setShowSkipDialog}
        data={{ monthlyPatients, averageTicket, conversionLoss, roi }}
        isSubmitting={isCreatingSession}
        error={createSessionError}
        onConfirm={async () => {
          setIsCreatingSession(true)
          setCreateSessionError(null)
          try {
            const session = await createSession({
              roi: { monthlyPatients, averageTicket, conversionLoss, roi },
            })
            if (!session?.accessToken) {
              throw new Error("No se pudo crear el token de sesión")
            }
            setHasAcceptedDialog(true)
            setAccessToken(session.accessToken)
            storage.set("local", "roi_access_token", session.accessToken)
            setShowSkipDialog(false)
            router.push("/contacto")
          } catch (error) {
            setCreateSessionError(error instanceof Error ? error.message : "No se pudo crear tu sesión. Inténtalo de nuevo.")
          } finally {
            setIsCreatingSession(false)
          }
        }}
      />
    </div>
  )
}

type SliderColor = "primary" | "secondary" | "destructive"

function SliderField({ label, icon: IconComponent, value, onChange, min, max, step, display, color, hint }: { label: string, icon: LucideIcon, value: number, onChange: (v: number) => void, min: number, max: number, step: number, display: string, color: SliderColor, hint?: string }) {
  const colorMap = { primary: "text-primary", secondary: "text-neon-pink", destructive: "text-destructive" }
  const dotMap = { primary: "bg-primary", secondary: "bg-neon-pink", destructive: "bg-destructive" }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-base font-medium flex items-center gap-2 ${colorMap[color]}`}>
          <span className={`h-2 w-2 rounded-full ${dotMap[color]}`} />
          <span className="text-foreground/80">{label}</span>
          <Icon icon={IconComponent} size="sm" />
        </label>
        <span className={`text-base font-bold tabular-nums ${colorMap[color]}`}>{display}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="py-1" />
      <div className="flex items-center justify-between text-base text-muted-foreground"><span>{min}</span><span className="opacity-60">{hint}</span><span>{max}</span></div>
    </div>
  )
}

function FormulaRow({ label, formula, result, color, isCalculating }: { label: string; formula: string; result: string; color: string; isCalculating?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0"><p className="text-base text-muted-foreground truncate">{label}</p><p className="text-base font-mono text-muted-foreground/60 truncate">{formula}</p></div>
      {isCalculating ? <Spinner size="sm" variant="default" /> : <span className={`text-base font-semibold tabular-nums ${color}`}>{result}</span>}
    </div>
  )
}

type MetricVariant = "primary" | "destructive" | "success" | "muted"

function MetricCard({ label, value, icon: IconComponent, variant, isCalculating }: { label: string; value: string; icon: LucideIcon; variant: MetricVariant; isCalculating?: boolean }) {
  const styles: Record<MetricVariant, string> = { primary: "border-primary/30 bg-primary/5 text-primary", destructive: "border-destructive/30 bg-destructive/5 text-destructive", success: "border-success/30 bg-success/5 text-success", muted: "border-white/10 bg-white/5 text-muted-foreground" }
  const iconVariantMap: Record<MetricVariant, "primary" | "destructive" | "muted"> = { primary: "primary", destructive: "destructive", success: "primary", muted: "muted" }
  return (
    <div className={`rounded-xl border p-3 space-y-1 ${styles[variant]}`}>
      <div className="flex items-center gap-1.5 opacity-70">
        <Icon icon={IconComponent} size="sm" variant={iconVariantMap[variant]} />
        <span className="text-base font-medium">{label}</span>
      </div>
      {isCalculating ? <div className="flex items-center justify-center h-7"><Spinner size="default" variant="default" /></div> : <p className="text-lg font-bold tabular-nums">{value}</p>}
    </div>
  )
}

interface ResultDialogData {
  monthlyPatients: number
  averageTicket: number
  conversionLoss: number
  roi: number
}

function ResultDialog({ open, onOpenChange, data, onConfirm, isSubmitting, error }: { open: boolean; onOpenChange: (open: boolean) => void; data: ResultDialogData; onConfirm: () => Promise<void> | void; isSubmitting: boolean; error?: string | null }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary">
            <Icon icon={Calculator} size="lg" variant="primary" />
          </div>
          <DialogTitle className="text-center text-xl">¿Enviar estos datos a <BrandName />?</DialogTitle>
          <DialogDescription className="text-center text-base">Obtendrás un feedback personalizado mucho más exacto.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2 text-base">
          {[{ l: "Pacientes/mes", v: data.monthlyPatients }, { l: "Ticket medio", v: `${data.averageTicket}€` }, { l: "Pérdida", v: `${data.conversionLoss}%` }].map(i => (
            <div key={i.l} className="flex justify-between"><span>{i.l}:</span><span className="font-semibold">{i.v}</span></div>
          ))}
          <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between"><span>ROI proyectado:</span><span className="font-bold text-success">{data.roi}%</span></div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter className="mt-4 gap-2">
          <Button variant="destructive" className="w-full bg-destructive/15 border-2 border-destructive/70 text-destructive shadow-[0_0_20px_rgba(var(--destructive-rgb),0.50)]" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="default" className="w-full" onClick={() => { void onConfirm() }} disabled={isSubmitting}>
            {isSubmitting ? "Creando acceso..." : "Continuar"}
            <Icon icon={ArrowRight} size="sm" className="ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
