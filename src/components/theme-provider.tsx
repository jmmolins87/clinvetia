"use client";

/**
 * ThemeProvider — Glassmorphism Neon Design System
 *
 * Wrapper sobre `next-themes` que:
 *  - Aplica la clase `dark` al <html> (Tailwind darkMode: "class").
 *  - Establece "dark" como tema por defecto (modo Neon).
 *  - Evita el flash de tema incorrecto (disableTransitionOnChange opcional).
 *
 * Uso en src/app/layout.tsx:
 *   <ThemeProvider>
 *     {children}
 *   </ThemeProvider>
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"          // Aplica class="dark" al <html>
      defaultTheme="dark"        // Dark Neon como modo predeterminado
      enableSystem={true}        // Respeta prefers-color-scheme si el usuario no eligió
      disableTransitionOnChange  // Evita flash de estilos al cambiar tema
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
