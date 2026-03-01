"use client"

import dynamic from "next/dynamic"

const GlobalBookingTimer = dynamic(
  () => import("@/components/marketing/global-booking-timer").then((mod) => mod.GlobalBookingTimer),
  { ssr: false }
)
const ExitIntentGuard = dynamic(
  () => import("@/components/marketing/exit-intent-guard").then((mod) => mod.ExitIntentGuard),
  { ssr: false }
)
const ChatPortal = dynamic(
  () => import("@/components/marketing/chat-portal").then((mod) => mod.ChatPortal),
  { ssr: false }
)
const CookieConsent = dynamic(
  () => import("@/components/marketing/cookie-consent").then((mod) => mod.CookieConsent),
  { ssr: false }
)

export function MarketingOverlays() {
  return (
    <>
      <GlobalBookingTimer />
      <ExitIntentGuard />
      <ChatPortal />
      <CookieConsent />
    </>
  )
}
