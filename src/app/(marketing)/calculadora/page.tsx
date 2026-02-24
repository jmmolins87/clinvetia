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

  useEffect(() => {
    setMounted(true)
  }, [])

  const calculatingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSliderChange = (setter: (v: number) => void) => (value: number) => {
    setter(value)
    if (!isCalculating) setIsCalculating(true)
    if (calculatingTimeoutRef.current) {
      clearTimeout(calculatingTimeoutRef.current)
    }
    calculatingTimeoutRef.current = setTimeout(() => {
      setIsCalculating(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (calculatingTimeoutRef.current) {
        clearTimeout(calculatingTimeoutRef.current)
      }
    }
  }, [])

  const ingresosBrutos        = monthlyPatients * averageTicket
  const perdidaMensual        = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada  = Math.round(perdidaMensual * 0.7)
  const beneficioNeto         = recuperacionEstimada - CLINVETIA_MONTHLY_COST
  const roi                   = CLINVETIA_MONTHLY_COST > 0
    ? Math.round(((beneficioNeto) / CLINVETIA_MONTHLY_COST) * 100)
    : 0
  const paybackDays           = beneficioNeto > 0
    ? Math.ceil((CLINVETIA_MONTHLY_COST / (beneficioNeto / 30)))
    : null

  const isPositive = roi > 0

  function handleGoToContact() {
    // Si el ticket es 0, consideramos que la calculadora no está completa
    if (averageTicket > 0) {
      setShowSkipDialog(true)
    } else {
      setShowWarningDialog(true)
    }
  }

  return (
    <div className="relative">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Badge variant="default" className="mb-6">
                Calculadora de rentabilidad
              </Badge>
            </motion.div>
            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="mb-6 text-4xl font-bold tracking-tight md:text-6xl"
            >
              ¿Cuánto dinero pierdes{" "}
              <span className="text-gradient-primary">cada mes</span>?
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ delay: 0.3 }}
              className="mx-auto max-w-2xl text-lg text-muted-foreground"
            >
              Ajusta los valores a tu clínica y descubre el ROI real que
              obtendrías con <BrandName />.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ───────────────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-stretch">
              {/* ── Panel de sliders ──────────────────────────────────────── */}
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <GlassCard className="p-6 md:p-8 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Configura tu clínica
                      </p>
                      <p className="text-base text-muted-foreground">
                        Arrastra los controles para ajustar los valores
                      </p>
                    </div>
                  </div>

                  {/* Slider: Pacientes / mes */}
                  <SliderField
                    label="Pacientes / mes"
                    icon={<Users className="w-4 h-4" />}
                    value={monthlyPatients}
                    onChange={handleSliderChange(setMonthlyPatients)}
                    min={0}
                    max={1000}
                    step={10}
                    display={`${monthlyPatients}`}
                    minLabel="0"
                    maxLabel="1.000"
                    color="primary"
                    hint="Consultas o visitas que gestionas al mes."
                  />

                  {/* Slider: Ticket medio */}
                  <SliderField
                    label="Ticket Medio"
                    icon={<ReceiptText className="w-4 h-4" />}
                    value={averageTicket}
                    onChange={handleSliderChange(setAverageTicket)}
                    min={0}
                    max={200}
                    step={5}
                    display={`${averageTicket}€`}
                    minLabel="0€"
                    maxLabel="200€"
                    color="secondary"
                    hint="Ingreso medio por visita o consulta (consulta + productos)."
                  />

                  {/* Slider: % Pérdida de conversión */}
                  <SliderField
                    label="% Pérdida de conversión"
                    icon={<PercentCircle className="w-4 h-4" />}
                    value={conversionLoss}
                    onChange={handleSliderChange(setConversionLoss)}
                    min={0}
                    max={60}
                    step={1}
                    display={`${conversionLoss}%`}
                    minLabel="0%"
                    maxLabel="60%"
                    color="destructive"
                    hint="% consultas que no se convierten en cita."
                  />
                </GlassCard>

                {/* Fórmula explicada */}
                {mounted && (
                  <GlassCard className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-base font-medium text-muted-foreground">
                        Cómo se calcula el ROI
                      </p>
                    </div>
                    <div className="space-y-3 text-base">
                      <FormulaRow
                        label="Ingresos brutos mensuales"
                        formula={`${monthlyPatients} pac × ${averageTicket}€`}
                        result={formatEur(ingresosBrutos)}
                        color="text-foreground"
                        isCalculating={isCalculating}
                      />
                      <FormulaRow
                        label="Pérdida mensual estimada"
                        formula={`${monthlyPatients} × ${conversionLoss}% × ${averageTicket}€`}
                        result={`-${formatEur(perdidaMensual)}`}
                        color="text-destructive"
                        isCalculating={isCalculating}
                      />
                      <FormulaRow
                        label="Recuperación con ClinvetIA (70%)"
                        formula={`${formatEur(perdidaMensual)} × 0.70`}
                        result={`+${formatEur(recuperacionEstimada)}`}
                        color="text-success"
                        isCalculating={isCalculating}
                      />
                      <div className="border-t border-white/10 pt-3">
                        <FormulaRow
                          label="Coste mensual ClinvetIA"
                          formula="Tarifa plana"
                          result={`-${formatEur(CLINVETIA_MONTHLY_COST)}`}
                          color="text-muted-foreground"
                        />
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <FormulaRow
                          label="Beneficio neto mensual"
                          formula="Recuperado − Coste"
                          result={
                            beneficioNeto >= 0
                              ? `+${formatEur(beneficioNeto)}`
                              : `-${formatEur(Math.abs(beneficioNeto))}`
                          }
                          color={
                            beneficioNeto >= 0
                              ? "text-primary font-semibold"
                              : "text-destructive font-semibold"
                          }
                          isCalculating={isCalculating}
                        />
                      </div>
                      <div className="mt-3 rounded-lg bg-white/5 p-3 text-center text-base text-muted-foreground">
                        <span className="font-mono">
                          ROI = (Beneficio neto / Inversión) × 100
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </motion.div>

              {/* ── Panel de resultados ───────────────────────────────────── */}
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.2 }}
                className="space-y-4 flex flex-col"
              >
                {mounted && (
                  <>
                    {/* ROI grande */}
                    <GlassCard className="p-6 text-center space-y-2">
                      <p className="text-base text-muted-foreground font-medium">
                        Tu ROI con ClinvetIA
                      </p>
                      <AnimatePresence mode="wait">
                        {isCalculating ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-[3.75rem]"
                          >
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </motion.div>
                        ) : (
                          <motion.p
                            key={roi}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-6xl font-bold tabular-nums ${isPositive ? "text-success drop-shadow-[0_0_20px_rgba(var(--success-rgb),0.5)]" : "text-destructive"}`}
                          >
                            {roi > 0 ? "+" : ""}
                            {roi}%
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <p className="text-base text-muted-foreground">
                        {isCalculating ? "Calculando..." : isPositive
                          ? "ROI positivo — la inversión es muy rentable"
                          : "Ajusta los valores para ver el potencial"}
                      </p>
                    </GlassCard>

                    {/* Cards métricas */}
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        label="Pérdida mensual"
                        value={`-${formatEur(perdidaMensual)}`}
                        icon={<TrendingDown className="h-4 w-4" />}
                        variant="destructive"
                        isCalculating={isCalculating}
                      />
                      <MetricCard
                        label="Recuperable"
                        value={`+${formatEur(recuperacionEstimada)}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        variant="success"
                        isCalculating={isCalculating}
                      />
                      <MetricCard
                        label="Beneficio neto"
                        value={
                          beneficioNeto >= 0
                            ? `+${formatEur(beneficioNeto)}`
                            : `-${formatEur(Math.abs(beneficioNeto))}`
                        }
                        icon={<Euro className="h-4 w-4" />}
                        variant={beneficioNeto >= 0 ? "primary" : "destructive"}
                        isCalculating={isCalculating}
                      />
                      <MetricCard
                        label="Payback"
                        value={paybackDays ? `${paybackDays} días` : "—"}
                        icon={<Calculator className="h-4 w-4" />}
                        variant="muted"
                        isCalculating={isCalculating}
                      />
                    </div>

                    {/* ROI dinámico highlight - Siempre visible */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <GlassCard className={cn(
                        "p-4 bg-gradient-to-br border-success/30",
                        isPositive 
                          ? "from-success/10 via-background to-primary/5" 
                          : "from-white/5 via-background to-white/5"
                      )}>
                        <p className="text-base text-foreground/80 text-center">
                          Por {" "}
                          <span className="font-bold text-foreground">1€</span>{" "}
                          invertido en <BrandName />, recuperas{" "}
                          {isCalculating ? (
                            <Loader2 className="inline h-4 w-4 animate-spin text-success" />
                          ) : (
                            <span className={cn("font-bold", isPositive ? "text-success" : "text-foreground")}>
                              {Math.max(0, (roi / 100 + 1)).toFixed(1)}€
                            </span>
                          )}
                        </p>
                      </GlassCard>
                    </motion.div>
                  </>
                )}

                {/* CTA a contacto */}
                <GlassCard className="p-5 space-y-4">
                  <p className="text-lg font-medium text-foreground">
                    ¿Quieres ver estos números en tu clínica?
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Esta calculadora usa promedios del sector. En una
                    llamada de 30 minutos analizamos tu caso concreto:
                    volumen real de consultas perdidas, horarios de
                    mayor demanda y cómo <BrandName /> se integra con
                    tu sistema actual.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Recibirás tu proyección con ROI real. Sin compromiso,
                    solo datos.
                  </p>
                  <div className="border-t border-white/10 my-4 pt-4">
                    <p className="text-center text-base font-semibold text-success whitespace-nowrap">
                      Sin compromiso · Demo gratuita
                    </p>
                  </div>
                </GlassCard>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleGoToContact}
                >
                  Hablar con el equipo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dialog: confirmar envío de datos ──────────────────────────────────── */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              ¿Enviar estos datos a <BrandName />?
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              <BrandName /> utilizará este resultado para poder darte un <span className="text-primary font-semibold">feedback personalizado y mucho más exacto</span> sobre el potencial de tu clínica.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
            <p className="text-base font-medium text-foreground">Resumen de tu cálculo:</p>
            <div className="space-y-2 text-base text-muted-foreground">
              <div className="flex justify-between">
                <span>Pacientes/mes:</span>
                <span className="font-semibold text-foreground">{monthlyPatients}</span>
              </div>
              <div className="flex justify-between">
                <span>Ticket medio:</span>
                <span className="font-semibold text-foreground">{averageTicket}€</span>
              </div>
              <div className="flex justify-between">
                <span>Pérdida conversión:</span>
                <span className="font-semibold text-foreground">{conversionLoss}%</span>
              </div>
              <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between">
                <span>Tu ROI proyectado:</span>
                <span className="font-bold text-success">{roi}%</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-between gap-2 mt-4">
            <Button
              variant="destructive"
              className="bg-destructive/15 border-2 border-destructive/70 text-destructive shadow-[0_0_20px_rgba(var(--destructive-rgb),0.50)]"
              onClick={() => setShowSkipDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowSkipDialog(false);
                router.push("/contacto");
              }}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: advertencia datos en 0 ──────────────────────────────────── */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30">
              <Info className="h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center text-xl">
              Calculadora incompleta
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              Para poder darte un feedback útil y personalizado, necesitamos que primero introduzcas los datos básicos de tu clínica en la calculadora.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
            <p className="text-center text-base text-muted-foreground">
              Mueve los sliders para ajustar el número de pacientes, ticket medio y pérdida de conversión.
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              variant="default"
              onClick={() => setShowWarningDialog(false)}
              className="w-full sm:w-auto"
            >
              Entendido, volver a la calculadora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

