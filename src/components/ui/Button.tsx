import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radii, Typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = TouchableOpacityProps & {
  variant?: Variant;
  size?: Size;
  label: string;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  style,
  onPress,
  ...props
}: Props) {
  const colors = useColors();

  const handlePress = (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const bgColor = {
    primary: colors.primary,
    secondary: colors.primaryLight,
    ghost: 'transparent',
    danger: colors.dangerLight,
  }[variant];

  const labelColor = {
    primary: '#FFFFFF',
    secondary: colors.primary,
    ghost: colors.primary,
    danger: colors.danger,
  }[variant];

  return (
    <TouchableOpacity
      style={[styles.base, styles[`size_${size}`], { backgroundColor: bgColor }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} size="small" />
      ) : (
        <View style={styles.content}>
          <Text
            style={[
              styles.label,
              { color: labelColor },
              size === 'sm' && { fontSize: 14 },
              size === 'lg' && { fontSize: 17 },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...Typography.headline,
    fontWeight: '600',
  },
  size_sm: {
    height: 36,
    paddingHorizontal: 16,
  },
  size_md: {
    height: 50,
    paddingHorizontal: 20,
  },
  size_lg: {
    height: 58,
    paddingHorizontal: 24,
  },
});
