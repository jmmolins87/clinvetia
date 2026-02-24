import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Calculadora ROI — Clinvetia",
}

export default function CalculadoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
