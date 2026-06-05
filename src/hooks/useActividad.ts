import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getActividad } from '@/services/actividad';
import { useAuthStore } from '@/store/auth';
import type { Actividad } from '@/types';

export function useActividad() {
  const { hogar } = useAuthStore();
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!hogar) return;
    setLoading(true);
    try {
      const data = await getActividad(hogar.id);
      setActividad(data);
    } finally {
      setLoading(false);
    }
  }, [hogar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Sufijo único por instancia — mismo motivo que useFacturas/useGastos.
  const instanceId = useRef(Math.random());
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  // Suscripción en tiempo real.
  useEffect(() => {
    if (!hogar?.id) return;

    const hogarId = hogar.id;
    const channel = supabase
      .channel(`actividad-${hogarId}-${instanceId.current}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'actividad',
          filter: `hogar_id=eq.${hogarId}`,
        },
        async () => {
          await cargarRef.current();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hogar?.id]);

  return { actividad, loading, recargar: cargar };
}
