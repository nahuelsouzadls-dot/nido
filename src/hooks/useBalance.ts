import { useMemo } from 'react';
import type { Gasto, Balance } from '@/types';
import { useAuthStore } from '@/store/auth';

type DivisionConfig = {
  tipo: '50-50' | 'porcentaje' | 'monto-fijo';
  porcentajeA?: number; // porcentaje de la persona A (perfil)
};

export function useBalance(gastos: Gasto[], config: DivisionConfig = { tipo: '50-50' }) {
  const { perfil, companero } = useAuthStore();

  const balance = useMemo((): Balance | null => {
    if (!perfil || !companero) return null;

    const totalMes = gastos.reduce((sum, g) => sum + g.monto, 0);
    const gastosPorA = gastos
      .filter((g) => g.pagado_por === perfil.id)
      .reduce((sum, g) => sum + g.monto, 0);
    const gastosPorB = gastos
      .filter((g) => g.pagado_por === companero.id)
      .reduce((sum, g) => sum + g.monto, 0);

    let porcentajeA = 50;
    if (config.tipo === 'porcentaje' && config.porcentajeA !== undefined) {
      porcentajeA = config.porcentajeA;
    }
    const porcentajeB = 100 - porcentajeA;

    const deberiaA = (totalMes * porcentajeA) / 100;
    const deberiaB = (totalMes * porcentajeB) / 100;

    const diferencia = gastosPorA - deberiaA; // positivo = A pagó de más

    let deudor: string | null = null;
    let acreedor: string | null = null;
    let montoDebe = 0;

    if (Math.abs(diferencia) > 0.5) {
      if (diferencia > 0) {
        // A pagó de más → B le debe a A
        deudor = companero.id;
        acreedor = perfil.id;
        montoDebe = diferencia;
      } else {
        // B pagó de más → A le debe a B
        deudor = perfil.id;
        acreedor = companero.id;
        montoDebe = Math.abs(diferencia);
      }
    }

    return {
      totalMes,
      porcentajeA,
      porcentajeB,
      montoA: gastosPorA,
      montoB: gastosPorB,
      diferencia,
      deudor,
      acreedor,
      montoDebe,
    };
  }, [gastos, perfil, companero, config]);

  return balance;
}
