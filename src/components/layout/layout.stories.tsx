import type { Meta, StoryObj } from "@storybook/react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { ThemeSwitcher } from "./theme-switcher"
import { MobileNav } from "./mobile-nav"

/**
 * Componentes estructurales que definen el layout y la navegación de ClinvetIA.
 */
const meta = {
  title: "Layout/Navigation",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta

export const FullNavbar: StoryObj<typeof Navbar> = {
  name: "Navbar · Desktop",
  render: () => (
    <div className="min-h-[200px] bg-background">
      <Navbar />
      <div className="pt-24 p-8">
        <h1 className="text-2xl font-bold">Contenido de la página</h1>
        <p className="text-muted-foreground">Scroll para ver el efecto blur del navbar.</p>
        <div className="h-[100vh]" />
      </div>
    </div>
  ),
}

export const FullFooter: StoryObj<typeof Footer> = {
  name: "Footer",
  render: () => <Footer />,
}

export const Switcher: StoryObj<typeof ThemeSwitcher> = {
  name: "Theme Switcher",
  render: () => (
    <div className="p-12 flex justify-center bg-background">
      <ThemeSwitcher />
    </div>
  ),
}

export const MobileMenu: StoryObj<typeof MobileNav> = {
  name: "Mobile Navigation",
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
  },
  render: () => (
    <div className="min-h-[100px] bg-background flex items-center justify-end p-4">
      <MobileNav />
    </div>
  ),
}
