import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFacturasConEstado,
  crearFactura,
  actualizarFactura,
  pagarFactura,
  eliminarFactura,
  actualizarVencidas,
} from '@/services/facturas';
import { registrarActividad } from '@/services/actividad';
import { notificarCompanero } from '@/services/notificaciones';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Factura, Scope } from '@/types';

export function useFacturas(mes: number, anio: number, options?: { scope?: Scope }) {
  const scope = options?.scope ?? 'hogar';
  const { hogar, perfil } = useAuthStore();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!hogar) return;
    setLoading(true);
    try {
      // Solo actualizar vencidas para facturas del hogar (las personales no comparten estado)
      if (scope === 'hogar') await actualizarVencidas(hogar.id, mes, anio);
      const data = await getFacturasConEstado(hogar.id, mes, anio, scope);
      setFacturas(data);
    } finally {
      setLoading(false);
    }
  }, [hogar, mes, anio, scope]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Sufijo único por instancia: supabase.channel() reutiliza canales por nombre,
  // por lo que múltiples instancias del hook (index + facturas + modal) con el mismo
  // hogar/mes/anio entrarían en conflicto y .on() lanzaría si el canal ya está JOINED.
  const instanceId = useRef(Math.random());
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  // Realtime: se actualiza cuando el compañero paga o crea una factura.
  useEffect(() => {
    if (!hogar?.id) return;

    const hogarId = hogar.id;
    const channel = supabase
      .channel(`facturas-${hogarId}-${mes}-${anio}-${scope}-${instanceId.current}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facturas_pagos',
          filter: `hogar_id=eq.${hogarId}`,
        },
        () => { cargarRef.current(); },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facturas',
          filter: `hogar_id=eq.${hogarId}`,
        },
        () => { cargarRef.current(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hogar?.id, mes, anio, scope]);

  const crear = useCallback(
    async (factura: Omit<Factura, 'id' | 'created_at' | 'hogar_id' | 'responsable' | 'pago_actual' | 'activa'>) => {
      if (!hogar || !perfil) return;

      const nueva = await crearFactura({ ...factura, hogar_id: hogar.id });

      // Optimistic: add immediately so the list reflects the new invoice before the background refetch
      setFacturas((prev) => [...prev, { ...nueva, activa: true, pago_actual: undefined }]);

      // Background: activity, reconcile
      (async () => {
        if (factura.scope !== 'personal') {
          await registrarActividad({
            hogar_id: hogar.id,
            perfil_id: perfil.id,
            tipo: 'factura_creada',
            titulo: `${perfil.nombre} creó una factura`,
            descripcion: factura.nombre,
            metadata: { factura_id: nueva.id },
          }).catch(() => {});
        }
        await cargar().catch(() => {});
      })();

      return nueva;
    },
    [hogar, perfil, cargar],
  );

  const pagar = useCallback(
    async (facturaId: string, monto?: number) => {
      if (!hogar || !perfil) return;

      const factura = facturas.find((f) => f.id === facturaId);
      // Snapshot the previous pago_actual so we can revert if the network call fails
      const pagoAnterior = factura?.pago_actual ?? undefined;

      // Optimistic update: flip to 'pagada' before the network round-trip
      // so the UI responds instantly. cargar() at the end reconciles with
      // the real server state (including the generated id/timestamps).
      setFacturas((prev) =>
        prev.map((f) =>
          f.id !== facturaId
            ? f
            : {
                ...f,
                pago_actual: {
                  id: '__optimistic__',
                  factura_id: facturaId,
                  hogar_id: hogar.id,
                  mes,
                  anio,
                  monto: monto ?? null,
                  estado: 'pagada' as const,
                  pagado_por: perfil.id,
                  fecha_pago: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  pagador: perfil,
                },
              }
        )
      );

      try {
        await pagarFactura(facturaId, hogar.id, mes, anio, perfil.id, monto);

        // Facturas personales son privadas — no registrar actividad ni notificar
        if (factura?.scope !== 'personal') {
          await registrarActividad({
            hogar_id: hogar.id,
            perfil_id: perfil.id,
            tipo: 'factura_pagada',
            titulo: `${perfil.nombre} pagó ${factura?.nombre ?? 'una factura'}`,
            descripcion: monto ? `$${monto.toLocaleString('es-UY')}` : undefined,
            metadata: { factura_id: facturaId },
          });

          await notificarCompanero(
            hogar.id,
            perfil.id,
            `${perfil.nombre} pagó ${factura?.nombre ?? 'una factura'}`,
            monto ? `Monto: $${monto.toLocaleString('es-UY')}` : 'Factura pagada',
          );
        }
      } catch (e) {
        // Revert the optimistic update so the card goes back to its real state
        setFacturas((prev) =>
          prev.map((f) =>
            f.id !== facturaId ? f : { ...f, pago_actual: pagoAnterior }
          )
        );
        // Re-throw so the calling screen can show an error Alert
        throw e;
      } finally {
        // Always reconcile with server state — on success this replaces the
        // optimistic record; on failure this ensures we're back in sync.
        await cargar().catch(() => {});
      }
    },
    [hogar, perfil, facturas, mes, anio, cargar],
  );

  const editar = useCallback(
    async (
      id: string,
      updates: { nombre?: string; monto?: number | null; dia_vencimiento?: number; responsable_id?: string | null },
    ) => {
      // Optimistic update so the list reflects changes immediately
      setFacturas((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
      try {
        await actualizarFactura(id, updates);
      } catch (e) {
        await cargar().catch(() => {});
        throw e;
      }
    },
    [cargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      // Optimistic: remove from list immediately
      setFacturas((prev) => prev.filter((f) => f.id !== id));
      try {
        await eliminarFactura(id);
      } catch (e) {
        await cargar().catch(() => {});
        throw e;
      }
    },
    [cargar],
  );

  const pendientes = facturas.filter((f) => !f.pago_actual || f.pago_actual.estado === 'pendiente');
  const pagadas = facturas.filter((f) => f.pago_actual?.estado === 'pagada');
  const vencidas = facturas.filter((f) => f.pago_actual?.estado === 'vencida');
  const todasPagadas = facturas.length > 0 && pendientes.length === 0 && vencidas.length === 0;

  return { facturas, loading, crear, editar, pagar, eliminar, recargar: cargar, pendientes, pagadas, vencidas, todasPagadas };
}
