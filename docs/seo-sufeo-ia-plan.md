# Plan SEO con Sufeo.ia

## Objetivo

Usar `sufeo.ia` para construir una capa SEO clara, escalable y orientada a negocio sobre Clinvetia.

El objetivo no es solo atraer tráfico, sino captar búsquedas con intención comercial alta para:

- demos
- contacto comercial
- calculadora ROI
- páginas de solución

## Decisión de posicionamiento

Clinvetia ahora mezcla varias narrativas:

- software veterinario
- IA para clínicas veterinarias
- automatización clínica veterinaria
- agencia marketing veterinaria

Para SEO conviene ordenar eso en un árbol más claro.

### Posicionamiento principal

Keyword madre:

- `software veterinario con ia`

Keywords core secundarias:

- `software veterinario`
- `ia para clínicas veterinarias`
- `automatización clínica veterinaria`
- `agenda veterinaria con ia`
- `gestión de citas veterinarias`

### Posicionamiento comercial secundario

Cluster orientado a adquisición:

- `agencia marketing veterinaria`
- `marketing veterinario`
- `captación de clientes para clínicas veterinarias`
- `automatización de leads veterinaria`

### Regla editorial

No competir entre páginas por la misma intención.

Cada URL debe tener:

- una keyword principal
- 2-4 secundarias
- una intención clara
- un CTA principal único

## Keyword map recomendado

### Home `/`

Keyword principal:

- `software veterinario con ia`

Secundarias:

- `software veterinario`
- `ia para clínicas veterinarias`
- `automatización clínica veterinaria`

Objetivo:

- explicar categoría
- presentar propuesta de valor
- repartir autoridad a clusters

CTA principal:

- reservar demo

### `/solucion`

Keyword principal:

- `automatización clínica veterinaria`

Secundarias:

- `automatización de citas veterinarias`
- `software de recepción veterinaria`
- `automatización de atención al cliente veterinaria`

Objetivo:

- página producto/servicio
- explicar módulos y beneficios

CTA principal:

- demo

### `/como-funciona`

Keyword principal:

- `cómo automatizar una clínica veterinaria`

Secundarias:

- `cómo funciona la ia en una clínica veterinaria`
- `automatización de recepción veterinaria`

Objetivo:

- capturar búsquedas explicativas
- enlazar a solución y demo

CTA principal:

- ver demo

### `/agencia-marketing-veterinaria`

Keyword principal:

- `agencia marketing veterinaria`

Secundarias:

- `marketing veterinario`
- `captación de clientes veterinarios`
- `seguimiento comercial veterinario`

Objetivo:

- captar búsquedas BOFU orientadas a crecimiento

CTA principal:

- contacto

### `/calculadora`

Keyword principal:

- `roi software veterinario`

Secundarias:

- `calcular roi clínica veterinaria`
- `roi automatización veterinaria`

Objetivo:

- captación mid-funnel
- conversión a sesión/demo

CTA principal:

- calcular / reservar

### `/faqs`

Keyword principal:

- `preguntas frecuentes software veterinario con ia`

Secundarias:

- `precios software veterinario`
- `cómo implementar ia en clínica veterinaria`

Objetivo:

- capturar dudas preconversión
- activar rich results con schema FAQ

CTA principal:

- demo

### `/contacto`

Keyword principal:

- `demo software veterinario`

Secundarias:

- `reservar demo software veterinario`
- `contacto software veterinario`

Objetivo:

- conversión

CTA principal:

- enviar datos

## Nuevas páginas recomendadas

Estas son las primeras páginas que sí merece la pena crear con `sufeo.ia`.

### Cluster 1: software veterinario

- `/software-veterinario`
- `/software-veterinario-con-ia`
- `/agenda-veterinaria`
- `/gestion-de-citas-veterinarias`
- `/recepcion-veterinaria`

### Cluster 2: automatización

- `/automatizacion-clinica-veterinaria`
- `/automatizacion-de-consultas-veterinarias`
- `/automatizacion-de-recordatorios-veterinarios`
- `/triaje-veterinario-con-ia`

### Cluster 3: captación y marketing

