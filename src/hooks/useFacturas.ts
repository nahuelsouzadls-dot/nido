import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFacturasConEstado,
  crearFactura,
  pagarFactura,
  eliminarFactura,
  actualizarVencidas,
} from '@/services/facturas';
import { registrarActividad } from '@/services/actividad';
import { notificarCompanero } from '@/services/notificaciones';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Factura } from '@/types';

export function useFacturas(mes: number, anio: number) {
  const { hogar, perfil } = useAuthStore();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!hogar) return;
    setLoading(true);
    try {
      // Actualiza vencidas antes de cargar para que el estado sea correcto
      await actualizarVencidas(hogar.id, mes, anio);
      const data = await getFacturasConEstado(hogar.id, mes, anio);
      setFacturas(data);
    } finally {
      setLoading(false);
    }
  }, [hogar, mes, anio]);

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
      .channel(`facturas-${hogarId}-${mes}-${anio}-${instanceId.current}`)
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
  }, [hogar?.id, mes, anio]);

  const crear = useCallback(
    async (factura: Omit<Factura, 'id' | 'created_at' | 'hogar_id' | 'responsable' | 'pago_actual' | 'activa'>) => {
      if (!hogar || !perfil) return;

      const nueva = await crearFactura({ ...factura, hogar_id: hogar.id });

      await registrarActividad({
        hogar_id: hogar.id,
        perfil_id: perfil.id,
        tipo: 'factura_creada',
        titulo: `${perfil.nombre} creó una factura`,
        descripcion: factura.nombre,
        metadata: { factura_id: nueva.id },
      });

      await cargar();
      return nueva;
    },
    [hogar, perfil, cargar],
  );

  const pagar = useCallback(
    async (facturaId: string, monto?: number) => {
      if (!hogar || !perfil) return;

      const factura = facturas.find((f) => f.id === facturaId);
      await pagarFactura(facturaId, hogar.id, mes, anio, perfil.id, monto);

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

      await cargar();
    },
    [hogar, perfil, facturas, mes, anio, cargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      await eliminarFactura(id);
      await cargar();
    },
    [cargar],
  );

  const pendientes = facturas.filter((f) => !f.pago_actual || f.pago_actual.estado === 'pendiente');
  const pagadas = facturas.filter((f) => f.pago_actual?.estado === 'pagada');
  const vencidas = facturas.filter((f) => f.pago_actual?.estado === 'vencida');
  const todasPagadas = facturas.length > 0 && pendientes.length === 0 && vencidas.length === 0;

  return { facturas, loading, crear, pagar, eliminar, recargar: cargar, pendientes, pagadas, vencidas, todasPagadas };
}
