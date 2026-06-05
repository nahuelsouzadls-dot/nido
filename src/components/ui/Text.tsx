import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { Typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

type Variant = keyof typeof Typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color, align, style, ...props }: Props) {
  const colors = useColors();
  return (
    <RNText
      style={[
        Typography[variant],
        { color: color ?? colors.textPrimary },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    />
  );
}
