export function bookingConfirmationEmail(params: {
  name: string
  dateLabel: string
  timeLabel: string
  duration: number
  brandName: string
  supportEmail: string
}) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Confirmacion de demo</title>
  </head>
  <body style="margin:0;background:#06090d;color:#e6edf3;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
      <div style="background:linear-gradient(180deg,#111827 0%,#0f172a 100%);border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);">
        <div style="padding:22px 24px;border-bottom:1px solid #1f2937;background:radial-gradient(circle at top right, rgba(67,233,123,0.16), transparent 45%), radial-gradient(circle at top left, rgba(0,242,254,0.10), transparent 40%);">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#8b98a5;">${params.brandName} · demo</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Tu demo está confirmada</h1>
          <p style="margin:10px 0 0;color:#b6c2cf;font-size:14px;line-height:1.5;">
            Hola ${params.name}, aquí tienes los detalles de tu demo personalizada.
          </p>
        </div>

        <div style="padding:24px;">
          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Resumen de la cita</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 10px;color:#9fb0c0;font-size:13px;width:110px;">Fecha</td>
                <td style="padding:0 0 10px;color:#ffffff;font-size:15px;font-weight:700;">${params.dateLabel}</td>
              </tr>
              <tr>
                <td style="padding:0;color:#9fb0c0;font-size:13px;">Hora</td>
                <td style="padding:0;color:#ffffff;font-size:15px;font-weight:700;">${params.timeLabel} · ${params.duration} min</td>
              </tr>
            </table>
          </div>

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Agenda y acceso</p>
            <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;">
              Hemos adjuntado un archivo de calendario (.ics) para que puedas añadir la demo a tu agenda.
              Si necesitas cambiar la cita, responde a este correo.
            </p>
          </div>

          <div style="border:1px solid #2a3445;background:#0a111c;border-radius:14px;padding:14px;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#43e97b;">Soporte</p>
            <p style="margin:0;color:#b6c2cf;font-size:13px;line-height:1.5;">
              Para reprogramar o resolver cualquier duda, responde a este correo o escribe a ${params.supportEmail}.
            </p>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #1f2937;background:#0b1220;color:#8b98a5;font-size:11px;text-align:center;">
          ${params.brandName} · Confirmación de demo · ${params.supportEmail}
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function contactConfirmationEmail(params: {
  name: string
  brandName: string
  supportEmail: string
}) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Hemos recibido tu mensaje</title>
  </head>
  <body style="margin:0;background:#06090d;color:#e6edf3;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
      <div style="background:linear-gradient(180deg,#111827 0%,#0f172a 100%);border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);">
        <div style="padding:22px 24px;border-bottom:1px solid #1f2937;background:radial-gradient(circle at top right, rgba(0,242,254,0.14), transparent 45%), radial-gradient(circle at top left, rgba(240,147,251,0.10), transparent 40%);">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#8b98a5;">${params.brandName} · contacto</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Hemos recibido tu mensaje</h1>
          <p style="margin:10px 0 0;color:#b6c2cf;font-size:14px;line-height:1.5;">
            Hola ${params.name}, gracias por escribirnos. Nuestro equipo revisará tu solicitud y te contactará en menos de 24 horas.
          </p>
        </div>

        <div style="padding:24px;">
          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Próximos pasos</p>
            <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;">
              Revisaremos tus datos y, si has solicitado demo, coordinaremos contigo la siguiente acción desde el mismo hilo de correo.
            </p>
          </div>

          <div style="border:1px solid #2a3445;background:#0a111c;border-radius:14px;padding:14px;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#43e97b;">Soporte</p>
            <p style="margin:0;color:#b6c2cf;font-size:13px;line-height:1.5;">
              Si necesitas algo urgente, responde a este correo o escribe a ${params.supportEmail}.
            </p>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #1f2937;background:#0b1220;color:#8b98a5;font-size:11px;text-align:center;">
          ${params.brandName} · Confirmación de contacto · ${params.supportEmail}
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function internalLeadNotificationEmail(params: {
  brandName: string
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
  booking?: {
    dateLabel: string
    timeLabel: string
    duration: number
  } | null
  roi?: {
    monthlyPatients?: number
    averageTicket?: number
    conversionLoss?: number
    roi?: number
  } | null
}) {
  const roi = params.roi ?? {}
  const booking = params.booking

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Nuevo lead de contacto</title>
  </head>
  <body style="margin:0;background:#06090d;color:#e6edf3;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
      <div style="background:linear-gradient(180deg,#111827 0%,#0f172a 100%);border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);">
        <div style="padding:22px 24px;border-bottom:1px solid #1f2937;background:radial-gradient(circle at top right, rgba(240,147,251,0.16), transparent 45%), radial-gradient(circle at top left, rgba(0,242,254,0.10), transparent 40%);">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#8b98a5;">${params.brandName} · lead interno</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Nuevo lead recibido</h1>
          <p style="margin:10px 0 0;color:#b6c2cf;font-size:14px;line-height:1.5;">
            Nueva solicitud registrada desde el flujo de contacto/demo.
          </p>
        </div>

        <div style="padding:24px;">
          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Datos de contacto</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;width:120px;">Nombre</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.nombre}</td></tr>
              <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Email</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.email}</td></tr>
              <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Teléfono</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.telefono}</td></tr>
              <tr><td style="padding:0;color:#9fb0c0;font-size:13px;">Clínica</td><td style="padding:0;color:#ffffff;font-size:14px;font-weight:600;">${params.clinica}</td></tr>
            </table>
          </div>

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Mensaje</p>
            <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;white-space:pre-wrap;">${params.mensaje}</p>
          </div>

          ${
            booking
              ? `<div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Reserva demo</p>
            <p style="margin:0 0 6px;font-size:14px;color:#b6c2cf;">Fecha: <strong style="color:#ffffff;">${booking.dateLabel}</strong></p>
            <p style="margin:0;font-size:14px;color:#b6c2cf;">Hora: <strong style="color:#ffffff;">${booking.timeLabel} · ${booking.duration} min</strong></p>
          </div>`
              : ""
          }

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Resumen ROI</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;width:140px;">Pacientes/mes</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${roi.monthlyPatients ?? "-"}</td></tr>
              <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Ticket medio</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${roi.averageTicket ?? "-"}${typeof roi.averageTicket === "number" ? "€" : ""}</td></tr>
              <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Pérdida conversión</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${roi.conversionLoss ?? "-"}${typeof roi.conversionLoss === "number" ? "%" : ""}</td></tr>
              <tr><td style="padding:0;color:#9fb0c0;font-size:13px;">ROI proyectado</td><td style="padding:0;color:#ffffff;font-size:14px;font-weight:700;">${roi.roi ?? "-"}${typeof roi.roi === "number" ? "%" : ""}</td></tr>
            </table>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #1f2937;background:#0b1220;color:#8b98a5;font-size:11px;text-align:center;">
          ${params.brandName} · Notificación interna de lead
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function leadSummaryEmail(params: {
  brandName: string
  nombre: string
  email: string
  telefono: string
  clinica: string
  mensaje: string
  supportEmail: string
  booking?: {
    dateLabel: string
    timeLabel: string
    duration: number
  } | null
  roi?: {
    monthlyPatients?: number
    averageTicket?: number
    conversionLoss?: number
    roi?: number
  } | null
}) {
  const roi = params.roi ?? {}
  const booking = params.booking

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Resumen de tu solicitud</title>
  </head>
  <body style="margin:0;background:#06090d;color:#e6edf3;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
      <div style="background:linear-gradient(180deg,#111827 0%,#0f172a 100%);border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);">
        <div style="padding:22px 24px;border-bottom:1px solid #1f2937;background:radial-gradient(circle at top right, rgba(0,242,254,0.14), transparent 45%), radial-gradient(circle at top left, rgba(67,233,123,0.10), transparent 40%);">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#8b98a5;">${params.brandName} · resumen</p>
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.2;color:#ffffff;">Resumen de tu solicitud</h1>
          <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;">
            Hola ${params.nombre}, este es el resumen de los datos que hemos recibido. Si necesitas corregir algo, responde a este correo o escribe a ${params.supportEmail}.
          </p>
        </div>

        <div style="padding:24px;">
        <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Datos del usuario</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;width:120px;">Correo</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.email}</td></tr>
            <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Teléfono</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.telefono}</td></tr>
            <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Nombre</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.nombre}</td></tr>
            <tr><td style="padding:0;color:#9fb0c0;font-size:13px;">Clínica</td><td style="padding:0;color:#ffffff;font-size:14px;font-weight:600;">${params.clinica}</td></tr>
          </table>
        </div>

        ${
          booking
            ? `<div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Resumen demo</p>
          <p style="margin:0 0 6px;font-size:14px;color:#b6c2cf;">Fecha: <strong style="color:#ffffff;">${booking.dateLabel}</strong></p>
          <p style="margin:0;font-size:14px;color:#b6c2cf;">Hora: <strong style="color:#ffffff;">${booking.timeLabel} · ${booking.duration} min</strong></p>
        </div>`
            : ""
        }

        <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Resumen ROI</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;width:140px;">Pacientes/mes</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${roi.monthlyPatients ?? "-"}</td></tr>
            <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Ticket medio</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${roi.averageTicket ?? "-"}${typeof roi.averageTicket === "number" ? "€" : ""}</td></tr>
            <tr><td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;">Pérdida conversión</td><td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${roi.conversionLoss ?? "-"}${typeof roi.conversionLoss === "number" ? "%" : ""}</td></tr>
            <tr><td style="padding:0;color:#9fb0c0;font-size:13px;">ROI</td><td style="padding:0;color:#ffffff;font-size:14px;font-weight:700;">${roi.roi ?? "-"}${typeof roi.roi === "number" ? "%" : ""}</td></tr>
          </table>
        </div>

        <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Datos del formulario</p>
          <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;white-space:pre-wrap;">${params.mensaje}</p>
        </div>

        <div style="border:1px solid #2a3445;background:#0a111c;border-radius:14px;padding:14px;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#43e97b;">Correcciones</p>
          <p style="margin:0;color:#b6c2cf;font-size:13px;line-height:1.5;">
            Si detectas algún dato incorrecto, responde a este correo y te ayudaremos a actualizarlo.
          </p>
        </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid #1f2937;background:#0b1220;color:#8b98a5;font-size:11px;text-align:center;">
          ${params.brandName} · Resumen de solicitud · ${params.supportEmail}
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function adminUserInviteEmail(params: {
  brandName: string
  senderName: string
  senderEmail: string
  senderRole: string
  recipientName: string
  recipientEmail: string
  role: string
  generatedPassword: string
  confirmUrl: string
  supportEmail: string
}) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Invitacion de usuario</title>
  </head>
  <body style="margin:0;background:#06090d;color:#e6edf3;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
      <div style="background:linear-gradient(180deg,#111827 0%,#0f172a 100%);border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);">
        <div style="padding:22px 24px;border-bottom:1px solid #1f2937;background:radial-gradient(circle at top right, rgba(67,233,123,0.16), transparent 45%), radial-gradient(circle at top left, rgba(0,242,254,0.10), transparent 40%);">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#8b98a5;">${params.brandName} · acceso interno</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Invitación de acceso</h1>
          <p style="margin:10px 0 0;color:#b6c2cf;font-size:14px;line-height:1.5;">
            Hola ${params.recipientName || params.recipientEmail}, se ha solicitado crear tu acceso con rol <strong style="color:#ffffff;">${params.role}</strong>.
          </p>
        </div>

        <div style="padding:24px;">
          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px 16px 14px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Solicitud interna</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;width:140px;">Solicitado por</td>
                <td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.senderName} · ${params.senderRole}</td>
              </tr>
              <tr>
                <td style="padding:0;color:#9fb0c0;font-size:13px;">Email interno</td>
                <td style="padding:0;color:#ffffff;font-size:14px;font-weight:600;">${params.senderEmail}</td>
              </tr>
            </table>
          </div>

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px 16px 14px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Credenciales de acceso</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 10px;color:#9fb0c0;font-size:13px;width:130px;">Correo</td>
                <td style="padding:0 0 10px;color:#ffffff;font-size:14px;font-weight:600;">${params.recipientEmail}</td>
              </tr>
              <tr>
                <td style="padding:0;color:#9fb0c0;font-size:13px;">Password</td>
                <td style="padding:0;">
                  <span style="display:inline-block;border:1px solid rgba(0,242,254,0.25);background:rgba(0,242,254,0.08);color:#ffffff;border-radius:8px;padding:7px 10px;font-size:14px;font-weight:700;letter-spacing:.06em;">
                    ${params.generatedPassword}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:18px;">
            <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Activación requerida</p>
            <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;">
              El usuario no se activará hasta confirmar esta solicitud. Pulsa el botón para validar el alta.
            </p>
            <p style="margin:14px 0 0;">
              <a href="${params.confirmUrl}" style="display:inline-block;background:rgba(67,233,123,0.12);color:#43e97b;border:1px solid rgba(67,233,123,0.55);border-radius:12px;padding:11px 16px;text-decoration:none;font-weight:700;box-shadow:0 0 18px rgba(67,233,123,0.20);">
                Confirmar y activar usuario
              </a>
            </p>
          </div>

          <div style="border:1px solid #2a3445;background:#0a111c;border-radius:14px;padding:14px;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#f59e0b;">Seguridad</p>
            <p style="margin:0;color:#b6c2cf;font-size:13px;line-height:1.5;">
              Si no esperabas este correo, ignóralo. Para cualquier incidencia, responde a este correo o escribe a ${params.supportEmail}.
            </p>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #1f2937;background:#0b1220;color:#8b98a5;font-size:11px;text-align:center;">
          ${params.brandName} · Gestión interna · ${params.supportEmail}
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function adminUserResetPasswordEmail(params: {
  brandName: string
  senderName: string
  senderEmail: string
  senderRole: string
  recipientName: string
  recipientEmail: string
  recipientRole?: string
  generatedPassword: string
  confirmUrl: string
  supportEmail: string
}) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Confirmacion de cambio de password</title>
  </head>
  <body style="margin:0;background:#06090d;color:#e6edf3;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:760px;margin:0 auto;padding:28px 18px;">
      <div style="background:linear-gradient(180deg,#111827 0%,#0f172a 100%);border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.35);">
        <div style="padding:22px 24px;border-bottom:1px solid #1f2937;background:radial-gradient(circle at top right, rgba(245,158,11,0.16), transparent 45%), radial-gradient(circle at top left, rgba(239,68,68,0.08), transparent 40%);">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#8b98a5;">${params.brandName} · seguridad</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Solicitud de cambio de password</h1>
          <p style="margin:10px 0 0;color:#b6c2cf;font-size:14px;line-height:1.5;">
            Hola ${params.recipientName || params.recipientEmail}, se ha solicitado un cambio de contraseña para tu acceso interno.
          </p>
        </div>

        <div style="padding:24px;">
          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px 16px 14px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Solicitud interna</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 8px;color:#9fb0c0;font-size:13px;width:140px;">Solicitado por</td>
                <td style="padding:0 0 8px;color:#ffffff;font-size:14px;font-weight:600;">${params.senderName} · ${params.senderRole}</td>
              </tr>
              <tr>
                <td style="padding:0;color:#9fb0c0;font-size:13px;">Email interno</td>
                <td style="padding:0;color:#ffffff;font-size:14px;font-weight:600;">${params.senderEmail}</td>
              </tr>
            </table>
          </div>

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px 16px 14px;margin-bottom:16px;">
            <p style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Nuevo password</p>
            <p style="margin:0 0 10px;color:#b6c2cf;font-size:13px;line-height:1.45;">
              Esta contraseña se aplicará cuando confirmes la solicitud.
            </p>
            <span style="display:inline-block;border:1px solid rgba(245,158,11,0.30);background:rgba(245,158,11,0.08);color:#ffffff;border-radius:8px;padding:7px 10px;font-size:14px;font-weight:700;letter-spacing:.06em;">
              ${params.generatedPassword}
            </span>
          </div>

          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:14px;padding:16px;margin-bottom:18px;">
            <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#9fb0c0;">Confirmación del usuario</p>
            <p style="margin:0;color:#b6c2cf;font-size:14px;line-height:1.55;">
              Si estás de acuerdo con este cambio${params.recipientRole ? ` (rol ${params.recipientRole})` : ""}, confirma desde el botón. Si no reconoces la solicitud, no hagas clic.
            </p>
            <p style="margin:14px 0 0;">
              <a href="${params.confirmUrl}" style="display:inline-block;background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.55);border-radius:12px;padding:11px 16px;text-decoration:none;font-weight:700;box-shadow:0 0 18px rgba(245,158,11,0.18);">
                Confirmar cambio de password
              </a>
            </p>
          </div>

          <div style="border:1px solid #2a3445;background:#0a111c;border-radius:14px;padding:14px;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#ef4444;">Aviso de seguridad</p>
            <p style="margin:0;color:#b6c2cf;font-size:13px;line-height:1.5;">
              Si no reconoces esta solicitud, ignora este correo y avisa al equipo de ${params.brandName} en ${params.supportEmail}.
            </p>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #1f2937;background:#0b1220;color:#8b98a5;font-size:11px;text-align:center;">
          ${params.brandName} · Seguridad de acceso · ${params.supportEmail}
        </div>
      </div>
    </div>
  </body>
</html>`
}
