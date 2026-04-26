# Integracion WhatsApp -> n8n -> Kapso

El webhook de WhatsApp de Kapso entra por `POST /api/whatsapp/webhook`.
Si `N8N_WHATSAPP_WEBHOOK_URL` esta configurada, la app delega el mensaje a n8n.
El workflow de n8n llama a MOKA en el backend con bypass anti-bucle y envia la respuesta por Kapso.

Flujo:

```txt
WhatsApp -> Kapso -> /api/whatsapp/webhook -> n8n moka-whatsapp -> /api/chat/assistant -> Kapso messages API
```

## En Vercel

```env
N8N_WHATSAPP_WEBHOOK_URL=https://n8n.clinvetia.com/webhook/moka-whatsapp
N8N_WHATSAPP_WEBHOOK_SECRET=change-me-whatsapp-secret
```

Mantener tambien:

```env
KAPSO_API_BASE_URL=https://api.kapso.ai
KAPSO_API_KEY=...
KAPSO_WHATSAPP_PHONE_NUMBER_ID=1131536336707887
KAPSO_WEBHOOK_SECRET=...
META_GRAPH_VERSION=v24.0
```

`N8N_CHAT_WEBHOOK_URL` puede seguir existiendo para el chat web.

## En n8n

Importa [clinvetia-moka-whatsapp.workflow.json](./clinvetia-moka-whatsapp.workflow.json).

Variables necesarias en el entorno de n8n:

```env
CLINVETIA_BASE_URL=https://clinvetia.com
N8N_WHATSAPP_WEBHOOK_SECRET=change-me-whatsapp-secret
N8N_CHAT_WEBHOOK_SECRET=change-me-moka-secret
KAPSO_API_BASE_URL=https://api.kapso.ai
KAPSO_API_KEY=...
KAPSO_WHATSAPP_PHONE_NUMBER_ID=1131536336707887
META_GRAPH_VERSION=v24.0
```

Cuando MOKA detecta que el usuario quiere una cita o el backend devuelve `openCalendar`/`openRoiCalculator`, el workflow anade un enlace a:

```txt
https://clinvetia.com/demo
```
