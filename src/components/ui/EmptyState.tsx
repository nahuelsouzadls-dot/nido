import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Text } from './Text';

type Props = {
  emoji: string;
  titulo: string;
  descripcion?: string;
};

export function EmptyState({ emoji, titulo, descripcion }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="headline" align="center" style={styles.titulo}>
        {titulo}
      </Text>
      {descripcion ? (
        <Text variant="subhead" color={colors.textSecondary} align="center">
          {descripcion}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  titulo: {
    marginBottom: 4,
  },
});
