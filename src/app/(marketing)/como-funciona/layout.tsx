import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Cómo funciona — Clinvetia",
}

export default function ComoFuncionaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
