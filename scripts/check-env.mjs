/**
 * Validates that required environment variables are present and correctly formatted
 * before running expo export.
 *
 * - En Vercel: las variables vienen de Vercel Dashboard → ya están en process.env
 * - En local: las variables vienen del archivo .env → este script las carga primero
 *
 * Si falla, el build de Vercel se detiene con un mensaje claro.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

// Carga archivos .env en el mismo orden de prioridad que @expo/env
// (menor prioridad primero para que la mayor sobreescriba)
const mode = process.env.NODE_ENV || 'production';
const envFiles = [
  `.env`,
  `.env.${mode}`,
  `.env.local`,
  `.env.${mode}.local`,
];

for (const file of envFiles) {
  const filePath = join(projectRoot, file);
  if (!existsSync(filePath)) continue;

  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    // Solo setea si aún no está definida (no pisar las vars del entorno real)
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Validaciones requeridas
const required = [
  {
    key: 'EXPO_PUBLIC_SUPABASE_URL',
    validate: (v) => /^https?:\/\//i.test(v),
    hint: 'Debe empezar con https:// — ejemplo: https://abcdefgh.supabase.co',
  },
  {
    key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    validate: (v) => v.length > 10,
    hint: 'Debe ser la clave anon/public de Supabase → Project Settings → API',
  },
];

let hasErrors = false;

console.log('\n🔍 Verificando variables de entorno para el build web...\n');

for (const { key, validate, hint } of required) {
  const value = process.env[key];

  if (!value) {
    console.error(`❌ ${key} no está definida`);
    console.error(`   ${hint}`);
    hasErrors = true;
    continue;
  }

  if (!validate(value)) {
    console.error(`❌ ${key} tiene un valor inválido: "${value}"`);
    console.error(`   ${hint}`);
    hasErrors = true;
    continue;
  }

  // Preview seguro del valor (primeros y últimos caracteres)
  const preview = value.length > 30
    ? `${value.slice(0, 20)}...${value.slice(-6)}`
    : value;
  console.log(`✅ ${key} = ${preview}`);
}

if (hasErrors) {
  console.error('\n💥 Build abortado: corregí las variables de entorno');
  console.error('   Vercel: Settings → Environment Variables → habilitar para "Production"');
  console.error('   Local:  asegurate de tener un archivo .env con los valores correctos\n');
  process.exit(1);
}

console.log('\n✅ Variables de entorno válidas — iniciando build\n');
