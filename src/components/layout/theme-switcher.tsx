"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEMES = [
  { value: "dark",   label: "Dark Neon",    icon: Moon    },
  { value: "light",  label: "Light Frost",  icon: Sun     },
  { value: "system", label: "Sistema",      icon: Monitor },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const current = THEMES.find((t) => t.value === theme) ?? THEMES[0]
  const Icon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cambiar tema"
          className="h-9 w-9"
        >
          <Icon className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" sideOffset={8} className="min-w-[160px] z-[110]">
        {THEMES.map(({ value, label, icon: ItemIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="gap-2.5 cursor-pointer"
            data-active={theme === value}
          >
            <ItemIcon className="size-4 shrink-0" aria-hidden />
            <span>{label}</span>
            {theme === value && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
