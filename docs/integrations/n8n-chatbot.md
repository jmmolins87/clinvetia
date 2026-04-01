# Integracion chatbot web -> n8n

El chatbot de la web usa `POST /api/chat/assistant` como punto de entrada unico.

Si `N8N_CHAT_WEBHOOK_URL` esta configurada, la API intenta delegar primero en `n8n`.
Si `n8n` no responde, responde con error o devuelve un payload invalido, la ruta usa el fallback interno de Clinvetia.

## Donde configurar cada cosa

### En la app web de Clinvetia

Pon estas variables en el entorno donde corre Next.js.
Si desarrollas en local, van en `.env`.
Si despliegas la web en Vercel o Render, van en las variables de entorno de ese servicio.

```env
N8N_CHAT_WEBHOOK_URL=https://n8n.clinvetia.com/webhook/moka-chat
N8N_CHAT_WEBHOOK_SECRET=change-me-moka-secret
```

### En n8n en Render

En Render, o en cualquier instancia de `n8n`, añade estas variables:

```env
CLINVETIA_BASE_URL=https://clinvetia.com
N8N_CHAT_WEBHOOK_SECRET=change-me-moka-secret
LLM_API_BASE_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=tu-api-key
LLM_MODEL=qwen/qwen-2.5-72b-instruct:free
```

Importa el workflow desde [clinvetia-moka-chat.workflow.json](/Users/juanmamolinscortes/Documentos/clinvetia-glass/docs/integrations/clinvetia-moka-chat.workflow.json).

Ese workflow ya viene preparado para:

- un nodo `Webhook`
- path: `moka-chat`
- method: `POST`
- validacion del header `x-clinvetia-n8n-secret` con `N8N_CHAT_WEBHOOK_SECRET`
- uso de un proveedor LLM configurable desde variables de entorno
- reenvio a `CLINVETIA_BASE_URL/api/chat/assistant`
- bypass controlado para que la app no vuelva a entrar en `n8n`
- capa visible en `n8n` para objeciones, calificacion y respuestas comerciales antes de delegar en backend

Para desarrollo local, `CLINVETIA_BASE_URL` debe apuntar a tu Next.js local:

```env
CLINVETIA_BASE_URL=http://127.0.0.1:3000
```

## Variables de entorno opcionales

```env
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/default
N8N_WEBHOOK_SECRET=secret-general-opcional
```

`N8N_CHAT_WEBHOOK_URL` y `N8N_CHAT_WEBHOOK_SECRET` tienen prioridad.
Si no existen, el chat cae a `N8N_WEBHOOK_URL` y `N8N_WEBHOOK_SECRET`.

## Payload enviado a n8n

```json
{
  "event": "chat.message",
  "channel": "web",
  "source": "website-chatbot",
  "requestId": "uuid",
  "sentAt": "2026-03-21T18:00:00.000Z",
  "message": "Quiero reservar una demo",
  "locale": "es",
  "history": [
    { "role": "assistant", "content": "Hola..." },
    { "role": "user", "content": "Quiero reservar una demo" }
  ],
  "state": {
    "intent": "book",
    "step": "idle"
  },
  "sessionToken": "roi-session-token",
  "bookingToken": null,
  "pathname": "/como-funciona",
  "pageUrl": "https://clinvetia.com/como-funciona"
}
```

## Respuesta esperada desde n8n

```json
{
  "reply": "Perfecto, te ayudo con eso.",
  "openCalendar": false,
  "openRoiCalculator": false,
  "state": {
    "intent": "book",
    "step": "await_slot"
  },
  "booking": null
}
```

## Reglas del contrato

- `reply` es obligatorio.
- `state` debe respetar los mismos enums del frontend.
- `booking` solo debe enviarse cuando haya una reserva confirmada.
- Si `n8n` devuelve un shape distinto, la API no lo reenvia al cliente y usa el fallback interno.
