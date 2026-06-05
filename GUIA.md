# Guía de instalación y configuración — Nido

Guía paso a paso para tener Nido funcionando en tu iPhone desde cero.
Tiempo estimado: 2-3 horas la primera vez.

---

## Parte 1 — Instalar herramientas en tu Mac

### 1.1 Node.js

Node es el motor que ejecuta todo el código JavaScript/TypeScript.

1. Abrí tu navegador y entrá a https://nodejs.org
2. Descargá la versión **LTS** (la que dice "Recommended For Most Users")
3. Abrí el instalador descargado y seguí los pasos
4. Verificá la instalación abriendo Terminal y escribiendo:
   ```
   node --version
   ```
   Debería mostrarte algo como `v20.x.x`

### 1.2 Expo CLI

Expo es el framework que usamos para construir la app.

Abrí Terminal y ejecutá:
```bash
npm install -g expo-cli eas-cli
```

Verificá:
```bash
expo --version
```

### 1.3 Git (si no lo tenés)

Abrí Terminal y escribí:
```bash
git --version
```
Si te pide instalarlo, aceptá. Si ya aparece una versión, podés saltearte esto.

---

## Parte 2 — Configurar Supabase

Supabase es el backend de Nido (base de datos, autenticación, archivos, tiempo real). Es gratuito.

### 2.1 Crear cuenta

1. Entrá a https://supabase.com
2. Hacé clic en "Start your project"
3. Creá una cuenta (podés usar GitHub o email)

### 2.2 Crear proyecto

1. Hacé clic en "New project"
2. Completá:
   - **Name**: Nido (o como quieras)
   - **Database Password**: elegí una contraseña fuerte y guardala
   - **Region**: elegí el más cercano (ej: `South America (São Paulo)`)
3. Hacé clic en "Create new project"
4. Esperá 2-3 minutos mientras Supabase configura todo

### 2.3 Obtener credenciales

1. Dentro de tu proyecto, hacé clic en el ícono de ⚙️ "Project Settings"
2. Seleccioná "API"
3. Copiá y guardá:
   - **Project URL**: algo como `https://abcdefgh.supabase.co`
   - **anon public**: clave que empieza con `eyJ...`

### 2.4 Crear las tablas

1. En el menú de la izquierda, hacé clic en "SQL Editor"
2. Hacé clic en "New query"
3. Abrí el archivo `supabase/migrations/001_schema_inicial.sql` de este proyecto
4. Copiá TODO el contenido y pegalo en el editor de Supabase
5. Hacé clic en "Run" (o presioná Ctrl+Enter / Cmd+Enter)
6. Deberías ver el mensaje "Success. No rows returned"

Si hay algún error, verificá que copiaste todo el archivo correctamente.

### 2.5 Configurar Storage

Los archivos (fotos de recibos, avatares) se guardan en Supabase Storage.

1. En el menú de la izquierda, hacé clic en "Storage"
2. Hacé clic en "New bucket"
3. Creá los siguientes buckets:

**Bucket 1:**
- Name: `archivos`
- Public bucket: ✅ Activado
- Hacé clic en "Create bucket"

**Bucket 2:**
- Name: `avatares`
- Public bucket: ✅ Activado
- Hacé clic en "Create bucket"

### 2.6 Configurar autenticación

1. En el menú, hacé clic en "Authentication" → "Providers"
2. Verificá que "Email" esté habilitado (viene por defecto)
3. Opcionalmente, en "Auth" → "Settings":
   - Desactivá "Enable email confirmations" para pruebas más fáciles
   - (Podés activarlo después para mayor seguridad)

### 2.7 Configurar Realtime

El Realtime ya está configurado en el SQL, pero verificamos:

1. Hacé clic en "Database" → "Replication"
2. Verificá que las tablas `actividad`, `gastos`, `facturas_pagos`, `objetivos` aparecen en la lista de publicación `supabase_realtime`

---

## Parte 3 — Configurar la aplicación

### 3.1 Instalar dependencias

Abrí Terminal, navegá a la carpeta del proyecto:
```bash
cd "/Volumes/EXT SSD/MAC/Desktop/appgastos"
```

