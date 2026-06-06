import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';

type Props = {
  disponible: number;
  totalIngresos: number;
};

export function DisponibleHeroCard({ disponible, totalIngresos }: Props) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 20, gap: 6, alignItems: 'center' },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
    color: 'rgba(225,245,238,0.65)',
  },
  amount: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 26,
    letterSpacing: -0.8,
  },
  sub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    color: 'rgba(225,245,238,0.6)',
  },
});
