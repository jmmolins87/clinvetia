import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/providers/page-loader";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { TranslationSkeletonProvider } from "@/components/providers/translation-skeleton";
import { GlobalAutoTranslate } from "@/components/providers/global-auto-translate";
import { GlobalBackground } from "@/components/ui/global-background";
import { Toaster } from "@/components/ui/toaster";
import "./[locale]/globals.css";

export const metadata: Metadata = {
  title: "Clinvetia - Software Veterinario con IA",
  description: "Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
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
        className="antialiased bg-background text-foreground relative min-h-screen"
      >
        <ThemeProvider>
          <LoadingProvider>
            <TranslationSkeletonProvider>
              <GlobalAutoTranslate />
              <GlobalBackground />
              <PageLoader />
              <Toaster />
              {children}
            </TranslationSkeletonProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
