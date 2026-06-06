import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';

type Props = {
  totalIngresos: number;
  totalGastos: number;
  disponible: number;
};

export function ResumenPersonalCard({ totalIngresos, totalGastos, disponible }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.personal }]}>
      <RNText style={styles.label}>ME QUEDA DISPONIBLE</RNText>
      <RNText style={[styles.amount, { color: colors.heroPersonal }]}>
        {formatMonto(disponible)}
      </RNText>
      <RNText style={styles.sub}>
        de {formatMonto(totalIngresos)} cobrados este mes
      </RNText>
      <View style={styles.divider} />
      <View style={styles.grid}>
        <View style={styles.col}>
          <RNText style={[styles.gridNum, { color: colors.heroPersonal }]}>
            {formatMonto(totalIngresos)}
          </RNText>
          <RNText style={styles.gridLabel}>COBRÉ</RNText>
        </View>
        <View style={styles.gridDivider} />
        <View style={styles.col}>
          <RNText style={[styles.gridNum, { color: 'rgba(225,245,238,0.7)' }]}>
            {formatMonto(totalGastos)}
          </RNText>
          <RNText style={styles.gridLabel}>GASTÉ</RNText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, gap: 4 },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
    color: 'rgba(225,245,238,0.65)',
    marginBottom: 2,
  },
  amount: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.8,
  },
  sub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    color: 'rgba(225,245,238,0.6)',
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  grid: { flexDirection: 'row' },
  col: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  gridDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.13)' },
  gridNum: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  gridLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 7,
    letterSpacing: 0.5,
    color: 'rgba(225,245,238,0.5)',
    marginTop: 2,
  },
});
