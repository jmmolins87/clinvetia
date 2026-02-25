"use client"

import { useEffect, useState } from "react"
import { BookingSection } from "@/components/marketing/booking-calendar"

export default function DemoPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative">
      <BookingSection id="demo" />
    </div>
  )
}
