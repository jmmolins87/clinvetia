"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock } from "lucide-react"
import { useROIStore } from "@/store/roi-store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { storage } from "@/lib/storage"

export function GlobalBookingTimer() {
  const { formExpiresAt, setFormExpiration, setAccessToken, reset } = useROIStore()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!formExpiresAt) {
      setTimeLeft(null)
      return
    }

    const expiry = new Date(formExpiresAt).getTime()
    
    const updateTimer = () => {
      const remaining = Math.max(0, expiry - Date.now())
      const seconds = Math.floor(remaining / 1000)
      setTimeLeft(seconds)
      
      if (remaining <= 0) {
        // Limpieza global al expirar
        localStorage.removeItem("clinvetia_booking")
        setFormExpiration(null)
        setTimeLeft(null)
        
        // Opcional: Si queremos ser muy agresivos, podemos resetear el store
        // reset()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [formExpiresAt, setFormExpiration, reset])

  useEffect(() => {
    const checkDemoExpiration = () => {
      const raw = localStorage.getItem("clinvetia_booking")
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as { demoExpiresAt?: string }
        if (!parsed.demoExpiresAt) return
        const demoTime = new Date(parsed.demoExpiresAt).getTime()
        if (Date.now() >= demoTime) {
          localStorage.removeItem("clinvetia_booking")
          storage.remove("local", "access_token")
          storage.remove("local", "demo_access_token")
          setAccessToken(null)
        }
      } catch {
        // Ignorar datos corruptos
      }
    }

    checkDemoExpiration()
    const interval = setInterval(checkDemoExpiration, 60_000)
    return () => clearInterval(interval)
  }, [setAccessToken])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!mounted || timeLeft === null || timeLeft <= 0) return null

  return (
    <TooltipProvider>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-[200]"
        >
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className={cn(
                "relative flex items-center justify-center rounded-full backdrop-blur-3xl transition-all duration-500 shadow-2xl group cursor-help",
                timeLeft < 60 
                  ? "bg-destructive/20 border border-destructive/50 animate-pulse shadow-[0_0_30px_rgba(var(--destructive-rgb),0.5)]" 
                  : "bg-warning/15 border border-warning/40 shadow-[0_0_20px_rgba(var(--warning-rgb),0.3)]"
              )}>
                {/* SVG Circular Progress */}
                <svg 
                  className="w-14 h-14 md:w-20 md:h-20 -rotate-90 transform"
                  viewBox="0 0 100 100"
                >
                  {/* Borde fino de fondo */}
                  <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-white/10" />
                  
                  {/* Borde grueso de progreso (Drenaje sentido horario) */}
                  <motion.circle
                    cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="transparent"
                    initial={{ pathLength: 1, pathOffset: 0 }}
                    animate={{ 
                      pathLength: timeLeft / 600,
                      pathOffset: 1 - timeLeft / 600
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                    className={cn(
                      "transition-colors duration-500", 
                      timeLeft < 60 ? "text-destructive" : "text-warning"
                    )}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={cn(
                    "text-sm md:text-lg font-mono font-black tabular-nums tracking-tighter leading-none", 
                    timeLeft < 60 ? "text-destructive" : "text-warning drop-shadow-[0_0_10px_rgba(var(--warning-rgb),0.5)]"
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              variant="warning" 
              side="right" 
              sideOffset={15}
              className="flex items-center gap-3 px-4 py-2 border-warning/40 shadow-[0_0_30px_rgba(var(--warning-rgb),0.3)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
                <Clock className="h-4 w-4 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Reserva temporal activa</span>
                <span className="text-[10px] opacity-80">Tu plaza se liberará si el tiempo llega a cero.</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  )
}
