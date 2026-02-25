import type { Meta, StoryObj } from "@storybook/react"
import { Search, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const meta = {
  title: "Design System/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {},
  argTypes: {
    disabled:    { control: "boolean" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Type something…", type: "text" },
  decorators: [(S) => <div className="w-72"><S /></div>],
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Type something…" />`,
      },
    },
  },
}

export const WithLabel: Story = {
  name: "With Label",
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="flex w-72 flex-col gap-2">
  <Label className="text-base font-medium text-foreground">Email address</Label>
  <Input type="email" placeholder="you@example.com" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label className="text-base font-medium text-foreground">Email address</Label>
      <Input type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithIcon: Story = {
  name: "With Icon (Search)",
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

<div className="relative w-72">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
  <Input type="search" placeholder="Suggestions" className="pl-10" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="relative w-72">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input type="search" placeholder="Suggestions" className="pl-10" />
    </div>
  ),
}

export const PasswordReveal: Story = {
  name: "Password Reveal",
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

function PasswordReveal() {
  const [show, setShow] = useState(false)
  return (
    <div className="relative w-72">
      <Input type={show ? "text" : "password"} placeholder="Enter password" className="pr-10" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  )
}`,
      },
    },
  },
  render: function Render() {
    const [show, setShow] = useState(false)
    return (
      <div className="relative w-72">
        <Input type={show ? "text" : "password"} placeholder="Enter password" className="pr-10" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShow((s) => !s)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { placeholder: "Disabled field", disabled: true },
  decorators: [(S) => <div className="w-72"><S /></div>],
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@/components/ui/input"

<Input placeholder="Disabled field" disabled />`,
      },
    },
  },
}

export const FormGroup: Story = {
  name: "Form Group",
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

<div className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 w-80">
  <h3 className="text-sm font-semibold text-gradient-primary">Sign in</h3>
  <div className="flex flex-col gap-2">
    <Label className="text-base text-muted-foreground">Email</Label>
    <Input type="email" placeholder="you@example.com" />
  </div>
  <div className="flex flex-col gap-2">
    <Label className="text-base text-muted-foreground">Password</Label>
    <Input type="password" placeholder="••••••••" />
  </div>
  <Button className="w-full mt-1">Sign In</Button>
</div>`,
      },
    },
  },
  render: () => (
    <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 w-80">
      <h3 className="text-sm font-semibold text-gradient-primary">Sign in</h3>
      <div className="flex flex-col gap-2">
        <Label className="text-base text-muted-foreground">Email</Label>
        <Input type="email" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-base text-muted-foreground">Password</Label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <Button className="w-full mt-1">Sign In</Button>
    </div>
  ),
}

// ── Dark + Light side-by-side ─────────────────────────────────────────────────
export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

<div className="flex flex-col gap-4 w-64">
  <Input type="text" placeholder="Default input" />
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
    <Input type="search" placeholder="Suggestions" className="pl-10" />
  </div>
  <Input type="text" placeholder="Disabled" disabled />
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Input type="text" placeholder="Default input" />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input type="search" placeholder="Suggestions" className="pl-10" />
      </div>
      <Input type="text" placeholder="Disabled" disabled />
    </div>
  ),
}
