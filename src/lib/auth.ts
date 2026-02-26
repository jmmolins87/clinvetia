import { randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto"

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const test = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex")
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"))
}