interface SliderFieldProps {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  display: string
  minLabel: string
  maxLabel: string
  color: "primary" | "secondary" | "destructive"
  hint: string
}

function SliderField({
  label, icon, value, onChange, min, max, step,
  display, minLabel, maxLabel, color, hint,
}: SliderFieldProps) {
  const colorMap = {
    primary:     "text-primary",
    secondary:   "text-neon-pink",
    destructive: "text-destructive",
  }
  const dotMap = {
    primary:     "bg-primary",
    secondary:   "bg-neon-pink",
    destructive: "bg-destructive",
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-base font-medium text-foreground/80 flex items-center gap-2 ${colorMap[color]}`}>
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotMap[color]}`} />
          <span className="text-foreground/80">{label}</span>
          {icon}
        </label>
        <span className={`text-base font-bold tabular-nums ${colorMap[color]}`}>{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-1"
      />
      <div className="flex items-center justify-between text-base text-muted-foreground">
        <span>{minLabel}</span>
        <span className="text-center opacity-60 text-base whitespace-nowrap">{hint}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

interface FormulaRowProps {
  label: string
  formula: string
  result: string
  color: string
  isCalculating?: boolean
}

function FormulaRow({ label, formula, result, color, isCalculating }: FormulaRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-base text-muted-foreground truncate">{label}</p>
        <p className="text-base font-mono text-muted-foreground/60 truncate">{formula}</p>
      </div>
      {isCalculating ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
      ) : (
        <span className={`text-base font-semibold tabular-nums shrink-0 ${color}`}>{result}</span>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  variant: "primary" | "destructive" | "success" | "muted"
  isCalculating?: boolean
}

function MetricCard({ label, value, icon, variant, isCalculating }: MetricCardProps) {
  const styles = {
    primary:     "border-primary/30 bg-primary/5 text-primary",
    destructive: "border-destructive/30 bg-destructive/5 text-destructive",
    success:     "border-success/30 bg-success/5 text-success",
    muted:       "border-white/10 bg-white/5 text-muted-foreground",
  }

  return (
    <div className={`rounded-xl border p-3 space-y-1 ${styles[variant]}`}>
      <div className="flex items-center gap-1.5 opacity-70">
        {icon}
        <span className="text-base font-medium">{label}</span>
      </div>
      {isCalculating ? (
        <div className="flex items-center justify-center h-7">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <p className="text-lg font-bold tabular-nums">{value}</p>
      )}
    </div>
  )
}
