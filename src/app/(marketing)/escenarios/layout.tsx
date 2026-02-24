import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Escenarios — Clinvetia",
}

export default function EscenariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
