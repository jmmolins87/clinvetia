# 🗺️ ROADMAP: Clinvetia (AI Automation Agency)

> **Visión:** Plataforma SaaS para clínicas veterinarias que ofrece Agentes de IA de automatización.
> **Estilo Visual:** Glassmorphism Premium + Neon Glow (Futurista, limpio, tecnológico).
> **Stack:** Next.js (App Router), TypeScript, Tailwind, MongoDB, Docker.

---

## ✅ ESTADO ACTUAL (Fases 1 & 2)
*Cimientos del Frontend y entorno de desarrollo.*

- [x] **Inicialización del Proyecto:** Next.js + TypeScript + Tailwind CSS.
- [x] **Design Tokens (CSS):** Definición de variables CSS para temas Dark Neon y Light Frost (colores, gradientes, blurs).
- [x] **Theme Engine:** Implementación de `next-themes` para cambio de modo (oscuro/claro) persistente.
- [x] **Configuración de Storybook:**
    - [x] Integración con Vite para desarrollo rápido de componentes.
    - [x] Solución de alias `@/*` para imports absolutos.
    - [x] Carga de estilos globales en preview.

---

## 🚧 FASE 3: Design System "Neon Glass" (EN PROCESO)
*Transformación de componentes base (shadcn/ui) a la estética de la marca.*

### Átomos (Componentes Base)
- [ ] **Buttons:** Variantes con gradientes, "glow" al hover y efectos de borde luminoso.
- [ ] **Inputs & Textareas:** Superficies "frosted" (vidrio esmerilado) con anillos de enfoque neón.
- [ ] **Badges/Tags:** Estilo "Pill" con borde brillante para estados (ej: "Agente Activo").
- [ ] **Switch & Checkbox:** Controles con iluminación activa (efecto LED).

### Moléculas (Componentes Compuestos)
- [ ] **Glass Cards:** Contenedores translúcidos con bordes sutiles y sombras de color.
- [ ] **Dialogs/Modals:** Ventanas emergentes con `backdrop-blur` intenso.
- [ ] **Tabs:** Navegación interna estilo píldora flotante.
- [ ] **Toasts:** Notificaciones flotantes con estética cristalina.

---

## 📅 FASE 4: Arquitectura de Páginas (Frontend)
*Implementación de la estructura web basada en Clinvetia.*

### Landing Page (Pública)
- [ ] **Hero Section:** Título impactante con tipografía gradient y elementos 3D/Blur de fondo.
- [ ] **Features Grid:** Grid de tarjetas glass explicando los agentes (Citas, Seguimiento, Q&A).
- [ ] **Pricing:** Tablas de precios con la opción recomendada destacada con "Neon Glow".
- [ ] **Footer:** Navegación y legal.

### Dashboard (App Privada para Veterinarias)
- [ ] **Layout Shell:** Sidebar lateral colapsable (Glass) + Topbar.
- [ ] **Overview:** Gráficos (Recharts/Visx) estilizados con líneas neón mostrando métricas de los agentes.
- [ ] **Agent Config:** Formularios para configurar el comportamiento del bot.
- [ ] **Chat Logs:** Vista tipo chat para ver el historial de conversaciones de la IA con pacientes.

---

## 🔙 FASE 5: Backend & Base de Datos (MongoDB)
*Infraestructura de datos robusta y escalable.*

### Configuración DB
- [ ] **Docker Compose:** Configurar contenedor `mongo:latest` para desarrollo local con persistencia de volumen.
- [ ] **Mongoose Setup:** Configurar conexión en Next.js (con manejo de caché de conexiones para Serverless).
- [ ] **Esquemas de Datos (Schemas):**
    - `User` (Veterinarias, Roles).
    - `Agent` (Configuración de prompts, estado activo/inactivo).
    - `Conversation` (Logs de chats).
    - `Lead` (Datos capturados por el agente).

### API Routes (Server Actions / Route Handlers)
- [ ] CRUD para gestión de Agentes.
- [ ] Webhooks para integración con proveedores de IA (OpenAI/Anthropic).
- [ ] Endpoints protegidos.

---

## 🔐 FASE 6: Autenticación & Seguridad
- [ ] **Auth System:** Implementar Auth.js (NextAuth) v5 o Clerk.
    - Login social (Google) + Email/Password.
- [ ] **Middleware:** Protección de rutas `/dashboard` y API.
- [ ] **Role Based Access Control (RBAC):** Admin (Agencia) vs User (Veterinaria).

---

## 🚀 FASE 7: Despliegue & DevOps
- [ ] **Producción DB:** Migración de Docker local a **MongoDB Atlas**.
- [ ] **Variables de Entorno:** Configuración segura en Vercel (`.env.production`).
- [ ] **CI/CD:** Pipelines básicos para linting y build check antes de merge.
