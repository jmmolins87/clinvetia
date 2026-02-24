import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Solución — Clinvetia",
}

export default function SolucionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
