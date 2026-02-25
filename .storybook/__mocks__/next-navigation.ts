// Mock de next/navigation para Storybook (fuera del App Router de Next.js)

export function useRouter() {
  return {
    push: (url: string) => { console.log("[Storybook] router.push:", url) },
    replace: (url: string) => { console.log("[Storybook] router.replace:", url) },
    back: () => { console.log("[Storybook] router.back") },
    forward: () => { console.log("[Storybook] router.forward") },
    refresh: () => { console.log("[Storybook] router.refresh") },
    prefetch: () => {},
  }
}

export function usePathname(): string {
  return "/"
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function useParams(): Record<string, string | string[]> {
  return {}
}

export function redirect(url: string): never {
  throw new Error(`[Storybook] redirect called with: ${url}`)
}

export function notFound(): never {
  throw new Error("[Storybook] notFound called")
}
