import type { Metadata } from "next"
import { BookingSection } from "@/components/marketing/booking-calendar"

export const metadata: Metadata = {
  title: "Reservar demo",
  description:
    "Elige día y hora para tu demo personalizada de ClinvetIA. Te mostramos cómo automatizar la gestión de tu clínica veterinaria en menos de 30 minutos.",
}

export default function DemoPage() {
  return (
    <div className="relative">
      <BookingSection id="demo" />
    </div>
  )
}
