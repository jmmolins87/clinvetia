import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/providers/page-loader";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { TranslationSkeletonProvider } from "@/components/providers/translation-skeleton";
import { GlobalAutoTranslate } from "@/components/providers/global-auto-translate";
import { GlobalBackground } from "@/components/ui/global-background";
import { Toaster } from "@/components/ui/toaster";
import "./[locale]/globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clinvetia.com"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Clinvetia - Software Veterinario con IA",
    template: "%s · Clinvetia",
  },
  description: "Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo.",
  applicationName: "Clinvetia",
  category: "software",
  keywords: [
    "software veterinario",
    "ia veterinaria",
    "automatización clínica veterinaria",
    "agenda veterinaria",
    "gestión clínica veterinaria",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: appUrl,
    siteName: "Clinvetia",
    title: "Clinvetia - Software Veterinario con IA",
    description: "Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Clinvetia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinvetia - Software Veterinario con IA",
    description: "Software veterinario potenciado con IA. Más tiempo para tus pacientes, menos papeleo.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Clinvetia",
              url: appUrl,
              logo: `${appUrl}/logo.png`,
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Clinvetia",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              url: appUrl,
              inLanguage: "es-ES",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Clinvetia",
              url: appUrl,
              inLanguage: "es",
            }),
          }}
        />
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
