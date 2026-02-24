"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Euro,
  TrendingUp,
  TrendingDown,
  Calculator,
  ArrowRight,
  Info,
  Users,
  ReceiptText,
  PercentCircle,
  ChevronRight,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { BrandName } from "@/components/ui/brand-name"
import { useROIStore } from "@/store/roi-store"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const CLINVETIA_MONTHLY_COST = 297

function formatEur(n: number) {
  return n.toLocaleString("es-ES") + "€"
}

export default function CalculadoraPage() {
  const router = useRouter()
  const {
    monthlyPatients,
    averageTicket,
    conversionLoss,
    setMonthlyPatients,
    setAverageTicket,
    setConversionLoss,
  } = useROIStore()

  const [mounted, setMounted] = useState(false)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const calculatingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSliderChange = (setter: (v: number) => void) => (value: number) => {
    setter(value)
    if (!isCalculating) setIsCalculating(true)
    if (calculatingTimeoutRef.current) clearTimeout(calculatingTimeoutRef.current)
    calculatingTimeoutRef.current = setTimeout(() => { setIsCalculating(false) }, 1000)
  }

  const ingresosBrutos        = monthlyPatients * averageTicket
  const perdidaMensual        = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada  = Math.round(perdidaMensual * 0.7)
  const beneficioNeto         = recuperacionEstimada - CLINVETIA_MONTHLY_COST
  const roi                   = Math.round(((beneficioNeto) / CLINVETIA_MONTHLY_COST) * 100)
  const paybackDays           = beneficioNeto > 0 ? Math.ceil((CLINVETIA_MONTHLY_COST / (beneficioNeto / 30))) : null
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
    <div className="relative">
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
                  <div className="flex items-center gap-2"><Info className="h-4 w-4 text-muted-foreground" /><p className="text-base font-medium text-muted-foreground">Cómo se calcula el ROI</p></div>
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
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-[3.75rem]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></motion.div>
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

                  <GlassCard className={cn("p-4 bg-gradient-to-br border-success/30", isPositive ? "from-success/10 via-background to-primary/5" : "from-white/5")}>
                    <p className="text-base text-center">Por <span className="font-bold">1€</span> invertido, recuperas {isCalculating ? <Loader2 className="inline h-4 w-4 animate-spin" /> : <span className={cn("font-bold", isPositive ? "text-success" : "")}>{(roi / 100 + 1).toFixed(1)}€</span>}</p>
                  </GlassCard>
                </>
              )}

              <GlassCard className="p-5 space-y-4">
                <p className="text-lg font-medium">¿Quieres ver estos números en tu clínica?</p>
                <p className="text-base text-muted-foreground leading-relaxed">Analizamos tu caso concreto en una llamada de 30 min. Recibirás tu proyección real sin compromiso.</p>
                <div className="border-t border-white/10 pt-4 text-center font-semibold text-success">Demo gratuita</div>
              </GlassCard>

              <Button size="lg" className="w-full gap-2" onClick={() => (averageTicket > 0 ? setShowSkipDialog(true) : setShowWarningDialog(true))}>Hablar con el equipo<ChevronRight className="h-4 w-4" /></Button>
            </motion.div>
          </div>
        </div>
      </section>

      <ResultDialog open={showSkipDialog} onOpenChange={setShowSkipDialog} data={{ monthlyPatients, averageTicket, conversionLoss, roi }} onConfirm={() => router.push("/contacto")} />
      <WarningDialog open={showWarningDialog} onOpenChange={setShowWarningDialog} />
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function SliderField({ label, icon: Icon, value, onChange, min, max, step, display, color, hint }: any) {
  const colorMap = { primary: "text-primary", secondary: "text-neon-pink", destructive: "text-destructive" }
  const dotMap = { primary: "bg-primary", secondary: "bg-neon-pink", destructive: "bg-destructive" }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-base font-medium flex items-center gap-2 ${colorMap[color]}`}><span className={`h-2 w-2 rounded-full ${dotMap[color]}`} /><span className="text-foreground/80">{label}</span><Icon className="w-4 h-4" /></label>
        <span className={`text-base font-bold tabular-nums ${colorMap[color]}`}>{display}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="py-1" />
      <div className="flex items-center justify-between text-base text-muted-foreground"><span>{min}</span><span className="opacity-60">{hint}</span><span>{max}</span></div>
    </div>
  )
}

function FormulaRow({ label, formula, result, color, isCalculating }: any) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0"><p className="text-base text-muted-foreground truncate">{label}</p><p className="text-base font-mono text-muted-foreground/60 truncate">{formula}</p></div>
      {isCalculating ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <span className={`text-base font-semibold tabular-nums ${color}`}>{result}</span>}
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, variant, isCalculating }: any) {
  const styles: any = { primary: "border-primary/30 bg-primary/5 text-primary", destructive: "border-destructive/30 bg-destructive/5 text-destructive", success: "border-success/30 bg-success/5 text-success", muted: "border-white/10 bg-white/5 text-muted-foreground" }
  return (
    <div className={`rounded-xl border p-3 space-y-1 ${styles[variant]}`}>
      <div className="flex items-center gap-1.5 opacity-70"><Icon className="h-4 w-4" /><span className="text-base font-medium">{label}</span></div>
      {isCalculating ? <div className="flex items-center justify-center h-7"><Loader2 className="h-5 w-5 animate-spin" /></div> : <p className="text-lg font-bold tabular-nums">{value}</p>}
    </div>
  )
}

function ResultDialog({ open, onOpenChange, data, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary"><Calculator className="h-7 w-7" /></div>
          <DialogTitle className="text-center text-xl">¿Enviar estos datos a <BrandName />?</DialogTitle>
          <DialogDescription className="text-center text-base">Obtendrás un feedback personalizado mucho más exacto.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2 text-base">
          {[{ l: "Pacientes/mes", v: data.monthlyPatients }, { l: "Ticket medio", v: `${data.averageTicket}€` }, { l: "Pérdida", v: `${data.conversionLoss}%` }].map(i => (
            <div key={i.l} className="flex justify-between"><span>{i.l}:</span><span className="font-semibold">{i.v}</span></div>
          ))}
          <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between"><span>ROI proyectado:</span><span className="font-bold text-success">{data.roi}%</span></div>
        </div>
        <DialogFooter className="flex-row justify-between gap-2 mt-4">
          <Button variant="destructive" className="bg-destructive/15 border-2 border-destructive/70 text-destructive shadow-[0_0_20px_rgba(var(--destructive-rgb),0.50)]" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="default" onClick={() => { onOpenChange(false); onConfirm() }}>Continuar<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WarningDialog({ open, onOpenChange }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive"><Info className="h-7 w-7" /></div>
          <DialogTitle className="text-center text-xl">Calculadora incompleta</DialogTitle>
          <DialogDescription className="text-center text-base">Introduce los datos básicos de tu clínica para poder darte un feedback útil.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center"><Button variant="default" onClick={() => onOpenChange(false)}>Entendido</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
