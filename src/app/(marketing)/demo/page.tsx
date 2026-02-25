"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookingSection } from "@/components/marketing/booking-calendar"
import { useROIStore } from "@/store/roi-store"
import { Icon } from "@/components/ui/icon"
import { Calculator } from "lucide-react"

export default function DemoPage() {
  const router = useRouter()
  const { hasAcceptedDialog } = useROIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !hasAcceptedDialog) {
      router.replace("/calculadora")
    }
  }, [mounted, hasAcceptedDialog, router])

  if (!mounted || !hasAcceptedDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Icon icon={Calculator} size="xl" variant="primary" className="mx-auto animate-pulse" />
          <p className="text-muted-foreground animate-pulse text-lg">Redirigiendo a la calculadora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <BookingSection id="demo" />
    </div>
  )
}
