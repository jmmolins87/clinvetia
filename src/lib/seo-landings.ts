export interface SeoLandingConfig {
  slug: string
  category: "operaciones" | "marketing"
  title: string
  metaTitle: string
  metaDescription: string
  heroBadge: string
  heroTitle: string
  heroDescription: string
  intro: string
  problemTitle: string
  problemPoints: string[]
  solutionTitle: string
  solutionPoints: string[]
  useCasesTitle: string
  useCases: { title: string; description: string }[]
  benefitsTitle: string
  benefits: string[]
  faqTitle: string
  faqs: { question: string; answer: string }[]
  clusterLinks: { href: string; title: string; description: string }[]
}

export const seoLandings: Record<string, SeoLandingConfig> = {
  "software-veterinario-con-ia": {
    slug: "software-veterinario-con-ia",
    category: "operaciones",
    title: "Software veterinario con IA para clínicas que quieren atender más y mejor",
    metaTitle: "Software veterinario con IA para atención y agenda",
    metaDescription:
      "Descubre cómo un software veterinario con IA mejora atención, clasificación y agenda en clínicas veterinarias con Clinvetia.",
    heroBadge: "Software veterinario con IA",
    heroTitle: "Software veterinario con IA para atender, clasificar y agendar",
    heroDescription:
      "Clinvetia combina atención automática, criterio operativo y agenda conectada para que tu clínica responda mejor sin cargar más al equipo.",
    intro:
      "Si buscas un software veterinario con IA, normalmente no necesitas solo un chatbot. Necesitas un sistema que responda consultas, filtre urgencias, proponga cita y deje todo reflejado en la operativa real de la clínica.",
    problemTitle: "Qué problema resuelve un software veterinario con IA",
    problemPoints: [
      "Consultas que entran fuera de horario y se pierden por falta de respuesta inmediata.",
      "Recepción saturada por llamadas repetitivas sobre vacunas, revisiones, síntomas y disponibilidad.",
      "Citas que no se cierran porque el lead enfría antes de que alguien conteste.",
      "Procesos manuales de recordatorio y seguimiento que consumen tiempo clínico.",
    ],
    solutionTitle: "Cómo lo resuelve Clinvetia",
    solutionPoints: [
      "Responde preguntas frecuentes y consultas iniciales en lenguaje natural.",
      "Clasifica urgencias y distingue entre rutina, prevención y casos sensibles.",
      "Consulta disponibilidad y propone la cita adecuada según el motivo de consulta.",
      "Mantiene seguimiento y recordatorios para reducir olvidos y mejorar asistencia.",
    ],
    useCasesTitle: "Casos de uso más comunes",
    useCases: [
      { title: "Urgencias nocturnas", description: "Prioriza casos sensibles y evita que una consulta urgente quede sin atender." },
      { title: "Vacunas y medicina preventiva", description: "Automatiza recordatorios y acelera la reserva de revisiones periódicas." },
      { title: "Seguimiento postconsulta", description: "Mantiene al propietario informado y evita llamadas repetitivas a recepción." },
    ],
    benefitsTitle: "Beneficios para la clínica",
    benefits: [
      "Más citas cerradas sin aumentar la carga manual del equipo.",
      "Mejor experiencia para propietarios que esperan respuesta rápida.",
      "Menos interrupciones operativas en recepción.",
      "Más visibilidad sobre el recorrido de cada consulta.",
    ],
    faqTitle: "Preguntas frecuentes sobre software veterinario con IA",
    faqs: [
      {
        question: "¿Un software veterinario con IA sustituye al equipo?",
        answer: "No. Clinvetia automatiza la parte repetitiva y operativa, pero la clínica mantiene el control sobre decisiones sensibles y atención profesional.",
      },
      {
        question: "¿Sirve para clínicas pequeñas?",
        answer: "Sí. El valor es especialmente alto en clínicas donde recepción está saturada y cada consulta perdida tiene impacto directo en ingresos.",
      },
      {
        question: "¿Puede clasificar urgencias?",
        answer: "Sí. El sistema recoge síntomas y contexto para priorizar correctamente y orientar la siguiente acción.",
      },
      {
        question: "¿Se integra con la agenda?",
        answer: "Ese es el objetivo operativo: que la conversación no se quede en respuesta, sino que termine en una cita o una acción útil.",
      },
    ],
    clusterLinks: [
      { href: "/solucion", title: "Ver la solución", description: "Entiende la propuesta completa de Clinvetia para clínicas veterinarias." },
      { href: "/como-funciona", title: "Cómo funciona", description: "Revisa el flujo desde la consulta hasta la cita confirmada." },
      { href: "/escenarios", title: "Escenarios reales", description: "Explora casos concretos de uso en veterinaria." },
      { href: "/demo", title: "Reservar demo", description: "Solicita una demo adaptada a la operativa de tu clínica." },
    ],
  },
  "automatizacion-clinica-veterinaria": {
    slug: "automatizacion-clinica-veterinaria",
    category: "operaciones",
    title: "Automatización para clínica veterinaria orientada a citas, seguimiento y recepción",
    metaTitle: "Automatización clínica veterinaria para recepción y seguimiento",
    metaDescription:
      "Clinvetia ayuda a automatizar recepción, seguimiento y tareas repetitivas en clínicas veterinarias con IA aplicada a procesos reales.",
    heroBadge: "Automatización clínica veterinaria",
    heroTitle: "Automatización clínica veterinaria con impacto real en recepción y agenda",
    heroDescription:
      "Reduce carga manual, acelera respuesta y convierte más consultas en citas con un sistema diseñado para operativa veterinaria.",
    intro:
      "La automatización clínica veterinaria no debería limitarse a enviar recordatorios. El punto de mayor valor está en capturar consultas, responder a tiempo, guiar al propietario y llevarlo a una acción útil dentro de la clínica.",
    problemTitle: "Dónde se atasca la operativa sin automatización",
    problemPoints: [
      "Recepción dedica demasiados minutos a las mismas preguntas una y otra vez.",
      "Los leads entran por web o mensajería, pero nadie los sigue con consistencia.",
      "Se escapan citas por demora en respuesta o por falta de seguimiento.",
      "Los recordatorios y tareas administrativas dependen de procesos manuales frágiles.",
    ],
    solutionTitle: "Qué automatiza Clinvetia",
    solutionPoints: [
      "Respuestas iniciales y cualificación de la consulta.",
      "Clasificación entre urgencia, revisión, vacuna, cirugía o seguimiento.",
      "Propuesta de cita según tipo de necesidad y disponibilidad.",
      "Seguimiento posterior para reducir pérdida de oportunidades.",
    ],
    useCasesTitle: "Procesos que más se benefician",
    useCases: [
      { title: "Recepción", description: "Menos interrupciones y más foco en atención presencial y clínica." },
      { title: "Captación", description: "Recupera consultas que antes quedaban sin responder o sin seguimiento." },
      { title: "Fidelización", description: "Refuerza revisiones, vacunas y seguimiento de pacientes recurrentes." },
    ],
    benefitsTitle: "Qué gana la clínica",
    benefits: [
      "Operativa más predecible y menos dependiente de tareas manuales.",
      "Menor pérdida de oportunidades por tiempos de respuesta lentos.",
      "Más capacidad para atender sin ampliar estructura.",
      "Mejor trazabilidad del recorrido de cada consulta.",
    ],
    faqTitle: "Preguntas frecuentes sobre automatización clínica veterinaria",
    faqs: [
      {
        question: "¿Automatizar significa deshumanizar la atención?",
        answer: "No. Bien planteada, la automatización libera tiempo para que el equipo humano se enfoque en los casos que sí requieren intervención directa.",
      },
      {
        question: "¿Qué procesos conviene automatizar primero?",
        answer: "Normalmente conviene empezar por atención inicial, clasificación, seguimiento comercial y recordatorios.",
      },
      {
        question: "¿Se puede usar sin una gran clínica?",
        answer: "Sí. De hecho, clínicas pequeñas suelen notar el impacto antes porque el cuello de botella en recepción es más visible.",
      },
      {
        question: "¿Cómo se mide el retorno?",
        answer: "Por citas recuperadas, menos pérdida de leads, reducción de carga manual y mejor asistencia a citas.",
      },
    ],
    clusterLinks: [
      { href: "/calculadora", title: "Calcular ROI", description: "Mide el impacto de automatizar procesos en tu clínica." },
      { href: "/solucion", title: "Ver la solución", description: "Explora cómo Clinvetia aterriza esa automatización en la práctica." },
      { href: "/faqs", title: "Resolver dudas", description: "Aclara implementación, tiempos y operación." },
      { href: "/contacto", title: "Hablar con el equipo", description: "Recibe una propuesta adaptada a tu caso." },
    ],
  },
  "gestion-de-citas-veterinarias": {
    slug: "gestion-de-citas-veterinarias",
    category: "operaciones",
    title: "Gestión de citas veterinarias para reducir pérdidas y mejorar la conversión",
    metaTitle: "Gestión de citas veterinarias para confirmaciones y reprogramaciones",
    metaDescription:
      "Mejora la gestión de citas veterinarias con Clinvetia: más confirmaciones, menos fricción y mejor manejo de cambios y seguimiento.",
    heroBadge: "Gestión de citas veterinarias",
    heroTitle: "Gestión de citas veterinarias con menos fricción y más confirmaciones",
    heroDescription:
      "Clinvetia convierte consultas en citas confirmadas con un flujo más rápido, más claro y más fácil de seguir para tu equipo.",
    intro:
      "La gestión de citas veterinarias no se rompe solo en la agenda. Se rompe antes: cuando el propietario escribe, nadie responde a tiempo, la necesidad no se clasifica bien o la propuesta de cita llega tarde.",
    problemTitle: "Por qué fallan tantas citas antes de llegar a agenda",
    problemPoints: [
      "La clínica tarda demasiado en responder a consultas iniciales.",
      "No hay un filtro claro entre urgencias, revisiones y consultas preventivas.",
      "Se ofrecen horarios sin contexto suficiente y se genera más ida y vuelta.",
      "Faltan recordatorios y seguimiento para mantener la asistencia.",
    ],
    solutionTitle: "Cómo mejora Clinvetia la gestión de citas",
    solutionPoints: [
      "Recoge el motivo de consulta y el contexto antes de proponer horario.",
      "Clasifica el tipo de cita y orienta mejor la agenda.",
      "Reduce pasos manuales en recepción para cerrar antes cada cita.",
      "Activa recordatorios y seguimiento para mejorar asistencia y reprogramaciones.",
    ],
    useCasesTitle: "Situaciones típicas de gestión de citas",
    useCases: [
      { title: "Vacunas y revisiones", description: "Citas frecuentes que deben resolverse rápido y sin demasiada fricción." },
      { title: "Cirugías y preparación", description: "Flujos que requieren confirmación y recogida de información previa." },
      { title: "Reagendados", description: "Cambios de cita que deben quedar reflejados sin errores ni duplicidades." },
    ],
    benefitsTitle: "Qué mejora cuando la cita se gestiona bien",
    benefits: [
      "Más citas cerradas desde web y mensajería.",
      "Menos errores operativos en cambios y confirmaciones.",
      "Mejor experiencia para el propietario.",
      "Más control del equipo sobre agenda y carga asistencial.",
    ],
    faqTitle: "Preguntas frecuentes sobre gestión de citas veterinarias",
    faqs: [
      {
        question: "¿Clinvetia sirve solo para captar citas nuevas?",
        answer: "No. También ayuda con confirmaciones, cambios, recordatorios y seguimiento de citas ya existentes.",
      },
      {
        question: "¿Puede ayudar con cancelaciones o reagendados?",
        answer: "Sí. La lógica operativa está pensada para reflejar cambios de manera consistente en la agenda y el resto del sistema.",
      },
      {
        question: "¿Mejora la asistencia a cita?",
        answer: "Sí, especialmente cuando se combina cierre rápido de la cita con recordatorios y seguimiento adecuados.",
      },
      {
        question: "¿Es útil si ya tengo agenda digital?",
        answer: "Sí. El problema no suele ser tener agenda, sino convertir mejor la consulta inicial en una cita correcta y confirmada.",
      },
    ],
    clusterLinks: [
      { href: "/como-funciona", title: "Ver el flujo", description: "Comprueba cómo se cierra una cita desde la primera consulta." },
      { href: "/escenarios", title: "Explorar escenarios", description: "Aterriza la gestión de citas en casos veterinarios reales." },
      { href: "/solucion", title: "Entender la plataforma", description: "Ve la propuesta completa más allá de la agenda." },
      { href: "/demo", title: "Solicitar demo", description: "Revisa cómo encajaría en tu operativa actual." },
    ],
  },
  "triaje-veterinario-con-ia": {
    slug: "triaje-veterinario-con-ia",
    category: "operaciones",
    title: "Triaje veterinario con IA para priorizar mejor y atender antes",
    metaTitle: "Triaje veterinario con IA para urgencias y clasificación",
    metaDescription:
      "Clinvetia aplica triaje veterinario con IA para detectar urgencias, clasificar consultas y orientar mejor la agenda clínica.",
    heroBadge: "Triaje veterinario con IA",
    heroTitle: "Triaje veterinario con IA para detectar urgencias y orientar la agenda",
    heroDescription:
      "Recoge síntomas, contexto y disponibilidad para priorizar mejor cada caso sin dejar de lado el control clínico.",
    intro:
      "El triaje veterinario con IA tiene valor cuando ayuda a priorizar, no cuando pretende diagnosticar. La clave está en entender el motivo de consulta, recoger la información útil y dirigir la siguiente acción correcta.",
    problemTitle: "Qué ocurre sin un buen triaje inicial",
    problemPoints: [
      "Casos urgentes compiten con consultas rutinarias en el mismo canal.",
      "Recepción necesita hacer demasiadas preguntas manuales para clasificar bien.",
      "Se pierde tiempo en idas y vueltas antes de decidir qué tipo de cita toca.",
      "Propietarios preocupados reciben respuestas lentas o poco claras.",
    ],
    solutionTitle: "Cómo aplica Clinvetia el triaje con IA",
    solutionPoints: [
      "Recoge síntomas, contexto y señales de riesgo de forma estructurada.",
      "Distingue entre rutina, prevención, seguimiento y posibles urgencias.",
      "Propone la siguiente acción útil sin invadir el terreno clínico del diagnóstico.",
      "Ayuda a que la cita llegue mejor clasificada a la agenda de la clínica.",
    ],
    useCasesTitle: "Casos donde el triaje aporta más valor",
    useCases: [
      { title: "Síntomas digestivos", description: "Ayuda a distinguir señales preocupantes frente a consultas no urgentes." },
      { title: "Accidentes o golpes", description: "Prioriza rápidamente preguntas y derivación cuando el contexto lo exige." },
      { title: "Seguimiento crónico", description: "Ordena mejor controles y revisiones en pacientes recurrentes." },
    ],
    benefitsTitle: "Beneficios del triaje veterinario con IA",
    benefits: [
      "Mejor priorización desde el primer contacto.",
      "Menos tiempo manual para clasificar cada caso.",
      "Propietarios mejor orientados y con menos incertidumbre.",
      "Agenda más alineada con el nivel de urgencia real.",
    ],
    faqTitle: "Preguntas frecuentes sobre triaje veterinario con IA",
    faqs: [
      {
        question: "¿El triaje con IA diagnostica?",
        answer: "No. Su función es recoger información, clasificar el caso y orientar la siguiente acción, no sustituir el criterio veterinario.",
      },
      {
        question: "¿Sirve también para consultas rutinarias?",
        answer: "Sí. Un buen triaje no solo prioriza urgencias, también evita sobredimensionar casos preventivos o de seguimiento.",
      },
      {
        question: "¿Puede mejorar la agenda?",
        answer: "Sí. Cuando el caso llega mejor clasificado, es más fácil asignar el tipo de cita correcto y reducir fricción en recepción.",
      },
      {
        question: "¿Cómo se mantiene el control humano?",
        answer: "La clínica define límites, protocolos y revisiones sobre casos sensibles o complejos.",
      },
    ],
    clusterLinks: [
      { href: "/como-funciona", title: "Ver el flujo operativo", description: "Comprueba cómo encaja el triaje en la operativa completa." },
      { href: "/solucion", title: "Entender la solución", description: "Ve cómo se conecta con atención, agenda y seguimiento." },
      { href: "/faqs", title: "Resolver dudas", description: "Aclara límites, tiempos y aplicación real." },
      { href: "/contacto", title: "Pedir una demo", description: "Habla con el equipo sobre tu protocolo de atención." },
    ],
  },
  "chatbot-para-clinicas-veterinarias": {
    slug: "chatbot-para-clinicas-veterinarias",
    category: "operaciones",
    title: "Chatbot para clínicas veterinarias que quiere convertir más consultas en citas",
    metaTitle: "Chatbot para clínicas veterinarias en web y WhatsApp",
    metaDescription:
      "Descubre cómo un chatbot para clínicas veterinarias en web y WhatsApp puede pasar de responder preguntas a cerrar citas con Clinvetia.",
    heroBadge: "Chatbot para clínicas veterinarias",
    heroTitle: "Chatbot para clínicas veterinarias con foco en citas y operativa real",
    heroDescription:
      "Clinvetia va más allá del chatbot simple: responde, clasifica, propone citas y acompaña al propietario sin romper la operativa de la clínica.",
    intro:
      "Muchas clínicas buscan un chatbot para clínicas veterinarias pensando en ahorrar tiempo. El problema es que un chatbot genérico suele responder, pero no cualifica bien, no orienta la agenda y no cierra el proceso operativo.",
    problemTitle: "Dónde se queda corto un chatbot genérico",
    problemPoints: [
      "Responde preguntas, pero no entiende bien el contexto veterinario.",
      "No distingue con claridad entre urgencias, revisiones o prevención.",
      "Genera conversación, pero no siempre la convierte en cita útil.",
      "No deja trazabilidad suficiente para recepción y seguimiento.",
    ],
    solutionTitle: "Qué hace diferente Clinvetia",
    solutionPoints: [
      "Entiende consultas veterinarias con mejor contexto operativo.",
      "Clasifica necesidades antes de proponer la siguiente acción.",
      "Lleva la conversación hacia una cita o seguimiento útil.",
      "Se integra mejor con la lógica real de atención de la clínica.",
    ],
    useCasesTitle: "Usos habituales",
    useCases: [
      { title: "Consultas web", description: "Convierte preguntas de propietarios en oportunidades mejor trabajadas." },
      { title: "WhatsApp y mensajería", description: "Responde fuera de horario y evita pérdida de consultas." },
      { title: "Primer filtro", description: "Recoge información antes de escalar a recepción o al veterinario." },
    ],
    benefitsTitle: "Qué mejora con este enfoque",
    benefits: [
      "Más citas y menos conversaciones estériles.",
      "Mejor experiencia para propietarios que quieren respuesta rápida.",
      "Más orden para recepción y seguimiento.",
      "Menos dependencia de respuestas manuales repetitivas.",
    ],
    faqTitle: "Preguntas frecuentes sobre chatbot para clínicas veterinarias",
    faqs: [
      {
        question: "¿Clinvetia es solo un chatbot?",
        answer: "No. Tiene interfaz conversacional, pero está pensado como sistema operativo de atención y agenda, no como chat aislado.",
      },
      {
        question: "¿Sirve para WhatsApp y web?",
        answer: "Sí. La idea es atender los canales donde los propietarios ya escriben y mantener coherencia en el proceso.",
      },
      {
        question: "¿Puede clasificar consultas?",
        answer: "Sí. Ese es uno de los puntos clave para que el sistema no se quede en respuestas superficiales.",
      },
      {
        question: "¿Ayuda a cerrar más citas?",
        answer: "Sí, precisamente porque orienta mejor la conversación y reduce la fricción entre consulta y agenda.",
      },
    ],
    clusterLinks: [
      { href: "/software-veterinario-con-ia", title: "Software veterinario con IA", description: "Sitúa el chatbot dentro de una solución más completa." },
      { href: "/como-funciona", title: "Cómo funciona", description: "Ve el recorrido real de la conversación a la cita." },
      { href: "/solucion", title: "Ver la solución", description: "Entiende la propuesta completa de Clinvetia." },
      { href: "/demo", title: "Reservar demo", description: "Pide una demo adaptada a tu canal de atención." },
    ],
  },
  "recordatorios-veterinarios-automaticos": {
    slug: "recordatorios-veterinarios-automaticos",
    category: "operaciones",
    title: "Recordatorios veterinarios automáticos para reducir ausencias y mejorar seguimiento",
    metaTitle: "Recordatorios veterinarios automáticos para vacunas y revisiones",
    metaDescription:
      "Automatiza recordatorios veterinarios de vacunas, revisiones y seguimiento con Clinvetia para reducir olvidos y mejorar asistencia.",
    heroBadge: "Recordatorios veterinarios automáticos",
    heroTitle: "Recordatorios veterinarios automáticos con lógica de seguimiento real",
    heroDescription:
      "Reduce ausencias, mejora revisiones y acompaña al propietario con recordatorios mejor conectados a la operativa de la clínica.",
    intro:
      "Los recordatorios veterinarios automáticos aportan valor cuando no son un envío aislado. Funcionan mejor cuando están conectados con el tipo de paciente, la cita prevista y la lógica de seguimiento de la clínica.",
    problemTitle: "Qué pasa sin recordatorios bien montados",
    problemPoints: [
      "Propietarios olvidan vacunas, revisiones o controles recurrentes.",
      "Recepción dedica tiempo a llamar o perseguir confirmaciones.",
      "Se pierden ingresos por citas no asistidas o no reagendadas.",
      "El seguimiento preventivo depende demasiado de tareas manuales.",
    ],
    solutionTitle: "Cómo los trabaja Clinvetia",
    solutionPoints: [
      "Automatiza recordatorios para vacunas, revisiones y seguimientos.",
      "Mantiene una comunicación más clara y oportuna con el propietario.",
      "Reduce trabajo manual en confirmaciones y reprogramaciones.",
      "Conecta mejor los recordatorios con la agenda y el contexto del paciente.",
    ],
    useCasesTitle: "Casos típicos",
    useCases: [
      { title: "Vacunas", description: "Evita retrasos en pautas de vacunación y refuerzos." },
      { title: "Postoperatorio", description: "Acompaña recuperación y revisiones tras cirugía." },
      { title: "Seguimiento crónico", description: "Mantiene controles recurrentes más ordenados." },
    ],
    benefitsTitle: "Resultados esperables",
    benefits: [
      "Menos ausencias y más confirmaciones.",
      "Mayor recurrencia en revisiones y medicina preventiva.",
      "Menos llamadas manuales desde recepción.",
      "Mejor experiencia de seguimiento para el propietario.",
    ],
    faqTitle: "Preguntas frecuentes sobre recordatorios veterinarios automáticos",
    faqs: [
      {
        question: "¿Sirven solo para vacunas?",
        answer: "No. También son útiles para revisiones, postoperatorios, seguimientos crónicos y cualquier cita recurrente.",
      },
      {
        question: "¿Reducen ausencias?",
        answer: "Sí. Suelen mejorar asistencia cuando están bien temporizados y conectados con la confirmación de la cita.",
      },
      {
        question: "¿Ahorran trabajo a recepción?",
        answer: "Sí. Reducen parte de las llamadas manuales y tareas repetitivas de seguimiento.",
      },
      {
        question: "¿Se integran con la agenda?",
        answer: "Ese es el objetivo: que no vivan aparte, sino que formen parte de la operativa real de la clínica.",
      },
    ],
    clusterLinks: [
      { href: "/gestion-de-citas-veterinarias", title: "Gestión de citas veterinarias", description: "Conecta recordatorios con agenda y confirmaciones." },
      { href: "/automatizacion-clinica-veterinaria", title: "Automatización clínica veterinaria", description: "Sitúa los recordatorios dentro de un sistema más amplio." },
      { href: "/escenarios", title: "Escenarios reales", description: "Explora seguimientos y postoperatorios en contexto." },
      { href: "/calculadora", title: "Calcular ROI", description: "Aterriza el impacto económico de reducir ausencias." },
    ],
  },
  "captacion-de-leads-para-clinicas-veterinarias": {
    slug: "captacion-de-leads-para-clinicas-veterinarias",
    category: "marketing",
    title: "Captación de leads para clínicas veterinarias con mejor respuesta y seguimiento",
    metaTitle: "Captación de leads para clínicas veterinarias con respuesta automática",
    metaDescription:
      "Mejora la captación de leads para clínicas veterinarias combinando marketing, respuesta automática y seguimiento con Clinvetia.",
    heroBadge: "Captación de leads para clínicas veterinarias",
    heroTitle: "Captación de leads para clínicas veterinarias con mejor conversión",
    heroDescription:
      "No basta con atraer tráfico. Clinvetia ayuda a captar, responder y seguir oportunidades para convertir más leads en citas y ventas recurrentes.",
    intro:
      "La captación de leads para clínicas veterinarias falla muchas veces después del clic. El propietario pregunta, pero nadie responde a tiempo, no se hace seguimiento y la oportunidad se enfría antes de llegar a una cita.",
    problemTitle: "Dónde se rompe la captación",
    problemPoints: [
      "Llegan leads, pero la clínica tarda en responder.",
      "No existe un proceso consistente de seguimiento comercial.",
      "Recepción mezcla atención operativa con gestión comercial.",
      "Es difícil medir qué canales convierten de verdad.",
    ],
    solutionTitle: "Cómo lo aborda Clinvetia",
    solutionPoints: [
      "Atrae leads con mejor intención gracias a mensajes y activos más enfocados.",
      "Responde rápido para evitar enfriamiento de la oportunidad.",
      "Automatiza parte del seguimiento y empuja hacia la cita.",
      "Conecta marketing, atención y medición para ver retorno real.",
    ],
    useCasesTitle: "Dónde suele aportar más",
    useCases: [
      { title: "Campañas locales", description: "Mejora el rendimiento de la demanda existente en tu zona." },
      { title: "Web y formularios", description: "Evita que los leads queden sin trabajar tras el primer contacto." },
      { title: "Seguimiento comercial", description: "Recupera oportunidades que antes se perdían por falta de constancia." },
    ],
    benefitsTitle: "Impacto principal",
    benefits: [
      "Más leads convertidos en citas reales.",
      "Menos fuga de oportunidades por tiempos de respuesta lentos.",
      "Mayor claridad sobre el retorno de marketing.",
      "Proceso comercial más consistente para la clínica.",
    ],
    faqTitle: "Preguntas frecuentes sobre captación de leads para clínicas veterinarias",
    faqs: [
      {
        question: "¿La captación depende solo del marketing?",
        answer: "No. Captar mejor también depende de cómo respondes y haces seguimiento después del primer contacto.",
      },
      {
        question: "¿Clinvetia ayuda en la respuesta al lead?",
        answer: "Sí. Ese es uno de los puntos clave para no desperdiciar la inversión en captación.",
      },
      {
        question: "¿Se puede medir el retorno?",
        answer: "Sí. Lo correcto es conectar leads, citas e ingresos para ver el rendimiento real del canal.",
      },
      {
        question: "¿Sirve para clínicas pequeñas?",
        answer: "Sí. En clínicas pequeñas, perder un lead por tardar en responder suele notarse mucho más.",
      },
    ],
    clusterLinks: [
      { href: "/agencia-marketing-veterinaria", title: "Agencia marketing veterinaria", description: "Explora la pata de captación y seguimiento comercial." },
      { href: "/calculadora", title: "Calcular ROI", description: "Mide el impacto de convertir mejor los leads." },
      { href: "/software-veterinario-con-ia", title: "Software veterinario con IA", description: "Conecta captación con atención y agenda." },
      { href: "/contacto", title: "Hablar con el equipo", description: "Pide una propuesta adaptada a tu clínica." },
    ],
  },
  "marketing-digital-para-veterinarios": {
    slug: "marketing-digital-para-veterinarios",
    category: "marketing",
    title: "Marketing digital para veterinarios con foco en citas, seguimiento y retorno",
    metaTitle: "Marketing digital para veterinarios orientado a citas y retorno",
    metaDescription:
      "Descubre cómo enfocar el marketing digital para veterinarios hacia citas, seguimiento y retorno real con Clinvetia, sin perder leads por falta de respuesta.",
    heroBadge: "Marketing digital para veterinarios",
    heroTitle: "Marketing digital para veterinarios que no se queda en clics ni formularios",
    heroDescription:
      "Clinvetia conecta marketing, respuesta automática y seguimiento para que la demanda que generas termine en citas reales y no en oportunidades frías.",
    intro:
      "El marketing digital para veterinarios falla cuando se queda en tráfico, clics o formularios. Para que el canal funcione de verdad, la clínica necesita responder rápido, hacer seguimiento y medir qué campañas terminan convirtiendo en citas e ingresos.",
    problemTitle: "Por qué muchas acciones de marketing veterinario se frenan antes de la cita",
    problemPoints: [
      "Las campañas generan interés, pero nadie responde con rapidez suficiente.",
      "Los leads se quedan a mitad de camino entre marketing y recepción.",
      "No existe un seguimiento comercial consistente tras el primer contacto.",
      "Es difícil atribuir ingresos reales a cada canal o campaña.",
    ],
    solutionTitle: "Cómo plantea Clinvetia un marketing digital más rentable",
    solutionPoints: [
      "Diseña un recorrido comercial más claro desde el lead hasta la cita.",
      "Reduce el tiempo entre clic, consulta y respuesta inicial.",
      "Automatiza parte del seguimiento para no perder oportunidades.",
      "Conecta marketing con medición de citas e ingresos reales.",
    ],
    useCasesTitle: "Aplicaciones frecuentes",
    useCases: [
      { title: "Campañas locales", description: "Aprovecha mejor la demanda existente en tu zona de influencia." },
      { title: "Landing pages", description: "Mejora la conversión de formularios y consultas web." },
      { title: "Remarketing y follow-up", description: "Recupera interés comercial que antes se perdía por falta de constancia." },
    ],
    benefitsTitle: "Qué gana la clínica cuando el canal está bien conectado",
    benefits: [
      "Mejor conversión de la inversión en marketing.",
      "Más citas generadas desde canales digitales.",
      "Más claridad sobre qué canal funciona mejor.",
      "Menos pérdida de oportunidades por una respuesta tardía.",
    ],
    faqTitle: "Preguntas frecuentes sobre marketing digital para veterinarios",
    faqs: [
      {
        question: "¿Basta con hacer anuncios?",
        answer: "No. Sin respuesta rápida, seguimiento y medición, la captación suele rendir muy por debajo de su potencial.",
      },
      {
        question: "¿Clinvetia sustituye a una agencia?",
        answer: "No necesariamente. Puede complementar la estrategia y reforzar la parte de respuesta, seguimiento y conversión.",
      },
      {
        question: "¿Cómo se mide el retorno real?",
        answer: "Conectando campañas, leads, citas e ingresos en un mismo recorrido comercial.",
      },
      {
        question: "¿Sirve para clínicas pequeñas?",
        answer: "Sí. En clínicas pequeñas, cada lead desaprovechado pesa mucho más en la cuenta de resultados.",
      },
    ],
    clusterLinks: [
      { href: "/agencia-marketing-veterinaria", title: "Agencia marketing veterinaria", description: "Ve la página de servicio comercial principal." },
      { href: "/captacion-de-leads-para-clinicas-veterinarias", title: "Captación de leads", description: "Profundiza en la adquisición y respuesta inicial." },
      { href: "/calculadora", title: "Calcular ROI", description: "Aterriza el impacto económico del canal." },
      { href: "/contacto", title: "Hablar con el equipo", description: "Pide una propuesta adaptada a tu clínica." },
    ],
  },
  "seguimiento-comercial-para-clinicas-veterinarias": {
    slug: "seguimiento-comercial-para-clinicas-veterinarias",
    category: "marketing",
    title: "Seguimiento comercial para clínicas veterinarias sin perder oportunidades por el camino",
    metaTitle: "Seguimiento comercial para clínicas veterinarias que quieren convertir más",
    metaDescription:
      "Mejora el seguimiento comercial de tu clínica veterinaria con Clinvetia para convertir más leads en citas, revisiones y ventas recurrentes.",
    heroBadge: "Seguimiento comercial para clínicas veterinarias",
    heroTitle: "Seguimiento comercial para clínicas veterinarias con menos fuga y más cierres",
    heroDescription:
      "Clinvetia ayuda a que los leads no se queden olvidados tras el primer contacto y sostiene cada oportunidad hasta llevarla a una acción útil.",
    intro:
      "El seguimiento comercial para clínicas veterinarias suele romperse por saturación operativa. El lead entra, se responde una vez y luego nadie retoma la conversación con el ritmo y la consistencia suficientes para cerrarla en cita o venta recurrente.",
    problemTitle: "Qué hace que el seguimiento comercial falle en muchas clínicas",
    problemPoints: [
      "El equipo no tiene tiempo para perseguir cada oportunidad.",
      "Los leads se enfrían tras una primera respuesta correcta pero incompleta.",
      "No hay un sistema claro para priorizar a quién recontactar y cuándo.",
      "El seguimiento depende de memoria o tareas manuales dispersas.",
    ],
    solutionTitle: "Cómo ayuda Clinvetia a sostener la conversación comercial",
    solutionPoints: [
      "Automatiza parte de los recordatorios y recontactos comerciales.",
      "Mantiene continuidad entre consulta, respuesta y siguiente paso.",
      "Reduce fuga de leads por tiempos muertos entre interacciones.",
      "Facilita una operación comercial más consistente para la clínica.",
    ],
    useCasesTitle: "Momentos donde más aporta",
    useCases: [
      { title: "Leads templados", description: "Oportunidades que mostraron interés pero no reservaron en el primer contacto." },
      { title: "Seguimiento postcampaña", description: "Contactos que llegaron por anuncios o formularios y requieren más de un toque." },
      { title: "Ventas recurrentes", description: "Casos donde conviene seguir alimentando revisiones, planes o servicios adicionales." },
    ],
    benefitsTitle: "Qué mejora cuando el seguimiento deja de depender de memoria y huecos",
    benefits: [
      "Más leads convertidos en citas.",
      "Menos oportunidades perdidas por falta de constancia.",
      "Proceso comercial menos dependiente de memoria humana.",
      "Mejor aprovechamiento de la inversión en captación.",
    ],
    faqTitle: "Preguntas frecuentes sobre seguimiento comercial para clínicas veterinarias",
    faqs: [
      {
        question: "¿Esto sirve solo para leads fríos?",
        answer: "No. También sirve para leads templados, oportunidades abiertas y seguimiento posterior a una primera conversación.",
      },
      {
        question: "¿Hace falta un equipo comercial grande?",
        answer: "No. De hecho, cuanto más pequeño es el equipo, más útil suele ser un seguimiento automatizado y ordenado.",
      },
      {
        question: "¿Se puede medir si funciona?",
        answer: "Sí. Debe medirse por citas recuperadas, tiempos de respuesta y mejora de conversión sobre los leads existentes.",
      },
      {
        question: "¿Sustituye al trato humano?",
        answer: "No. Lo que hace es sostener el proceso para que el humano intervenga donde realmente suma valor.",
      },
    ],
    clusterLinks: [
      { href: "/captacion-de-leads-para-clinicas-veterinarias", title: "Captación de leads", description: "Conecta la adquisición con el seguimiento." },
      { href: "/marketing-digital-para-veterinarios", title: "Marketing digital para veterinarios", description: "Sitúa el seguimiento dentro del sistema comercial completo." },
      { href: "/agencia-marketing-veterinaria", title: "Agencia marketing veterinaria", description: "Ve la propuesta comercial global." },
      { href: "/calculadora", title: "Calcular ROI", description: "Mide el impacto de recuperar leads ya captados." },
    ],
  },
  "conversion-de-leads-veterinarios": {
    slug: "conversion-de-leads-veterinarios",
    category: "marketing",
    title: "Conversión de leads veterinarios para transformar interés en citas reales",
    metaTitle: "Conversión de leads veterinarios a citas reales",
    metaDescription:
      "Descubre cómo mejorar la conversión de leads veterinarios a citas reales con Clinvetia combinando respuesta rápida, seguimiento y operativa conectada.",
    heroBadge: "Conversión de leads veterinarios",
    heroTitle: "Conversión de leads veterinarios a citas con menos fricción y menos fuga",
    heroDescription:
      "Clinvetia ayuda a pasar del lead a la cita con un recorrido más rápido, más claro y mejor conectado con recepción, agenda y seguimiento.",
    intro:
      "La conversión de leads veterinarios no depende solo del volumen de contactos. Depende de cómo responde la clínica, cómo clasifica la necesidad, cómo hace seguimiento y cómo reduce la fricción hasta la cita confirmada.",
    problemTitle: "Por qué se pierden tantos leads antes de llegar a agenda",
    problemPoints: [
      "La respuesta inicial llega tarde o sin suficiente contexto.",
      "No hay continuidad entre marketing, recepción y agenda.",
      "El lead no recibe el empujón adecuado hacia la cita.",
      "Falta seguimiento cuando la conversión no ocurre en la primera interacción.",
    ],
    solutionTitle: "Cómo mejora Clinvetia la conversión desde el primer contacto",
    solutionPoints: [
      "Reduce tiempos de respuesta desde el primer contacto.",
      "Clasifica mejor la necesidad antes de proponer acción.",
      "Facilita el paso del lead a una cita correcta y confirmada.",
      "Refuerza el seguimiento para recuperar oportunidades abiertas.",
    ],
    useCasesTitle: "Aplicaciones directas",
    useCases: [
      { title: "Leads web", description: "Convierte mejor formularios y mensajes de contacto." },
      { title: "Campañas activas", description: "Evita que el coste publicitario se pierda en una mala gestión posterior." },
      { title: "Mensajería", description: "Acelera la conversión desde WhatsApp y otros canales conversacionales." },
    ],
    benefitsTitle: "Qué mejora en la clínica cuando el funnel está bien conectado",
    benefits: [
      "Más citas cerradas con el mismo volumen de leads.",
      "Mejor aprovechamiento de campañas y canales digitales.",
      "Menos fuga comercial en el paso de interés a acción.",
      "Más claridad sobre dónde se cae cada oportunidad.",
    ],
    faqTitle: "Preguntas frecuentes sobre conversión de leads veterinarios",
    faqs: [
      {
        question: "¿La conversión depende solo de marketing?",
        answer: "No. También depende de la velocidad de respuesta, la claridad del proceso y la calidad del seguimiento posterior.",
      },
      {
        question: "¿Se puede mejorar sin aumentar el tráfico?",
        answer: "Sí. Muchas clínicas tienen margen simplemente cerrando mejor las oportunidades que ya están generando.",
      },
      {
        question: "¿Qué métrica debería mirar?",
        answer: "La relación entre leads, citas cerradas, asistencia y ventas derivadas de esos contactos.",
      },
      {
        question: "¿Clinvetia ayuda en todo el recorrido?",
        answer: "Sí. El valor está precisamente en conectar adquisición, atención inicial y acción comercial útil.",
      },
    ],
    clusterLinks: [
      { href: "/captacion-de-leads-para-clinicas-veterinarias", title: "Captación de leads", description: "Empieza por la adquisición y respuesta." },
      { href: "/seguimiento-comercial-para-clinicas-veterinarias", title: "Seguimiento comercial", description: "Refuerza el tramo intermedio del recorrido." },
      { href: "/gestion-de-citas-veterinarias", title: "Gestión de citas veterinarias", description: "Conecta conversión con agenda y confirmación." },
      { href: "/contacto", title: "Hablar con el equipo", description: "Pide una revisión del funnel comercial de tu clínica." },
    ],
  },
  "whatsapp-para-clinicas-veterinarias": {
    slug: "whatsapp-para-clinicas-veterinarias",
    category: "marketing",
    title: "WhatsApp para clínicas veterinarias orientado a captar, responder y cerrar citas",
    metaTitle: "WhatsApp para clínicas veterinarias orientado a citas",
    metaDescription:
      "Descubre cómo usar WhatsApp para clínicas veterinarias para captar, responder y convertir más consultas en citas con Clinvetia.",
    heroBadge: "WhatsApp para clínicas veterinarias",
    heroTitle: "WhatsApp para clínicas veterinarias que convierte conversaciones en citas",
    heroDescription:
      "Clinvetia ayuda a responder antes, seguir mejor y cerrar más citas desde el canal donde muchos propietarios ya escriben.",
    intro:
      "WhatsApp para clínicas veterinarias puede ser uno de los canales más rentables, pero también uno de los más desordenados. Si cada conversación depende del tiempo libre de recepción, el canal genera carga operativa y deja demasiadas oportunidades por el camino.",
    problemTitle: "Qué hace que WhatsApp rinda por debajo de su potencial",
    problemPoints: [
      "Los mensajes llegan, pero no siempre se responden con la rapidez esperada.",
      "Las conversaciones se quedan abiertas sin seguimiento ni cierre claro.",
      "Recepción mezcla dudas simples, urgencias y oportunidades comerciales en el mismo flujo.",
      "No hay una forma consistente de llevar la conversación hacia una cita útil.",
    ],
    solutionTitle: "Cómo lo plantea Clinvetia en WhatsApp",
    solutionPoints: [
      "Responde consultas frecuentes y primeras preguntas de forma inmediata.",
      "Clasifica cada conversación antes de proponer la siguiente acción.",
      "Empuja el canal hacia cita, seguimiento o escalado cuando hace falta.",
      "Reduce la dependencia de respuestas manuales repetitivas desde recepción.",
    ],
    useCasesTitle: "Dónde más valor aporta el canal",
    useCases: [
      { title: "Consultas nuevas", description: "Acelera el paso del primer mensaje a una cita o una llamada útil." },
      { title: "Recontactos", description: "Recupera conversaciones abiertas que antes quedaban olvidadas." },
      { title: "Cambios y seguimiento", description: "Mantiene continuidad entre atención, agenda y siguientes pasos." },
    ],
    benefitsTitle: "Qué gana la clínica con un WhatsApp mejor estructurado",
    benefits: [
      "Más citas cerradas desde un canal ya muy usado por propietarios.",
      "Menos conversaciones perdidas por falta de seguimiento.",
      "Menos carga manual en recepción.",
      "Más orden entre mensajería, agenda y operativa real.",
    ],
    faqTitle: "Preguntas frecuentes sobre WhatsApp para clínicas veterinarias",
    faqs: [
      {
        question: "¿WhatsApp sirve solo como canal de atención?",
        answer: "No. Bien planteado, también sirve para captar, convertir, seguir oportunidades y sostener parte del seguimiento al propietario.",
      },
      {
        question: "¿Puede ayudar a cerrar más citas?",
        answer: "Sí. El valor está precisamente en reducir la fricción entre conversación y acción útil dentro de la clínica.",
      },
      {
        question: "¿Genera más carga de trabajo?",
        answer: "No si el canal está bien estructurado. El objetivo es justamente descargar a recepción de la parte más repetitiva.",
      },
      {
        question: "¿Sustituye al equipo?",
        answer: "No. Ayuda a ordenar y acelerar la respuesta, pero el equipo sigue interviniendo donde aporta más valor.",
      },
    ],
    clusterLinks: [
      { href: "/chatbot-para-clinicas-veterinarias", title: "Chatbot para clínicas veterinarias", description: "Conecta WhatsApp con la capa conversacional más amplia." },
      { href: "/captacion-de-leads-para-clinicas-veterinarias", title: "Captación de leads", description: "Lleva el canal de mensajería hacia adquisición y respuesta." },
      { href: "/gestion-de-citas-veterinarias", title: "Gestión de citas veterinarias", description: "Conecta conversación con agenda y confirmación." },
      { href: "/demo", title: "Reservar demo", description: "Revisa cómo encaja WhatsApp en la operativa real de tu clínica." },
    ],
  },
  "automatizacion-de-leads-veterinarios": {
    slug: "automatizacion-de-leads-veterinarios",
    category: "marketing",
    title: "Automatización de leads veterinarios para responder antes y convertir más",
    metaTitle: "Automatización de leads veterinarios para clínicas",
    metaDescription:
      "Mejora la automatización de leads veterinarios con Clinvetia para responder antes, seguir mejor y convertir más consultas en citas.",
    heroBadge: "Automatización de leads veterinarios",
    heroTitle: "Automatización de leads veterinarios sin dejar la conversión a medias",
    heroDescription:
      "Clinvetia organiza la respuesta inicial, el seguimiento y el paso a cita para que cada lead tenga más opciones reales de convertirse.",
    intro:
      "La automatización de leads veterinarios no consiste en mandar mensajes genéricos. Consiste en responder con rapidez, mantener continuidad comercial y empujar cada oportunidad hacia una cita o un siguiente paso claro dentro de la clínica.",
    problemTitle: "Qué pasa cuando los leads dependen solo de tareas manuales",
    problemPoints: [
      "La respuesta llega tarde porque compite con la operativa diaria.",
      "Los leads no reciben seguimiento suficiente tras el primer contacto.",
      "Cada oportunidad avanza con criterios distintos según quién responda.",
      "La clínica pierde visibilidad sobre dónde se cae cada lead.",
    ],
    solutionTitle: "Cómo automatiza Clinvetia el recorrido comercial",
    solutionPoints: [
      "Responde y cualifica antes desde el primer contacto.",
      "Automatiza parte del seguimiento para no dejar conversaciones abiertas.",
      "Lleva al lead hacia cita, recontacto o escalado según contexto.",
      "Da más trazabilidad al funnel comercial de la clínica.",
    ],
    useCasesTitle: "Momentos donde más se nota",
    useCases: [
      { title: "Campañas activas", description: "Sostiene mejor la respuesta cuando entran muchos leads a la vez." },
      { title: "Web y formularios", description: "Evita que el lead quede parado tras dejar sus datos." },
      { title: "Reactivación", description: "Recupera oportunidades que se enfriaron por falta de constancia." },
    ],
    benefitsTitle: "Beneficios de automatizar mejor los leads",
    benefits: [
      "Más velocidad de respuesta sin ampliar equipo.",
      "Menos leads abandonados a mitad del proceso.",
      "Mejor aprovechamiento de la inversión en captación.",
      "Más consistencia comercial desde la primera interacción.",
    ],
    faqTitle: "Preguntas frecuentes sobre automatización de leads veterinarios",
    faqs: [
      {
        question: "¿Automatizar leads significa sonar robótico?",
        answer: "No. Bien planteada, la automatización mantiene continuidad y velocidad sin que la conversación pierda utilidad ni contexto.",
      },
      {
        question: "¿Sirve solo para clínicas grandes?",
        answer: "No. En clínicas pequeñas el impacto suele ser incluso mayor porque cada lead desaprovechado pesa mucho más.",
      },
      {
        question: "¿Se puede conectar con la agenda?",
        answer: "Sí. El valor real aparece cuando el lead no se queda en seguimiento, sino que termina en una acción operativa útil.",
      },
      {
        question: "¿Cómo se mide si mejora?",
        answer: "Por velocidad de respuesta, leads recuperados, citas cerradas y mejora de conversión sobre el volumen ya captado.",
      },
    ],
    clusterLinks: [
      { href: "/conversion-de-leads-veterinarios", title: "Conversión de leads veterinarios", description: "Aterriza el impacto de automatizar bien el recorrido." },
      { href: "/seguimiento-comercial-para-clinicas-veterinarias", title: "Seguimiento comercial", description: "Refuerza la parte media del funnel comercial." },
      { href: "/captacion-de-leads-para-clinicas-veterinarias", title: "Captación de leads", description: "Conecta adquisición con respuesta y seguimiento." },
      { href: "/calculadora", title: "Calcular ROI", description: "Mide el valor económico de no perder leads ya captados." },
    ],
  },
  "embudo-de-citas-veterinarias": {
    slug: "embudo-de-citas-veterinarias",
    category: "marketing",
    title: "Embudo de citas veterinarias para convertir consultas en agenda confirmada",
    metaTitle: "Embudo de citas veterinarias para clínicas",
    metaDescription:
      "Descubre cómo construir un embudo de citas veterinarias con Clinvetia para convertir más consultas en agenda confirmada.",
    heroBadge: "Embudo de citas veterinarias",
    heroTitle: "Embudo de citas veterinarias para pasar de la consulta a la agenda confirmada",
    heroDescription:
      "Clinvetia ordena el recorrido desde el lead o la conversación inicial hasta la cita confirmada, con menos fricción y mejor seguimiento.",
    intro:
      "Un embudo de citas veterinarias no debería romperse entre marketing y recepción. Si el propietario pregunta, espera demasiado o recibe un proceso confuso, la oportunidad se enfría antes de llegar a agenda. El trabajo está en cerrar bien ese tramo intermedio.",
    problemTitle: "Dónde se rompe el embudo antes de la cita",
    problemPoints: [
      "El lead entra, pero no recibe una respuesta clara y rápida.",
      "No hay un criterio uniforme para mover cada contacto al siguiente paso.",
      "La cita depende demasiado de tareas manuales y seguimiento irregular.",
      "La clínica no sabe en qué punto exacto está perdiendo oportunidades.",
    ],
    solutionTitle: "Cómo construye Clinvetia un embudo más sólido",
    solutionPoints: [
      "Ordena la respuesta inicial según contexto y tipo de consulta.",
      "Conecta marketing, conversación, seguimiento y agenda.",
      "Reduce fricción en el paso del interés a la cita.",
      "Da visibilidad sobre cada tramo del recorrido comercial.",
    ],
    useCasesTitle: "Aplicaciones habituales del embudo",
    useCases: [
      { title: "Leads de campañas", description: "Evita que el interés generado se pierda antes de llegar a agenda." },
      { title: "Consultas web y WhatsApp", description: "Unifica canales distintos bajo una misma lógica de cierre." },
      { title: "Reagendados y seguimientos", description: "Mantiene continuidad cuando la conversión no ocurre al primer intento." },
    ],
    benefitsTitle: "Qué mejora cuando el embudo está bien diseñado",
    benefits: [
      "Más citas confirmadas con el mismo volumen de contactos.",
      "Menos fuga entre captación, recepción y agenda.",
      "Mejor lectura de cuellos de botella comerciales.",
      "Más previsibilidad sobre el rendimiento del canal.",
    ],
    faqTitle: "Preguntas frecuentes sobre embudo de citas veterinarias",
    faqs: [
      {
        question: "¿Esto es solo para campañas de marketing?",
        answer: "No. También sirve para cualquier consulta que entre por web, WhatsApp o formularios y deba terminar en cita.",
      },
      {
        question: "¿Un embudo de citas es demasiado complejo para una clínica pequeña?",
        answer: "No. En realidad es una forma de ordenar mejor un recorrido que ya existe, aunque hoy esté disperso y poco medido.",
      },
      {
        question: "¿Se puede mejorar sin aumentar tráfico?",
        answer: "Sí. Muchas clínicas tienen margen simplemente cerrando mejor las oportunidades que ya generan.",
      },
      {
        question: "¿Clinvetia cubre solo la parte comercial?",
        answer: "No. El punto fuerte es conectar la parte comercial con la agenda y la operativa real de la clínica.",
      },
    ],
    clusterLinks: [
      { href: "/conversion-de-leads-veterinarios", title: "Conversión de leads veterinarios", description: "Profundiza en cómo mejorar el paso a cita." },
      { href: "/gestion-de-citas-veterinarias", title: "Gestión de citas veterinarias", description: "Aterriza el embudo en agenda, confirmaciones y cambios." },
      { href: "/marketing-digital-para-veterinarios", title: "Marketing digital para veterinarios", description: "Conecta el embudo con la captación del canal." },
      { href: "/demo", title: "Reservar demo", description: "Revisa cómo montar este recorrido dentro de tu clínica." },
    ],
  },
  "crm-para-clinicas-veterinarias": {
    slug: "crm-para-clinicas-veterinarias",
    category: "marketing",
    title: "CRM para clínicas veterinarias orientado a seguimiento y citas",
    metaTitle: "CRM para clínicas veterinarias orientado a conversión",
    metaDescription:
      "Descubre cómo un CRM para clínicas veterinarias ayuda a ordenar leads, seguimiento y citas con Clinvetia.",
    heroBadge: "CRM para clínicas veterinarias",
    heroTitle: "CRM para clínicas veterinarias que ordena leads, seguimiento y citas",
    heroDescription:
      "Clinvetia ayuda a que las oportunidades no se pierdan entre recepción, marketing y agenda, con un recorrido comercial mucho más claro.",
    intro:
      "Un CRM para clínicas veterinarias solo tiene valor si mejora la conversión y da visibilidad al recorrido de cada oportunidad. Si los leads siguen dependiendo de notas sueltas, conversaciones dispersas y seguimiento irregular, el problema no es tener más contactos, sino gestionarlos mal.",
    problemTitle: "Qué se rompe cuando no existe un sistema claro de seguimiento",
    problemPoints: [
      "Los leads quedan repartidos entre WhatsApp, formularios, correo y recepción.",
      "No hay una visión clara de qué oportunidades están activas, frías o cerradas.",
      "El seguimiento depende de memoria, tareas manuales o conversaciones dispersas.",
      "La clínica pierde trazabilidad entre primera consulta, cita y resultado comercial.",
    ],
    solutionTitle: "Cómo plantea Clinvetia este enfoque tipo CRM",
    solutionPoints: [
      "Ordena cada oportunidad según su estado y siguiente acción útil.",
      "Conecta captación, respuesta, seguimiento y agenda dentro del mismo recorrido.",
      "Reduce la fuga comercial entre el primer contacto y la cita confirmada.",
      "Da más visibilidad sobre tiempos de respuesta, seguimientos y cierres.",
    ],
    useCasesTitle: "Dónde más aporta este tipo de sistema",
    useCases: [
      { title: "Leads de campañas", description: "Permite seguir mejor las oportunidades que llegan por anuncios, web o formularios." },
      { title: "Recepción y mensajería", description: "Evita que conversaciones útiles queden perdidas en distintos canales." },
      { title: "Seguimiento comercial", description: "Sostiene el paso del interés inicial a la cita o venta recurrente." },
    ],
    benefitsTitle: "Qué gana la clínica al ordenar su pipeline",
    benefits: [
      "Más claridad sobre cada oportunidad y su siguiente paso.",
      "Menos leads olvidados o mal trabajados.",
      "Más citas cerradas con el mismo volumen de captación.",
      "Mejor coordinación entre marketing, recepción y agenda.",
    ],
    faqTitle: "Preguntas frecuentes sobre CRM para clínicas veterinarias",
    faqs: [
      {
        question: "¿Esto sustituye a un CRM tradicional?",
        answer: "No necesariamente. El foco aquí no es acumular fichas, sino ordenar seguimiento, respuesta y conversión dentro de la operativa real de la clínica.",
      },
      {
        question: "¿Sirve si la clínica es pequeña?",
        answer: "Sí. De hecho, cuanto menos tiempo tiene el equipo para hacer seguimiento, más valor aporta ordenar bien el pipeline comercial.",
      },
      {
        question: "¿Se conecta con la agenda?",
        answer: "Ese es el punto clave: que la oportunidad no se quede en seguimiento, sino que llegue a cita y quede reflejada en la operativa.",
      },
      {
        question: "¿Cómo se mide el impacto?",
        answer: "Por visibilidad del funnel, reducción de fugas, mejor seguimiento y aumento de citas cerradas.",
      },
    ],
    clusterLinks: [
      { href: "/seguimiento-comercial-para-clinicas-veterinarias", title: "Seguimiento comercial", description: "Profundiza en la parte más dependiente de constancia." },
      { href: "/automatizacion-de-leads-veterinarios", title: "Automatización de leads veterinarios", description: "Conecta el CRM con respuesta y recontacto." },
      { href: "/conversion-de-leads-veterinarios", title: "Conversión de leads veterinarios", description: "Aterriza el impacto del recorrido comercial." },
      { href: "/calculadora", title: "Calcular ROI", description: "Mide el valor de no perder oportunidades ya captadas." },
    ],
  },
  "whatsapp-business-para-veterinarias": {
    slug: "whatsapp-business-para-veterinarias",
    category: "marketing",
    title: "WhatsApp Business para veterinarias con foco en respuesta y citas",
    metaTitle: "WhatsApp Business para veterinarias orientado a citas",
    metaDescription:
      "Descubre cómo usar WhatsApp Business para veterinarias para responder mejor, organizar conversaciones y cerrar más citas con Clinvetia.",
    heroBadge: "WhatsApp Business para veterinarias",
    heroTitle: "WhatsApp Business para veterinarias que organiza mejor las conversaciones y las citas",
    heroDescription:
      "Clinvetia ayuda a convertir WhatsApp en un canal más ordenado para captar, responder, seguir y cerrar citas sin saturar recepción.",
    intro:
      "WhatsApp Business para veterinarias puede ser mucho más que una bandeja de entrada. Cuando se usa bien, sirve para responder antes, ordenar conversaciones, sostener seguimientos y empujar cada oportunidad hacia una acción útil sin depender de improvisación continua.",
    problemTitle: "Qué limita el uso de WhatsApp Business en muchas clínicas",
    problemPoints: [
      "Las conversaciones se mezclan sin un criterio claro entre atención, ventas y seguimiento.",
      "El equipo responde como puede, pero no siempre con el tiempo y el contexto adecuados.",
      "No hay una lógica consistente para pasar del mensaje a la cita.",
      "Las oportunidades se enfrían en chats abiertos sin próximo paso definido.",
    ],
    solutionTitle: "Cómo ayuda Clinvetia a estructurar WhatsApp Business",
    solutionPoints: [
      "Ordena mejor la respuesta inicial según el tipo de consulta.",
      "Reduce la carga repetitiva en conversaciones frecuentes.",
      "Mantiene continuidad entre WhatsApp, seguimiento y agenda.",
      "Empuja el canal hacia citas, recontactos o escalado cuando toca.",
    ],
    useCasesTitle: "Aplicaciones más útiles del canal",
    useCases: [
      { title: "Consultas nuevas", description: "Evita que el interés inicial se pierda en una respuesta tardía o dispersa." },
      { title: "Seguimientos", description: "Sostiene la conversación hasta que la clínica consigue una acción útil." },
      { title: "Agenda y confirmaciones", description: "Conecta la mensajería con el paso real a cita o cambio de cita." },
    ],
    benefitsTitle: "Qué gana la clínica con un WhatsApp Business mejor trabajado",
    benefits: [
      "Más orden entre conversaciones, seguimiento y citas.",
      "Menos dependencia de respuestas manuales repetitivas.",
      "Mejor aprovechamiento de un canal con alta intención.",
      "Más continuidad comercial sin romper la operativa diaria.",
    ],
    faqTitle: "Preguntas frecuentes sobre WhatsApp Business para veterinarias",
    faqs: [
      {
        question: "¿En qué se diferencia de una página sobre WhatsApp general?",
        answer: "Aquí el foco está en ordenar el canal como herramienta de trabajo y conversión, no solo como punto de contacto con propietarios.",
      },
      {
        question: "¿Ayuda también a recepción?",
        answer: "Sí. Cuanto mejor estructurado está el canal, menos carga repetitiva y menos conversaciones dispersas recaen en el equipo.",
      },
      {
        question: "¿Puede empujar hacia la cita?",
        answer: "Sí. El valor está en que el canal no se quede en charla, sino que conecte con agenda y seguimiento real.",
      },
      {
        question: "¿Se solapa con chatbot o automatización?",
        answer: "No exactamente. Esta búsqueda encaja mejor con clínicas que ya usan WhatsApp y necesitan ordenarlo como canal comercial y operativo.",
      },
    ],
    clusterLinks: [
      { href: "/whatsapp-para-clinicas-veterinarias", title: "WhatsApp para clínicas veterinarias", description: "Amplía la visión del canal hacia atención y citas." },
      { href: "/chatbot-para-clinicas-veterinarias", title: "Chatbot para clínicas veterinarias", description: "Conecta WhatsApp Business con la capa conversacional." },
      { href: "/embudo-de-citas-veterinarias", title: "Embudo de citas veterinarias", description: "Aterriza el paso del chat a la agenda." },
      { href: "/demo", title: "Reservar demo", description: "Revisa cómo estructurar este canal dentro de tu clínica." },
    ],
  },
  "seguimiento-postoperatorio-veterinario": {
    slug: "seguimiento-postoperatorio-veterinario",
    category: "operaciones",
    title: "Seguimiento postoperatorio veterinario automatizado para reducir incidencias",
    metaTitle: "Seguimiento postoperatorio veterinario automatizado",
    metaDescription:
      "Descubre cómo automatizar el seguimiento postoperatorio veterinario con Clinvetia para mejorar revisiones, recordatorios y comunicación con propietarios.",
    heroBadge: "Seguimiento postoperatorio veterinario",
    heroTitle: "Seguimiento postoperatorio veterinario automatizado con más control y menos carga manual",
    heroDescription:
      "Clinvetia ayuda a ordenar revisiones, recordatorios e incidencias tras cirugía para que el propietario esté mejor acompañado y la clínica tenga más visibilidad.",
    intro:
      "El seguimiento postoperatorio veterinario es uno de los puntos donde más valor tiene automatizar sin perder criterio. Después de una cirugía, el propietario necesita instrucciones claras, recordatorios y canales de seguimiento, mientras la clínica necesita reducir tareas repetitivas y detectar incidencias antes.",
    problemTitle: "Qué falla cuando el postoperatorio depende solo de tareas manuales",
    problemPoints: [
      "El propietario recibe indicaciones, pero no siempre tiene continuidad ni recordatorios claros.",
      "Recepción o el equipo clínico dedican tiempo repetitivo a resolver dudas postoperatorias comunes.",
      "Las revisiones y controles dependen de seguimiento manual disperso.",
      "Es más difícil detectar rápido incidencias o falta de adherencia al tratamiento.",
    ],
    solutionTitle: "Cómo trabaja Clinvetia el seguimiento postoperatorio",
    solutionPoints: [
      "Automatiza recordatorios e hitos de revisión tras cirugía.",
      "Mantiene al propietario mejor orientado durante la recuperación.",
      "Reduce preguntas repetitivas y seguimiento manual desde recepción.",
      "Conecta mejor controles, revisiones y señales que requieren atención.",
    ],
    useCasesTitle: "Casos donde más se nota",
    useCases: [
      { title: "Cirugías programadas", description: "Mejora el seguimiento tras esterilizaciones, odontología o intervenciones comunes." },
      { title: "Controles de medicación", description: "Refuerza adherencia y reduce olvidos después de la cirugía." },
      { title: "Revisiones postoperatorias", description: "Ayuda a ordenar mejor las citas y controles posteriores." },
    ],
    benefitsTitle: "Beneficios para la clínica y el propietario",
    benefits: [
      "Menos carga manual en seguimiento postcirugía.",
      "Mejor experiencia para propietarios que necesitan guía clara.",
      "Más orden en revisiones y controles postoperatorios.",
      "Más capacidad para detectar incidencias y reaccionar antes.",
    ],
    faqTitle: "Preguntas frecuentes sobre seguimiento postoperatorio veterinario",
    faqs: [
      {
        question: "¿Automatizar el postoperatorio despersonaliza la atención?",
        answer: "No. El objetivo es asegurar continuidad y liberar tiempo para que el equipo intervenga donde sí hace falta criterio clínico.",
      },
      {
        question: "¿Sirve solo para grandes cirugías?",
        answer: "No. También aporta mucho valor en procedimientos frecuentes donde el volumen de seguimiento es alto.",
      },
      {
        question: "¿Puede mejorar la adherencia del propietario?",
        answer: "Sí. Los recordatorios y la comunicación ordenada suelen reducir olvidos y dudas repetitivas.",
      },
      {
        question: "¿Se conecta con revisiones y agenda?",
        answer: "Sí. La clave es que el seguimiento no viva aparte, sino conectado con citas, controles y operativa clínica.",
      },
    ],
    clusterLinks: [
      { href: "/recordatorios-veterinarios-automaticos", title: "Recordatorios veterinarios automáticos", description: "Amplía la parte de recordatorio y seguimiento recurrente." },
      { href: "/gestion-de-citas-veterinarias", title: "Gestión de citas veterinarias", description: "Conecta el postoperatorio con revisiones y agenda." },
      { href: "/recepcion-veterinaria-con-ia", title: "Recepción veterinaria con IA", description: "Reduce la carga repetitiva que cae en recepción." },
      { href: "/escenarios", title: "Escenarios reales", description: "Explora seguimientos postquirúrgicos dentro del contexto clínico." },
    ],
  },
  "recepcion-veterinaria-con-ia": {
    slug: "recepcion-veterinaria-con-ia",
    category: "operaciones",
    title: "Recepción veterinaria con IA para reducir carga manual y responder mejor",
    metaTitle: "Recepción veterinaria con IA para descargar trabajo operativo",
    metaDescription:
      "Descubre cómo una recepción veterinaria con IA ayuda a responder antes, clasificar consultas y descargar trabajo operativo repetitivo.",
    heroBadge: "Recepción veterinaria con IA",
    heroTitle: "Recepción veterinaria con IA para descargar trabajo y ordenar la atención",
    heroDescription:
      "Clinvetia ayuda a recepción a responder mejor, filtrar mejor y dedicar más tiempo a lo que sí requiere intervención humana.",
    intro:
      "La recepción veterinaria con IA tiene sentido cuando quita carga repetitiva sin romper la experiencia del propietario. No se trata de esconder al equipo, sino de ayudarle a responder antes y con más orden.",
    problemTitle: "Qué desgasta más a recepción",
    problemPoints: [
      "Llamadas y mensajes repetitivos sobre los mismos temas.",
      "Interrupciones constantes que dificultan la atención presencial.",
      "Consultas que se amontonan y generan respuesta tardía.",
      "Poca trazabilidad entre la conversación inicial y la cita final.",
    ],
    solutionTitle: "Cómo ayuda Clinvetia a recepción",
    solutionPoints: [
      "Responde preguntas frecuentes y primeras consultas.",
      "Clasifica necesidades antes de escalar o agendar.",
      "Reduce el volumen de tareas repetitivas que cae en el equipo.",
      "Mantiene mejor continuidad entre conversación, cita y seguimiento.",
    ],
    useCasesTitle: "Momentos de mayor valor",
    useCases: [
      { title: "Horas punta", description: "Reduce cuello de botella cuando entran muchas consultas a la vez." },
      { title: "Fuera de horario", description: "Evita pérdida de consultas cuando recepción no está disponible." },
      { title: "Confirmaciones y seguimiento", description: "Quita tareas repetitivas que consumen tiempo operativo." },
    ],
    benefitsTitle: "Beneficios operativos",
    benefits: [
      "Menos saturación en recepción.",
      "Más velocidad de respuesta al propietario.",
      "Menos tareas repetitivas y más foco humano donde aporta valor.",
      "Más orden entre atención, agenda y seguimiento.",
    ],
    faqTitle: "Preguntas frecuentes sobre recepción veterinaria con IA",
    faqs: [
      {
        question: "¿Sustituye a recepción?",
        answer: "No. La idea es descargar trabajo repetitivo y mejorar tiempos de respuesta, no eliminar la intervención humana donde hace falta.",
      },
      {
        question: "¿Ayuda en horas punta?",
        answer: "Sí. Ahí es donde más valor suele aportar, porque evita acumulación de mensajes sin atender.",
      },
      {
        question: "¿Puede clasificar consultas?",
        answer: "Sí. Esa clasificación inicial reduce fricción y permite que recepción trabaje con más contexto.",
      },
      {
        question: "¿Sirve para clínicas pequeñas?",
        answer: "Sí. En equipos pequeños, cada minuto liberado en recepción tiene mucho impacto.",
      },
    ],
    clusterLinks: [
      { href: "/automatizacion-clinica-veterinaria", title: "Automatización clínica veterinaria", description: "Sitúa recepción dentro del sistema operativo completo." },
      { href: "/chatbot-para-clinicas-veterinarias", title: "Chatbot para clínicas veterinarias", description: "Compara conversación simple frente a operativa real." },
      { href: "/triaje-veterinario-con-ia", title: "Triaje veterinario con IA", description: "Profundiza en la clasificación inicial de consultas." },
      { href: "/demo", title: "Reservar demo", description: "Revisa cómo descargar trabajo de recepción en tu clínica." },
    ],
  },
}

export function getSeoLandingConfig(slug: string): SeoLandingConfig {
  const config = seoLandings[slug]

  if (!config) {
    throw new Error(`Unknown SEO landing: ${slug}`)
  }

  return config
}

export function getSeoLandingConfigs(): SeoLandingConfig[] {
  return Object.values(seoLandings).sort((a, b) => a.metaTitle.localeCompare(b.metaTitle, "es"))
}
