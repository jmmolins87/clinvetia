"use client"

import { useTheme } from "next-themes"
import { Toaster as SonnerToaster, toast } from "sonner"

export function Sonner() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-right"
      richColors
      expand={false}
      closeButton
      toastOptions={{
        className: "border border-white/10 bg-background/90 backdrop-blur-xl",
      }}
    />
  )
}

export { toast }
