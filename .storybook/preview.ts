import React from "react"
import type { Preview, Decorator } from "@storybook/react"
import "../src/app/globals.css"

// ── Constantes de tema ────────────────────────────────────────────────────────
const DARK_BG  = "#0a0a0f"
const LIGHT_BG = "#f0f4f8"

const PANEL_BASE: React.CSSProperties = {
  padding: "2.5rem 2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1.5rem",
}

const LABEL: React.CSSProperties = {
  fontSize: "0.6rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
}

// ── Decorador global de tema ─────────────────────────────────────────────────
// Toolbar "Theme" controla cuatro modos: dark, light, system, side-by-side.
// Estrategia: en lugar de mutar class="dark" en el <html> (que puede
// chocar con el addon Backgrounds de Storybook), cada modo envuelve la
// story en un <div> contenedor que:
//   • Tiene el background correcto como color inline
//   • Lleva class="dark" cuando corresponde → activa tokens CSS de .dark {}
//   • Cubre toda el área del canvas
// Esto hace que los tokens CSS de Tailwind (var(--background), etc.)
// se resuelvan siempre desde el ancestro correcto, sin depender del <body>.

function resolveTheme(theme: string): "dark" | "light" {
  if (theme === "system") {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme === "dark" ? "dark" : "light"
}

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals?.theme as string) ?? "dark"

  if (theme === "side-by-side") {
    return React.createElement(
      "div",
      { style: { display: "flex", width: "100%" } },

      React.createElement(
        "div",
        { className: "dark", style: { ...PANEL_BASE, background: DARK_BG, flex: 1 } },
        React.createElement("span", {
          style: { ...LABEL, color: "rgba(255,255,255,0.30)" },
        }, "Dark Neon"),
        React.createElement(Story),
      ),

      React.createElement("div", {
        style: { width: "1px", flexShrink: 0, background: "rgba(128,128,128,0.20)" },
      }),

      React.createElement(
        "div",
        { style: { ...PANEL_BASE, background: LIGHT_BG, flex: 1 } },
        React.createElement("span", {
          style: { ...LABEL, color: "rgba(0,0,0,0.30)" },
        }, "Light Frost"),
        React.createElement(Story),
      ),
    )
  }

  const resolved = resolveTheme(theme)
  const isDark   = resolved === "dark"
  const bg       = isDark ? DARK_BG : LIGHT_BG

  return React.createElement(
    "div",
    {
      className: isDark ? "dark" : undefined,
      style: {
        background: bg,
        width: "100%",
        padding: "2rem",
      },
    },
    React.createElement(Story),
  )
}

// ── Preview config ────────────────────────────────────────────────────────────
const preview: Preview = {
  decorators: [withTheme],

  tags: ["autodocs"],

  globalTypes: {
    theme: {
      name: "Theme",
      description: "Alterna Dark Neon, Light Frost o ambos en paralelo",
      defaultValue: "dark",
      toolbar: {
        icon: "moon",
        items: [
          { value: "dark",         title: "Dark Neon",    icon: "moon"       },
          { value: "light",        title: "Light Frost",  icon: "sun"        },
          { value: "system",       title: "System",       icon: "browser"    },
          { value: "side-by-side", title: "Dark + Light", icon: "sidebyside" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    backgrounds: { disable: true },

    actions: { argTypesRegex: "^on[A-Z].*" },

    controls: {
      matchers: {
        color: /(background|color|fill|stroke)$/i,
        date:  /Date$/i,
      },
    },

    layout: "fullscreen",

    viewport: {
      viewports: {
        mobile:  { name: "Mobile (375px)",   styles: { width: "375px",  height: "812px"  } },
        tablet:  { name: "Tablet (768px)",   styles: { width: "768px",  height: "1024px" } },
        desktop: { name: "Desktop (1280px)", styles: { width: "1280px", height: "800px"  } },
        wide:    { name: "Wide (1536px)",    styles: { width: "1536px", height: "900px"  } },
      },
      defaultViewport: "desktop",
    },

    docs: {
      toc: {
        contentsSelector: ".sbdocs-content",
        headingSelector: "h2, h3",
        title: "Contenido",
      },
      codePanel: true,
      source: {
        transform: (code: string) => code,
      },
    },
  },
}

export default preview
