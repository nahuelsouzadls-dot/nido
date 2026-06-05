import { useState, useEffect, useCallback, useRef } from 'react';
import { getGastosMes, crearGasto, eliminarGasto } from '@/services/gastos';
import { registrarActividad } from '@/services/actividad';
import { notificarCompanero } from '@/services/notificaciones';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Gasto } from '@/types';

export function useGastos(mes: number, anio: number) {
  const { hogar, perfil } = useAuthStore();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!hogar) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getGastosMes(hogar.id, mes, anio);
      setGastos(data);
    } catch {
      setError('Error cargando gastos');
    } finally {
      setLoading(false);
    }
  }, [hogar, mes, anio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Sufijo único por instancia — mismo motivo que useFacturas.
  const instanceId = useRef(Math.random());
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  // Realtime: el compañero agrega un gasto y esta pantalla se actualiza.
  useEffect(() => {
    if (!hogar?.id) return;

    const hogarId = hogar.id;
    const channel = supabase
      .channel(`gastos-${hogarId}-${mes}-${anio}-${instanceId.current}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos',
          filter: `hogar_id=eq.${hogarId}`,
        },
        () => { cargarRef.current(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hogar?.id, mes, anio]);

  const agregar = useCallback(
    async (gasto: Omit<Gasto, 'id' | 'created_at' | 'hogar_id' | 'perfil' | 'categoria' | 'archivos'>) => {
      if (!hogar || !perfil) return;

      const nuevo = await crearGasto({ ...gasto, hogar_id: hogar.id });

      await registrarActividad({
        hogar_id: hogar.id,
        perfil_id: perfil.id,
        tipo: 'gasto_agregado',
        titulo: `${perfil.nombre} registró un gasto`,
        descripcion: `${gasto.descripcion} · $${gasto.monto.toLocaleString('es-UY')}`,
        metadata: { gasto_id: nuevo.id, monto: gasto.monto },
      });

      await notificarCompanero(
        hogar.id,
        perfil.id,
        `${perfil.nombre} registró un gasto`,
        `${gasto.descripcion} · $${gasto.monto.toLocaleString('es-UY')}`,
      );

      await cargar();
      return nuevo;
    },
    [hogar, perfil, cargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await eliminarGasto(id);
      setGastos((prev) => prev.filter((g) => g.id !== id));
    },
    [],
  );

  const totalMes = gastos.reduce((sum, g) => sum + g.monto, 0);

  return { gastos, loading, error, agregar, eliminar, recargar: cargar, totalMes };
}
