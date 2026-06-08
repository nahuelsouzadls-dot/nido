import { useMemo, useCallback } from 'react';
import { useGastos } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';
import { useFacturas } from '@/hooks/useFacturas';

export function useResumenPersonal(mes: number, anio: number) {
  const { ingresos, totalMes: totalIngresos, loading: loadingIngresos, recargar: recargarIngresos } = useIngresos(mes, anio);
  const { gastos, totalMes: totalGastosBase, loading: loadingGastos, recargar: recargarGastos } = useGastos(mes, anio, { scope: 'personal' });
  const { facturas: facturasPersonales, recargar: recargarFacturas } = useFacturas(mes, anio, { scope: 'personal' });

  // Suma el monto de las facturas personales ya pagadas este mes.
  // Se usa pago_actual.monto (puede diferir de factura.monto en facturas de monto variable).
  // Fallback a factura.monto si el pago no registró monto propio.
  const montoFacturasPersonalesPagadas = useMemo(
    () =>
      facturasPersonales
        .filter((f) => f.pago_actual?.estado === 'pagada')
        .reduce((sum, f) => sum + (f.pago_actual?.monto ?? f.monto ?? 0), 0),
    [facturasPersonales],
  );

  const totalGastos = useMemo(
    () => totalGastosBase + montoFacturasPersonalesPagadas,
    [totalGastosBase, montoFacturasPersonalesPagadas],
  );

  const disponible = useMemo(() => totalIngresos - totalGastos, [totalIngresos, totalGastos]);
  const pctGastado = useMemo(
    () => (totalIngresos > 0 ? Math.min(Math.round((totalGastos / totalIngresos) * 100), 100) : 0),
    [totalIngresos, totalGastos],
  );

  const recargar = useCallback(
    () => Promise.all([recargarIngresos(), recargarGastos(), recargarFacturas()]),
    [recargarIngresos, recargarGastos, recargarFacturas],
  );

  return {
    ingresos,
    gastos,
    facturasPersonales,
    totalIngresos,
    totalGastos,
    disponible,
    pctGastado,
    loading: loadingIngresos || loadingGastos,
    recargar,
  };
}
