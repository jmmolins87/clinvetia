"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Select } from "@/components/ui/select"
import { Avatar } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ADMIN_ROLES, allowedCreatableRoles, canManageRole, roleBadgeVariant, type AdminRole } from "@/lib/admin-roles"
import { sanitizeInput } from "@/lib/security"
import { cn } from "@/lib/utils"

type AdminUser = {
  id?: string
  email: string
  name: string
  role: AdminRole
  status: string
  createdAt: string
}

type PendingUserAction = {
  id: string
  type: "invite_user" | "reset_user_password"
  email: string
  name: string
  role: AdminRole | null
  targetUserId: string | null
  createdAt: string
  expiresAt: string
  requestedByRole: AdminRole
  status: "pending" | "used"
}

function getInitials(name: string, email: string) {
  const base = name?.trim() || email.split("@")[0] || "U"
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [role, setRole] = useState<AdminRole | null>(null)
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingActions, setPendingActions] = useState<PendingUserAction[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [createRole, setCreateRole] = useState<AdminRole>("worker")
  const [creating, setCreating] = useState(false)
  const [resetPassword, setResetPassword] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [pendingActionLoadingId, setPendingActionLoadingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Pick<AdminUser, "id" | "name" | "email"> | null>(null)
  const creatableRoles = role ? allowedCreatableRoles(role) : []
  const [createTouched, setCreateTouched] = useState<{ email: boolean; name: boolean }>({
    email: false,
    name: false,
  })
  const [createErrors, setCreateErrors] = useState<{ email?: string; name?: string }>({})

  const loadUsers = useCallback(async () => {
    setError(null)
    try {
      const meRes = await fetch("/api/admin/me", { cache: "no-store" })
      if (meRes.status === 401) {
        router.push("/admin/login")
        return
      }
      const meData = await meRes.json()
      setRole(meData.admin.role)
      setCurrentAdminId(meData.admin.id)

      const [usersRes, actionsRes] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/users/actions", { cache: "no-store" }),
      ])

      if (!usersRes.ok) {
        const payload = await usersRes.json().catch(() => null)
        throw new Error(payload?.error || "Error al cargar usuarios")
      }

      if (!actionsRes.ok) {
        const payload = await actionsRes.json().catch(() => null)
        throw new Error(payload?.error || "Error al cargar solicitudes pendientes")
      }

      const [usersData, actionsData] = await Promise.all([usersRes.json(), actionsRes.json()])
      setUsers(usersData.users)
      setPendingActions(actionsData.actions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios")
    } finally {
      setLoading(false)
      setPendingLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (!role) return
    if (creatableRoles.length === 0) return
    if (!creatableRoles.includes(createRole)) {
      setCreateRole(creatableRoles[0])
    }
  }, [role, creatableRoles, createRole])

  const validateCreateField = (field: "email" | "name", value: string) => {
    if (!value.trim()) return "Este campo es obligatorio"
    if (field === "name") {
      if (value.trim().length < 2) return "Mínimo 2 caracteres"
      if (value.length > 80) return "Máximo 80 caracteres"
      return ""
    }
    if (field === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email no válido"
      return ""
    }
    return ""
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = {
      name: validateCreateField("name", name),
      email: validateCreateField("email", email),
    }
    setCreateErrors(nextErrors)
    setCreateTouched({ name: true, email: true })
    if (nextErrors.name || nextErrors.email) return

    setCreating(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role: createRole }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo crear el usuario")
      }

      setEmail("")
      setName("")
      setCreateErrors({})
      setCreateTouched({ name: false, email: false })
      setCreateRole(creatableRoles[0] ?? "worker")
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo eliminar")
      }

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar")
    }
  }

  const handleStatus = async (id: string, status: "active" | "disabled") => {
    setStatusLoading(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo actualizar")
      }
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setStatusLoading(null)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPassword) return
    setResetLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(resetPassword)}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo resetear")
      }
      setResetPassword(null)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo resetear")
    } finally {
      setResetLoading(false)
    }
  }

  const handlePendingAction = async (id: string, action: "resend" | "cancel") => {
    setPendingActionLoadingId(id)
    setError(null)
    try {
      const res = await fetch("/api/admin/users/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo actualizar la solicitud")
      }
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la solicitud")
    } finally {
      setPendingActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Vas a eliminar al usuario ${deleteTarget.name} (${deleteTarget.email}). Esta acción no se puede deshacer.`
                : "Confirma la eliminación del usuario."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:[&>*]:flex-none">
            <Button variant="ghost" className="!w-auto" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="!w-auto"
              onClick={async () => {
                const id = deleteTarget?.id
                setDeleteTarget(null)
                if (!id) return
                await handleDelete(id)
              }}
            >
              Eliminar usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <GlassCard className="p-5 space-y-4">
        <h3 className="text-lg font-semibold">Listado</h3>
        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner size="sm" variant="primary" />
            <span>Cargando usuarios...</span>
          </div>
        )}
        {!loading && users.length === 0 && <div className="text-sm text-muted-foreground">Sin usuarios</div>}
        {!loading && (
          <div className="space-y-3">
            {users.map((user) => {
              const canEditThisUser = role ? canManageRole(role, user.role) : false
              const isCurrentUser = Boolean(currentAdminId && user.id && currentAdminId === user.id)
              return (
                <div key={user.email} className="space-y-3 rounded-lg border border-white/10 px-3 py-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        variant={user.role === "superadmin" ? "primary" : "secondary"}
                        initials={getInitials(user.name, user.email)}
                      />
                      <div>
                        <div className="text-sm font-medium">{user.name} · {user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.role} · {user.status}</div>
                      </div>
                    </div>
                    {role && canEditThisUser && (
                      <div className="flex flex-nowrap items-center gap-2">
                        {user.status !== "disabled" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="!w-auto shrink-0"
                            disabled={!canEditThisUser}
                            onClick={() => {
                              if (!user.id) return
                              setResetPassword(user.id)
                            }}
                          >
                            Reset password
                          </Button>
                        )}
                        {!isCurrentUser && user.status !== "disabled" && (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              className="!w-auto shrink-0"
                              onClick={() => user.id && handleStatus(user.id, "disabled")}
                              disabled={statusLoading === user.id || !canEditThisUser}
                            >
                              {statusLoading === user.id ? "Actualizando..." : "Desactivar"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="!w-auto shrink-0"
                              disabled={!canEditThisUser}
                              onClick={() => user.id && setDeleteTarget({ id: user.id, name: user.name, email: user.email })}
                            >
                              Eliminar
                            </Button>
                          </>
                        )}
                        {!isCurrentUser && user.status === "disabled" && (
                          <Button
                            variant="accent"
                            size="sm"
                            className="!w-auto shrink-0"
                            onClick={() => user.id && handleStatus(user.id, "active")}
                            disabled={statusLoading === user.id || !canEditThisUser}
                          >
                            {statusLoading === user.id ? "Actualizando..." : "Activar"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {resetPassword === user.id && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
                      <h3 className="text-sm font-semibold">Reset password</h3>
                      <p className="text-sm text-muted-foreground">
                        Se generará una nueva contraseña temporal y se enviará un correo al usuario para que confirme el cambio.
                      </p>
                      <div className="flex flex-nowrap justify-start gap-2">
                        <button
                          type="button"
                          className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "!w-auto shrink-0")}
                          onClick={() => {
                            setResetPassword(null)
                          }}
                          disabled={resetLoading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className={cn(buttonVariants({ variant: "default", size: "sm" }), "!w-auto shrink-0")}
                          onClick={handleResetPassword}
                          disabled={resetLoading}
                        >
                          {resetLoading ? "Enviando..." : "Enviar email de verificación"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <h3 className="text-lg font-semibold">Crear usuario</h3>
        {role && creatableRoles.length === 0 && (
          <div className="text-sm text-muted-foreground">Tu rol no puede crear usuarios.</div>
        )}
        <form className="grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Nombre</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                const value = sanitizeInput(e.target.value)
                setName(value)
                if (createTouched.name) {
                  setCreateErrors((prev) => ({ ...prev, name: validateCreateField("name", value) }))
                }
              }}
              onBlur={(e) => {
                setCreateTouched((prev) => ({ ...prev, name: true }))
                setCreateErrors((prev) => ({ ...prev, name: validateCreateField("name", e.target.value) }))
              }}
              disabled={!role || creatableRoles.length === 0}
              className={createErrors.name ? "glass border-destructive/50" : "glass"}
              required
            />
            {createTouched.name && createErrors.name && <div className="text-xs text-destructive">{createErrors.name}</div>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                const value = sanitizeInput(e.target.value)
                setEmail(value)
                if (createTouched.email) {
                  setCreateErrors((prev) => ({ ...prev, email: validateCreateField("email", value) }))
                }
              }}
              onBlur={(e) => {
                setCreateTouched((prev) => ({ ...prev, email: true }))
                setCreateErrors((prev) => ({ ...prev, email: validateCreateField("email", e.target.value) }))
              }}
              disabled={!role || creatableRoles.length === 0}
              className={createErrors.email ? "glass border-destructive/50" : "glass"}
              required
            />
            {createTouched.email && createErrors.email && <div className="text-xs text-destructive">{createErrors.email}</div>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="role">Rol</label>
            <Select
              id="role"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as AdminRole)}
              disabled={!role || creatableRoles.length === 0}
              className="glass"
            >
              {ADMIN_ROLES.filter((itemRole) => !role || creatableRoles.includes(itemRole)).map((itemRole) => (
                <option key={itemRole} value={itemRole}>{itemRole}</option>
              ))}
            </Select>
          </div>
          </div>
          <div>
            <Button type="submit" className="w-full sm:w-auto" disabled={!role || creatableRoles.length === 0 || creating}>
              {creating ? "Enviando invitación..." : "Enviar invitación"}
            </Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Solicitudes pendientes</h3>
          <Badge variant="accent" className="w-fit sm:ml-3">
            {pendingActions.length}
          </Badge>
        </div>

        {pendingLoading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner size="sm" variant="accent" />
            <span>Cargando solicitudes...</span>
          </div>
        )}

        {!pendingLoading && pendingActions.length === 0 && (
          <div className="text-sm text-muted-foreground">No hay invitaciones ni resets pendientes.</div>
        )}

        {!pendingLoading && pendingActions.length > 0 && (
          <div className="space-y-4 pt-1">
            {pendingActions.map((actionItem) => {
              const isInvite = actionItem.type === "invite_user"
              const isBusy = pendingActionLoadingId === actionItem.id
              return (
                <div key={actionItem.id} className="rounded-lg border border-white/10 px-3 py-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={isInvite ? "accent" : "warning"} className="w-fit">
                          {isInvite ? "Invitación" : "Reset password"}
                        </Badge>
                        {actionItem.role && (
                          <Badge variant={roleBadgeVariant(actionItem.role)} className="w-fit">
                            {actionItem.role}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        {actionItem.name || actionItem.email}
                        <span className="text-muted-foreground"> · {actionItem.email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expira: {new Date(actionItem.expiresAt).toLocaleString("es-ES")}
                      </div>
                    </div>

                    <div className="flex flex-nowrap items-center gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        className="!w-auto shrink-0"
                        onClick={() => handlePendingAction(actionItem.id, "resend")}
                        disabled={isBusy}
                      >
                        {isBusy ? "Enviando..." : "Reenviar"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="!w-auto shrink-0"
                        onClick={() => handlePendingAction(actionItem.id, "cancel")}
                        disabled={isBusy}
                      >
                        {isBusy ? "Cancelando..." : "Cancelar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
