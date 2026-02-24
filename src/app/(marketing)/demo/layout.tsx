import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Demo — Clinvetia",
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
