// Supabase Edge Function — bot de Telegram para registro rápido de gastos
// Deploy: supabase functions deploy telegram-bot --no-verify-jwt --project-ref njdirubtwpukwdohugvw
// Formatos soportados:
//   Gasto rápido:      "200 coca"
//   Extracto ASCII:    pegar líneas del banco (formato fijo de cuenta corriente)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_API = 'https://api.telegram.org/bot';

// ─── Categorías ──────────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Supermercado: ['super', 'supermercado', 'coto', 'disco', 'jumbo', 'carrefour', 'dia', 'verduleria', 'almacen', 'mercado', 'chino'],
  Hogar:        ['ferreteria', 'limpieza', 'pintura', 'mueble', 'deco', 'ikea', 'homecenter'],
  Servicios:    ['luz', 'gas', 'agua', 'internet', 'telefono', 'streaming', 'spotify', 'netflix', 'suscripcion', 'suscripción'],
  Transporte:   ['uber', 'taxi', 'sube', 'colectivo', 'remis', 'nafta', 'combustible', 'tren', 'subte', 'peaje'],
  Mascotas:     ['veterinaria', 'vet', 'vacuna', 'pet', 'perro', 'gato', 'arena'],
  Salidas:      ['cafe', 'café', 'pizza', 'coca', 'cerveza', 'resto', 'restaurant', 'restaurante', 'almuerzo', 'cena', 'desayuno', 'mcdonald', 'burger', 'sushi', 'bar', 'helado', 'delivery', 'rappi', 'pedidosya', 'medialunas', 'empanadas', 'facturas'],
  Salud:        ['farmacia', 'medicamento', 'medicina', 'doctor', 'medico', 'médico', 'consulta', 'clinica', 'clínica', 'dentista', 'turno'],
};

function detectCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return 'Otros';
}

// ─── Parser gasto rápido ──────────────────────────────────────────────────────

function parseQuickExpense(text: string): { monto: number; descripcion: string } | null {
  const clean = text.trim().replace(',', '.');
  const match = clean.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!match) return null;
  const monto = parseFloat(match[1]);
  if (isNaN(monto) || monto <= 0) return null;
  return { monto, descripcion: match[2].trim() };
}

// ─── Parser extracto ASCII ────────────────────────────────────────────────────

const MONTHS: Record<string, string> = {
  ENE: '01', FEB: '02', MAR: '03', ABR: '04',
  MAY: '05', JUN: '06', JUL: '07', AGO: '08',
  SEP: '09', OCT: '10', NOV: '11', DIC: '12',
};

type BankLine = { fecha: string; monto: number; descripcion: string; tipo: 'gasto' | 'ingreso' };

// Formato: 7 chars ID + 4 chars código + 7 chars fecha (DDMMMYY) + débito (17 chars) + crédito (15 chars) + descripción
const BANK_LINE_RE = /^\d{7}[A-Z0-9]{4}(\d{2}[A-Z]{3}\d{2})(\d+\.\d{2})(\d+\.\d{2})(.+)$/;

function parseAsciiDate(raw: string): string {
  const day = raw.slice(0, 2);
  const mon = MONTHS[raw.slice(2, 5)] ?? '01';
  const year = `20${raw.slice(5, 7)}`;
  return `${year}-${mon}-${day}`;
}

function parseBankStatement(text: string): BankLine[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: BankLine[] = [];

  for (const line of lines) {
    const match = line.match(BANK_LINE_RE);
    if (!match) continue;

    const [, rawDate, rawDebit, rawCredit, rawDesc] = match;
    const debit  = parseFloat(rawDebit);
    const credit = parseFloat(rawCredit);

    if (debit > 0) {
      results.push({ fecha: parseAsciiDate(rawDate), monto: debit,  descripcion: rawDesc.trim(), tipo: 'gasto' });
    } else if (credit > 0) {
      results.push({ fecha: parseAsciiDate(rawDate), monto: credit, descripcion: rawDesc.trim(), tipo: 'ingreso' });
    }
  }

  return results;
}

