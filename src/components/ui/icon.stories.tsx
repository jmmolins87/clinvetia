import * as React from "react"
import type { Meta } from "@storybook/react"
import {
  Zap,
  Heart,
  Star,
  Settings,
  Bell,
  Trash2,
  Plus,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  Search,
  User,
  Home,
  Mail,
  Phone,
  Calendar,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Euro,
  TrendingUp,
} from "lucide-react"
import { Icon, type IconProps } from "@/components/ui/icon"

const meta = {
  title: "Design System/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Icono con estilo **Liquid Glass** — wrapper de \`lucide-react\` con:

- **Variantes de color** con glow neon según el tema
- **Tamaños predefinidos** para consistencia
- Soporte para todas las props de SVG

Todos los iconos de la aplicación deben consumirse desde este componente.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "destructive", "accent", "muted"],
      description: "Variante de color",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl", "2xl"],
      description: "Tamaño del icono",
    },
  },
} satisfies Meta<typeof Icon>

export default meta

export const Default: { args: IconProps; parameters: object } = {
  args: {
    icon: Zap,
    variant: "default",
    size: "default",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Icon } from "@/components/ui/icon"
import { Zap } from "lucide-react"

<Icon icon={Zap} variant="default" size="default" />`,
      },
    },
  },
}

export const Primary: { args: IconProps; parameters: object } = {
  args: {
    icon: Zap,
    variant: "primary",
    size: "lg",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Icon } from "@/components/ui/icon"
import { Zap } from "lucide-react"

<Icon icon={Zap} variant="primary" size="lg" />`,
      },
    },
  },
}

export const Secondary: { args: IconProps; parameters: object } = {
  args: {
    icon: Heart,
    variant: "secondary",
    size: "lg",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Icon } from "@/components/ui/icon"
import { Heart } from "lucide-react"

<Icon icon={Heart} variant="secondary" size="lg" />`,
      },
    },
  },
}

export const Destructive: { args: IconProps; parameters: object } = {
  args: {
    icon: Trash2,
    variant: "destructive",
    size: "lg",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Icon } from "@/components/ui/icon"
import { Trash2 } from "lucide-react"

<Icon icon={Trash2} variant="destructive" size="lg" />`,
      },
    },
  },
}

export const Accent: { args: IconProps; parameters: object } = {
  args: {
    icon: Star,
    variant: "accent",
    size: "lg",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Icon } from "@/components/ui/icon"
import { Star } from "lucide-react"

<Icon icon={Star} variant="accent" size="lg" />`,
      },
    },
  },
}

export const Muted: { args: IconProps; parameters: object } = {
  args: {
    icon: Info,
    variant: "muted",
    size: "lg",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Icon } from "@/components/ui/icon"
import { Info } from "lucide-react"

<Icon icon={Info} variant="muted" size="lg" />`,
      },
    },
  },
}

const sizes = ["xs", "sm", "default", "lg", "xl", "2xl"] as const

export function AllSizes() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon icon={Zap} variant="primary" size={size} />
          <span className="text-base text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  )
}

AllSizes.parameters = {
  docs: {
    source: {
      code: `import { Icon } from "@/components/ui/icon"
import { Zap } from "lucide-react"

<div className="flex flex-wrap items-end gap-4">
  <Icon icon={Zap} variant="primary" size="xs" />
  <Icon icon={Zap} variant="primary" size="sm" />
  <Icon icon={Zap} variant="primary" size="default" />
  <Icon icon={Zap} variant="primary" size="lg" />
  <Icon icon={Zap} variant="primary" size="xl" />
  <Icon icon={Zap} variant="primary" size="2xl" />
</div>`,
    },
  },
}

const variants = ["default", "primary", "secondary", "destructive", "accent", "muted"] as const

export function AllVariants() {
  return (
    <div className="flex flex-wrap gap-6">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <Icon icon={Star} variant={variant} size="xl" />
          <span className="text-base text-muted-foreground">{variant}</span>
        </div>
      ))}
    </div>
  )
}

AllVariants.parameters = {
  docs: {
    source: {
      code: `import { Icon } from "@/components/ui/icon"
import { Star } from "lucide-react"

<div className="flex flex-wrap gap-6">
  <Icon icon={Star} variant="default" size="xl" />
  <Icon icon={Star} variant="primary" size="xl" />
  <Icon icon={Star} variant="secondary" size="xl" />
  <Icon icon={Star} variant="destructive" size="xl" />
  <Icon icon={Star} variant="accent" size="xl" />
  <Icon icon={Star} variant="muted" size="xl" />
</div>`,
    },
  },
}

const commonIcons = [
  { icon: Zap, name: "Zap" },
  { icon: Heart, name: "Heart" },
  { icon: Star, name: "Star" },
  { icon: Settings, name: "Settings" },
  { icon: Bell, name: "Bell" },
  { icon: Trash2, name: "Trash" },
  { icon: Plus, name: "Plus" },
  { icon: ArrowRight, name: "Arrow" },
  { icon: Check, name: "Check" },
  { icon: X, name: "X" },
  { icon: AlertTriangle, name: "Alert" },
  { icon: Info, name: "Info" },
  { icon: HelpCircle, name: "Help" },
  { icon: Search, name: "Search" },
  { icon: User, name: "User" },
  { icon: Home, name: "Home" },
  { icon: Mail, name: "Mail" },
  { icon: Phone, name: "Phone" },
  { icon: Calendar, name: "Calendar" },
  { icon: Clock, name: "Clock" },
  { icon: Lock, name: "Lock" },
  { icon: Eye, name: "Eye" },
  { icon: EyeOff, name: "EyeOff" },
  { icon: Euro, name: "Euro" },
  { icon: TrendingUp, name: "Trending" },
]

export function IconGallery() {
  return (
    <div className="grid grid-cols-6 gap-4">
      {commonIcons.map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2 p-3">
          <Icon icon={icon} variant="primary" size="xl" />
          <span className="text-base text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  )
}

IconGallery.parameters = {
  docs: {
    source: {
      code: `import { Icon } from "@/components/ui/icon"
import { Zap, Heart, Star, Settings, Bell, Trash2 } from "lucide-react"

// Usa cualquier icono de lucide-react con el componente Icon
<Icon icon={Zap} variant="primary" size="xl" />
<Icon icon={Heart} variant="secondary" size="xl" />
<Icon icon={Star} variant="accent" size="xl" />
<Icon icon={Trash2} variant="destructive" size="xl" />`,
    },
  },
}

export function DarkAndLight() {
  return (
    <div className="flex flex-wrap gap-4">
      {(["primary", "secondary", "destructive", "accent"] as const).map((variant) => (
        <Icon key={variant} icon={Star} variant={variant} size="xl" />
      ))}
    </div>
  )
}

DarkAndLight.parameters = {
  globals: { theme: "side-by-side" },
  docs: {
    source: {
      code: `import { Icon } from "@/components/ui/icon"
import { Star } from "lucide-react"

<div className="flex flex-wrap gap-4">
  <Icon icon={Star} variant="primary" size="xl" />
  <Icon icon={Star} variant="secondary" size="xl" />
  <Icon icon={Star} variant="destructive" size="xl" />
  <Icon icon={Star} variant="accent" size="xl" />
</div>`,
    },
  },
}
