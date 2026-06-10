# Roadmap — Nido

## Implementado

### Core
- [x] Auth con Supabase (email + magic link) + callback web
- [x] Onboarding: crear hogar o unirse con código
- [x] Soporte usuario solo (sin compañero)
- [x] Tabs: Inicio, Balance, Facturas, Objetivos, Perfil
- [x] FAB contextual con acciones según tab activo

### Gastos del hogar
- [x] Registrar gasto (monto, descripción, categoría, quién pagó, foto)
- [x] Eliminar gasto
- [x] Categorías de gastos del hogar (CRUD)
- [x] OCR de tickets via ocr.space (pre-rellena monto y descripción)
- [x] Compras en cuotas: N cuotas mensuales con tarjeta asociada
- [x] `GastoRow` muestra info de cuota (Cuota N de M · Tarjeta)

### Espacio personal
- [x] Scope dual hogar/personal en gastos, facturas y objetivos
- [x] Ingresos personales (registrar, ver historial)
- [x] Balance personal: disponible = ingresos − gastos − facturas personales
- [x] `MovimientoRow` con cuotaInfo para gastos en cuotas
- [x] Privacidad: los datos personales son invisibles para el compañero (RLS)
- [x] `PrivacyBadge` en formularios del espacio personal

### Facturas
- [x] CRUD completo de facturas (crear, editar, eliminar)
- [x] Pagar / despagar factura del mes
- [x] Facturas mensuales y anuales
- [x] Facturas con monto fijo o variable
- [x] Scope hogar/personal en facturas
- [x] Facturas del hogar pagadas impactan balance hogar y balance personal del pagador

### Objetivos
- [x] CRUD de objetivos de ahorro
- [x] Aportes individuales hacia un objetivo
- [x] Progreso visual con barra
- [x] Scope hogar/personal en objetivos

### Balance hogar
- [x] Balance 50/50 por mes
- [x] Incluye gastos + pagos de facturas
- [x] Muestra quién le debe cuánto a quién
- [x] Historial de gastos del mes con `GastoRow`

### UI / DX
- [x] Sistema de temas dark/light con toggle (sin modo sistema)
- [x] Componentes propios: ActionSheet, ConfirmDialog, Toast, EmptyState, Badge
- [x] Fuente Manrope en todos los pesos
- [x] Tokens de animación (`src/theme/animations.ts`)
- [x] PWA: `app/+html.tsx`, build con `expo export --platform web`

---

## Pendiente / Próximo

### Alta prioridad
- [ ] **Edición de gasto** — el gasto solo se puede eliminar, no editar
- [ ] **Eliminar grupo de cuotas** — al eliminar una cuota, ofrecer eliminar todo el grupo
- [ ] **Aplicar migración 009** en producción (cuotas + tarjeta)
- [ ] **Reemplazar OCR key** — cambiar `helloworld` por key propia antes de tener usuarios reales

### Features
- [ ] **Navegación por mes** en Balance y Gastos (hoy está fijo en mes actual)
- [ ] **Historial de meses anteriores** — actualmente solo se ve el mes en curso
- [ ] **Configuración de porcentaje de balance** — el hook ya lo soporta, falta UI
- [ ] **Editar cuotas**: cambiar tarjeta o número de cuotas de un grupo
- [ ] **Notificaciones push** — scaffold existe (`services/notificaciones.native.ts`), falta activar y configurar la Edge Function `send-push`
- [ ] **Resumen anual** — gráficos de gasto por categoría, mes a mes
- [ ] **Exportar datos** (CSV / PDF)
- [ ] **Invitar compañero por link** — mejorar el flujo de join actual

### Nice to have
- [ ] Widget iOS/Android con disponible del mes
- [ ] Soporte para más de 2 personas en un hogar
- [ ] Recordatorio de facturas vencidas por push
- [ ] División de gasto específico (no solo 50/50 global)
