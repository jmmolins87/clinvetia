export function assertAdmin(req: Request) {
  const token = req.headers.get("x-admin-token")
  const expected = process.env.ADMIN_TOKEN
  if (!expected || !token || token !== expected) {
    return false
  }
  return true
}
