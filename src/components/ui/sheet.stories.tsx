import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "./sheet"

/**
 * Componente Sheet para paneles laterales (Sidebars) que se deslizan sobre el contenido.
 * Basado en Radix UI Dialog.
 */
const meta = {
  title: "Design System/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Panel</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Perfil</SheetTitle>
          <SheetDescription>
            Haz cambios en tu perfil aquí. Haz clic en guardar cuando termines.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Nombre</span>
            <div className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">Juan García</div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Usuario</span>
            <div className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">@jgarcia</div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Guardar cambios</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} Panel</SheetTitle>
              <SheetDescription>
                Panel deslizante desde el borde {side}.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}
