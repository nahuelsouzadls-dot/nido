import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Radii, Shadow } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

type Props = ViewProps & {
  padded?: boolean;
};

export function Card({ padded = true, style, children, ...props }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    ...Shadow.sm,
  },
  padded: {
    padding: 16,
  },
});
