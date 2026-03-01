"use client"

import { useEffect } from "react"
import { translateText } from "@/lib/i18n"
import { useTranslationSkeleton } from "@/components/providers/translation-skeleton"

const textOriginal = new WeakMap<Text, string>()
const attrOriginal = new WeakMap<Element, Map<string, string>>()
const translatableAttributes = ["aria-label", "placeholder", "title", "alt"] as const

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement
  if (!parent) return true
  const tag = parent.tagName
  return tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE" || tag === "TEXTAREA"
}

function applyTextNode(node: Text, locale: "es" | "en") {
  if (shouldSkipTextNode(node)) return
  const current = node.nodeValue ?? ""
  let original = textOriginal.get(node)
  if (!original) {
    original = current
    textOriginal.set(node, current)
  } else {
    const previousTranslated = translateText(original, "en")
    const isRuntimeSourceUpdate =
      locale === "es" ? current !== original : current !== previousTranslated
    if (isRuntimeSourceUpdate) {
      original = current
      textOriginal.set(node, current)
    }
  }
  const translated = locale === "es" ? original : translateText(original, locale)
  if (current !== translated) {
    node.nodeValue = translated
  }
}

function applyElementAttributes(element: Element, locale: "es" | "en") {
  let originalMap = attrOriginal.get(element)
  if (!originalMap) {
    originalMap = new Map<string, string>()
    attrOriginal.set(element, originalMap)
  }

  for (const attr of translatableAttributes) {
    if (!element.hasAttribute(attr)) continue
    const current = element.getAttribute(attr) ?? ""
    const originalCached = originalMap.get(attr)
    let original = originalCached ?? current
    if (!originalCached) {
      originalMap.set(attr, original)
    } else {
      const previousTranslated = translateText(originalCached, "en")
      const isRuntimeSourceUpdate =
        locale === "es" ? current !== originalCached : current !== previousTranslated
      if (isRuntimeSourceUpdate) {
        original = current
        originalMap.set(attr, current)
      }
    }
    const translated = locale === "es" ? original : translateText(original, locale)
    if (current !== translated) {
      element.setAttribute(attr, translated)
    }
  }
}

function translateSubtree(root: Node, locale: "es" | "en") {
  if (root.nodeType === Node.TEXT_NODE) {
    applyTextNode(root as Text, locale)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let currentText = walker.nextNode()
  while (currentText) {
    applyTextNode(currentText as Text, locale)
    currentText = walker.nextNode()
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    applyElementAttributes(root as Element, locale)
  }

  if ("querySelectorAll" in root) {
    const elements = (root as Element | Document).querySelectorAll(
      "[aria-label],[placeholder],[title],img[alt]"
    )
    for (const element of elements) {
      applyElementAttributes(element, locale)
    }
  }
}

export function GlobalAutoTranslate() {
  const { locale } = useTranslationSkeleton()

  useEffect(() => {
    if (typeof document === "undefined") return

    const applyAll = () => translateSubtree(document.body, locale)
    applyAll()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          applyTextNode(mutation.target as Text, locale)
          continue
        }

        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            translateSubtree(node, locale)
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [locale])

  return null
}
