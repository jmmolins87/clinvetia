"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Euro, TrendingUp, Calculator } from "lucide-react"
import { BrandName } from "@/components/ui/brand-name"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useROIStore } from "@/store/roi-store"

interface ROICalculatorProps {
  trigger?: React.ReactNode
}

export function ROICalculator({ trigger }: ROICalculatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const {
    monthlyPatients,
    averageTicket,
    conversionLoss,
    setMonthlyPatients,
    setAverageTicket,
    setConversionLoss,
  } = useROIStore()

  const perdidaMensual = Math.round(monthlyPatients * (conversionLoss / 100) * averageTicket)
  const recuperacionEstimada = Math.round(perdidaMensual * 0.7)

  const handleContactClick = useCallback(() => {
    setIsOpen(false)
    router.push("/contacto")
  }, [router])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" className="gap-2">
            <Calculator className="w-4 h-4" />
            Calcular mi ROI
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Calculadora de Rentabilidad
              </DialogTitle>
              <DialogDescription>
                Descubre cuánto dinero pierdes por llamadas perdidas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium text-foreground/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Pacientes / mes
                </label>
                <div className="relative w-20">
                  <Input
                    type="number"
                    value={monthlyPatients}
                    onChange={(e) => setMonthlyPatients(Number(e.target.value))}
                    className="h-8 px-2 text-right font-bold text-primary glass"
                  />
                </div>
              </div>
              <Slider
                value={[monthlyPatients]}
                onValueChange={([value]) => setMonthlyPatients(value)}
                min={0}
                max={2000}
                step={10}
                className="py-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>2000</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium text-foreground/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Ticket Medio (€)
                </label>
                <div className="relative w-20">
                  <Input
                    type="number"
                    value={averageTicket}
                    onChange={(e) => setAverageTicket(Number(e.target.value))}
                    className="h-8 px-2 pr-5 text-right font-bold text-secondary glass"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondary/60">€</span>
                </div>
              </div>
              <Slider
                value={[averageTicket]}
                onValueChange={([value]) => setAverageTicket(value)}
                min={0}
                max={500}
                step={5}
                className="py-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0€</span>
                <span>500€</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-medium text-foreground/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  % Pérdida de conversión
                </label>
                <div className="relative w-20">
                  <Input
                    type="number"
                    value={conversionLoss}
                    onChange={(e) => setConversionLoss(Number(e.target.value))}
                    className="h-8 px-2 pr-5 text-right font-bold text-destructive glass"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-destructive/60">%</span>
                </div>
              </div>
              <Slider
                value={[conversionLoss]}
                onValueChange={([value]) => setConversionLoss(value)}
                min={0}
                max={100}
                step={1}
                className="py-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
              <div className="relative">
                <p className="text-sm text-destructive/80 font-medium mb-1 flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5" />
                  Pérdida Mensual
                </p>
                <p className="text-2xl font-bold text-destructive tabular-nums drop-shadow-[0_0_15px_rgba(var(--destructive-rgb),0.5)]">
                  {perdidaMensual.toLocaleString("es-ES")}€
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="relative">
                <p className="text-sm text-primary/80 font-medium mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Recuperable (70%)
                </p>
                <p className="text-2xl font-bold text-primary tabular-nums drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
                  {recuperacionEstimada.toLocaleString("es-ES")}€
                </p>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {recuperacionEstimada > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-white/10 p-3 text-center"
              >
                <p className="text-base text-foreground/70">
                  Con <BrandName /> podrías recuperar hasta{" "}
                  <span className="font-semibold text-primary">
                    {recuperacionEstimada.toLocaleString("es-ES")}€/mes
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
          <Button variant="default" onClick={handleContactClick} className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Empezar a recuperar dinero
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
