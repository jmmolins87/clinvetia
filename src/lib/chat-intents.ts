function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function hasPositiveBookingIntent(normalized: string) {
  if (/\b(vamos a reservar|voy a reservar|queremos reservar|prefiero reservar|mejor reservar|reservemos|lets book|let's book|we want to book)\b/i.test(normalized)) {
    return true
  }

  if (/\bquiero reservar\b/i.test(normalized) && !/\bno quiero reservar\b/i.test(normalized)) {
    return true
  }

  if (/\bi want to book\b/i.test(normalized) && !/\bi do not want to book\b/i.test(normalized) && !/\bi don't want to book\b/i.test(normalized)) {
    return true
  }

  return false
}

export function wantsRoiCalculator(text: string) {
  const normalized = normalizeText(text)
  const asksToOpen =
    /\b(abre|abrir|abrirme|abreme|ábreme|reabre|reabrir|vuelve a abrir|open|reopen|show)\b/i.test(normalized) ||
    /\b(de nuevo|otra vez|again|back)\b/i.test(normalized)
  const mentionsCalculator = /\b(calculadora|calculator|roi)\b/i.test(normalized)

  if (!mentionsCalculator || !asksToOpen) {
    return false
  }

  return !/\b(explica|explicame|explícame|como funciona|cómo funciona|what is|how does)\b/i.test(normalized)
}

export function detectChatIntents(text: string) {
  const normalized = normalizeText(text)
  const deniesCancel = /\b(no|dont|don't|do not)\b.{0,20}\b(cancelar|cancel)\b/i.test(normalized)
  const deniesReschedule = /\b(no|dont|don't|do not)\b.{0,25}\b(reagend\w*|reprogram\w*|reschedule|change appointment)\b/i.test(normalized)
  const deniesBook =
    !hasPositiveBookingIntent(normalized) &&
    /\b(no|dont|don't|do not)\b.{0,20}\b(reservar|book|agendar|appointment)\b/i.test(normalized)
  const hasMoveToDayPhrase =
    /\b(pasala al|pasala para|moverla a|moverla para|mover la de|cambiar la de|mueveme la del|muéveme la del)\b.{0,20}\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|manana|pasado manana)\b/i.test(normalized)

  const wantsCancel =
    !deniesCancel &&
    /\b(cancelar|cancelarla|cancelarlo|canceladme|cancela|anular|anula|anulala|dar de baja|borra mi demo|borra la demo|borra mi cita|borra la de mi companero|borrar la de mi companero|elimina mi cita|quita mi cita|quitamela|quitame la|quítame la|quitamela ya|canceladme eso|cancel|cancellation)\b/i.test(normalized)
  const wantsReschedule =
    !deniesReschedule &&
    (/\b(reagend\w*|reprogram\w*|cambiar hora|cambiar cita|cambiar una cita|cambiar la de otra persona|cambiamela|cambiamela|otro horario|mover cita|mover mi cita|mover la cita|mover la demo|mover la de|mover la del|muevemela|muevela|mueveme la|muéveme la|move it|cambiar la demo de hora|cambiar la hora de la demo|aplazar|aplazarla|aplazar mi cita|pasarla a otro dia|pasarla a otro día|reschedule|change time|change appointment|another slot)\b/i.test(normalized) ||
      hasMoveToDayPhrase)
  const wantsBooking =
    !deniesBook && /\b(reservar|reserva|cita|agendar|agenda|book|booking|appointment|schedule|calendario|calendar|horario|horarios|slot|slots|demo|demostracion|demostración)\b/i.test(normalized)

  return { wantsBooking, wantsReschedule, wantsCancel }
}