Instalá todas las dependencias:
```bash
npm install
```

Esto descarga todos los paquetes necesarios. Puede tardar 3-5 minutos.

### 3.2 Configurar variables de entorno

1. En la carpeta del proyecto, encontrás el archivo `.env.example`
2. Copialo y renombralo a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Abrí `.env` con cualquier editor de texto y completá:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
   ```
   
   Reemplazá `TU_PROYECTO` con el ID de tu proyecto de Supabase y `TU_ANON_KEY_AQUI` con la clave `anon public` que copiaste antes.

### 3.3 Crear assets mínimos

Para que la app arranque necesitás las imágenes de ícono. Podés usar imágenes temporales:

1. Buscá cualquier imagen PNG en tu Mac
2. Copiala cuatro veces en la carpeta `assets/` con los nombres:
   - `icon.png`
   - `splash.png`
   - `adaptive-icon.png`
   - `notification-icon.png`

Después podés reemplazarlas por las imágenes finales.

---

## Parte 4 — Ejecutar la app

### Opción A: Expo Go (más fácil para empezar)

**Paso 1:** Instalá Expo Go en tu iPhone desde el App Store.

**Paso 2:** Asegurate de que tu iPhone y tu Mac están en la misma red WiFi.

**Paso 3:** Ejecutá en Terminal:
```bash
npx expo start
```

**Paso 4:** Verás un código QR en la terminal. Abrí la cámara de tu iPhone y escaneá el código QR.

**Paso 5:** Expo Go abrirá la app automáticamente.

> **Limitación de Expo Go**: las notificaciones push no funcionan en Expo Go. Para notificaciones, usá la Opción B.

### Opción B: Development Build (recomendado)

El Development Build es una versión de la app instalada directamente en tu iPhone, sin Expo Go. Soporta todas las funcionalidades.

**Requisitos:** Necesitás una cuenta gratuita de Expo en https://expo.dev

**Paso 1:** Creá cuenta en https://expo.dev

**Paso 2:** Iniciá sesión desde Terminal:
```bash
eas login
```

**Paso 3:** Configurá el proyecto:
```bash
eas build:configure
```
Seguí las instrucciones. Cuando pregunte por el platform, elegí `iOS`.

**Paso 4:** Compilá la app (esto demora ~15 minutos y corre en los servidores de Expo):
```bash
eas build --platform ios --profile development
```

**Paso 5:** Cuando termine, EAS te dará un link para descargar el archivo `.ipa`. Instalalo en tu iPhone usando la opción "Install" del link.

**Paso 6:** Para correr la app en desarrollo:
```bash
npx expo start --dev-client
```

### Opción C: TestFlight

Si querés la versión "final" instalada como cualquier app, sin ver código de desarrollo:

**Paso 1:** Necesitás una cuenta de Apple Developer ($99/año). Para uso privado, probablemente no vale la pena.

**Alternativa gratuita:** Expo Go + Development Builds son suficientes para uso personal.

---

## Parte 5 — Primera configuración de la app

### 5.1 Registrar las dos cuentas

**Persona A (por ejemplo, vos):**
1. Abrí la app en tu iPhone
2. Tocá "¿Primera vez? Creá una cuenta"
3. Ingresá tu nombre, email y contraseña
4. Tocá "Crear cuenta"

**Persona B (tu pareja):**
1. Abrí la app en el iPhone de tu pareja
2. Hacé lo mismo con su email y nombre

### 5.2 Crear el hogar

**Solo una persona hace esto (la primera):**
1. Después de crear la cuenta, aparece la pantalla de bienvenida
2. Tocá "Crear un hogar"
3. Escribí el nombre del hogar (ej: "Nuestro Nido")
4. Tocá "Crear hogar"

### 5.3 Compartir el código con tu pareja

1. Una vez creado el hogar, andá a la pestaña "Perfil"
2. Ahí vas a ver el código del hogar (el ID)
3. Copialo y mandáselo a tu pareja

### 5.4 Tu pareja se une al hogar

**La segunda persona:**
1. Después de crear su cuenta, aparece la pantalla de bienvenida
2. Tocá "Unirse a un hogar"
3. Pegá el código que le mandaste
4. Tocá "Unirse al hogar"

✅ ¡Listo! Ambos están en el mismo hogar y todo se sincroniza en tiempo real.

---

## Parte 6 — Configurar Push Notifications

Las notificaciones funcionan con Expo Push Notifications (gratuito, sin límite razonable para uso personal).

No necesitás configurar nada extra. Las notificaciones se activan automáticamente cuando cada persona abre la app por primera vez. La app pide permiso y registra el token.

Para verificar que funciona:
1. Asegurate de que los dos tengan la app abierta al menos una vez
2. Uno registra un gasto
3. El otro debería recibir una notificación

---

## Parte 7 — Configurar OCR (lectura de recibos)

El OCR usa OCR.space, que tiene un plan gratuito con 25.000 requests por mes. Para uso personal, es más que suficiente.

**Por defecto usa la clave de prueba `helloworld`**, que tiene límite menor. Para uso a largo plazo:

1. Registrate en https://ocr.space/ocrapi (es gratis)
2. Obtenés una API key personal con más capacidad
3. Abrí el archivo `src/services/ocr.ts`
4. En la línea que dice `const OCR_API_KEY = 'helloworld'`, reemplazá `helloworld` por tu clave

---

## Parte 8 — Deployar la Edge Function de Push

Si querés que las notificaciones funcionen en tiempo real entre los dos dispositivos:

**Paso 1:** Instalá Supabase CLI:
```bash
brew install supabase/tap/supabase
```

**Paso 2:** Iniciá sesión:
```bash
supabase login
```

**Paso 3:** Vinculá el proyecto (reemplazá con tu Project ID que aparece en la URL de Supabase):
```bash
supabase link --project-ref TU_PROJECT_ID
```

**Paso 4:** Desplegá la función:
```bash
supabase functions deploy send-push
```

---

## Parte 9 — Actualizaciones futuras

### Para actualizar el código

Cuando quieras hacer cambios:

1. Editá el código en tu Mac
2. Si estás usando Expo Go o Dev Client, los cambios se reflejan automáticamente al guardar (hot reload)
3. No necesitás recompilar la app

### Para actualizaciones que requieren nueva build

Si cambiás `app.json`, dependencias nativas, o configuración de Expo:
```bash
eas build --platform ios --profile development
```

### Para actualizar la base de datos

Si necesitás agregar tablas o campos:
1. Escribí el SQL en Supabase SQL Editor
2. Ejecutalo

---

## Problemas comunes

### "Unable to find expo in this project"
```bash
npm install
```

### "Error loading module" o pantalla en blanco
1. Verificá que `.env` existe y tiene los valores correctos
2. Reiniciá el servidor: `npx expo start --clear`

### "AuthApiError: Invalid login credentials"
El email o contraseña son incorrectos. Verificá que no haya espacios extra.

### Las notificaciones no llegan
- Verificá que la Edge Function esté desplegada
- Verificá que ambos tengan la app instalada (no solo Expo Go)
- Revisá que dieron permiso de notificaciones

### El OCR no detecta el monto
- Asegurate de que la foto esté bien iluminada y enfocada
- El recibo debe estar plano y en el encuadre completo
- Probá con el botón de "Registrar gasto" manualmente

---

## Costos

Todo esto corre **gratis** con los planes gratuitos:

| Servicio | Plan | Límite | Costo |
|---|---|---|---|
| Supabase | Free | 500MB DB, 1GB Storage, 2M reqs/mes | $0 |
| Expo | Free | Dev builds ilimitados | $0 |
| OCR.space | Free | 25.000 req/mes | $0 |
| Expo Push | Free | Sin límite razonable | $0 |

Para 2 personas con uso diario normal, nunca van a superar estos límites.

---

## Soporte

Si algo no funciona:
1. Revisá que todos los pasos estén completos
2. Ejecutá `npx expo start --clear` para limpiar la caché
3. Revisá los errores en la consola de Terminal
4. Revisá los logs en Supabase: "Logs" en el panel izquierdo
