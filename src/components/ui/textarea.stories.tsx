import type { Meta, StoryObj } from "@storybook/react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const meta = {
  title: "Design System/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {},
  argTypes: {
    disabled:    { control: "boolean" },
    placeholder: { control: "text" },
    rows:        { control: { type: "number", min: 2, max: 12 } },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Write something…" },
  decorators: [(S) => <div className="w-80"><S /></div>],
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Write something…" />`,
      },
    },
  },
}

export const WithLabel: Story = {
  name: "With Label",
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

<div className="flex w-80 flex-col gap-2">
  <Label className="text-base font-medium text-foreground">Your message</Label>
  <Textarea placeholder="Describe your issue in detail…" rows={4} />
  <p className="text-base text-muted-foreground">Maximum 500 characters</p>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label className="text-base font-medium text-foreground">Your message</Label>
      <Textarea placeholder="Describe your issue in detail…" rows={4} />
      <p className="text-base text-muted-foreground">Maximum 500 characters</p>
    </div>
  ),
}

export const Disabled: Story = {
  args: { placeholder: "Cannot edit this field", disabled: true, rows: 3 },
  decorators: [(S) => <div className="w-80"><S /></div>],
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Cannot edit this field" disabled rows={3} />`,
      },
    },
  },
}

export const InCard: Story = {
  name: "Inside Glass Card",
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

<div className="liquid-glass-secondary rounded-2xl p-6 flex flex-col gap-4 w-96">
  <h3 className="text-sm font-semibold text-gradient-secondary">Send feedback</h3>
  <div className="flex flex-col gap-2">
    <Label className="text-base text-muted-foreground">Comments</Label>
    <Textarea placeholder="What could we improve?" rows={5} />
  </div>
  <div className="flex gap-2 justify-end">
    <Button variant="ghost" size="sm">Cancel</Button>
    <Button variant="secondary" size="sm">Send</Button>
  </div>
</div>`,
      },
    },
  },
  render: () => (
    <div className="liquid-glass-secondary rounded-2xl p-6 flex flex-col gap-4 w-96">
      <h3 className="text-sm font-semibold text-gradient-secondary">Send feedback</h3>
      <div className="flex flex-col gap-2">
        <Label className="text-base text-muted-foreground">Comments</Label>
        <Textarea placeholder="What could we improve?" rows={5} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="secondary" size="sm">Send</Button>
      </div>
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
        code: `import { Textarea } from "@/components/ui/textarea"

<div className="flex flex-col gap-4 w-72">
  <Textarea placeholder="Default textarea…" rows={3} />
  <Textarea placeholder="Disabled" disabled rows={2} />
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <Textarea placeholder="Default textarea…" rows={3} />
      <Textarea placeholder="Disabled" disabled rows={2} />
    </div>
  ),
}
