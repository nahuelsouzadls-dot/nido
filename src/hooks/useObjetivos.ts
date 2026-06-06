import { useState, useEffect, useCallback } from 'react';
import { getObjetivos, crearObjetivo, aportarObjetivo, eliminarObjetivo } from '@/services/objetivos';
import { registrarActividad } from '@/services/actividad';
import { notificarCompanero } from '@/services/notificaciones';
import { useAuthStore } from '@/store/auth';
import type { Objetivo } from '@/types';

export function useObjetivos() {
  const { hogar, perfil } = useAuthStore();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!hogar) return;
    setLoading(true);
    try {
      const data = await getObjetivos(hogar.id);
      setObjetivos(data);
    } finally {
      setLoading(false);
    }
  }, [hogar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = useCallback(
    async (objetivo: Omit<Objetivo, 'id' | 'created_at' | 'hogar_id' | 'monto_actual' | 'completado'>) => {
      if (!hogar || !perfil) return;

      const nuevo = await crearObjetivo({ ...objetivo, hogar_id: hogar.id });

      await registrarActividad({
        hogar_id: hogar.id,
        perfil_id: perfil.id,
        tipo: 'objetivo_creado',
        titulo: `${perfil.nombre} creó un objetivo`,
        descripcion: objetivo.nombre,
        metadata: { objetivo_id: nuevo.id, monto: objetivo.monto_objetivo },
      });

      await cargar();
      return nuevo;
    },
    [hogar, perfil, cargar],
  );

  const aportar = useCallback(
    async (objetivoId: string, monto: number, nota?: string) => {
      if (!hogar || !perfil) return;

      const objetivo = objetivos.find((o) => o.id === objetivoId);
      const actualizado = await aportarObjetivo(objetivoId, perfil.id, monto, nota);

      if (actualizado?.completado && !objetivo?.completado) {
        await registrarActividad({
          hogar_id: hogar.id,
          perfil_id: perfil.id,
          tipo: 'objetivo_completado',
          titulo: `Completaron el objetivo "${objetivo?.nombre}"`,
          descripcion: `Meta: $${objetivo?.monto_objetivo.toLocaleString('es-UY')}`,
        });

        await notificarCompanero(
          hogar.id,
          perfil.id,
          `Objetivo completado`,
          `Completaron "${objetivo?.nombre}"`,
        );
      } else {
        await registrarActividad({
          hogar_id: hogar.id,
          perfil_id: perfil.id,
          tipo: 'aporte_objetivo',
          titulo: `${perfil.nombre} aportó al objetivo`,
          descripcion: `${objetivo?.nombre} · $${monto.toLocaleString('es-UY')}`,
        });
      }

      await cargar();
    },
    [hogar, perfil, objetivos, cargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await eliminarObjetivo(id);
      await cargar();
    },
    [cargar],
  );

  return { objetivos, loading, crear, aportar, eliminar, recargar: cargar };
}
