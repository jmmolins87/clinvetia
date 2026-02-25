"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Ghost } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { GlassCard } from "@/components/ui/GlassCard"
import { BrandName } from "@/components/ui/brand-name"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-end justify-end p-6 md:p-12">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/404.webm" type="video/webm" />
        <source src="/videos/404.mp4" type="video/mp4" />
        <source src="/videos/404.ogv" type="video/ogg" />
      </video>

      {/* Overlay — Casi invisible para máximo resplandor */}
      <div className="absolute inset-0 bg-black/5" />

      {/* Content — Posicionado abajo a la derecha */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full md:max-w-md"
      >
        <GlassCard className="p-10 md:p-12 text-left border-primary/20 bg-background/10 backdrop-blur-lg min-h-[600px] flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-6 mb-8">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 8, -8, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30"
              >
                <Icon icon={Ghost} size="xl" variant="primary" className="drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.8)]" />
              </motion.div>
              <h1 className="font-bold tracking-tighter leading-none">
                <span className="text-7xl md:text-9xl text-gradient-primary block mb-2">404</span>
                <span className="text-xl md:text-2xl text-muted-foreground uppercase tracking-[0.3em] font-semibold">Error</span>
              </h1>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Paciente a la fuga. 🐾
            </h2>
            
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Esta página no ha pasado por consulta. Puede que se haya ido a dar un paseo largo por el parque. No es una urgencia, te ayudamos a volver.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full h-14 gap-2 cursor-pointer shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] text-lg"
                asChild
              >
                <Link href="/">
                  <Icon icon={Home} size="default" />
                  Ir al inicio
                </Link>
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full h-14 gap-2 cursor-pointer text-lg"
                onClick={() => router.back()}
              >
                <Icon icon={ArrowLeft} size="default" />
                Volver atrás
              </Button>
            </div>

            <div className="pt-8 border-t border-white/5">
              <BrandName className="text-2xl font-bold" />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
