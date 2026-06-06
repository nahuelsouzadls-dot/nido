import { useMemo } from 'react';
import { useGastos } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';

export type Movimiento = {
  id: string;
  tipo: 'ingreso' | 'egreso';
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string | null;
};

export function useMovimientosPersonales(mes: number, anio: number) {
  const { ingresos, loading: loadingIngresos } = useIngresos(mes, anio);
  const { gastos, loading: loadingGastos } = useGastos(mes, anio, { scope: 'personal' });

  const movimientos = useMemo<Movimiento[]>(() => {
    const ingresosMov: Movimiento[] = ingresos.map((i) => ({
      id: i.id,
      tipo: 'ingreso',
      descripcion: i.descripcion ?? 'Ingreso',
      monto: i.monto,
      fecha: i.fecha,
      categoria: i.categoria,
    }));

    const egresosMov: Movimiento[] = gastos.map((g) => ({
      id: g.id,
      tipo: 'egreso',
      descripcion: g.descripcion,
      monto: g.monto,
      fecha: g.fecha,
      categoria: g.categoria_texto ?? g.categoria?.nombre ?? null,
    }));

    return [...ingresosMov, ...egresosMov].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  }, [ingresos, gastos]);

  return { movimientos, loading: loadingIngresos || loadingGastos };
}
