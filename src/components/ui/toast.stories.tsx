"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"
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
  render: () => (
    <Toast open>
      <div className="grid gap-0.5">
        <ToastTitle>
          <span className="flex items-center gap-2">
            <Info className="size-4 text-primary" />
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
  render: () => (
    <Toast open variant="success">
      <div className="grid gap-0.5">
        <ToastTitle>
          <span className="flex items-center gap-2">
            <CheckCircle className="size-4 text-success" />
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
  render: () => (
    <Toast open variant="destructive">
      <div className="grid gap-0.5">
        <ToastTitle>
          <span className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
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
  render: () => (
    <div className="flex flex-col gap-3 w-[380px]">
      <Toast open>
        <div className="grid gap-0.5">
          <ToastTitle className="flex items-center gap-2">
            <Info className="size-4 text-primary" />
            Default Toast
          </ToastTitle>
          <ToastDescription>Información general del sistema.</ToastDescription>
        </div>
        <ToastCloseButton />
      </Toast>

      <Toast open variant="success">
        <div className="grid gap-0.5">
          <ToastTitle className="flex items-center gap-2">
            <CheckCircle className="size-4 text-success" />
            Success Toast
          </ToastTitle>
          <ToastDescription>Operación completada con éxito.</ToastDescription>
        </div>
        <ToastCloseButton />
      </Toast>

      <Toast open variant="destructive">
        <div className="grid gap-0.5">
          <ToastTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
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
