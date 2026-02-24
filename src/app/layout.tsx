import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/providers/page-loader";
import { GlobalBackground } from "@/components/ui/global-background";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground relative min-h-screen`}
      >
        <ThemeProvider>
          <GlobalBackground />
          <PageLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
