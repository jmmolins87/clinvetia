# n8n + OpenAI para agente veterinario

Workflow export:

- `n8n/clinvetia-openai-veterinaria-agent.json`

## Qué hace

- responde con coherencia a preguntas generales
- detecta posibles urgencias
- ayuda a solicitar una urgencia
- ayuda a solicitar una cita normal
- mantiene contexto con memoria simple

## Estructura del workflow

1. `When chat message received`
2. `AI Agent`
3. `OpenAI Chat Model`
4. `Simple Memory`

## Modelo recomendado

- `gpt-4o-mini`

## Cómo usarlo

1. Importa el JSON en `n8n`
2. Abre el nodo `OpenAI Chat Model`
3. Selecciona tu credencial de OpenAI
4. Prueba el chat

## Importante

Este workflow está preparado para conversar y cerrar la solicitud dentro del chat.

No está conectado todavía a:

- calendario real
- base de datos real
- WhatsApp real
- email real

Por eso, cuando el agente “reserva”, en realidad deja la solicitud estructurada en la conversación. Si quieres, el siguiente paso es añadir herramientas reales para:

- guardar citas en Google Calendar
- mandar urgencias a WhatsApp
- crear registros en Airtable o Sheets
- conectarlo al backend de Clinvetia
