"use client"

import { useEffect, useRef } from "react"
import Lenis from "lenis"

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)
  const rafIdRef = useRef<number>(0)

  useEffect(() => {
    const startLenis = () => {
      if (lenisRef.current) return
      const lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      })
      lenisRef.current = lenis

      const raf = (time: number) => {
        if (!lenisRef.current) return
        lenisRef.current.raf(time)
        rafIdRef.current = requestAnimationFrame(raf)
      }
      rafIdRef.current = requestAnimationFrame(raf)
    }

    const stopLenis = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = 0
      }
      lenisRef.current?.destroy()
      lenisRef.current = null
    }

    startLenis()

    const handleScrollLock = (event: Event) => {
      const customEvent = event as CustomEvent<{ locked?: boolean }>
      if (customEvent.detail?.locked) {
        stopLenis()
        return
      }
      startLenis()
    }
    window.addEventListener("clinvetia:scroll-lock", handleScrollLock as EventListener)

    return () => {
      window.removeEventListener("clinvetia:scroll-lock", handleScrollLock as EventListener)
      stopLenis()
    }
  }, [])

  return null
}
