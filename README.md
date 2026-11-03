# Nido

**App de finanzas para hogares compartidos** (parejas y compañeros de cuarto). Permite llevar gastos del hogar, facturas y objetivos de ahorro en conjunto, con un espacio de finanzas personales privado para cada integrante.

Hecha con React Native + Expo, corre de forma nativa en **iOS, Android y web (PWA)** desde un solo código.

> _Tu hogar en tus manos._ Gestión compartida de gastos y facturas.

---

## Destacados

- **Un solo código, tres plataformas** — React Native + React Native Web con Expo SDK 54 y expo-router v6.
- **Modelo de scope dual** — cada gasto, factura y objetivo es `hogar` (compartido) o `personal` (privado), alternado desde un `SpaceContext` global.
- **Balance del hogar automático** — calcula quién le debe a quién a partir de los gastos compartidos y los pagos de facturas.
- **Gastos en cuotas** — una compra dividida en N cuotas genera N filas vinculadas; el balance de cada mes refleja solo la cuota de ese mes.
- **OCR de recibos** — sacás una foto del comprobante y precarga el gasto.
- **Bot de Telegram** — registrás gastos en lenguaje natural desde el chat, con palabras clave de categorías adaptadas a Uruguay.
- **Temas claro / oscuro** — paletas reactivas con una biblioteca de componentes propia.
- **Row-level security** — el aislamiento de datos se aplica en Postgres vía RLS de Supabase, no solo en el cliente.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK 54 · expo-router v6 |
| UI | React Native · React Native Web |
| Lenguaje | TypeScript (estricto, sin `any`) |
| Backend | Supabase — Postgres, Auth, Storage, RLS |
| Estado | Zustand |
| Edge | Supabase Edge Functions (push, bot de Telegram) |
| Fuente / temas | Manrope · paletas claro/oscuro propias |

## Notas de arquitectura

- **Design system primero** — una biblioteca de componentes propia (`src/components/ui/`) cubre botones, inputs, sheets, diálogos, toasts y más, para que las pantallas se armen con primitivas consistentes.
- **Hooks como capa de datos** — `useGastos`, `useFacturas`, `useBalance`, `useObjetivos`, etc. encapsulan las consultas a Supabase y aceptan la opción `scope`.
- **Única fuente de verdad de tipos** — todos los tipos del dominio viven en `src/types/`.
- **Migraciones SQL versionadas** — el esquema evoluciona con migraciones numeradas en `supabase/migrations/`.

```
app/        rutas (auth, tabs, modales) — expo-router
src/
  components/   features + ui (design system)
  hooks/        capa de datos sobre Supabase
  services/     llamadas a Supabase, OCR
  store/        Zustand (auth, hogar)
  context/      SpaceContext, ThemeContext
  types/        tipos del dominio
supabase/
  migrations/   SQL en orden
  functions/    Edge Functions
```

## Cómo arrancar

```bash
npm install
npm start        # Expo dev server (iOS / Android / web)
npm run web      # solo web
npx tsc --noEmit # type check
```

Requiere dos variables de entorno:

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Las migraciones de `supabase/migrations/` se aplican en orden numérico desde el SQL editor de Supabase.

---

Proyecto personal — desarrollado y mantenido por Nahuel Souza.
