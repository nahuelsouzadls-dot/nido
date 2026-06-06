import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatMonto, formatFechaRelativa } from '@/utils/format';
import type { Movimiento } from '@/hooks/useMovimientosPersonales';

type Props = {
  movimiento: Movimiento;
  showSeparator?: boolean;
};

export function MovimientoRow({ movimiento, showSeparator }: Props) {
  const colors = useColors();
  const esIngreso = movimiento.tipo === 'ingreso';

  return (
    <>
      <View style={[
        styles.row,
        { borderLeftColor: esIngreso ? colors.sage : colors.textSecondary },
      ]}>
        <View style={{ flex: 1 }}>
          <RNText style={[styles.desc, { color: colors.textPrimary }]}>
            {movimiento.descripcion}
          </RNText>
          {movimiento.categoria && (
            <RNText style={[styles.cat, { color: colors.textSecondary }]}>
              {movimiento.categoria}
            </RNText>
          )}
          <RNText style={[styles.fecha, { color: colors.textSecondary }]}>
            {formatFechaRelativa(movimiento.fecha)}
          </RNText>
        </View>
        <RNText style={[
          styles.monto,
          { color: esIngreso ? colors.sage : colors.textPrimary },
        ]}>
          {esIngreso ? '+' : '-'}{formatMonto(movimiento.monto)}
        </RNText>
      </View>
      {showSeparator && (
        <View style={[styles.sep, { backgroundColor: 'rgba(30,10,16,0.06)' }]} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 2.5,
    paddingLeft: 10,
    paddingVertical: 10,
    paddingRight: 4,
    gap: 8,
  },
  desc: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
  },
  cat: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    marginTop: 1,
  },
  fecha: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 8,
    marginTop: 2,
  },
  monto: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  sep: {
    height: 0.5,
    marginLeft: 13,
  },
});
