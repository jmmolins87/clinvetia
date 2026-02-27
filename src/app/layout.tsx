import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/providers/page-loader";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { TranslationSkeletonProvider } from "@/components/providers/translation-skeleton";
import { GlobalBackground } from "@/components/ui/global-background";
import { GlobalBookingTimer } from "@/components/marketing/global-booking-timer";
import { ExitIntentGuard } from "@/components/marketing/exit-intent-guard";
import { ChatPortal } from "@/components/marketing/chat-portal";
import { CookieConsent } from "@/components/marketing/cookie-consent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clinvetia - Software Veterinario con IA",
  description: "Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground relative min-h-screen`}
      >
        <ThemeProvider>
          <LoadingProvider>
            <TranslationSkeletonProvider>
              <GlobalBackground />
              <PageLoader />
              <GlobalBookingTimer />
              <ExitIntentGuard />
              <ChatPortal />
              <CookieConsent />
              {children}
            </TranslationSkeletonProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
