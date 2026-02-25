import path from "path";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  // ── Story discovery ────────────────────────────────────────────────────────
  // Busca stories en src/ con cualquier extensión .stories.{ts,tsx,mdx}
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],

  // ── Addons ─────────────────────────────────────────────────────────────────
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",   // docs, controls, actions, viewport, backgrounds, toolbars
    "@storybook/addon-interactions", // play functions & testing
  ],

  // ── Framework ──────────────────────────────────────────────────────────────
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  // ── Docs ───────────────────────────────────────────────────────────────────
  docs: {
    autodocs: "tag", // genera docs automáticos cuando la story tiene `tags: ['autodocs']`
  },

  // ── TypeScript ─────────────────────────────────────────────────────────────
  typescript: {
    // react-docgen-typescript extrae prop types para el panel Controls
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      // Filtra props heredadas de HTML para no saturar el panel
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  // ── Vite final config ──────────────────────────────────────────────────────
  // viteFinal recibe la config base de Storybook y nos permite extenderla.
  // Aquí añadimos:
  //   1. @tailwindcss/vite  → procesa Tailwind v4 nativamente (sin PostCSS)
  //   2. vite-tsconfig-paths → resuelve alias "@/*" desde tsconfig.json
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");

    return mergeConfig(config, {
      plugins: [
        // Tailwind v4 plugin nativo para Vite — reemplaza @tailwindcss/postcss
        // en el contexto de Vite. Lee automáticamente tailwind.config.ts.
        tailwindcss(),

        // Resuelve los paths de tsconfig.json → "@/components/..." funciona
        tsconfigPaths(),

        // Intercepta next/navigation ANTES que cualquier resolución de Vite.
        // Necesario porque @storybook/react-vite no incluye el App Router context
        // y el useRouter real lanza "invariant expected app router to be mounted".
        {
          name: "storybook-mock-next-navigation",
          enforce: "pre",
          resolveId(id: string) {
            if (id === "next/navigation") return "\0virtual:mock-next-navigation";
          },
          load(id: string) {
            if (id !== "\0virtual:mock-next-navigation") return;
            return `
export function useRouter() {
  return {
    push:    (url) => console.log("[Storybook] router.push:", url),
    replace: (url) => console.log("[Storybook] router.replace:", url),
    back:    ()    => console.log("[Storybook] router.back"),
    forward: ()    => console.log("[Storybook] router.forward"),
    refresh: ()    => console.log("[Storybook] router.refresh"),
    prefetch: ()   => {},
  };
}
export function usePathname()  { return "/"; }
export function useSearchParams() { return new URLSearchParams(); }
export function useParams()    { return {}; }
export function redirect(url)  { throw new Error("[Storybook] redirect: " + url); }
export function notFound()     { throw new Error("[Storybook] notFound called"); }
`;
          },
        },
      ],

      // Alias explícito como respaldo (redundante con tsconfigPaths,
      // pero garantiza resolución en cualquier entorno CI)
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
          // next/image y next/link usan process.env internamente y rompen en Vite/Storybook.
          // Los reemplazamos con mocks que usan elementos HTML estándar.
          "next/image": path.resolve(__dirname, "./__mocks__/next-image.tsx"),
          "next/link": path.resolve(__dirname, "./__mocks__/next-link.tsx"),
          "next/navigation": path.resolve(__dirname, "./__mocks__/next-navigation.ts"),
        },
      },

      // Optimiza el bundle de Storybook en dev
      optimizeDeps: {
        // next/* debe quedar fuera del pre-bundle para que resolve.alias lo intercepte
        exclude: ["next/navigation", "next/image", "next/link"],
        include: [
          "react",
          "react-dom",
          "clsx",
          "tailwind-merge",
          "lucide-react",
          "next-themes",
          "@radix-ui/react-slot",
          "@radix-ui/react-switch",
          "@radix-ui/react-dialog",
          "@radix-ui/react-tabs",
          "@radix-ui/react-toast",
          "@radix-ui/react-dropdown-menu",
          "@radix-ui/react-slider",
        ],
      },
    });
  },
};

export default config;
