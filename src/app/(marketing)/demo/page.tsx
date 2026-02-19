import type { Metadata } from "next"
import { BookingSection } from "@/components/marketing/booking-calendar"

export const metadata: Metadata = {
  title: "Reservar demo",
  description:
    "Elige día y hora para tu demo personalizada de ClinvetIA. Te mostramos cómo automatizar la gestión de tu clínica veterinaria en menos de 30 minutos.",
}

export default function DemoPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Blobs de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-1/4 h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[110px]" />
        <div className="absolute top-1/2 -right-1/4 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[110px]" />
      </div>

      <BookingSection id="demo" />
    </div>
  )
}
