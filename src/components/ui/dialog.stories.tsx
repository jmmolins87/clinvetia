import type { Meta, StoryObj } from "@storybook/react"
import { Trash2, LogOut } from "lucide-react"
import { Icon } from "@/components/ui/icon"
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogCancel, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const meta = {
  title: "Design System/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Modal con estilo **Liquid Glass** — panel de cristal translúcido 3D centrado:

- Overlay oscuro con backdrop-blur
- Contenido con highlight interno y sombra profunda
- Botón de cierre con cursor pointer y hover glow
- **DialogCancel** para botones de cancelar (variante destructive)

Usa \`DialogCancel\` para los botones de cancelar/cerrar.
        `,
      },
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Diálogo estándar para edición de perfil. Usa DialogCancel para el botón de cancelar.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-base text-muted-foreground">Display name</Label>
            <Input defaultValue="John Doe" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-base text-muted-foreground">Email</Label>
            <Input defaultValue="john@example.com" type="email" />
          </div>
        </div>
        <DialogFooter>
          <DialogCancel size="sm">Cancel</DialogCancel>
          <DialogClose asChild>
            <Button size="sm">Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Destructive: Story = {
  name: "Destructive Confirm",
  parameters: {
    docs: {
      description: {
        story: "Diálogo de confirmación destructiva. El botón principal usa variante destructive.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Icon icon={Trash2} size="xs" />Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All your data will be erased.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogCancel size="sm">Cancel</DialogCancel>
          <DialogClose asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Icon icon={Trash2} size="xs" />Delete permanently
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const SignOut: Story = {
  name: "Sign Out Confirm",
  parameters: {
    docs: {
      description: {
        story: "Diálogo de confirmación para cerrar sesión. Usa DialogCancel para el botón Stay.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Icon icon={LogOut} size="xs" />Sign out
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign out</DialogTitle>
          <DialogDescription>
            You will be redirected to the login page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogCancel size="sm">Stay</DialogCancel>
          <DialogClose asChild>
            <Button size="sm" className="gap-2">
              <Icon icon={LogOut} size="xs" />Sign out
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}


export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      description: {
        story: "Vista comparativa del diálogo en ambos temas.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Glass Dialog</DialogTitle>
          <DialogDescription>Liquid glass modal en ambos temas.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogCancel size="sm">Cancel</DialogCancel>
          <DialogClose asChild>
            <Button size="sm">Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const FullLayout: Story = {
  name: "Full Layout (with Header/Footer)",
  parameters: {
    docs: {
      description: {
        story: "Diálogo abierto con el layout completo de la página (navbar + footer) para ver cómo el backdrop cubre toda la pantalla.",
      },
    },
  },
  render: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg">Abrir diálogo de confirmación</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Enviar estos datos a ClinvetIA?</DialogTitle>
              <DialogDescription>
                Te mostraremos a nuestro equipo con los datos que has calculado para preparar una propuesta personalizada.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pacientes/mes:</span>
                <span className="font-semibold">300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket medio:</span>
                <span className="font-semibold">50€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pérdida conversión:</span>
                <span className="font-semibold">20%</span>
              </div>
            </div>
            <DialogFooter className="flex-row justify-between gap-2">
              <DialogCancel>Cancelar</DialogCancel>
              <DialogClose asChild>
                <Button>Enviar datos</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  ),
}
