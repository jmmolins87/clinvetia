"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArchiveRestore, Inbox, Mail, RotateCcw, Send, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Icon } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type MailboxMode = "self" | "shared"
type MailFolder = "inbox" | "sent" | "trash"
type MailStatus = "all" | "received" | "sent" | "failed"
type MailErrorFilter = "all" | "yes" | "no"

type MailMessage = {
  id: string
  mailboxType: "shared" | "user"
  mailboxEmail: string
  folder: MailFolder
  direction: "inbound" | "outbound"
  status: "received" | "sent" | "failed"
  from: { email: string; name?: string | null }
  to: Array<{ email: string; name?: string | null }>
  subject: string
  body: string
  preview: string
  createdAt: string
  updatedAt: string
  error?: string | null
}

type MailResponse = {
  messages: MailMessage[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  mailboxes: { self: string; shared: string | null }
  capabilities: { canAccessShared: boolean }
  isDemo?: boolean
}

const PAGE_SIZE = 20

export default function AdminMailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [resettingDemo, setResettingDemo] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [data, setData] = useState<MailResponse | null>(null)
  const [mailbox, setMailbox] = useState<MailboxMode>("self")
  const [folder, setFolder] = useState<MailFolder>("inbox")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MailStatus>("all")
  const [errorFilter, setErrorFilter] = useState<MailErrorFilter>("all")
  const [toFilter, setToFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [page, setPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [to, setTo] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      mailbox,
      folder,
      status: statusFilter,
      hasError: errorFilter,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    })
    if (query.trim()) params.set("q", query.trim())
    if (toFilter.trim()) params.set("to", toFilter.trim())
    if (fromDate) params.set("fromDate", fromDate)
    if (toDate) params.set("toDate", toDate)

    const res = await fetch(`/api/admin/mail?${params.toString()}`, { cache: "no-store" })
    if (res.status === 401) {
      router.push("/admin/login")
      return
    }
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || "No se pudieron cargar los correos")
    }
    const payload = (await res.json()) as MailResponse
    setData(payload)
    if (payload.capabilities.canAccessShared && mailbox === "self" && payload.messages.length === 0 && folder === "inbox") {
      setMailbox("shared")
    }
  }, [errorFilter, folder, fromDate, mailbox, page, query, router, statusFilter, toDate, toFilter])

  useEffect(() => {
    setLoading(true)
    load()
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "No se pudo cargar el gestor de correos",
          description: error instanceof Error ? error.message : "Error inesperado",
        })
      })
      .finally(() => setLoading(false))
  }, [load, toast])

  useEffect(() => {
    setPage(1)
  }, [folder, mailbox, query, statusFilter, errorFilter, toFilter, fromDate, toDate])

  const openCompose = () => {
    setSubject("Seguimiento de tu solicitud en Clinvetia")
    setMessage("Hola,\n\nTe escribimos para dar seguimiento a tu solicitud.\n\nQuedamos atentos a tu respuesta.\n\nEquipo Clinvetia")
    setComposeOpen(true)
  }

  const sendMessage = async () => {
    if (!to.trim() || !subject.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Completa el correo",
        description: "Destino, asunto y mensaje son obligatorios.",
      })
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/admin/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailbox,
          to: to.trim(),
          customerName: customerName.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo enviar el correo")
      }
      toast({
        variant: "success",
        title: "Correo enviado",
        description: "El mensaje se registró en el buzón de salida.",
      })
      setComposeOpen(false)
      setTo("")
      setCustomerName("")
      setSubject("")
      setMessage("")
      setFolder("sent")
      setPage(1)
      await load()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar",
        description: error instanceof Error ? error.message : "Error al enviar el correo",
      })
    } finally {
      setSending(false)
    }
  }

  const moveMessage = async (id: string, nextFolder: MailFolder) => {
    setMovingId(id)
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", ids: [id], folder: nextFolder }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo mover el correo")
      }
      await load()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo mover el correo",
        description: error instanceof Error ? error.message : "Error inesperado",
      })
    } finally {
      setMovingId(null)
    }
  }

  const mailboxLabel = useMemo(() => {
    if (!data) return "Buzón personal"
    if (mailbox === "shared") return `Buzón compartido (${data.mailboxes.shared})`
    return `Buzón personal (${data.mailboxes.self})`
  }, [data, mailbox])

  const resetDemoMailbox = async () => {
    setResettingDemo(true)
    try {
      const res = await fetch("/api/admin/mail/demo-reset", { method: "POST" })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo reiniciar la demo")
      }
      setMailbox("self")
      setFolder("inbox")
      setPage(1)
      setQuery("")
      setStatusFilter("all")
      setErrorFilter("all")
      setToFilter("")
      setFromDate("")
      setToDate("")
      await load()
      toast({
        variant: "success",
        title: "Demo reiniciada",
        description: "Se restauraron los correos mock del gestor.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo reiniciar la demo",
        description: error instanceof Error ? error.message : "Error inesperado",
      })
    } finally {
      setResettingDemo(false)
    }
  }

  return (
    <div className="space-y-6">
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo correo</DialogTitle>
            <DialogDescription>
              Se enviará desde {mailbox === "shared" ? "info@clinvetia.com" : "tu buzón personal"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destinatario (email)" className="glass" />
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre del destinatario (opcional)" className="glass" />
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto" className="glass" />
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe el mensaje..." className="glass min-h-40" />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setComposeOpen(false)} disabled={sending}>
              Cancelar
            </Button>
            <Button className="w-full sm:flex-1" onClick={sendMessage} disabled={sending}>
              <Icon icon={Send} size="xs" variant="primary" />
              {sending ? "Enviando..." : "Enviar correo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || "Detalle del correo"}</DialogTitle>
            <DialogDescription>
              {selectedMessage ? `De ${selectedMessage.from.email} · ${new Date(selectedMessage.createdAt).toLocaleString("es-ES")}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <p><span className="text-muted-foreground">De:</span> {selectedMessage.from.email}</p>
                <p><span className="text-muted-foreground">Para:</span> {selectedMessage.to.map((item) => item.email).join(", ") || "-"}</p>
                <p><span className="text-muted-foreground">Estado:</span> {selectedMessage.status}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm whitespace-pre-wrap">
                {selectedMessage.body}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedMessage(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gestor de correos</h2>
          <p className="text-sm text-muted-foreground">{mailboxLabel}</p>
        </div>
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:flex-nowrap">
          {data?.capabilities.canAccessShared && (
            <>
              <Button
                type="button"
                size="sm"
                variant={mailbox === "shared" ? "default" : "outline"}
                className="!w-auto"
                onClick={() => setMailbox("shared")}
              >
                info@clinvetia.com
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mailbox === "self" ? "default" : "outline"}
                className="!w-auto"
                onClick={() => setMailbox("self")}
              >
                Mi buzón
              </Button>
            </>
          )}
          {!data?.capabilities.canAccessShared && (
            <Badge variant="outline">Mi buzón</Badge>
          )}
          <Button type="button" size="sm" className="!w-auto" onClick={openCompose}>
            <Icon icon={Mail} size="xs" variant="primary" />
            Nuevo correo
          </Button>
          {data?.isDemo ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="!w-auto border border-warning/30 bg-warning/10 hover:bg-warning/15"
              onClick={resetDemoMailbox}
              disabled={resettingDemo}
            >
              <Icon icon={RotateCcw} size="xs" variant="warning" />
              {resettingDemo ? "Reiniciando..." : "Reiniciar datos demo"}
            </Button>
          ) : null}
        </div>
      </div>

      <GlassCard className="p-6 md:p-7 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { key: "inbox", label: "Entrada", icon: Inbox },
            { key: "sent", label: "Salida", icon: Send },
            { key: "trash", label: "Papelera", icon: Trash2 },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFolder(item.key as MailFolder)}
              className={cn(
                buttonVariants({ variant: folder === item.key ? "default" : "outline", size: "sm" }),
                "w-auto rounded-full"
              )}
            >
              <Icon icon={item.icon} size="xs" variant="default" className="text-current" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar texto"
            className="glass h-10 lg:col-span-2"
          />
          <Input
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            placeholder="Filtrar por destinatario"
            className="glass h-10"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MailStatus)} className="h-10 rounded-xl px-3 pr-10">
            <option value="all">Estado: todos</option>
            <option value="received">Recibidos</option>
            <option value="sent">Enviados</option>
            <option value="failed">Con error</option>
          </Select>
          <Select value={errorFilter} onChange={(e) => setErrorFilter(e.target.value as MailErrorFilter)} className="h-10 rounded-xl px-3 pr-10">
            <option value="all">Errores: todos</option>
            <option value="yes">Solo con error</option>
            <option value="no">Sin error</option>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="glass h-10" />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="glass h-10" />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" variant="primary" />
            Cargando correos...
          </div>
        ) : data && data.messages.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            No hay correos en esta carpeta.
          </div>
        ) : (
          <div className="space-y-3">
            {data?.messages.map((mail) => (
              <div key={mail.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(mail)}
                    className="min-w-0 text-left"
                  >
                    <p className="truncate text-sm font-semibold hover:text-primary">{mail.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {mail.direction === "inbound" ? `De: ${mail.from.email}` : `Para: ${mail.to[0]?.email || "-"}`}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge variant={mail.status === "failed" ? "destructive" : "outline"}>
                      {mail.status === "failed" ? "Error" : mail.folder === "inbox" ? "Recibido" : "Enviado"}
                    </Badge>
                    {mail.folder !== "trash" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="!w-auto"
                        onClick={() => moveMessage(mail.id, "trash")}
                        disabled={movingId === mail.id}
                      >
                        <Icon icon={Trash2} size="xs" variant="destructive" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="!w-auto"
                        onClick={() => moveMessage(mail.id, "inbox")}
                        disabled={movingId === mail.id}
                      >
                        <Icon icon={ArchiveRestore} size="xs" variant="primary" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{mail.preview || mail.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(mail.createdAt).toLocaleString("es-ES")}
                </p>
                {mail.error ? <p className="mt-1 text-xs text-destructive">{mail.error}</p> : null}
              </div>
            ))}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-muted-foreground">
            <span>
              Página {data.pagination.page} de {data.pagination.totalPages} · {data.pagination.total} correos
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.pagination.page <= 1}
              >
                Anterior
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={data.pagination.page >= data.pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
