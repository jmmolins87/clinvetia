import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  // ── Dark mode via clase HTML (next-themes añade class="dark") ──────────
  darkMode: "class",

  // ── Archivos a escanear para purge ────────────────────────────────────
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── Colores → variables CSS ──────────────────────────────────────
      colors: {
        background:  "var(--background)",
        foreground:  "var(--foreground)",
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        border:      "var(--border)",
        input:       "var(--input)",
        ring:        "var(--ring)",
      },

      // ── Border radius → variable CSS ─────────────────────────────────
      borderRadius: {
        sm:   "calc(var(--radius) - 4px)",
        md:   "var(--radius)",
        lg:   "calc(var(--radius) + 4px)",
        xl:   "calc(var(--radius) + 8px)",
        "2xl":"calc(var(--radius) + 16px)",
      },

      // ── Box shadows neon ─────────────────────────────────────────────
      boxShadow: {
        "neon-primary":   "0 0 20px rgba(79, 172, 254, 0.50)",
        "neon-primary-lg":"0 0 60px rgba(79, 172, 254, 0.30), 0 0 120px rgba(79, 172, 254, 0.10)",
        "neon-secondary": "0 0 20px rgba(240, 147, 251, 0.50)",
        "neon-accent":    "0 0 20px rgba(0, 242, 254, 0.40)",
        "glass":          "0 8px 32px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.10)",
        "glass-hover":    "0 16px 48px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        "inner-neon":     "inset 0 0 20px rgba(79, 172, 254, 0.15)",
      },

      // ── Background gradientes de marca ───────────────────────────────
      backgroundImage: {
        "gradient-primary":   "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
        "gradient-secondary": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-accent":    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "gradient-surface":   "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "gradient-dark":      "linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)",
        // Gradientes diagonales extra
        "neon-glow-primary":  "radial-gradient(ellipse at center, rgba(79,172,254,0.15) 0%, transparent 70%)",
        "neon-glow-secondary":"radial-gradient(ellipse at center, rgba(240,147,251,0.15) 0%, transparent 70%)",
      },

      // ── Keyframes & animaciones ──────────────────────────────────────
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(79, 172, 254, 0.50)" },
          "50%":       { boxShadow: "0 0 40px rgba(79, 172, 254, 0.80), 0 0 80px rgba(79, 172, 254, 0.30)" },
        },
        "glow-pulse-secondary": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(240, 147, 251, 0.50)" },
          "50%":       { boxShadow: "0 0 40px rgba(240, 147, 251, 0.80), 0 0 80px rgba(240, 147, 251, 0.30)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(79, 172, 254, 0.30)" },
          "50%":       { borderColor: "rgba(79, 172, 254, 0.80)" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "glow-pulse":           "glow-pulse 2s ease-in-out infinite",
        "glow-pulse-secondary": "glow-pulse-secondary 2s ease-in-out infinite",
        "shimmer":              "shimmer 3s linear infinite",
        "float":                "float 3s ease-in-out infinite",
        "border-glow":          "border-glow 2s ease-in-out infinite",
        "fade-in":              "fade-in 0.4s ease-out forwards",
      },

      // ── Typography ───────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },

      // ── Backdrop blur extra ───────────────────────────────────────────
      backdropBlur: {
        xs:  "2px",
        "4xl": "72px",
      },
    },
  },

  plugins: [
    // ── Plugin: utilidades glass neon ────────────────────────────────────
    plugin(({ addUtilities, addComponents }) => {
      // Utilidades funcionales glass
      addUtilities({
        ".glass": {
          background:             "var(--glass-bg)",
          backdropFilter:         "blur(var(--glass-blur))",
          WebkitBackdropFilter:   "blur(var(--glass-blur))",
          border:                 "1px solid var(--glass-border)",
        },
        ".glass-strong": {
          background:             "rgba(20, 20, 30, 0.80)",
          backdropFilter:         "blur(20px)",
          WebkitBackdropFilter:   "blur(20px)",
          border:                 "1px solid rgba(255, 255, 255, 0.15)",
        },
        ".glass-light": {
          background:             "rgba(255, 255, 255, 0.70)",
          backdropFilter:         "blur(8px)",
          WebkitBackdropFilter:   "blur(8px)",
          border:                 "1px solid rgba(255, 255, 255, 0.60)",
        },
        // Gradiente de texto neon
        ".text-gradient-primary": {
          background:             "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
          WebkitBackgroundClip:   "text",
          backgroundClip:        "text",
          WebkitTextFillColor:   "transparent",
          color:                 "transparent",
        },
        ".text-gradient-secondary": {
          background:             "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          WebkitBackgroundClip:   "text",
          backgroundClip:        "text",
          WebkitTextFillColor:   "transparent",
          color:                 "transparent",
        },
        ".text-gradient-accent": {
          background:             "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          WebkitBackgroundClip:   "text",
          backgroundClip:        "text",
          WebkitTextFillColor:   "transparent",
          color:                 "transparent",
        },
        // Borde neon interactivo
        ".border-neon": {
          border:     "1px solid var(--border-neon-primary, rgba(79, 172, 254, 0.60))",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        },
        ".border-neon-secondary": {
          border:     "1px solid var(--border-neon-secondary, rgba(240, 147, 251, 0.60))",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        },
      });

      // Componentes compuestos reutilizables
      addComponents({
        // Tarjeta glass canónica del design system
        ".card-glass": {
          background:           "var(--glass-bg)",
          backdropFilter:       "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border:               "1px solid var(--glass-border)",
          borderRadius:         "calc(var(--radius) + 4px)",
          boxShadow:            "0 8px 32px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.10)",
          transition:           "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform:  "translateY(-2px)",
            boxShadow:  "0 16px 48px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 30px rgba(79, 172, 254, 0.15)",
          },
        },
        // Botón gradiente primario
        ".btn-neon-primary": {
          background:   "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
          color:        "#0a0a0f",
          fontWeight:   "600",
          borderRadius: "var(--radius)",
          transition:   "opacity 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease",
          "&:hover": {
            opacity:   "0.90",
            boxShadow: "0 0 30px rgba(79, 172, 254, 0.60)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        // Botón gradiente secundario
        ".btn-neon-secondary": {
          background:   "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color:        "#0a0a0f",
          fontWeight:   "600",
          borderRadius: "var(--radius)",
          transition:   "opacity 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease",
          "&:hover": {
            opacity:   "0.90",
            boxShadow: "0 0 30px rgba(240, 147, 251, 0.60)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
      });
    }),
  ],
};

export default config;
