declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      enterprise?: {
        ready: (cb: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
      }
    }
  }
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No browser environment"))
  if (window.grecaptcha) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="enterprise-v3"]')
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA")), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.defer = true
    script.dataset.recaptcha = "enterprise-v3"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"))
    document.head.appendChild(script)
  })
}

export async function getRecaptchaToken(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey) {
    if (process.env.NODE_ENV !== "production") {
      return "recaptcha-dev-bypass-token"
    }
    throw new Error("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY")
  }

  await loadRecaptchaScript(siteKey)

  if (!window.grecaptcha) {
    throw new Error("reCAPTCHA unavailable")
  }

  const token = await new Promise<string>((resolve, reject) => {
    if (window.grecaptcha?.enterprise) {
      window.grecaptcha.enterprise.ready(() => {
        window.grecaptcha?.enterprise
          ?.execute(siteKey, { action })
          .then(resolve)
          .catch(() => reject(new Error("reCAPTCHA execute failed")))
      })
      return
    }

    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(siteKey, { action })
        .then(resolve)
        .catch(() => reject(new Error("reCAPTCHA execute failed")))
    })
  })

  if (!token) {
    throw new Error("reCAPTCHA token not generated")
  }

  return token
}
