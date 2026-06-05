import { supabase } from '@/lib/supabase';
import type { Objetivo, ObjetivoAporte } from '@/types';

export async function getObjetivos(hogarId: string) {
  const { data, error } = await supabase
    .from('objetivos')
    .select('*')
    .eq('hogar_id', hogarId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Objetivo[];
}

export async function crearObjetivo(objetivo: {
  hogar_id: string;
  nombre: string;
  descripcion?: string | null;
  monto_objetivo: number;
  fecha_objetivo?: string | null;
  icono: string;
}) {
  const { data, error } = await supabase
    .from('objetivos')
    .insert({ ...objetivo, monto_actual: 0, completado: false })
    .select()
    .single();

  if (error) throw error;
  return data as Objetivo;
}

export async function aportarObjetivo(objetivoId: string, perfilId: string, monto: number, nota?: string) {
  const { error: aporteError } = await supabase.from('objetivos_aportes').insert({
    objetivo_id: objetivoId,
    perfil_id: perfilId,
    monto,
    nota,
  });

  if (aporteError) throw aporteError;

  // Actualiza el monto actual sumando el aporte
  const { data: objetivo } = await supabase
    .from('objetivos')
    .select('monto_actual, monto_objetivo')
    .eq('id', objetivoId)
    .single();

  if (objetivo) {
    const nuevoMonto = (objetivo.monto_actual ?? 0) + monto;
    const completado = nuevoMonto >= objetivo.monto_objetivo;

    const { data, error } = await supabase
      .from('objetivos')
      .update({ monto_actual: nuevoMonto, completado })
      .eq('id', objetivoId)
      .select()
      .single();

    if (error) throw error;
    return data as Objetivo;
  }
}

export async function eliminarObjetivo(id: string) {
  const { error } = await supabase.from('objetivos').delete().eq('id', id);
  if (error) throw error;
}
