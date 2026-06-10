import { supabase } from '@/lib/supabase';
import type { Factura, FacturaPago, Scope } from '@/types';

export async function getFacturasConEstado(hogarId: string, mes: number, anio: number, scope: Scope = 'hogar') {
  // Trae todas las facturas activas con su pago del mes actual
  const { data: facturas, error } = await supabase
    .from('facturas')
    .select(`
      *,
      responsable:perfiles!responsable_id(id, nombre, avatar_url)
    `)
    .eq('hogar_id', hogarId)
    .eq('activa', true)
    .eq('scope', scope)
    .order('dia_vencimiento', { ascending: true });

  if (error) throw error;

  // Trae los pagos de este mes
  const { data: pagos, error: pagosError } = await supabase
    .from('facturas_pagos')
    .select(`*, pagador:perfiles!pagado_por(id, nombre, avatar_url)`)
    .eq('hogar_id', hogarId)
    .eq('mes', mes)
    .eq('anio', anio);

  if (pagosError) throw pagosError;

  // Une facturas con sus pagos
  const facturasConEstado = (facturas as Factura[]).map((f) => {
    const pago = pagos?.find((p) => p.factura_id === f.id);
    return { ...f, pago_actual: pago ?? null };
  });

  return facturasConEstado;
}

export async function crearFactura(factura: {
  hogar_id: string;
  nombre: string;
  monto?: number | null;
  dia_vencimiento: number;
  responsable_id?: string | null;
  creado_por?: string | null;
  frecuencia?: 'mensual' | 'anual';
  scope?: Scope;
  num_cuotas?: number | null;
  tarjeta?: string | null;
  fecha_inicio?: string | null;
}) {
  const { data, error } = await supabase
    .from('facturas')
    .insert({ ...factura, activa: true })
    .select()
    .single();

  if (error) throw error;
  return data as Factura;
}

export async function pagarFactura(
  facturaId: string,
  hogarId: string,
  mes: number,
  anio: number,
  pagadoPor: string,
  monto?: number,
) {
  // Upsert del pago (crea o actualiza si ya existe)
  const { data, error } = await supabase
    .from('facturas_pagos')
    .upsert(
      {
        factura_id: facturaId,
        hogar_id: hogarId,
        mes,
        anio,
        monto,
        estado: 'pagada',
        pagado_por: pagadoPor,
        fecha_pago: new Date().toISOString(),
      },
      { onConflict: 'factura_id,mes,anio' },
    )
    .select()
    .single();

  if (error) throw error;
  return data as FacturaPago;
}

export async function actualizarFactura(
  id: string,
  updates: {
    nombre?: string;
    monto?: number | null;
    dia_vencimiento?: number;
    responsable_id?: string | null;
  },
) {
  const { error } = await supabase.from('facturas').update(updates).eq('id', id);
  if (error) throw error;
}

export async function resetearPagoFactura(facturaId: string, mes: number, anio: number) {
  const { error } = await supabase
    .from('facturas_pagos')
    .delete()
    .eq('factura_id', facturaId)
    .eq('mes', mes)
    .eq('anio', anio);
  if (error) throw error;
}

export async function eliminarFactura(id: string) {
  const { error } = await supabase.from('facturas').update({ activa: false }).eq('id', id);
  if (error) throw error;
}

// Marca como vencidas las facturas que pasaron su día de vencimiento sin pago registrado.
// Los upserts se ejecutan en paralelo para evitar el anti-patrón N+1 secuencial.
export async function actualizarVencidas(hogarId: string, mes: number, anio: number) {
  const hoy = new Date().getDate();

  const { data: facturas } = await supabase
    .from('facturas')
    .select('id, dia_vencimiento')
    .eq('hogar_id', hogarId)
    .eq('activa', true);

  if (!facturas) return;

  const vencidas = facturas.filter((f) => f.dia_vencimiento < hoy);
  if (vencidas.length === 0) return;

  await Promise.all(
    vencidas.map((f) =>
      supabase
        .from('facturas_pagos')
        .upsert(
          { factura_id: f.id, hogar_id: hogarId, mes, anio, estado: 'vencida' },
          { onConflict: 'factura_id,mes,anio', ignoreDuplicates: true },
        ),
    ),
  );
}
