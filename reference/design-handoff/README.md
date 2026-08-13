# Handoff: Llamados — PWA de herramientas de servicio

## Overview
PWA personal mobile-first (visión a futuro: app nativa Android vía Capacitor/TWA) que reúne 3 herramientas de servicio en la Iglesia: Secretario, Gather (líder misional) y BautizApp, más Ajustes compartidos. Un solo usuario, sin multiusuario por ahora, pero con calidad de producto real.

## About the Design Files
Los archivos en este paquete son **referencias de diseño creadas en HTML** (Design Components) — prototipos que muestran la apariencia e interacción deseadas, no código de producción para copiar directamente. La tarea es **recrear estos diseños en el entorno del proyecto real** (React Native/Capacitor/PWA stack elegido) usando sus patrones y librerías establecidos, o si no existe entorno aún, elegir el framework más adecuado para una PWA instalable.

## Fidelity
**Alta fidelidad (hifi)**: colores, tipografía, espaciado e iconografía finales. Recrear pixel-perfect usando componentes nativos/PWA equivalentes.

## Screens / Views

### 1. Home / Dashboard (`#1a`)
- **Propósito**: resumen accionable de las 3 herramientas activas al abrir la app.
- **Layout**: contenedor 390×844 (referencia mobile), header oscuro (deep-water) con saludo + fecha + chips de llamamientos activos, banner offline opcional, tarjeta "Hoy" (próximas reuniones), lista de tarjetas de herramienta (Secretario/Gather/BautizApp) con barra de color lateral de 5px identificando cada herramienta, bottom nav fija de 5 destinos.
- **Componentes clave**:
  - Header: fondo `#0E3B43`, anillos concéntricos SVG opacidad .20 en la esquina (motivo Gather), título Fraunces 500 29px, chips `rgba(220,234,232,.16)` con borde `rgba(220,234,232,.28)`.
  - Banner offline: fondo `#F0E2C8`, borde `#E0CFAE`, texto `#7A5A20`, punto ámbar `#C08A3E`.
  - Tarjeta "Hoy": blanco, borde `#E4DBC7`, radio 20px, filas hora (tabular-nums, `#1B5560`, 13px 700) + título 15px 600 + subtítulo 13px `#6A7B77`.
  - Tarjetas de herramienta: blanco, radio 20px, barra izquierda 5px (Secretario `#1B5560`, Gather `#2F8F92`, BautizApp `#E07856`), badge numérico rojo `#A13F2E` para pendientes, semáforo de 3 puntos (sage/amber/alerta) en Gather.
  - Bottom nav: blanco, borde superior `#E4DBC7`, 5 columnas iguales, ítem activo en `ink`/`deep-water` + subrayado coral `#E07856` 3px, iconos línea 1.8px stroke, min-height 44px por ítem, padding inferior 26px (safe area).

### 2. Secretario → Hoy (`#1b`)
- **Propósito**: vista diaria del módulo Secretario.
- **Layout**: header `#1B5560` con back button, título Fraunces 24px, fila de chips horizontales scrolleable (Hoy/Agenda/Minutas/Asignaciones… — así se resuelven las 9 subsecciones sin saturar la nav global), lista "Reuniones de hoy" con timeline (hora + línea vertical + tarjeta), lista "Asignaciones que vencen" con checkboxes y badges de vencimiento por color (alerta/ámbar/completado con strikethrough).
- **Chips**: activo blanco sobre `#1B5560` texto deep-water 700; inactivo `rgba(247,241,228,.14)` borde `rgba(247,241,228,.24)`.
- **Badge "En curso"**: fondo `#F3E4D9` texto `#A6512F`.

### 3. Ajustes compartidos (`#1c`)
- **Propósito**: unidad, estaca/distrito, misión, obispo/líder misional, llamamientos activos — una sola vez, usados por las 3 herramientas.
- **Layout**: header deep-water simple, secciones agrupadas en tarjetas blancas con filas separadas por línea `#EFE7D6` (min-height 44px cada fila), toggles de llamamiento (verde `#2F8F92` activo / mist `#DCEAE8` inactivo) que determinan qué secciones aparecen en Secretario.

### 4. Ícono / Splash (`#1d`)
- Ícono: anillos concéntricos + punto central coral sobre disco linen, monocromo deep-water para adaptativo Android, versión clara para iOS, anillo reducido para favicon 32px.
- Splash: fondo `#0E3B43`, anillos grandes opacidad .16, wordmark Fraunces 500 34px, CTA "Instalar en pantalla de inicio".

### 5. Sistema de componentes (`#1e`)
Paleta completa, tipografía (Fraunces títulos / Karla cuerpo), botones (primario/acento/secundario/terciario/deshabilitado + FAB), badges de estado, inputs (default/focus/error, 52px alto), tarjeta base y bottom nav — ver archivo HTML para specs exactas inline.

## Interactions & Behavior
- Bottom nav: 5 destinos fijos (Inicio, Secretario, Gather, Bautizos, Ajustes); las 9 subsecciones de Secretario viven en chips horizontales dentro del módulo, no en la nav global.
- Toggles en Ajustes activan/desactivan secciones visibles en Secretario según llamamiento.
- Todo por toque — sin hover states como única señal, sin tooltips (pensado para futura versión Android nativa).
- Banner offline no bloqueante, aparece/desaparece según conectividad.
- Targets táctiles mínimo 44×44px en toda la UI.

## State Management
- Llamamientos activos del usuario (afecta secciones visibles de Secretario).
- Estado de conexión (online/offline, banner).
- Contadores de pendientes por herramienta (badges).
- Semáforo de progreso pastoral en Gather (3 estados por persona).

## Design Tokens
**Colores**: deep-water `#0E3B43`, water-mid `#1B5560`, living-teal `#2F8F92`, dawn-coral `#E07856` (acento), linen `#F7F1E4` (fondo), mist `#DCEAE8`, ink `#1E2C2A`, sage `#5F8F6B`, amber `#C08A3E`, alerta `#A13F2E`.
**Tipografía**: Fraunces (títulos/nombres, pesos 400–700) + Karla (UI/cuerpo, pesos 400–700), vía Google Fonts.
**Radios**: tarjetas 18–20px, botones 12px, chips/badges 999px/7-9px, ícono app 24-30px.
**Sombras**: tarjeta de teléfono `0 30px 60px -20px rgba(14,59,67,.35)`; FAB `0 8px 20px -6px rgba(224,120,86,.7)`.
**Nav inferior**: alto 56px + 26px safe-area inferior; indicador activo = línea 3px coral.

## Assets
Iconografía dibujada en SVG inline (stroke 1.8–2px, sin relleno) — reemplazar por set de iconos definitivo si se desea. Motivo de anillos concéntricos (marca Gather) dibujado en SVG, reutilizable como asset de marca.

## Files
- `Centro de Servicio.dc.html` — Design Component con las 5 pantallas/entregables (Home, Secretario→Hoy, Ajustes, Ícono/Splash, Sistema de componentes). Ábrelo en un navegador para ver el diseño renderizado.
