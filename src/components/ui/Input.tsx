import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
} from 'react-native';
import { Radii, Typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
};

export function Input({ label, error, prefix, suffix, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const colors = useColors();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="footnote" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: focused ? colors.primary : colors.border,
          },
          error ? { borderColor: colors.danger } : null,
        ]}
      >
        {prefix ? (
          <Text style={styles.prefix} color={colors.textSecondary}>
            {prefix}
          </Text>
        ) : null}

        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {suffix ? (
          <Text style={styles.suffix} color={colors.textSecondary}>
            {suffix}
          </Text>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: 12,
  },
  prefix: {
    marginRight: 8,
    ...Typography.headline,
  },
  suffix: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 2,
  },
});
