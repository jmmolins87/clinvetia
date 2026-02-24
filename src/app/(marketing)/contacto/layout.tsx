import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Contacto — Clinvetia",
}

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
