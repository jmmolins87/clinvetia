"use client"

import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  Mail,
  MessageSquare,
  Plus,
  Github,
  LifeBuoy,
  Keyboard,
  Users,
  Cloud,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

const meta = {
  title: "Design System/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Menú desplegable con estilo **Liquid Glass** — contenedor flotante con:

- **Fondo translúcido** con backdrop-blur
- **Borde luminoso** sutil
- **Animaciones** de entrada/salida suaves
- **Soporte** para grupos, separadores, shortcuts, checkboxes y radio items

Usado para menús contextuales, acciones de usuario y navegación secundaria.
        `,
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof DropdownMenu>

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { User, CreditCard, Settings, LogOut } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="gap-2">
      <Icon icon={User} size="xs" />
      <span>Profile</span>
      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem className="gap-2">
      <Icon icon={CreditCard} size="xs" />
      <span>Billing</span>
      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem className="gap-2">
      <Icon icon={Settings} size="xs" />
      <span>Settings</span>
      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="gap-2">
      <Icon icon={LogOut} size="xs" />
      <span>Log out</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Icon icon={User} size="xs" />
          <span>Profile</span>
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon icon={CreditCard} size="xs" />
          <span>Billing</span>
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon icon={Settings} size="xs" />
          <span>Settings</span>
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Icon icon={LogOut} size="xs" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithGroups: Story = {
  name: "With Groups",
  parameters: {
    docs: {
      source: {
        code: `import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Plus, Mail, MessageSquare, Github, LifeBuoy, Keyboard } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuGroup>
      <DropdownMenuItem className="gap-2">
        <Icon icon={Plus} size="xs" /><span>New Item</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Icon icon={Mail} size="xs" /><span>Send Email</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Icon icon={MessageSquare} size="xs" /><span>Messages</span>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Support</DropdownMenuLabel>
    <DropdownMenuGroup>
      <DropdownMenuItem className="gap-2">
        <Icon icon={Github} size="xs" /><span>GitHub</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Icon icon={LifeBuoy} size="xs" /><span>Help</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Icon icon={Keyboard} size="xs" /><span>Keyboard Shortcuts</span>
      </DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2">
            <Icon icon={Plus} size="xs" />
            <span>New Item</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Icon icon={Mail} size="xs" />
            <span>Send Email</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Icon icon={MessageSquare} size="xs" />
            <span>Messages</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Support</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2">
            <Icon icon={Github} size="xs" />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Icon icon={LifeBuoy} size="xs" />
            <span>Help</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Icon icon={Keyboard} size="xs" />
            <span>Keyboard Shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithCheckboxes: Story = {
  name: "With Checkboxes",
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function CheckboxMenu() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showActivityBar, setShowActivityBar] = useState(false)
  const [showPanel, setShowPanel] = useState(true)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">View Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
      },
    },
  },
  render: function Render() {
    const [showStatusBar, setShowStatusBar] = React.useState(true)
    const [showActivityBar, setShowActivityBar] = React.useState(false)
    const [showPanel, setShowPanel] = React.useState(true)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">View Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showStatusBar}
            onCheckedChange={setShowStatusBar}
          >
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
          >
            Activity Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
          >
            Panel
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

export const WithRadioGroup: Story = {
  name: "With Radio Group",
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function RadioMenu() {
  const [position, setPosition] = useState("bottom")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="accent">Panel Position</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="left">Left</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
      },
    },
  },
  render: function Render() {
    const [position, setPosition] = React.useState("bottom")

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="accent">Panel Position</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="left">Left</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

export const WithSubmenu: Story = {
  name: "With Submenu",
  parameters: {
    docs: {
      source: {
        code: `import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Mail, MessageSquare, Users, Cloud, Github } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Invite Users</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Invite Users</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem className="gap-2">
        <Icon icon={Mail} size="xs" /><span>Email</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Icon icon={MessageSquare} size="xs" /><span>Message</span>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <Icon icon={Users} size="xs" /><span>More Options</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem className="gap-2">
          <Icon icon={Cloud} size="xs" /><span>Share Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon icon={Github} size="xs" /><span>GitHub</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Invite Users</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Invite Users</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2">
            <Icon icon={Mail} size="xs" />
            <span>Email</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Icon icon={MessageSquare} size="xs" />
            <span>Message</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Icon icon={Users} size="xs" />
            <span>More Options</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem className="gap-2">
              <Icon icon={Cloud} size="xs" />
              <span>Share Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Icon icon={Github} size="xs" />
              <span>GitHub</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const Destructive: Story = {
  parameters: {
    docs: {
      source: {
        code: `import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { LogOut, Settings } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="destructive">Danger Zone</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-[rgba(var(--destructive-rgb),0.10)] gap-2">
      <Icon icon={LogOut} size="xs" /><span>Delete Account</span>
    </DropdownMenuItem>
    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-[rgba(var(--destructive-rgb),0.10)] gap-2">
      <Icon icon={Settings} size="xs" /><span>Reset All Data</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="destructive">Danger Zone</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-[rgba(var(--destructive-rgb),0.10)] gap-2">
          <Icon icon={LogOut} size="xs" />
          <span>Delete Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-[rgba(var(--destructive-rgb),0.10)] gap-2">
          <Icon icon={Settings} size="xs" />
          <span>Reset All Data</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  parameters: {
    docs: {
      source: {
        code: `import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { User, Settings, LogOut } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Theme Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Liquid Glass</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="gap-2">
      <Icon icon={User} size="xs" />Profile
    </DropdownMenuItem>
    <DropdownMenuItem className="gap-2">
      <Icon icon={Settings} size="xs" />Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="gap-2">
      <Icon icon={LogOut} size="xs" />Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Theme Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Liquid Glass</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Icon icon={User} size="xs" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Icon icon={Settings} size="xs" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Icon icon={LogOut} size="xs" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
