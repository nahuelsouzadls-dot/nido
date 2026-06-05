import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Colors, Radii } from '@/constants/theme';
import { iniciales } from '@/utils/format';
import { Text } from './Text';

type Props = {
  nombre: string;
  url?: string | null;
  size?: number;
  color?: string;
};

export function Avatar({ nombre, url, size = 36, color = Colors.primary }: Props) {
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20' },
      ]}
    >
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color }}>
        {iniciales(nombre)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