function isBankStatement(text: string): boolean {
  return text.split('\n').some((line) => BANK_LINE_RE.test(line.trim()));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

async function sendMessage(token: string, chatId: string, text: string) {
  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretToken !== Deno.env.get('TELEGRAM_SECRET_TOKEN')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const message = body?.message;
    if (!message?.text) return new Response('ok', { status: 200 });

    const chatId = String(message.chat.id);
    if (chatId !== Deno.env.get('TELEGRAM_ALLOWED_CHAT_ID')) return new Response('ok', { status: 200 });

    const token = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const text = message.text.trim();

    // Comandos
    if (text === '/start' || text === '/ayuda' || text === '/help') {
      await sendMessage(token, chatId,
        '👋 <b>Nido Bot</b>\n\n' +
        '<b>Gasto rápido:</b>\n<code>200 coca</code>\n<code>1500 supermercado coto</code>\n\n' +
        '<b>Extracto bancario:</b>\nPegá las líneas del extracto ASCII directamente y registro todos los débitos.',
      );
      return new Response('ok', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const hogarId  = Deno.env.get('NIDO_HOGAR_ID');
    const userId   = Deno.env.get('NIDO_USER_ID');

    // ── Extracto ASCII ────────────────────────────────────────────────────────
    if (isBankStatement(text)) {
      const lines = parseBankStatement(text);

      if (lines.length === 0) {
        await sendMessage(token, chatId, '⚠️ Detecté un extracto pero no encontré movimientos.');
        return new Response('ok', { status: 200 });
      }

      const fechas  = lines.map((l) => l.fecha);
      const fechaMin = fechas.reduce((a, b) => (a < b ? a : b));
      const fechaMax = fechas.reduce((a, b) => (a > b ? a : b));

      // Traer facturas activas para detectar solapamientos en gastos
      const { data: facturas } = await supabase
        .from('facturas')
        .select('nombre')
        .eq('hogar_id', hogarId)
        .eq('activa', true);

      const facturaNames = (facturas ?? []).map((f: { nombre: string }) =>
        f.nombre.toLowerCase().replace(/\s+/g, ''),
      );

      // Sets de claves "monto|fecha" para deduplicar gastos e ingresos
      const [{ data: gastosExistentes }, { data: ingresosExistentes }] = await Promise.all([
        supabase.from('gastos').select('monto, fecha').eq('pagado_por', userId).gte('fecha', fechaMin).lte('fecha', fechaMax),
        supabase.from('ingresos').select('monto, fecha').eq('user_id', userId).gte('fecha', fechaMin).lte('fecha', fechaMax),
      ]);

      const gastosSet = new Set(
        (gastosExistentes ?? []).map((g: { monto: number; fecha: string }) =>
          `${parseFloat(String(g.monto)).toFixed(2)}|${g.fecha}`,
        ),
      );
      const ingresosSet = new Set(
        (ingresosExistentes ?? []).map((i: { monto: number; fecha: string }) =>
          `${parseFloat(String(i.monto)).toFixed(2)}|${i.fecha}`,
        ),
      );

      const nuevosGastos:   BankLine[] = [];
      const nuevosIngresos: BankLine[] = [];
      const omitidas: string[] = [];

      for (const line of lines) {
        const key      = `${line.monto.toFixed(2)}|${line.fecha}`;
        const descNorm = line.descripcion.toLowerCase().replace(/\s+/g, '');

        if (line.tipo === 'gasto') {
          if (gastosSet.has(key)) { omitidas.push(`ya registrado: ${line.descripcion.slice(0, 25)}`); continue; }
          const facturaMatch = facturaNames.find((fn) => descNorm.includes(fn) || fn.includes(descNorm.slice(0, 4)));
          if (facturaMatch) {
            omitidas.push(`factura "${facturas!.find((f: { nombre: string }) => f.nombre.toLowerCase().replace(/\s+/g, '') === facturaMatch)?.nombre}"`);
            continue;
          }
          nuevosGastos.push(line);
        } else {
          if (ingresosSet.has(key)) { omitidas.push(`ingreso ya registrado: ${line.descripcion.slice(0, 25)}`); continue; }
          nuevosIngresos.push(line);
        }
      }

      if (nuevosGastos.length === 0 && nuevosIngresos.length === 0) {
        const detalle = omitidas.map((o) => `  • ${o}`).join('\n');
        await sendMessage(token, chatId, `ℹ️ Todo ya estaba registrado.\n\n${detalle}`);
        return new Response('ok', { status: 200 });
      }

      // Insertar gastos e ingresos en paralelo
      const inserts: Promise<{ error: unknown }>[] = [];

      if (nuevosGastos.length > 0) {
        inserts.push(supabase.from('gastos').insert(
          nuevosGastos.map((l) => ({
            hogar_id:        hogarId,
            pagado_por:      userId,
            monto:           l.monto,
            descripcion:     l.descripcion,
            fecha:           l.fecha,
            scope:           'personal',
            categoria_id:    null,
            categoria_texto: detectCategory(l.descripcion),
          })),
        ));
      }

      if (nuevosIngresos.length > 0) {
        inserts.push(supabase.from('ingresos').insert(
          nuevosIngresos.map((l) => ({
            user_id:     userId,
            hogar_id:    hogarId,
            monto:       l.monto,
            descripcion: l.descripcion,
            categoria:   null,
            fecha:       l.fecha,
          })),
        ));
      }

      const results = await Promise.all(inserts);
      const insertError = results.find((r) => r.error);
      if (insertError) {
        console.error('Insert error:', insertError.error);
        await sendMessage(token, chatId, '⚠️ Error al guardar algunos movimientos. Intentá de nuevo.');
        return new Response('ok', { status: 200 });
      }

      let reply = '';

      if (nuevosGastos.length > 0) {
        const totalGastos = nuevosGastos.reduce((acc, l) => acc + l.monto, 0);
        const resumenGastos = nuevosGastos.map((l) => `  • $${l.monto.toFixed(2)} ${l.descripcion.slice(0, 28)}`).join('\n');
        reply += `💸 <b>${nuevosGastos.length} gasto${nuevosGastos.length > 1 ? 's' : ''}</b>\n${resumenGastos}\n<b>Total: $${totalGastos.toFixed(2)}</b>`;
      }

      if (nuevosIngresos.length > 0) {
        const totalIngresos = nuevosIngresos.reduce((acc, l) => acc + l.monto, 0);
        const resumenIngresos = nuevosIngresos.map((l) => `  • $${l.monto.toFixed(2)} ${l.descripcion.slice(0, 28)}`).join('\n');
        if (reply) reply += '\n\n';
        reply += `💰 <b>${nuevosIngresos.length} ingreso${nuevosIngresos.length > 1 ? 's' : ''}</b>\n${resumenIngresos}\n<b>Total: $${totalIngresos.toFixed(2)}</b>`;
      }

      if (omitidas.length > 0) {
        reply += `\n\n<i>Omitidos (${omitidas.length})</i>`;
      }

      await sendMessage(token, chatId, `✅ <b>Registrado</b>\n\n${reply}`);
      return new Response('ok', { status: 200 });
    }

    // ── Gasto rápido ──────────────────────────────────────────────────────────
    const parsed = parseQuickExpense(text);
    if (!parsed) {
      await sendMessage(token, chatId, '❌ No entendí. Formato: <code>200 coca</code>');
      return new Response('ok', { status: 200 });
    }

    const { monto, descripcion } = parsed;
    const categoria = detectCategory(descripcion);
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('gastos').insert({
      hogar_id:        hogarId,
      pagado_por:      userId,
      monto,
      descripcion,
      fecha:           today,
      scope:           'personal',
      categoria_id:    null,
      categoria_texto: categoria,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      await sendMessage(token, chatId, '⚠️ Error al guardar el gasto. Intentá de nuevo.');
      return new Response('ok', { status: 200 });
    }

    await sendMessage(token, chatId,
      `✅ <b>Gasto registrado</b>\n\n💰 $${monto} · ${categoria}\n📝 ${descripcion}\n📅 ${formatDate(today)}`,
    );

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Unhandled error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
