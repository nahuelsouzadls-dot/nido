import { supabase } from '@/lib/supabase';
import type { Gasto, Scope } from '@/types';

export async function getGastosMes(hogarId: string, mes: number, anio: number, scope: Scope = 'hogar') {
  const desde = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
  const hasta = new Date(anio, mes, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('gastos')
    .select(`
      *,
      categoria:categorias(*),
      perfil:perfiles!pagado_por(id, nombre, avatar_url),
      archivos:gastos_archivos(*)
    `)
    .eq('hogar_id', hogarId)
    .eq('scope', scope)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data as Gasto[];
}

export async function crearGasto(gasto: {
  hogar_id: string;
  categoria_id: string | null;
  categoria_texto?: string | null;
  pagado_por: string;
  monto: number;
  descripcion: string;
  fecha: string;
  observaciones?: string | null;
  scope?: Scope;
}) {
  const { data, error } = await supabase
    .from('gastos')
    .insert(gasto)
    .select(`
      *,
      categoria:categorias(*),
      perfil:perfiles!pagado_por(id, nombre, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data as Gasto;
}

export async function eliminarGasto(id: string) {
  const { error } = await supabase.from('gastos').delete().eq('id', id);
  if (error) throw error;
}

export async function adjuntarFotoGasto(gastoId: string, uri: string) {
  const fileName = `gasto_${gastoId}_${Date.now()}.jpg`;
  const path = `gastos/${fileName}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('archivos')
    .upload(path, blob, { contentType: 'image/jpeg' });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('archivos').getPublicUrl(path);

  const { error } = await supabase.from('gastos_archivos').insert({
    gasto_id: gastoId,
    url: urlData.publicUrl,
    tipo: 'foto',
  });

  if (error) throw error;
  return urlData.publicUrl;
}
