import { useMemo, useCallback } from 'react';
import { useGastos } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';

export function useResumenPersonal(mes: number, anio: number) {
  const { ingresos, totalMes: totalIngresos, loading: loadingIngresos, recargar: recargarIngresos } = useIngresos(mes, anio);
  const { gastos, totalMes: totalGastos, loading: loadingGastos, recargar: recargarGastos } = useGastos(mes, anio, { scope: 'personal' });

  const disponible = useMemo(() => totalIngresos - totalGastos, [totalIngresos, totalGastos]);
  const pctGastado = useMemo(
    () => (totalIngresos > 0 ? Math.min(Math.round((totalGastos / totalIngresos) * 100), 100) : 0),
    [totalIngresos, totalGastos],
  );

  const recargar = useCallback(
    () => Promise.all([recargarIngresos(), recargarGastos()]),
    [recargarIngresos, recargarGastos],
  );

  return {
    ingresos,
    gastos,
    totalIngresos,
    totalGastos,
    disponible,
    pctGastado,
    loading: loadingIngresos || loadingGastos,
    recargar,
  };
}
