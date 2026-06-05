import { supabase } from '@/lib/supabase';
import type { Actividad, ActividadTipo } from '@/types';

export async function getActividad(hogarId: string, limite = 30) {
  const { data, error } = await supabase
    .from('actividad')
    .select(`*, perfil:perfiles(id, nombre, avatar_url)`)
    .eq('hogar_id', hogarId)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data as Actividad[];
}

export async function registrarActividad(actividad: {
  hogar_id: string;
  perfil_id?: string;
  tipo: ActividadTipo;
  titulo: string;
  descripcion?: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from('actividad').insert(actividad);
  if (error) console.error('Error registrando actividad:', error);
}
