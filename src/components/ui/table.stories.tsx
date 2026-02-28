import type { Meta, StoryObj } from "@storybook/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const meta = {
  title: "Design System/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark-neon" },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { name: "Clínica Norte", email: "norte@clinica.com", status: "Activo" },
          { name: "Veterinaria Sur", email: "sur@clinica.com", status: "Pendiente" },
          { name: "Centro Azul", email: "azul@clinica.com", status: "Activo" },
        ].map((row) => (
          <TableRow key={row.email}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-muted-foreground">{row.email}</TableCell>
            <TableCell className="text-right text-muted-foreground">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
