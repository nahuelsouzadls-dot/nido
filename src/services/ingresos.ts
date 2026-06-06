import { supabase } from '@/lib/supabase';
import type { Ingreso } from '@/types';

export async function getIngresosMes(userId: string, hogarId: string, mes: number, anio: number) {
  const desde = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
  const hasta = new Date(anio, mes, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('ingresos')
    .select('*')
    .eq('user_id', userId)
    .eq('hogar_id', hogarId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data as Ingreso[];
}

export async function crearIngreso(ingreso: {
  user_id: string;
  hogar_id: string;
  monto: number;
  descripcion?: string | null;
  categoria?: string | null;
  fecha: string;
}) {
  const { data, error } = await supabase
    .from('ingresos')
    .insert(ingreso)
    .select()
    .single();

  if (error) throw error;
  return data as Ingreso;
}

export async function eliminarIngreso(id: string) {
  const { error } = await supabase.from('ingresos').delete().eq('id', id);
  if (error) throw error;
}
