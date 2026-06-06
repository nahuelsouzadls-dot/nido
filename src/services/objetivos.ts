import { supabase } from '@/lib/supabase';
import type { Objetivo, ObjetivoAporte, Scope } from '@/types';

export async function getObjetivos(hogarId: string, scope: Scope = 'hogar') {
  const { data, error } = await supabase
    .from('objetivos')
    .select('*')
    .eq('hogar_id', hogarId)
    .eq('scope', scope)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Objetivo[];
}

export async function crearObjetivo(objetivo: {
  hogar_id: string;
  user_id?: string | null;
  nombre: string;
  descripcion?: string | null;
  monto_objetivo: number;
  fecha_objetivo?: string | null;
  icono: string;
  scope?: Scope;
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
  // Operación atómica vía función SQL: inserta el aporte y actualiza monto_actual
  // en una sola transacción. Evita la race condition de SELECT → compute → UPDATE
  // cuando dos personas aportan al mismo objetivo simultáneamente.
  const { data, error } = await supabase.rpc('aportar_objetivo', {
    p_objetivo_id: objetivoId,
    p_perfil_id: perfilId,
    p_monto: monto,
    p_nota: nota ?? null,
  });

  if (error) throw error;
  return data as Objetivo;
}

export async function eliminarObjetivo(id: string) {
  const { error } = await supabase.from('objetivos').delete().eq('id', id);
  if (error) throw error;
}
