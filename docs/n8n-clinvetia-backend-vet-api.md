# Clinvetia backend para agente veterinario

Nuevos endpoints protegidos con `AI_INTEGRATION_API_KEY` para conectar `n8n` al backend de Clinvetia.

Autenticación:

- `Authorization: Bearer <AI_INTEGRATION_API_KEY>`
- `x-api-key: <AI_INTEGRATION_API_KEY>`

## Disponibilidad

`GET /api/ai/vet/availability?date=2026-03-20&priority=normal`

`GET /api/ai/vet/availability?date=2026-03-20&priority=urgent`

Respuesta:

```json
{
  "date": "2026-03-20",
  "priority": "normal",
  "slots": ["09:00", "09:30", "10:00"],
  "unavailable": ["10:30"],
  "bookable": ["10:00", "11:00"]
}
```

## Crear reserva

`POST /api/ai/vet/bookings`

Body:

```json
{
  "ownerName": "Laura Perez",
  "email": "laura@email.com",
  "phone": "600111222",
  "petName": "Toby",
  "species": "perro",
  "reason": "Vomitos desde esta manana",
  "priority": "urgent",
  "date": "2026-03-20",
  "time": "09:30",
  "notes": "Sin sangre"
}
```

## Uso desde n8n

Herramientas recomendadas en el agente:

1. `consultar_disponibilidad_vet`
   - `GET /api/ai/vet/availability`
2. `crear_reserva_vet`
   - `POST /api/ai/vet/bookings`

Cabeceras en ambos nodos HTTP Request:

```text
x-api-key: TU_AI_INTEGRATION_API_KEY
Content-Type: application/json
```

## Comportamiento recomendado del agente

- Si detecta urgencia grave, prioriza `priority=urgent`
- Si el usuario quiere cita rutinaria, usa `priority=normal`
- Antes de crear reserva, recopila:
  - propietario
  - email
  - telefono
  - mascota
  - especie
  - motivo
  - fecha
  - hora

## Nota

Este backend es separado del sistema de demos comerciales de Clinvetia. No reutiliza `Booking` ni `Contact` del flujo comercial.
