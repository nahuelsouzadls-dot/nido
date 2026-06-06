import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';

type Props = {
  label: string;
  value: number;
  valueColor?: string;
  count: string;
};

export function MiniStatCard({ label, value, valueColor, count }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
      <RNText style={[styles.label, { color: colors.textSecondary }]}>{label}</RNText>
      <RNText style={[styles.value, { color: valueColor ?? colors.textPrimary }]}>
        {formatMonto(value)}
      </RNText>
      <RNText style={[styles.count, { color: colors.textSecondary }]}>{count}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    letterSpacing: 0.6,
  },
  value: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  count: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
  },
});
