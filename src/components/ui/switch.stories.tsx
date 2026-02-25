import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const meta = {
  title: "Design System/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {},
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultChecked: false },
  parameters: {
    docs: {
      source: {
        code: `import { Switch } from "@/components/ui/switch"

<Switch defaultChecked={false} />`,
      },
    },
  },
}

export const Checked: Story = {
  args: { defaultChecked: true },
  parameters: {
    docs: {
      source: {
        code: `import { Switch } from "@/components/ui/switch"

<Switch defaultChecked={true} />`,
      },
    },
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: false },
  parameters: {
    docs: {
      source: {
        code: `import { Switch } from "@/components/ui/switch"

<Switch disabled defaultChecked={false} />`,
      },
    },
  },
}

export const DisabledChecked: Story = {
  name: "Disabled + Checked",
  args: { disabled: true, defaultChecked: true },
  parameters: {
    docs: {
      source: {
        code: `import { Switch } from "@/components/ui/switch"

<Switch disabled defaultChecked={true} />`,
      },
    },
  },
}

export const WithLabel: Story = {
  name: "With Label",
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function SwitchWithLabel() {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <Switch
        id="pro-plan"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Label
        htmlFor="pro-plan"
        className="text-sm font-medium text-foreground cursor-pointer select-none"
      >
        {checked ? "Pro plan" : "Free plan"}
      </Label>
    </div>
  )
}`,
      },
    },
  },
  render: function Render() {
    const [checked, setChecked] = useState(false)
    return (
      <div className="flex items-center gap-3">
        <Switch
          id="pro-plan"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label
          htmlFor="pro-plan"
          className="text-sm font-medium text-foreground cursor-pointer select-none"
        >
          {checked ? "Pro plan" : "Free plan"}
        </Label>
      </div>
    )
  },
}

export const SettingsGroup: Story = {
  name: "Settings Group",
  parameters: {
    docs: {
      source: {
        code: `import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

<div className="liquid-glass rounded-2xl p-6 w-80 space-y-5">
  <h3 className="text-sm font-semibold text-gradient-primary">Notifications</h3>
  <div className="flex items-center justify-between">
    <Label htmlFor="emails" className="text-sm text-foreground cursor-pointer">Email alerts</Label>
    <Switch id="emails" defaultChecked={true} />
  </div>
  <div className="flex items-center justify-between">
    <Label htmlFor="push" className="text-sm text-foreground cursor-pointer">Push notifications</Label>
    <Switch id="push" defaultChecked={false} />
  </div>
  <div className="flex items-center justify-between">
    <Label htmlFor="weekly" className="text-sm text-foreground cursor-pointer">Weekly digest</Label>
    <Switch id="weekly" defaultChecked={true} />
  </div>
</div>`,
      },
    },
  },
  render: () => (
    <div className="liquid-glass rounded-2xl p-6 w-80 space-y-5">
      <h3 className="text-sm font-semibold text-gradient-primary">Notifications</h3>
      {[
        { id: "emails",  label: "Email alerts",      defaultChecked: true  },
        { id: "push",    label: "Push notifications", defaultChecked: false },
        { id: "weekly",  label: "Weekly digest",      defaultChecked: true  },
      ].map(({ id, label, defaultChecked }) => (
        <div key={id} className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm text-foreground cursor-pointer">{label}</Label>
          <Switch id={id} defaultChecked={defaultChecked} />
        </div>
      ))}
    </div>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      source: {
        code: `import { Switch } from "@/components/ui/switch"

<div className="flex flex-col gap-4">
  <div className="flex items-center gap-3">
    <Switch defaultChecked={false} />
    <span className="text-sm text-foreground">Unchecked</span>
  </div>
  <div className="flex items-center gap-3">
    <Switch defaultChecked={true} />
    <span className="text-sm text-foreground">Checked</span>
  </div>
  <div className="flex items-center gap-3">
    <Switch disabled />
    <span className="text-sm text-muted-foreground">Disabled</span>
  </div>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch defaultChecked={false} />
        <span className="text-sm text-foreground">Unchecked</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch defaultChecked={true} />
        <span className="text-sm text-foreground">Checked</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch disabled />
        <span className="text-sm text-muted-foreground">Disabled</span>
      </div>
    </div>
  ),
}
