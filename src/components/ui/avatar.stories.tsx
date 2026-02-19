import type { Meta, StoryObj } from "@storybook/react"
import { Avatar, AvatarGroup } from "@/components/ui/avatar"

const meta = {
  title: "Design System/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Avatar con estilo **Liquid Glass** — muestra imagen de perfil o iniciales.

- Fallback a iniciales si no hay imagen
- Tres variantes de color: \`default\`, \`primary\`, \`secondary\`
- Cinco tamaños: \`xs\`, \`sm\`, \`default\`, \`lg\`, \`xl\`
- \`AvatarGroup\` para apilar múltiples avatares con overlap
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl"],
      description: "Tamaño del avatar",
    },
    variant: {
      control: "select",
      options: ["default", "primary", "secondary"],
      description: "Variante de color",
    },
    initials: { control: "text", description: "Texto de fallback (iniciales)" },
    src: { control: "text", description: "URL de imagen" },
    alt: { control: "text", description: "Texto alternativo" },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { initials: "JM", size: "default", variant: "default" },
  parameters: {
    docs: { description: { story: "Avatar con iniciales, variante neutra." } },
  },
}

export const WithImage: Story = {
  args: {
    src: "https://api.dicebear.com/7.x/avataaars/svg?seed=clinvetia",
    alt: "Veterinario",
    size: "lg",
  },
  parameters: {
    docs: { description: { story: "Avatar con imagen externa." } },
  },
}

export const Primary: Story = {
  args: { initials: "CV", size: "default", variant: "primary" },
  parameters: {
    docs: { description: { story: "Variante primary — tinte verde (dark) / cyan (light)." } },
  },
}

export const Secondary: Story = {
  args: { initials: "DR", size: "default", variant: "secondary" },
  parameters: {
    docs: { description: { story: "Variante secondary — tinte pink-magenta." } },
  },
}

export const AllSizes: Story = {
  name: "All Sizes",
  parameters: {
    docs: { description: { story: "Todos los tamaños disponibles." } },
  },
  render: () => (
    <div className="flex items-end gap-4">
      {(["xs", "sm", "default", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} initials="CV" size={size} variant="primary" />
      ))}
    </div>
  ),
}

export const AllVariants: Story = {
  name: "All Variants",
  parameters: {
    docs: { description: { story: "Todas las variantes de color." } },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar initials="DF" size="lg" variant="default" />
      <Avatar initials="CV" size="lg" variant="primary" />
      <Avatar initials="DR" size="lg" variant="secondary" />
    </div>
  ),
}

export const Group: Story = {
  name: "AvatarGroup",
  parameters: {
    docs: { description: { story: "Grupo de avatares apilados con overlap. `max` limita los visibles y muestra el contador." } },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <AvatarGroup size="default">
        <Avatar initials="AM" variant="primary" />
        <Avatar initials="JL" variant="secondary" />
        <Avatar initials="PR" variant="default" />
        <Avatar initials="CV" variant="primary" />
      </AvatarGroup>
      <AvatarGroup size="default" max={3}>
        <Avatar initials="AM" variant="primary" />
        <Avatar initials="JL" variant="secondary" />
        <Avatar initials="PR" variant="default" />
        <Avatar initials="CV" variant="primary" />
        <Avatar initials="MR" variant="secondary" />
      </AvatarGroup>
    </div>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar initials="DF" size="lg" variant="default" />
      <Avatar initials="CV" size="lg" variant="primary" />
      <Avatar initials="DR" size="lg" variant="secondary" />
      <AvatarGroup size="lg" max={3}>
        <Avatar initials="AM" variant="primary" />
        <Avatar initials="JL" variant="secondary" />
        <Avatar initials="PR" />
        <Avatar initials="CV" variant="primary" />
      </AvatarGroup>
    </div>
  ),
}
