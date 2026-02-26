import type { Meta, StoryObj } from "@storybook/react"
import { SkeletonWrapper } from "./skeleton-wrapper"
import { Card } from "./card"

/**
 * Wrapper inteligente que proyecta un skeleton con la forma exacta del contenido.
 * Se activa automáticamente mediante el estado global de carga.
 */
const meta = {
  title: "Design System/SkeletonWrapper",
  component: SkeletonWrapper,
  tags: ["autodocs"],
  args: {
    children: " ",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SkeletonWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const SingleLine: Story = {
  render: (args) => (
    <div className="w-64">
      <SkeletonWrapper {...args}>
        <h3 className="text-xl font-bold text-foreground">Contenido Real</h3>
      </SkeletonWrapper>
    </div>
  ),
  args: {
    showSkeleton: true,
  }
}

export const MultiLine: Story = {
  render: (args) => (
    <div className="w-80">
      <SkeletonWrapper {...args}>
        <p className="text-sm text-muted-foreground">
          Este es un párrafo de ejemplo con varias líneas de texto que será reemplazado
          por un skeleton multilínea manteniendo la altura y el ancho del contenedor.
        </p>
      </SkeletonWrapper>
    </div>
  ),
  args: {
    showSkeleton: true,
    shape: "text",
    lines: 3,
  }
}

export const Circle: Story = {
  render: (args) => (
    <SkeletonWrapper {...args}>
      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
        Logo
      </div>
    </SkeletonWrapper>
  ),
  args: {
    showSkeleton: true,
    shape: "circle",
    className: "h-16 w-16"
  }
}

export const InsideCard: Story = {
  render: (args) => (
    <Card className="p-6 w-80">
      <div className="space-y-4">
        <SkeletonWrapper shape="circle" className="h-12 w-12" {...args}>
          <div className="h-12 w-12 rounded-full bg-secondary/20" />
        </SkeletonWrapper>
        <div className="space-y-2">
          <SkeletonWrapper className="h-6 w-3/4" {...args}>
            <h4 className="font-bold">Título de Tarjeta</h4>
          </SkeletonWrapper>
          <SkeletonWrapper shape="text" lines={2} {...args}>
            <p className="text-sm text-muted-foreground">Descripción detallada del elemento.</p>
          </SkeletonWrapper>
        </div>
      </div>
    </Card>
  ),
  args: {
    showSkeleton: true,
  }
}
