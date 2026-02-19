import type { Meta, StoryObj } from "@storybook/react"
import { Zap, BarChart3, Users } from "lucide-react"
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "Design System/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {},
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Glass Card</CardTitle>
        <CardDescription>Superficie de cristal esmerilado con backdrop-blur.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base text-foreground/80">
          Contenido del card con fondo translúcido y borde sutil.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const Interactive: Story = {
  name: "Interactive (hover glow)",
  render: () => (
    <Card className="w-80 cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interactive Card</CardTitle>
          <Badge variant="default">New</Badge>
        </div>
        <CardDescription>Hover para ver el borde brillar.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base text-foreground/80">El borde se ilumina levemente al hacer hover.</p>
      </CardContent>
    </Card>
  ),
}

export const StatCards: Story = {
  name: "Stat Cards Grid",
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-2xl">
      <Card className="hover:border-white/20 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)] transition-all duration-300">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-primary" />Total Deploys
          </CardDescription>
          <CardTitle className="text-3xl text-gradient-primary">2,847</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card className="hover:border-white/20 hover:shadow-[0_0_20px_rgba(var(--secondary-rgb),0.12)] transition-all duration-300">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Users className="size-3.5 text-secondary" />Active Users
          </CardDescription>
          <CardTitle className="text-3xl text-gradient-secondary">18.4k</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">+4.3% from last week</p>
        </CardContent>
      </Card>

      <Card className="hover:border-white/20 hover:shadow-[0_0_20px_rgba(var(--success-rgb),0.12)] transition-all duration-300">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <BarChart3 className="size-3.5 text-success" />Uptime
          </CardDescription>
          <CardTitle className="text-3xl text-gradient-accent">99.9%</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">30-day average</p>
        </CardContent>
      </Card>
    </div>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>Glass Card</CardTitle>
        <CardDescription>Cristal esmerilado adaptivo.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base text-foreground/80">Funciona en ambos temas.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full">Confirm</Button>
      </CardFooter>
    </Card>
  ),
}
