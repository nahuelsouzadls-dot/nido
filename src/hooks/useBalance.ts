import { useMemo } from 'react';
import type { Gasto, FacturaPago, Balance } from '@/types';
import { useAuthStore } from '@/store/auth';

type DivisionConfig = {
  tipo: '50-50' | 'porcentaje' | 'monto-fijo';
  porcentajeA?: number;
};

type Contribucion = {
  pagado_por: string;
  monto: number;
};

export function useBalance(
  gastos: Gasto[],
  facturasPagadas: FacturaPago[] = [],
  config: DivisionConfig = { tipo: '50-50' },
) {
  const { perfil, companero } = useAuthStore();

  const balance = useMemo((): Balance | null => {
    if (!perfil || !companero) return null;

    // Unifica gastos y pagos de facturas en una sola lista de contribuciones.
    // Ambos representan plata que alguien del hogar puso de su bolsillo.
    const contribuciones: Contribucion[] = [
      ...gastos.map((g) => ({ pagado_por: g.pagado_por, monto: g.monto })),
      ...facturasPagadas
        .filter((f) => f.pagado_por != null && f.monto != null)
        .map((f) => ({ pagado_por: f.pagado_por!, monto: f.monto! })),
    ];

    const totalMes = contribuciones.reduce((sum, c) => sum + c.monto, 0);
    const gastosPorA = contribuciones
      .filter((c) => c.pagado_por === perfil.id)
      .reduce((sum, c) => sum + c.monto, 0);
    const gastosPorB = contribuciones
      .filter((c) => c.pagado_por === companero.id)
      .reduce((sum, c) => sum + c.monto, 0);

    let porcentajeA = 50;
    if (config.tipo === 'porcentaje' && config.porcentajeA !== undefined) {
      porcentajeA = config.porcentajeA;
    }
    const porcentajeB = 100 - porcentajeA;

    const deberiaA = (totalMes * porcentajeA) / 100;
    const diferencia = gastosPorA - deberiaA;

    let deudor: string | null = null;
    let acreedor: string | null = null;
    let montoDebe = 0;

    if (Math.abs(diferencia) > 0.5) {
      if (diferencia > 0) {
        deudor = companero.id;
        acreedor = perfil.id;
        montoDebe = diferencia;
      } else {
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
  }, [gastos, facturasPagadas, perfil, companero, config]);

  return balance;
}
