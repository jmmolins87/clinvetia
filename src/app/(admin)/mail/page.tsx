"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArchiveRestore, Inbox, Mail, Reply, Send, Trash2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  adminRole?: "superadmin" | "admin" | "manager" | "worker" | "demo"
  isSuperAdmin?: boolean
  isDemo?: boolean
}

const PAGE_SIZE = 20

function stripHtmlContent(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

function extractLatestReply(value: string) {
  const separators = [
    /(^|\n)\s*El\s.+?(escribi[oó]:|va escriure:)/i,
    /(^|\n)\s*On\s.+?wrote:/i,
    /(^|\n)\s*From:\s/i,
    /(^|\n)\s*De:\s/i,
  ]

  let cutIndex = -1
  for (const pattern of separators) {
    const match = pattern.exec(value)
    if (match && (cutIndex === -1 || match.index < cutIndex)) {
      cutIndex = match.index
    }
  }

  if (cutIndex > 0) return value.slice(0, cutIndex).trim()
  return value.trim()
}

function prettifyMailText(value: string) {
  return value
    .replace(/\s+(Datos del usuario|Resumen demo|Resumen ROI|Datos del formulario|Correcciones)\s+/gi, "\n\n$1\n\n")
    .replace(/\s+(Fecha:|Hora:|Correo|Tel[ée]fono|Nombre|Cl[íi]nica|Pacientes\/mes|Ticket medio|P[ée]rdida conversi[óo]n|ROI)\s*/gi, "\n$1 ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function formatConversationText(value: string) {
  const normalized = stripHtmlContent(value)
    .replace(/\b([^\s<>]+@[^\s<>]+)\s+\1\s*>/gi, "$1 >")
    .trim()
  const latestReply = extractLatestReply(normalized)
  return prettifyMailText(latestReply)
}

function formatConversationBlocks(value: string) {
  const normalized = stripHtmlContent(value)
    .replace(/\b([^\s<>]+@[^\s<>]+)\s+\1\s*>/gi, "$1 >")
    .trim()

  if (!normalized) return []

  const pattern = /(^|\n)\s*(El\s.+?(escribi[oó]:|va escriure:)|On\s.+?wrote:)/gim
  const starts: number[] = [0]
  let match: RegExpExecArray | null = pattern.exec(normalized)

  while (match) {
    let idx = match.index
    if (normalized[idx] === "\n") idx += 1
    if (idx > 0 && !starts.includes(idx)) starts.push(idx)
    match = pattern.exec(normalized)
  }

  const sortedStarts = starts.sort((a, b) => a - b)
  const blocks: string[] = []
  for (let i = 0; i < sortedStarts.length; i += 1) {
    const start = sortedStarts[i]
    const end = sortedStarts[i + 1] ?? normalized.length
    const chunk = prettifyMailText(normalized.slice(start, end))
    if (chunk) blocks.push(chunk)
  }

  return blocks
}

function getMessageContact(mail: MailMessage) {
  if (mail.direction === "inbound") return mail.from.email || "(sin email)"
  return mail.to[0]?.email || "(sin destinatario)"
}

function normalizeEmail(value: string | undefined | null) {
  return (value || "").trim().toLowerCase()
}

function getCounterpartyEmail(mail: MailMessage) {
  const owner = normalizeEmail(mail.mailboxEmail)
  if (mail.direction === "inbound") return normalizeEmail(mail.from.email)
  const firstNonOwner = (mail.to || []).find((entry) => normalizeEmail(entry.email) !== owner)
  return normalizeEmail(firstNonOwner?.email || mail.to[0]?.email || "")
}

function getConversationKey(mail: MailMessage) {
  const owner = normalizeEmail(mail.mailboxEmail)
  const counterparty = getCounterpartyEmail(mail)
  return [owner, counterparty].sort().join("|")
}

export default function AdminMailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [data, setData] = useState<MailResponse | null>(null)
  const [mailbox, setMailbox] = useState<MailboxMode>("self")
  const [folder, setFolder] = useState<MailFolder>("inbox")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MailStatus>("all")
  const [errorFilter, setErrorFilter] = useState<MailErrorFilter>("all")
  const [toFilter, setToFilter] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageNavLoading, setPageNavLoading] = useState<"prev" | "next" | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null)
  const [conversationMessages, setConversationMessages] = useState<MailMessage[] | null>(null)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<MailMessage | null>(null)
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string; error?: string } | null>(null)
  const [replyContext, setReplyContext] = useState<{ replyToId: string; conversationWith: string } | null>(null)
  const [to, setTo] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const loadAbortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller

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
    if (selectedDateRange?.from) {
      params.set("fromDate", format(selectedDateRange.from, "yyyy-MM-dd"))
      params.set("toDate", format(selectedDateRange.to ?? selectedDateRange.from, "yyyy-MM-dd"))
    }

    const res = await fetch(`/api/admin/mail?${params.toString()}`, { cache: "no-store", signal: controller.signal })
    if (res.status === 401) {
      router.push("/admin/login")
      return
    }
    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      throw new Error(payload?.error || "No se pudieron cargar los correos")
    }
    const payload = (await res.json()) as MailResponse
    if (controller.signal.aborted) return
    if ((payload.adminRole === "superadmin" || payload.adminRole === "demo") && mailbox !== "shared") {
      setMailbox("shared")
    }
    setData(payload)
  }, [errorFilter, folder, mailbox, page, query, router, selectedDateRange, statusFilter, toFilter])

  useEffect(() => {
    setLoading(true)
    load()
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return
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
  }, [folder, mailbox, query, statusFilter, errorFilter, toFilter, selectedDateRange])

  const openCompose = () => {
    setSubject("Seguimiento de tu solicitud en Clinvetia")
    setMessage("Hola,\n\nTe escribimos para dar seguimiento a tu solicitud.\n\nQuedamos atentos a tu respuesta.\n\nEquipo ClinvetIA")
    setReplyContext(null)
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
          replyToId: replyContext?.replyToId,
          conversationWith: replyContext?.conversationWith,
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo enviar el correo")
      }
      setSendResult({
        ok: true,
        message: "El correo se ha enviado correctamente.",
      })
      setComposeOpen(false)
      setTo("")
      setCustomerName("")
      setSubject("")
      setMessage("")
      setReplyContext(null)
      setPage(1)

      if (replyContext?.conversationWith) {
        const now = new Date().toISOString()
        const mailboxEmail = mailbox === "shared" ? (data?.mailboxes.shared || data?.mailboxes.self || "") : (data?.mailboxes.self || "")
        const optimistic: MailMessage = {
          id: `local-${now}`,
          mailboxType: mailbox === "shared" ? "shared" : "user",
          mailboxEmail,
          folder: "sent",
          direction: "outbound",
          status: "sent",
          from: { email: mailboxEmail, name: data?.mailboxes.self || null },
          to: [{ email: replyContext.conversationWith, name: customerName.trim() || null }],
          subject: subject.trim(),
          body: message.trim(),
          preview: message.trim().replace(/\s+/g, " ").slice(0, 180),
          createdAt: now,
          updatedAt: now,
          error: null,
        }
        setConversationMessages((prev) => {
          const next = [...(prev || []), optimistic]
          return next.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        })
      }

      await load()
    } catch (error) {
      setSendResult({
        ok: false,
        message: "No se pudo enviar el correo.",
        error: error instanceof Error ? error.message : "Error al enviar el correo",
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
        body: JSON.stringify({ action: "move", mailbox, sourceFolder: folder, ids: [id], folder: nextFolder }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo mover el correo")
      }
      await load()
      return true
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo mover el correo",
        description: error instanceof Error ? error.message : "Error inesperado",
      })
      return false
    } finally {
      setMovingId(null)
    }
  }

  const replyToMessage = (mail: MailMessage) => {
    const recipient = mail.direction === "inbound" ? mail.from.email : mail.to[0]?.email || ""
    if (!recipient) return

    setTo(recipient)
    setCustomerName(mail.direction === "inbound" ? (mail.from.name || "") : (mail.to[0]?.name || ""))
    const nextSubject = mail.subject.toLowerCase().startsWith("re:") ? mail.subject : `Re: ${mail.subject}`
    setSubject(nextSubject)
    setMessage(`Hola,\n\n\n\nGracias,\nEquipo ClinvetIA`)
    setReplyContext({
      replyToId: mail.id,
      conversationWith: recipient.trim().toLowerCase(),
    })
    setComposeOpen(true)
  }

  const mailboxLabel = useMemo(() => {
    if (!data) return "Buzón personal"
    if (mailbox === "shared") return `Buzón compartido (${data.mailboxes.shared})`
    return `Buzón personal (${data.mailboxes.self})`
  }, [data, mailbox])

  const canShowMailboxSwitcher =
    data?.capabilities.canAccessShared &&
    !data?.isSuperAdmin &&
    (data?.adminRole === "admin" || data?.adminRole === "demo")
  const groupedMessages = useMemo(() => {
    const source = data?.messages || []
    const groups = new Map<string, MailMessage[]>()
    for (const message of source) {
      const key = getConversationKey(message)
      const bucket = groups.get(key) || []
      bucket.push(message)
      groups.set(key, bucket)
    }
    return Array.from(groups.entries()).map(([key, messages]) => ({
      key,
      contact: getMessageContact(messages[0]),
      messages,
    }))
  }, [data?.messages])
  const selectedConversation = useMemo(() => {
    if (!selectedMessage) return []
    const key = getConversationKey(selectedMessage)
    if (conversationMessages) {
      return conversationMessages
        .filter((mail) => getConversationKey(mail) === key)
        .slice()
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    }
    if (!data?.messages) return []
    return data.messages
      .filter((mail) => getConversationKey(mail) === key)
      .slice()
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
  }, [conversationMessages, data?.messages, selectedMessage])
  const activeMailboxEmail = useMemo(() => {
    if (!data) return ""
    const email = mailbox === "shared" ? (data.mailboxes.shared || data.mailboxes.self) : data.mailboxes.self
    return (email || "").trim().toLowerCase()
  }, [data, mailbox])

  const changePageWithLoader = useCallback((direction: "prev" | "next") => {
    const totalPages = data?.pagination.totalPages ?? 1
    const currentPage = data?.pagination.page ?? 1
    if (pageNavLoading) return
    if (direction === "prev" && currentPage <= 1) return
    if (direction === "next" && currentPage >= totalPages) return
    setPageNavLoading(direction)
    window.setTimeout(() => {
      setPage((current) =>
        direction === "prev" ? Math.max(1, current - 1) : Math.min(totalPages, current + 1)
      )
      setPageNavLoading(null)
    }, 1000)
  }, [data?.pagination.page, data?.pagination.totalPages, pageNavLoading])

  useEffect(() => {
    if (!selectedMessage) {
      setConversationMessages(null)
      return
    }

    const participant = getMessageContact(selectedMessage)
    if (!participant || participant.startsWith("(")) return

    const controller = new AbortController()
    setConversationMessages(null)
    setConversationLoading(true)
    fetch(`/api/admin/mail?mailbox=${mailbox}&conversationWith=${encodeURIComponent(participant)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error || "No se pudo cargar la conversación")
        }
        return res.json() as Promise<MailResponse>
      })
      .then((payload) => {
        const merged = (payload.messages || [])
          .slice()
          .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        setConversationMessages(merged)
      })
      .catch(() => {
        setConversationMessages(null)
      })
      .finally(() => {
        setConversationLoading(false)
      })

    return () => controller.abort()
  }, [mailbox, selectedMessage])

  return (
    <div className="space-y-8">
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{selectedMessage ? `Conversación · ${getMessageContact(selectedMessage)}` : "Detalle del correo"}</DialogTitle>
            <DialogDescription>
              {selectedMessage ? `${selectedConversation.length} mensaje(s) en el hilo` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <ScrollArea className="h-[62vh] w-full rounded-xl border border-white/10 bg-background/20 p-4">
              {conversationLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner size="sm" variant="primary" />
                  Cargando conversación...
                </div>
              ) : null}
                <div className="space-y-4">
                {selectedConversation.map((mail) => {
                  const sender = (mail.from.email || "").trim().toLowerCase()
                  const isSenderMessage = sender === activeMailboxEmail || mail.direction === "outbound"
                  const blocks = formatConversationBlocks(mail.body || mail.preview)
                  return (
                    <div key={mail.id} className="space-y-2">
                      {(blocks.length ? blocks : [formatConversationText(mail.body || mail.preview)]).map((block, index) => {
                        const isSenderBlock = index % 2 === 0 ? isSenderMessage : !isSenderMessage
                        return (
                          <div key={`${mail.id}-${index}`} className={cn("flex w-full", isSenderBlock ? "justify-start" : "justify-end")}>
                            <div
                              className={cn(
                                "max-w-[86%] rounded-2xl border p-4 text-sm shadow-[var(--glass-highlight)]",
                                isSenderBlock
                                  ? "border-white/15 bg-white/8 text-foreground"
                                  : "border-secondary/35 bg-secondary/10 text-secondary"
                              )}
                            >
                              {index === 0 ? (
                                <div className={cn(
                                  "mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]",
                                  isSenderBlock ? "text-muted-foreground" : "text-secondary/70"
                                )}>
                                  <span>{isSenderBlock ? `De: ${mail.from.email}` : `Para: ${mail.to[0]?.email || "-"}`}</span>
                                  <span>·</span>
                                  <span>{new Date(mail.createdAt).toLocaleString("es-ES")}</span>
                                  <span>·</span>
                                  <span className="max-w-[420px] break-words">{mail.subject || "(Sin asunto)"}</span>
                                </div>
                              ) : null}
                              {index === 0 ? (
                                <div className="mb-2 flex justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="!w-auto"
                                    onClick={() => replyToMessage(mail)}
                                  >
                                    <Icon icon={Reply} size="sm" variant="foreground" className="text-primary" />
                                    Responder
                                  </Button>
                                </div>
                              ) : null}
                              <p className="whitespace-pre-wrap break-words leading-relaxed">{block}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedMessage(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(messageToDelete)} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar borrado</DialogTitle>
            <DialogDescription>
              Este correo se moverá a la papelera.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              className="w-full sm:flex-1"
              onClick={() => setMessageToDelete(null)}
              disabled={movingId === messageToDelete?.id}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:flex-1"
              onClick={async () => {
                if (!messageToDelete) return
                const ok = await moveMessage(messageToDelete.id, "trash")
                if (ok) setMessageToDelete(null)
              }}
              disabled={!messageToDelete || movingId === messageToDelete?.id}
            >
              {movingId === messageToDelete?.id ? "Borrando..." : "Borrar correo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(sendResult)} onOpenChange={(open) => !open && setSendResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{sendResult?.ok ? "Correo enviado" : "Error al enviar"}</DialogTitle>
            <DialogDescription>
              {sendResult?.message}
            </DialogDescription>
          </DialogHeader>
          {!sendResult?.ok && sendResult?.error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {sendResult.error}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSendResult(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Gestor de correos</h2>
          <p className="text-sm text-muted-foreground">{mailboxLabel}</p>
        </div>
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-3 lg:w-auto lg:flex-nowrap">
          {canShowMailboxSwitcher && (
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
            </>
          )}
          {!data?.capabilities.canAccessShared && (
            <Badge variant="outline">Mi buzón</Badge>
          )}
          <Button type="button" size="sm" className="!w-auto" onClick={openCompose}>
            <Icon icon={Mail} size="xs" variant="primary" />
            Nuevo correo
          </Button>
        </div>
      </div>

      <GlassCard className="space-y-7 p-5 md:p-7">
        <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 mb-3">
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
                "w-auto rounded-full px-4"
              )}
            >
              <Icon icon={item.icon} size="xs" variant="default" className="text-current" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-3 grid gap-4 rounded-2xl border border-white/10 bg-background/30 p-4 md:mb-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[2.1fr_2.1fr_1.15fr_1.15fr_0.9fr]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar texto"
            className="glass h-12 px-5 text-base"
          />
          <Input
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            placeholder="Filtrar por destinatario"
            className="glass h-12 px-5 text-base"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MailStatus)} className="h-11 w-full rounded-xl px-3 pr-10">
            <option value="all">Estado: todos</option>
            <option value="received">Recibidos</option>
            <option value="sent">Enviados</option>
            <option value="failed">Con error</option>
          </Select>
          <Select value={errorFilter} onChange={(e) => setErrorFilter(e.target.value as MailErrorFilter)} className="h-11 w-full rounded-xl px-3 pr-10">
            <option value="all">Errores: todos</option>
            <option value="yes">Solo con error</option>
            <option value="no">Sin error</option>
          </Select>
          <DatePicker
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            placeholder="Filtrar por intervalo"
            className="h-11 w-full"
          />
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
          <ScrollArea className="h-[40vh] md:h-[44vh] w-full rounded-2xl border border-white/10 bg-white/4 p-3 md:p-4">
            <div className="space-y-5">
              {groupedMessages.map((group) => (
                <div key={group.key} className="space-y-3">
                  <div className="sticky top-0 z-10 rounded-lg border border-white/10 bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                    {group.contact}
                  </div>
                  {group.messages.map((mail) => (
                    <div key={mail.id} className="group rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(mail)}
                          className="min-w-0 flex-1 cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {mail.direction === "inbound" ? mail.from.email : mail.to[0]?.email || "-"}
                            </p>
                            <p className="shrink-0 text-xs text-muted-foreground">
                              {new Date(mail.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <p className="mt-1 truncate cursor-pointer text-base font-semibold hover:text-primary">{mail.subject}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {mail.direction === "inbound" ? "Recibido" : "Enviado"} · {mail.to[0]?.email || mail.from.email}
                          </p>
                        </button>
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="flex items-center gap-1 opacity-100 transition-all md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="!w-auto"
                              onClick={() => setSelectedMessage(mail)}
                            >
                              Abrir
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="!w-auto"
                              onClick={() => replyToMessage(mail)}
                            >
                              <Icon icon={Reply} size="sm" variant="foreground" className="text-primary" />
                              Responder
                            </Button>
                            {mail.folder !== "trash" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="!w-auto"
                                onClick={() => setMessageToDelete(mail)}
                                disabled={movingId === mail.id}
                              >
                                <Icon icon={Trash2} size="xs" variant="destructive" />
                                Borrar
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
                                Restaurar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                        {formatConversationText(mail.body || mail.preview)}
                      </p>
                      {mail.error ? <p className="mt-1 text-xs text-destructive">{mail.error}</p> : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
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
                onClick={() => changePageWithLoader("prev")}
                disabled={data.pagination.page <= 1 || pageNavLoading !== null}
              >
                {pageNavLoading === "prev" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" variant="primary" />
                    Cargando...
                  </span>
                ) : "Anterior"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="!w-auto"
                onClick={() => changePageWithLoader("next")}
                disabled={data.pagination.page >= data.pagination.totalPages || pageNavLoading !== null}
              >
                {pageNavLoading === "next" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" variant="primary" />
                    Cargando...
                  </span>
                ) : "Siguiente"}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
