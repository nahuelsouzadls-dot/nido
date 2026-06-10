# Nido — Guía para Claude Code

## ¿Qué es esto?

Nido es una app de gestión financiera para hogares compartidos (pareja / compañeros de cuarto). Permite llevar gastos del hogar, facturas, objetivos de ahorro, y un espacio de finanzas personales privado por usuario.

Plataformas: **iOS, Android y PWA** (React Native Web via Expo).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK 54 + expo-router v6 |
| UI | React Native + React Native Web |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Estado global | Zustand (`src/store/auth.ts`) |
| Tipado | TypeScript estricto |
| Fuente | Manrope (Google Fonts via `@expo-google-fonts/manrope`) |
| Temas | Dark/Light — `ThemeContext` + paletas en `src/theme/palettes.ts` |

---

## Estructura clave

```
app/
  (auth)/         login, onboarding
  (tabs)/         index (home), balance, facturas, objetivos, perfil
  modal/          gasto, factura, ingreso, objetivo, scan (OCR)
src/
  components/     GastoRow, MovimientoRow, FacturaCard, ObjetivoCard…
  components/ui/  sistema de diseño propio: ActionSheet, ConfirmDialog, Toast…
  hooks/          useGastos, useFacturas, useBalance, useMovimientosPersonales…
  services/       gastos.ts, facturas.ts, ocr.ts…
  store/          auth.ts (perfil, hogar, compañero)
  types/          index.ts — fuente única de verdad de tipos
  theme/          palettes.ts, animations.ts
supabase/
  migrations/     001…009 — aplicar en orden en Supabase SQL Editor
  functions/      send-push (Edge Function)
```

---

## Patrones importantes

### Scope dual
Cada `Gasto`, `Factura` y `Objetivo` tiene `scope: 'hogar' | 'personal'`. El contexto activo lo provee `SpaceContext` (`useSpace()`). La mayoría de hooks aceptan `{ scope }` como opción.

### Colores reactivos al tema
Nunca uses colores hardcodeados en JSX. Siempre `const colors = useColors()`. Las claves están en `src/constants/theme.ts`.

### Texto
Usa `Text as RNText` de React Native en componentes que renderizan en web. Evita el componente `<Text>` de UI propio si necesitás control fino de estilo.

### Cuotas
Un gasto en N cuotas genera N filas en la tabla `gastos`, todas con el mismo `cuotas_grupo_id` (UUID), y campos `cuota_numero` (1…N), `cuota_total` (N), `tarjeta`. El balance de cada mes refleja solo la cuota de ese mes — comportamiento intencional.

### Balance hogar
`useBalance(gastos, facturasPagadas)` recibe gastos del scope hogar + pagos de facturas. Devuelve quién le debe a quién. Solo soporta 50/50 en la UI actual (el hook acepta porcentaje pero no hay UI para configurarlo).

### OCR
`src/services/ocr.ts` usa `ocr.space` con la API key pública `helloworld`. Es un placeholder — en producción reemplazar por una key propia o cambiar el servicio.

---

## Comandos

```bash
npm start          # Expo dev server (iOS/Android/web)
npm run web        # Web en modo desarrollo
npm run build:web  # Export PWA (requiere variables de entorno)
npx tsc --noEmit   # Type check
```

### Variables de entorno requeridas
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## Migraciones Supabase

Están en `supabase/migrations/`. Se aplican manualmente en el SQL Editor de Supabase en orden numérico. La 009 (cuotas) aún puede estar pendiente de aplicar en producción.

---

## Convenciones

- **Sin comentarios obvios** — el código se explica con nombres. Solo comentar invariantes no evidentes.
- **Sin features no pedidas** — no agregar manejo de errores para casos imposibles, no diseñar para el futuro.
- **TypeScript sin `any`** — si algo no tiene tipo, agregarlo en `src/types/index.ts`.
- **Estilos** — siempre `StyleSheet.create()`, nunca objetos inline en props de estilo (excepto valores dinámicos del tema).
- **Queries Supabase** — siempre incluir `select('*', campos join)` explícito. No confiar en el default.
