import { useState, useEffect, useCallback, useRef } from 'react';
import { getIngresosMes, crearIngreso, eliminarIngreso } from '@/services/ingresos';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Ingreso } from '@/types';

export function useIngresos(mes: number, anio: number) {
  const { hogar, perfil } = useAuthStore();
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!hogar || !perfil) return;
    setLoading(true);
    try {
      const data = await getIngresosMes(perfil.id, hogar.id, mes, anio);
      setIngresos(data);
    } finally {
      setLoading(false);
    }
  }, [hogar, perfil, mes, anio]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const instanceId = useRef(Math.random());
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    if (!hogar?.id || !perfil?.id) return;
    const hogarId = hogar.id;
    const channel = supabase
      .channel(`ingresos-${hogarId}-${mes}-${anio}-${instanceId.current}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ingresos', filter: `hogar_id=eq.${hogarId}` },
        () => { cargarRef.current(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hogar?.id, perfil?.id, mes, anio]);

  const agregar = useCallback(
    async (ingreso: { monto: number; descripcion?: string | null; categoria?: string | null; fecha: string }) => {
      if (!hogar || !perfil) return;
      const nuevo = await crearIngreso({ ...ingreso, user_id: perfil.id, hogar_id: hogar.id });
      await cargar();
      return nuevo;
    },
    [hogar, perfil, cargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await eliminarIngreso(id);
      setIngresos((prev) => prev.filter((i) => i.id !== id));
    },
    [],
  );

  const totalMes = ingresos.reduce((sum, i) => sum + i.monto, 0);

  return { ingresos, loading, agregar, eliminar, recargar: cargar, totalMes };
}
