"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Icon } from "@/components/ui/icon"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastCloseButton,
  ToastProvider,
  ToastViewport,
  type ToastPosition,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Design System/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Toast con estilo **Liquid Glass** — notificaciones emergentes con:

- **Variantes**: default, success, destructive
- **Posiciones**: bottom-right, bottom-left, top-right, top-left, top-center, bottom-center
- **Animaciones**: entrada/salida suaves
- **Cierre**: botón X o swipe gesture
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="relative min-h-48 w-full">
          <Story />
        </div>
        <ToastViewport />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `import {
  Toast, ToastTitle, ToastDescription,
  ToastAction, ToastCloseButton,
  ToastProvider, ToastViewport,
} from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { Info } from "lucide-react"

<ToastProvider>
  <Toast open>
    <div className="grid gap-0.5">
      <ToastTitle>
        <span className="flex items-center gap-2">
          <Icon icon={Info} size="xs" variant="primary" />
          Scheduled: Catch up
        </span>
      </ToastTitle>
      <ToastDescription>Friday, February 10, 2025 at 5:57 PM</ToastDescription>
    </div>
    <ToastAction altText="Undo">Undo</ToastAction>
    <ToastCloseButton />
  </Toast>
  <ToastViewport />
</ToastProvider>`,
      },
    },
  },
  render: () => (
    <Toast open>
      <div className="grid gap-0.5">
        <ToastTitle>
          <span className="flex items-center gap-2">
            <Icon icon={Info} size="xs" variant="primary" />
            Scheduled: Catch up
          </span>
        </ToastTitle>
        <ToastDescription>Friday, February 10, 2025 at 5:57 PM</ToastDescription>
      </div>
      <ToastAction altText="Undo">Undo</ToastAction>
      <ToastCloseButton />
    </Toast>
  ),
}

export const Success: Story = {
  parameters: {
    docs: {
      source: {
        code: `import {
  Toast, ToastTitle, ToastDescription, ToastCloseButton,
  ToastProvider, ToastViewport,
} from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { CheckCircle } from "lucide-react"

<ToastProvider>
  <Toast open variant="success">
    <div className="grid gap-0.5">
      <ToastTitle>
        <span className="flex items-center gap-2">
          <Icon icon={CheckCircle} size="xs" variant="primary" className="text-success" />
          Deployment successful
        </span>
      </ToastTitle>
      <ToastDescription>v2.4.1 is now live on production.</ToastDescription>
    </div>
    <ToastCloseButton />
  </Toast>
  <ToastViewport />
</ToastProvider>`,
      },
    },
  },
  render: () => (
    <Toast open variant="success">
      <div className="grid gap-0.5">
        <ToastTitle>
          <span className="flex items-center gap-2">
            <Icon icon={CheckCircle} size="xs" variant="primary" className="text-success" />
            Deployment successful
          </span>
        </ToastTitle>
        <ToastDescription>v2.4.1 is now live on production.</ToastDescription>
      </div>
      <ToastCloseButton />
    </Toast>
  ),
}

export const Destructive: Story = {
  parameters: {
    docs: {
      source: {
        code: `import {
  Toast, ToastTitle, ToastDescription,
  ToastAction, ToastCloseButton,
  ToastProvider, ToastViewport,
} from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { AlertTriangle } from "lucide-react"

<ToastProvider>
  <Toast open variant="destructive">
    <div className="grid gap-0.5">
      <ToastTitle>
        <span className="flex items-center gap-2">
          <Icon icon={AlertTriangle} size="xs" variant="destructive" />
          Connection error
        </span>
      </ToastTitle>
      <ToastDescription>Failed to connect to the database. Retrying…</ToastDescription>
    </div>
    <ToastAction altText="Retry">Retry</ToastAction>
    <ToastCloseButton />
  </Toast>
  <ToastViewport />
</ToastProvider>`,
      },
    },
  },
  render: () => (
    <Toast open variant="destructive">
      <div className="grid gap-0.5">
        <ToastTitle>
          <span className="flex items-center gap-2">
            <Icon icon={AlertTriangle} size="xs" variant="destructive" />
            Connection error
          </span>
        </ToastTitle>
        <ToastDescription>Failed to connect to the database. Retrying…</ToastDescription>
      </div>
      <ToastAction altText="Retry">Retry</ToastAction>
      <ToastCloseButton />
    </Toast>
  ),
}

