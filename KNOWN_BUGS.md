# Bugs conocidos — Nido

## Activos

### OCR — API key de demo en producción
**Archivo:** `src/services/ocr.ts:6`
**Problema:** La key `helloworld` es pública y tiene límite de 25.000 req/mes compartido con todos los que usan el plan gratuito de ocr.space. No es confiable para uso real.
**Fix:** Crear cuenta en ocr.space, obtener key propia y meterla en una variable de entorno `EXPO_PUBLIC_OCR_API_KEY`. Actualizar el servicio.

---

### Balance hogar — cuotas futuras no se ven
**Archivo:** `src/hooks/useBalance.ts`, `app/(tabs)/balance.tsx`
**Problema:** Al registrar una compra en 10 cuotas, el balance del mes actual solo refleja la cuota del mes 1. Las cuotas 2–10 existen en la BD pero no aparecen en ninguna vista hasta que llegue su mes. No hay forma de ver el compromiso total futuro.
**Workaround actual:** Ninguno. El comportamiento es correcto por diseño (cada mes paga su cuota), pero falta una vista de "compromisos futuros".

---

### Eliminar gasto en cuotas — no elimina el grupo
**Archivo:** `app/(tabs)/balance.tsx` (onLongPress en GastoRow), `src/services/gastos.ts`
**Problema:** Al eliminar una cuota, se elimina solo esa fila. Las otras N-1 cuotas del mismo `cuotas_grupo_id` quedan en la BD sin forma fácil de limpiarlas desde la UI.
**Fix pendiente:** Detectar si el gasto tiene `cuotas_grupo_id`, preguntar al usuario si quiere eliminar solo esa cuota o todo el grupo, y eliminar en consecuencia.

---

### Notificaciones — no funcionan en web
**Archivo:** `src/services/notificaciones.ts` / `notificaciones.native.ts`
**Problema:** El módulo tiene split de plataforma (`.native.ts` para móvil, `.ts` como stub para web). Las notificaciones push no se envían en la versión web/PWA.
**Estado:** Por diseño para web. En móvil tampoco están activas porque la Edge Function `send-push` no se invoca desde el flujo actual.

---

### `crypto.randomUUID()` — compatibilidad en RN antiguo
**Archivo:** `app/modal/gasto.tsx:129`
**Problema:** `crypto.randomUUID()` funciona bien en web y en RN con Hermes moderno (SDK 50+). En builds muy viejos o en simuladores con Hermes desactivado puede fallar.
**Estado:** No reproducible con Expo SDK 54 + Hermes. Monitorear si aparece en producción.

---

### Balance personal — facturas del hogar duplicadas
**Archivo:** `src/hooks/useResumenPersonal.ts`, `src/hooks/useMovimientosPersonales.ts`
**Problema:** Una factura del hogar pagada por el usuario actual reduce el disponible personal (correcto). Pero si esa misma factura también tiene un gasto personal vinculado (flujo del campo `factura_id` en gastos), podría contarse dos veces.
**Estado:** El flujo `despagar` limpia el gasto personal vinculado al despagar. Monitorear si se puede crear el estado doble desde otros paths.

---

## Resueltos recientemente

- ~~Auth callback fallaba en PWA~~ — fix en `868d252`
- ~~Alerts nativos en iOS/Android~~ — reemplazados por ConfirmDialog/ActionSheet en `30ac4d5`
- ~~Despagar factura no limpiaba el gasto personal vinculado~~ — fix en `be93272`
- ~~RLS de espacio personal no aislaba datos correctamente~~ — fix en `bcd9dc1` + `acc2b66`
