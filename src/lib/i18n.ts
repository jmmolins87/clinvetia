import esMessages from "../../messages/es.json"
import enMessages from "../../messages/en.json"

export const localeStorageKey = "clinvetia:locale"

export const locales = ["es", "en"] as const

export type Locale = (typeof locales)[number]

function flattenStringLeaves(
  value: unknown,
  path: string[],
  out: Map<string, string>
) {
  if (typeof value === "string") {
    out.set(path.join("."), value)
    return
  }
  if (!value || typeof value !== "object") return
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    flattenStringLeaves(v, [...path, k], out)
  }
}

function buildMessageValueMap() {
  const esFlat = new Map<string, string>()
  const enFlat = new Map<string, string>()

  flattenStringLeaves(esMessages, [], esFlat)
  flattenStringLeaves(enMessages, [], enFlat)

  const map: Record<string, string> = {}
  for (const [key, esValue] of esFlat.entries()) {
    const enValue = enFlat.get(key)
    if (!enValue || enValue === esValue) continue
    map[esValue] = enValue
  }
  return map
}

const fullEnByEs: Record<string, string> = buildMessageValueMap()
const replacementKeys = Object.keys(fullEnByEs).sort((a, b) => b.length - a.length)
const fullEsByEn: Record<string, string> = Object.fromEntries(
  Object.entries(fullEnByEs).map(([es, en]) => [en, es])
)
const reverseReplacementKeys = Object.keys(fullEsByEn).sort((a, b) => b.length - a.length)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function replaceWholeTokens(input: string, key: string, replacement: string) {
  const escaped = escapeRegExp(key)
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{N}])`, "gu")
  return input.replace(pattern, (full, prefix) => `${prefix}${replacement}`)
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "es"
}

export function translateText(text: string, locale: Locale) {
  const sourceMap = locale === "es" ? fullEsByEn : fullEnByEs
  const keys = locale === "es" ? reverseReplacementKeys : replacementKeys

  const exact = sourceMap[text]
  if (exact) return exact

  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!match) return text
  const leading = match[1]
  const core = match[2]
  const trailing = match[3]

  const trimmedExact = sourceMap[core]
  if (trimmedExact) return `${leading}${trimmedExact}${trailing}`

  let replaced = core
  for (const key of keys) {
    if (!replaced.includes(key)) continue
    replaced = replaceWholeTokens(replaced, key, sourceMap[key])
  }

  if (replaced === core) return text
  return `${leading}${replaced}${trailing}`
}
