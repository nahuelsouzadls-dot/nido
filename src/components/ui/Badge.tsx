import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Radii } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from './Text';

type Variant = 'success' | 'warning' | 'danger' | 'neutral';

type Props = {
  variant: Variant;
  label: string;
};

export function Badge({ variant, label }: Props) {
  const colors = useColors();

  const config = {
    success: { bg: colors.successLight, color: colors.success, dot: colors.success },
    warning: { bg: colors.warningLight, color: '#B07000', dot: colors.warning },
    danger: { bg: colors.dangerLight, color: colors.danger, dot: colors.danger },
    neutral: { bg: colors.card, color: colors.textSecondary, dot: colors.textTertiary },
  };

  const c = config[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text variant="caption" style={{ color: c.color, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
