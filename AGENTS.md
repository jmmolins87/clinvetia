# AGENTS.md — Guía para Agentes de Codificación

Este documento proporciona instrucciones esenciales para agentes de IA que operan en este repositorio.

---

## 📦 Comandos

### Desarrollo
```bash
npm run dev           # Servidor de desarrollo Next.js (localhost:3000)
npm run storybook     # Storybook para desarrollo de componentes (localhost:6006)
```

### Build & Producción
```bash
npm run build         # Build de producción Next.js
npm run start         # Servidor de producción
npm run build-storybook  # Build estático de Storybook
```

### Linting
```bash
npm run lint          # ESLint sobre todo el proyecto
npm run lint -- --fix # Auto-corregir errores de linting
```

### Testing
No hay framework de testing configurado actualmente. Cuando se implemente, seguir el patrón de Storybook para tests visuales/interacción:
```bash
# Storybook tests (cuando se configuren)
npm run test -- --stories  # Ejecutar tests de una story específica
```

---

## 🎨 Estilo Visual del Proyecto

**Tema:** Liquid Glass — objetos físicos de cristal translúcido 3D

El estilo no es glassmorphism plano. Es **Liquid Glass**: cada componente se trata como un objeto físico de vidrio con capas apiladas:

1. **Fondo tintado translúcido** — `rgba(color, 0.05–0.15)` + `backdrop-blur-xl`
2. **Borde luminoso** — `border border-[rgba(color, 0.55–0.70)]` de color según variante
3. **Highlight interno** — `inset 0 1px 0 rgba(255,255,255,0.18)` simula curvatura del cristal
4. **Sombra inferior interna** — `inset 0 -1px 0 rgba(0,0,0,0.25)` da profundidad
5. **Glow exterior multicapa** — `0 0 25px rgba(color,0.55), 0 0 60px rgba(color,0.20)`

### Tokens disponibles

- `--glass-highlight` — highlight interno + sombra inferior (combinados en `box-shadow`)
- `--glass-shadow` — sombra exterior de superficie
- `--glow-primary/secondary/accent` — glow neon multicapa
- `--border-neon-primary/secondary/accent` — borde luminoso en hover

### Clases utilitarias

- `.liquid-glass` — superficie neutra con highlight + sombra
- `.liquid-glass-primary` — con tinte green (dark) / cyan (light) y glow primario
- `.liquid-glass-secondary` — con tinte pink y glow secundario
- `.btn-liquid` — base para botones con pseudo-elemento `::before` de highlight curvo
- `.glass` — glassmorphism base (sin highlight 3D, para elementos secundarios)
- `.text-gradient-primary/secondary/accent` — texto con gradiente recortado

### Paleta de colores de variantes

| Variante | Dark Mode | Light Mode |
|----------|-----------|------------|
| **Primary/Default** | Verde Neón `#43e97b` | Cian Neón `#00f2fe` |
| **Secondary** | Pink-Magenta `#f093fb` | Pink-Magenta `#f093fb` |
| **Destructive** | Rojo-Rosa `#f5576c` | Rojo `#ef4444` |
| **Accent** | Cian-Azul `#00f2fe` | Azul `#3b82f6` |

- **Dark Mode** es el tema principal (`defaultTheme="dark"`) — Primary = Neon Green
- **Light Mode** disponible como "Light Frost" — Primary = Neon Cyan

### Sistema de colores (CSS Variables)

**TODOS los colores deben usar variables CSS**, nunca valores hardcodeados.

```tsx
// ❌ Incorrecto - NO hardcodear colores
className="text-[#f093fb] bg-[#43e97b]/10"

// ✅ Correcto - Usar variables
className="text-secondary bg-success/10"
style={{ backgroundColor: "rgba(var(--secondary-rgb), 0.15)" }}
```

**Variables disponibles:**
- `--primary`, `--secondary`, `--accent`, `--destructive`, `--success`, `--warning`
- `--neon-green`, `--neon-cyan`, `--neon-pink`, `--neon-red`, `--neon-amber`, `--neon-blue`
- `--primary-rgb`, `--secondary-rgb`, `--accent-rgb`, etc. (para transparencias)
- `--gradient-primary`, `--gradient-secondary`, `--gradient-accent`
- `--glow-primary`, `--glow-secondary`, `--glow-accent`, `--glow-destructive`

**Ver paleta completa:** Storybook → Design System → Colors

---

## 🏗️ Arquitectura

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Layout raíz con ThemeProvider
│   ├── page.tsx         # Página principal
│   └── globals.css      # Design tokens CSS
├── components/
│   ├── ui/              # Componentes base (shadcn/ui + estilo glass)
│   └── theme-provider.tsx
└── lib/
    └── utils.ts         # Utilidades (cn para clases)
