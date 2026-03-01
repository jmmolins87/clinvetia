import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const chatPortalPath = path.join(root, "src/components/marketing/chat-portal.tsx")
const scrollAreaPath = path.join(root, "src/components/ui/scroll-area.tsx")

function assertContains(content, pattern, message) {
  if (!pattern.test(content)) {
    throw new Error(message)
  }
}

function run() {
  const chatPortal = fs.readFileSync(chatPortalPath, "utf8")
  const scrollArea = fs.readFileSync(scrollAreaPath, "utf8")

  assertContains(
    chatPortal,
    /querySelector\(\s*"\[data-radix-scroll-area-viewport\]"/,
    "Missing viewport lookup for chat autoscroll.",
  )

  assertContains(
    chatPortal,
    /viewport\.scrollTo\(\{\s*top:\s*viewport\.scrollHeight,\s*behavior:\s*"auto"\s*\}\)/,
    "Missing explicit autoscroll to latest message.",
  )

  assertContains(
    chatPortal,
    /document\.addEventListener\("wheel",\s*preventBackgroundScroll,\s*\{\s*passive:\s*false\s*\}\)/,
    "Missing global wheel lock for background while chat overlay is open.",
  )

  assertContains(
    chatPortal,
    /if\s*\(target\?\.closest\("\[data-chat-scrollable='true'\]"\)\)\s*return/,
    "Missing allow-list for scrollable chat/dialog zones.",
  )

  assertContains(
    chatPortal,
    /onWheel=\{\(event\)\s*=>\s*\{/,
    "Missing wheel handler on chat ScrollArea.",
  )

  assertContains(
    scrollArea,
    /overflow-y-auto/,
    "ScrollArea viewport must be overflow-y-auto.",
  )

  console.log("PASS chat-scroll-guard")
}

try {
  run()
} catch (error) {
  console.error(`FAIL chat-scroll-guard: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
