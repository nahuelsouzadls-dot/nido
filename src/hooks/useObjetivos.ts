import { useState, useEffect, useCallback } from 'react';
import { getObjetivos, crearObjetivo, aportarObjetivo, eliminarObjetivo } from '@/services/objetivos';
import { registrarActividad } from '@/services/actividad';
import { notificarCompanero } from '@/services/notificaciones';
import { useAuthStore } from '@/store/auth';
import type { Objetivo, Scope } from '@/types';

export function useObjetivos(options?: { scope?: Scope }) {
  const scope = options?.scope ?? 'hogar';
  const { hogar, perfil } = useAuthStore();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!hogar) return;
    setLoading(true);
    try {
      const data = await getObjetivos(hogar.id, scope);
      setObjetivos(data);
    } finally {
      setLoading(false);
    }
  }, [hogar, scope]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = useCallback(
    async (objetivo: Omit<Objetivo, 'id' | 'created_at' | 'hogar_id' | 'monto_actual' | 'completado'>) => {
      if (!hogar || !perfil) return;

      const nuevo = await crearObjetivo({ ...objetivo, hogar_id: hogar.id });

      // Optimistic: add immediately
      setObjetivos((prev) => [nuevo, ...prev]);

      // Background: activity, reconcile
      (async () => {
        if (objetivo.scope !== 'personal') {
          await registrarActividad({
            hogar_id: hogar.id,
            perfil_id: perfil.id,
            tipo: 'objetivo_creado',
            titulo: `${perfil.nombre} creó un objetivo`,
            descripcion: objetivo.nombre,
            metadata: { objetivo_id: nuevo.id, monto: objetivo.monto_objetivo },
          }).catch(() => {});
        }
        await cargar().catch(() => {});
      })();

      return nuevo;
    },
    [hogar, perfil, cargar],
  );

  const aportar = useCallback(
    async (objetivoId: string, monto: number, nota?: string) => {
      if (!hogar || !perfil) return;

      const objetivo = objetivos.find((o) => o.id === objetivoId);
      const actualizado = await aportarObjetivo(objetivoId, perfil.id, monto, nota);

      // Objetivos personales son privados — no registrar actividad ni notificar
      if (scope !== 'personal') {
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
      }

      await cargar();
    },
    [hogar, perfil, objetivos, cargar, scope],
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