```

### Componentes UI Disponibles

Todos los componentes UI están en `src/components/ui/` y siguen el estilo Liquid Glass:

- **Button** - Botones con variantes (default, secondary, destructive, accent, ghost, outline, link)
- **Icon** - Wrapper de lucide-react con glow neon
- **Badge** - Etiquetas de estado/categoría
- **GlassCard** - Tarjetas contenedoras con efecto cristal
- **Dialog** - Modales con backdrop-blur
- **DropdownMenu** - Menús desplegables contextuales
- **Toast** - Notificaciones emergentes (con posiciones configurables)
- **Switch** - Toggle on/off
- **Slider** - Controles deslizantes
- **Input** - Campos de texto
- **Label** - Etiquetas de formularios
- **Tabs** - Navegación por pestañas

Ver galería completa en **Storybook → Design System**

---

## 📝 Convenciones de Código

### Imports
```typescript
// Orden: React → External libs → Internal aliases → Relative
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Button } from "./button"
```

- Siempre usar alias `@/*` para imports internos
- Agrupar imports con línea en blanco entre grupos

### Iconos

**TODOS los iconos de la aplicación deben consumirse desde el componente `Icon`**, no usar directamente `lucide-react`.

```typescript
// ❌ Incorrecto - NO usar directamente
import { Zap } from "lucide-react"
<Zap className="size-4" />

// ✅ Correcto - Usar componente Icon
import { Icon } from "@/components/ui/icon"
import { Zap } from "lucide-react"
<Icon icon={Zap} variant="primary" size="lg" />
```

**Variantes disponibles:**
- `default` - Sin glow especial
- `primary` - Glow verde (dark) / cyan (light)
- `secondary` - Glow pink-magenta
- `destructive` - Glow rojo para acciones peligrosas
- `accent` - Glow cyan
- `muted` - Sin glow para iconos secundarios

**Tamaños:** `xs`, `sm`, `default`, `lg`, `xl`, `2xl`

**Galería completa:** Ver en Storybook → Design System → Icon → Full Library

### Componentes

```typescript
// Exportar interfaz de props explícitamente
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Usar forwardRef para componentes DOM
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // ...
  },
)
Button.displayName = "Button"

// Exportar componente y variants
export { Button, buttonVariants }
```

### Clases CSS

```typescript
// Usar cn() para mergear clases
className={cn(
  "base-classes-here",
  variantStyles[variant],
  className,
)}

// Usar class-variance-authority (cva) para variantes
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", secondary: "..." },
      size: { default: "...", sm: "..." },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

### Tipos

```typescript
// Preferir interfaces para props de componentes
export interface ComponentProps {
  variant?: "default" | "primary" | "secondary"
  children?: React.ReactNode
  className?: string
}

// Usar type para unions y tipos derivados
export type GlassCardVariant = keyof typeof variantStyles
type Story = StoryObj<typeof meta>
```

### Nomenclatura

- **Componentes:** PascalCase (`GlassCard`, `Button`)
- **Archivos:** PascalCase para componentes (`Button.tsx`)
- **Stories:** `Component.stories.tsx` junto al componente
- **Utilidades:** camelCase (`cn`, `formatDate`)
- **Constantes:** camelCase para objetos, SCREAMING_SNAKE para valores fijos

### Tailwind CSS

- Usar variables CSS (`var(--primary)`) definidas en `globals.css`
- Preferir clases semánticas: `bg-background`, `text-foreground`, `border`
- Usar utilidades custom: `.glass`, `.card-glass`, `.text-gradient-primary`
- Gradientes: `bg-gradient-primary`, `bg-gradient-secondary`
- Sombras neón: `shadow-neon-primary`, `shadow-neon-secondary`

### Comentarios

```typescript
// ── Secciones con guiones largos ────────────────────────────────────
// ── Subsecciones ─────────────────────

/** JSDoc para funciones públicas */
export function cn(...inputs: ClassValue[]) { ... }
```

### Manejo de Errores

```typescript
// Validar props requeridas con console.warn
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, icon: IconComponent, variant, size, ...props }, ref) => {
    if (!IconComponent) {
      console.warn("Icon component: icon prop is required")
      return null
    }
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
```

### Nota sobre Storybook

No todos los componentes tienen stories en Storybook. Los componentes de marketing (como `CtaSection`, usada en la página "cómo funciona") pueden implementarse directamente en páginas sin story. Verificar antes de crear una nueva story.

---

## 🔧 Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui (style: new-york) |
| Variantes | class-variance-authority |
| Iconos | lucide-react |
| Temas | next-themes |
| Docs UI | Storybook 8 |

---

## ⚠️ Reglas Importantes

1. **NO añadir comentarios** a menos que sea solicitado explícitamente
2. **NO commit** cambios sin solicitud explícita del usuario
3. **SIEMPRE ejecutar `npm run lint`** después de cambios significativos
4. **Usar `eslint.config.mjs`** — ESLint flat config con next/core-web-vitals + typescript
5. **Dark mode primero** — el tema principal es `.dark`
6. **Server Components por defecto** — solo usar `"use client"` cuando sea necesario

---

## 📚 Archivos de Configuración Adicionales

- **`.cursorrules`**: Reglas específicas para Cursor IDE
- **`.storybook/`**: Configuración de Storybook (Vite + React)

### Storybook

Configuración en `.storybook/`:
- `main.ts`: Vite + React + alias `@/*`
- `preview.ts`: Carga de `globals.css` + backgrounds custom

Estructura de stories:
```typescript
const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark-neon" } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Primary Action" },
}
```

**Nota:** No todos los componentes tienen stories. Los componentes de marketing (como `CtaSection`) pueden implementarse directamente en páginas sin story. Verificar antes de crear.

---

## 🗺️ Roadmap

Configuración en `.storybook/`:
- `main.ts`: Vite + React + alias `@/*`
- `preview.ts`: Carga de `globals.css` + backgrounds custom

Estructura de stories:
```typescript
const meta = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { backgrounds: { default: "dark-neon" } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Primary Action" },
}
```

---

## 🗺️ Roadmap

Ver `ROADMAP.md` para el plan de desarrollo completo. Fase actual: **Fase 3 - Design System "Neon Glass"**.