- `/captacion-de-clientes-para-clinicas-veterinarias`
- `/marketing-para-clinicas-veterinarias`
- `/seguimiento-de-leads-veterinarios`
- `/automatizacion-de-leads-veterinaria`

### Cluster 4: comparativas BOFU

- `/software-veterinario-vs-recepcion-manual`
- `/ia-veterinaria-vs-whatsapp-manual`
- `/automatizacion-veterinaria-vs-call-center`

## Arquitectura recomendada

### Nivel 1

- Home
- Solución
- Cómo funciona
- Agencia marketing veterinaria
- FAQs
- Demo
- Contacto

### Nivel 2

- cluster software
- cluster automatización
- cluster marketing
- cluster comparativas

### Nivel 3

- páginas long-tail creadas por `sufeo.ia`

## Enlazado interno

Ahora mismo hay base, pero no una malla fuerte.

### Reglas

- Home enlaza a todas las páginas money
- cada página cluster enlaza a 3-5 páginas hermanas
- cada long-tail enlaza a:
  - su página pilar
  - `/demo`
  - `/contacto`
  - una comparativa o FAQ relevante

### Bloques a añadir

- breadcrumbs visibles
- bloque `Relacionado`
- bloque `Casos de uso relacionados`
- bloque `Preguntas frecuentes relacionadas`

## Mejoras técnicas prioritarias

### Prioridad 1

- consolidar el árbol duplicado de admin
- mantener una sola superficie canónica por ruta privada
- revisar consistencia de marca y usar siempre `Clinvetia`
- sustituir `lastModified: now` en sitemap por fechas reales o estables

### Prioridad 2

- añadir schema `FAQPage` en `/faqs`
- añadir schema `Service` o `Product` en `/solucion`
- añadir schema `BreadcrumbList` en landings principales
- mejorar OG images por plantilla

### Prioridad 3

- enriquecer snippets con FAQs inline en páginas BOFU
- preparar plantillas de páginas SEO para `sufeo.ia`
- definir taxonomía de anchors internos

## Metadata recomendada por patrón

### Patrón de title

- `{keyword principal} | Clinvetia`
- `{beneficio principal} para clínicas veterinarias | Clinvetia`

Evitar:

- titles demasiado genéricos
- titles duplicados entre páginas

### Patrón de description

- 140-160 caracteres
- keyword principal al inicio
- beneficio claro
- cierre con intención comercial

Ejemplo:

- `Software veterinario con IA para automatizar citas, consultas y seguimiento comercial en clínicas veterinarias. Reserva una demo con Clinvetia.`

## Schema recomendado

### Global

- `Organization`
- `WebSite`
- `SoftwareApplication`

### Por página

- `/faqs`: `FAQPage`
- `/solucion`: `Service` o `SoftwareApplication`
- `/como-funciona`: `WebPage`
- páginas comparativas: `Article` o `WebPage`
- páginas cluster: `BreadcrumbList`

## Plan editorial con Sufeo.ia

### Fase 1

- fijar 4 páginas pilar
- limpiar metadata y canónicas
- corregir arquitectura

### Fase 2

- crear 8-12 URLs cluster
- enlazarlas entre sí
- añadir schema

### Fase 3

- lanzar long-tail con `sufeo.ia`
- medir impresiones, CTR y páginas que empiezan a captar

### Fase 4

- reforzar páginas que ya rankean
- crear comparativas y páginas de intención BOFU

## Prioridad de ejecución

1. unificar naming de marca a `Clinvetia`
2. corregir sitemap y duplicidades de rutas privadas
3. añadir schema FAQ + Service + Breadcrumb
4. definir plantillas SEO para `sufeo.ia`
5. crear cluster inicial de 8-12 páginas
6. reforzar enlazado interno

## Qué no haría ahora

- generar decenas de páginas sin cluster claro
- atacar keywords demasiado genéricas sin intención
- indexar páginas legales o privadas con peso editorial artificial
- mezclar marketing y software en la misma URL objetivo

## Siguiente implementación recomendada

Primer bloque de cambios de código:

- normalizar marca en metadata
- mejorar sitemap
- añadir schema FAQPage en `/faqs`
- añadir schema Service en `/solucion`
- añadir breadcrumbs reutilizables

Después de eso:

- crear la primera plantilla SEO para `sufeo.ia`
