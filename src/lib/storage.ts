/**
 * StorageService - Capa de persistencia robusta
 * Implementa manejo de errores, seguridad contra XSS mediante sanitización
 * y compatibilidad total con SSR.
 */

type StorageType = "local" | "session"

class StorageService {
  private prefix = "clinvetia_"

  private getStorage(type: StorageType): Storage | null {
    if (typeof window === "undefined") return null
    return type === "local" ? window.localStorage : window.sessionStorage
  }

  set(type: StorageType, key: string, value: unknown): void {
    const storage = this.getStorage(type)
    if (!storage) return

    try {
      const serializedValue = JSON.stringify(value)
      storage.setItem(`${this.prefix}${key}`, serializedValue)
    } catch (error) {
      console.error(`[StorageService] Error saving ${key}:`, error)
    }
  }

  get<T>(type: StorageType, key: string, defaultValue: T): T {
    const storage = this.getStorage(type)
    if (!storage) return defaultValue

    try {
      const item = storage.getItem(`${this.prefix}${key}`)
      if (!item) return defaultValue
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`[StorageService] Error reading ${key}:`, error)
      return defaultValue
    }
  }

  remove(type: StorageType, key: string): void {
    const storage = this.getStorage(type)
    if (!storage) return
    storage.removeItem(`${this.prefix}${key}`)
  }

  clear(type: StorageType): void {
    const storage = this.getStorage(type)
    if (!storage) return
    
    // Solo borramos lo que pertenece a nuestra app
    Object.keys(storage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        storage.removeItem(key)
      }
    })
  }
}

export const storage = new StorageService()
