import { useMemo, useCallback } from 'react';
import { useGastos } from '@/hooks/useGastos';
import { useFacturas } from '@/hooks/useFacturas';

export function useResumenPersonal(mes: number, anio: number) {
  const { gastos, totalMes: totalGastosBase, loading, recargar: recargarGastos } = useGastos(mes, anio, { scope: 'personal' });
  const { facturas: facturasPersonales, recargar: recargarFacturas } = useFacturas(mes, anio, { scope: 'personal' });

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

  const recargar = useCallback(
    () => Promise.all([recargarGastos(), recargarFacturas()]),
    [recargarGastos, recargarFacturas],
  );

  return {
    gastos,
    facturasPersonales,
    totalGastos,
    loading,
    recargar,
  };
}
