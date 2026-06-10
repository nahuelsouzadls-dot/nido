import { useMemo } from 'react';
import { useGastos } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';
import { useFacturas } from '@/hooks/useFacturas';

export type Movimiento = {
  id: string;
  tipo: 'ingreso' | 'egreso';
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string | null;
  cuotaInfo?: string;   // "Cuota 3 de 10 · Visa Itaú"
};

export function useMovimientosPersonales(mes: number, anio: number) {
  const { ingresos, loading: loadingIngresos } = useIngresos(mes, anio);
  const { gastos, loading: loadingGastos } = useGastos(mes, anio, { scope: 'personal' });
  const { facturas: facturasPersonales } = useFacturas(mes, anio, { scope: 'personal' });

  const movimientos = useMemo<Movimiento[]>(() => {
    const ingresosMov: Movimiento[] = ingresos.map((i) => ({
      id: i.id,
      tipo: 'ingreso',
      descripcion: i.descripcion ?? 'Ingreso',
      monto: i.monto,
      fecha: i.fecha,
      categoria: i.categoria,
    }));

    const egresosMov: Movimiento[] = gastos.map((g) => {
      let cuotaInfo: string | undefined;
      if (g.cuota_numero && g.cuota_total) {
        cuotaInfo = `Cuota ${g.cuota_numero} de ${g.cuota_total}`;
        if (g.tarjeta) cuotaInfo += ` · ${g.tarjeta}`;
      }
      return {
        id: g.id,
        tipo: 'egreso',
        descripcion: g.descripcion,
        monto: g.monto,
        fecha: g.fecha,
        categoria: g.categoria_texto ?? g.categoria?.nombre ?? null,
        cuotaInfo,
      };
    });

    // Facturas personales pagadas este mes como egresos.
    // Solo se incluyen si tienen monto definido (facturas de monto variable sin monto
    // registrado en el pago no pueden impactar el balance).
    const facturasMov: Movimiento[] = facturasPersonales
      .filter((f) => {
        if (f.pago_actual?.estado !== 'pagada') return false;
        const monto = f.pago_actual?.monto ?? f.monto;
        return monto != null && monto > 0;
      })
      .map((f) => {
        const monto = f.pago_actual?.monto ?? f.monto ?? 0;
        const fechaPago = f.pago_actual?.fecha_pago ?? f.created_at;
        return {
          id: `factura-${f.id}`,
          tipo: 'egreso' as const,
          descripcion: `Factura · ${f.nombre}`,
          monto,
          fecha: fechaPago,
          categoria: 'Factura',
        };
      });

    return [...ingresosMov, ...egresosMov, ...facturasMov].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  }, [ingresos, gastos, facturasPersonales]);

  return { movimientos, loading: loadingIngresos || loadingGastos };
}