export const WithAction: Story = {
  name: "With Action Button",
  parameters: {
    docs: {
      source: {
        code: `import {
  Toast, ToastTitle, ToastDescription,
  ToastAction, ToastCloseButton,
  ToastProvider, ToastViewport,
} from "@/components/ui/toast"

<ToastProvider>
  <Toast open>
    <div className="grid gap-0.5">
      <ToastTitle>File deleted</ToastTitle>
      <ToastDescription>report-2025-q1.pdf has been removed.</ToastDescription>
    </div>
    <ToastAction altText="Undo delete">Undo</ToastAction>
    <ToastCloseButton />
  </Toast>
  <ToastViewport />
</ToastProvider>`,
      },
    },
  },
  render: () => (
    <Toast open>
      <div className="grid gap-0.5">
        <ToastTitle>File deleted</ToastTitle>
        <ToastDescription>report-2025-q1.pdf has been removed.</ToastDescription>
      </div>
      <ToastAction altText="Undo delete">Undo</ToastAction>
      <ToastCloseButton />
    </Toast>
  ),
}

export const AllVariants: Story = {
  name: "All Variants",
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: `import {
  Toast, ToastTitle, ToastDescription,
  ToastAction, ToastCloseButton,
  ToastProvider, ToastViewport,
} from "@/components/ui/toast"
import { Icon } from "@/components/ui/icon"
import { Info, CheckCircle, AlertTriangle } from "lucide-react"

<ToastProvider>
  <div className="flex flex-col gap-3 w-[380px]">
    <Toast open>
      <div className="grid gap-0.5">
        <ToastTitle className="flex items-center gap-2">
          <Icon icon={Info} size="xs" variant="primary" />Default Toast
        </ToastTitle>
        <ToastDescription>Información general del sistema.</ToastDescription>
      </div>
      <ToastCloseButton />
    </Toast>

    <Toast open variant="success">
      <div className="grid gap-0.5">
        <ToastTitle className="flex items-center gap-2">
          <Icon icon={CheckCircle} size="xs" variant="primary" className="text-success" />Success Toast
        </ToastTitle>
        <ToastDescription>Operación completada con éxito.</ToastDescription>
      </div>
      <ToastCloseButton />
    </Toast>

    <Toast open variant="destructive">
      <div className="grid gap-0.5">
        <ToastTitle className="flex items-center gap-2">
          <Icon icon={AlertTriangle} size="xs" variant="destructive" />Destructive Toast
        </ToastTitle>
        <ToastDescription>Error crítico en el sistema.</ToastDescription>
      </div>
      <ToastAction altText="Retry">Retry</ToastAction>
      <ToastCloseButton />
    </Toast>
  </div>
  <ToastViewport />
</ToastProvider>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3 w-[380px]">
      <Toast open>
        <div className="grid gap-0.5">
          <ToastTitle className="flex items-center gap-2">
            <Icon icon={Info} size="xs" variant="primary" />
            Default Toast
          </ToastTitle>
          <ToastDescription>Información general del sistema.</ToastDescription>
        </div>
        <ToastCloseButton />
      </Toast>

      <Toast open variant="success">
        <div className="grid gap-0.5">
          <ToastTitle className="flex items-center gap-2">
            <Icon icon={CheckCircle} size="xs" variant="primary" className="text-success" />
            Success Toast
          </ToastTitle>
          <ToastDescription>Operación completada con éxito.</ToastDescription>
        </div>
        <ToastCloseButton />
      </Toast>

      <Toast open variant="destructive">
        <div className="grid gap-0.5">
          <ToastTitle className="flex items-center gap-2">
            <Icon icon={AlertTriangle} size="xs" variant="destructive" />
            Destructive Toast
          </ToastTitle>
          <ToastDescription>Error crítico en el sistema.</ToastDescription>
        </div>
        <ToastAction altText="Retry">Retry</ToastAction>
        <ToastCloseButton />
      </Toast>
    </div>
  ),
}

function LiveDemoComponent() {
  const { toast } = useToast()

  const showToast = (variant: "default" | "success" | "destructive") => {
    toast({
      variant,
      title:
        variant === "success"
          ? "Operación exitosa"
          : variant === "destructive"
          ? "Error"
          : "Notificación",
      description:
        variant === "success"
          ? "Los cambios se guardaron correctamente."
          : variant === "destructive"
          ? "Algo salió mal. Intenta de nuevo."
          : "Este es un mensaje de prueba.",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="default" onClick={() => showToast("default")}>
          Default Toast
        </Button>
        <Button variant="accent" onClick={() => showToast("success")}>
          Success Toast
        </Button>
        <Button variant="destructive" onClick={() => showToast("destructive")}>
          Destructive Toast
        </Button>
      </div>
    </div>
  )
}

export const LiveDemo: Story = {
  name: "Live Demo",
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: `import { useToast } from "@/components/ui/use-toast"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

function ToastDemo() {
  const { toast } = useToast()

  return (
    <ToastProvider>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast({ title: "Notificación", description: "Mensaje de prueba." })}>
          Default Toast
        </Button>
        <Button variant="accent" onClick={() => toast({ variant: "success", title: "Operación exitosa" })}>
          Success Toast
        </Button>
        <Button variant="destructive" onClick={() => toast({ variant: "destructive", title: "Error" })}>
          Destructive Toast
        </Button>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}`,
      },
    },
  },
  render: () => <LiveDemoComponent />,
}

const positions: ToastPosition[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
  "top-center",
  "bottom-center",
]

function PositionDemoComponent() {
  const { toast, setPosition, position } = useToast()

  const showToastAtPosition = (pos: ToastPosition) => {
    setPosition(pos)
    toast({
      title: `Toast en ${pos}`,
      description: "Notificación posicionada correctamente.",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Posición actual: <code className="text-primary">{position}</code>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {positions.map((pos) => (
          <Button
            key={pos}
            variant="outline"
            size="sm"
            onClick={() => showToastAtPosition(pos)}
          >
            {pos}
          </Button>
        ))}
      </div>
    </div>
  )
}

export const Positions: Story = {
  name: "All Positions",
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: `import { useToast } from "@/components/ui/use-toast"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

// Posiciones disponibles:
// "bottom-right" | "bottom-left" | "top-right" | "top-left" | "top-center" | "bottom-center"

function PositionDemo() {
  const { toast, setPosition } = useToast()

  return (
    <ToastProvider>
      <Button
        onClick={() => {
          setPosition("top-center")
          toast({ title: "Toast en top-center" })
        }}
      >
        Top Center
      </Button>
      <ToastViewport />
    </ToastProvider>
  )
}`,
      },
    },
  },
  render: () => <PositionDemoComponent />,
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  parameters: {
    docs: {
      source: {
        code: `import {
  Toast, ToastTitle, ToastDescription, ToastCloseButton,
  ToastProvider, ToastViewport,
} from "@/components/ui/toast"

<ToastProvider>
  <div className="flex flex-col gap-3 w-[340px]">
    <Toast open>
      <div className="grid gap-0.5">
        <ToastTitle>Default toast</ToastTitle>
        <ToastDescription>Liquid glass en ambos temas.</ToastDescription>
      </div>
      <ToastCloseButton />
    </Toast>
    <Toast open variant="destructive">
      <div className="grid gap-0.5">
        <ToastTitle>Error toast</ToastTitle>
        <ToastDescription>Variante destructiva adaptiva.</ToastDescription>
      </div>
      <ToastCloseButton />
    </Toast>
  </div>
  <ToastViewport />
</ToastProvider>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3 w-[340px]">
      <Toast open>
        <div className="grid gap-0.5">
          <ToastTitle>Default toast</ToastTitle>
          <ToastDescription>Liquid glass en ambos temas.</ToastDescription>
        </div>
        <ToastCloseButton />
      </Toast>
      <Toast open variant="destructive">
        <div className="grid gap-0.5">
          <ToastTitle>Error toast</ToastTitle>
          <ToastDescription>Variante destructiva adaptiva.</ToastDescription>
        </div>
        <ToastCloseButton />
      </Toast>
    </div>
  ),
}
