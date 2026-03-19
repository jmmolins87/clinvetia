# n8n demo veterinaria conectada a Clinvetia

Archivos:

- `n8n/clinvetia-openai-vet-demo-main.json`
- `n8n/clinvetia-openai-vet-tool-availability.json`
- `n8n/clinvetia-openai-vet-tool-booking.json`

## Qué hace

- responde preguntas de una veterinaria
- detecta urgencias
- consulta disponibilidad real en tu backend de Clinvetia
- crea reservas reales en tu backend de Clinvetia

## Importación

Importa los 3 workflows en este orden:

1. `clinvetia-openai-vet-tool-availability.json`
2. `clinvetia-openai-vet-tool-booking.json`
3. `clinvetia-openai-vet-demo-main.json`

## Configuración

### OpenAI

En el workflow principal:

- abre `OpenAI Chat Model`
- selecciona tu credencial de OpenAI

### Variables de entorno en n8n

Necesitas estas variables en tu instancia de n8n:

```env
CLINVETIA_BASE_URL=https://tu-app.onrender.com
AI_INTEGRATION_API_KEY=tu_clave_del_backend
```

Como corre sobre `Render`, usa siempre la URL publica HTTPS de tu app.

Si tambien tienes `n8n` desplegado en Render, no necesitas `localhost` ni `host.docker.internal`.

Si el servicio de Render entra en reposo, la primera llamada puede tardar un poco mas.

## Enlazar los subworkflows

En el workflow principal hay dos nodos tipo herramienta:

- `ConsultarDisponibilidadClinvetia`
- `CrearReservaClinvetia`

Después de importar:

1. abre `ConsultarDisponibilidadClinvetia`
2. selecciona el workflow `Clinvetia - Vet Availability Tool`
3. abre `CrearReservaClinvetia`
4. selecciona el workflow `Clinvetia - Vet Booking Tool`

Los IDs están puestos como placeholder para que no dependan de tu instancia de `n8n`.

## Endpoints que usa

- `GET /api/ai/vet/availability`
- `POST /api/ai/vet/bookings`

## Ejemplos para probar

Prueba 1:

```text
Mi perro lleva vomitando desde esta manana y esta muy apagado. Necesito una urgencia hoy.
```

Prueba 2:

```text
Quiero pedir cita para mi gato la semana que viene por una revision.
```

Prueba 3:

```text
Soy Laura Perez. Mi telefono es 600111222, mi email es laura@email.com, mi perro Toby necesita una cita urgente hoy y puedo a las 09:30.
```

## Nota práctica

En el prompt principal se usa `urgent` como valor de prioridad para que el agente no improvise etiquetas distintas. Tu backend actual acepta `normal` y `urgent`.

Para una demo estable en Render:

- comprueba que `AI_INTEGRATION_API_KEY` esta configurada en producción
- verifica que `/api/ai/vet/availability` responde desde tu dominio de Render
- verifica que `/api/ai/vet/bookings` acepta peticiones desde tu dominio de Render
