import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Radii, Shadow } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';
import type { Objetivo } from '@/types';

type Props = {
  objetivo: Objetivo;
  onPress?: () => void;
};

export function ObjetivoCard({ objetivo, onPress }: Props) {
  const colors = useColors();
  const progreso = objetivo.monto_actual / objetivo.monto_objetivo;
  const porcentaje = Math.min(Math.round(progreso * 100), 100);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.icono}>{objetivo.icono}</Text>
        <View style={{ flex: 1 }}>
          <Text variant="headline">{objetivo.nombre}</Text>
          {objetivo.descripcion ? (
            <Text variant="caption" color={colors.textSecondary}>
              {objetivo.descripcion}
            </Text>
          ) : null}
        </View>
        <Text variant="footnote" color={colors.textSecondary} style={{ fontWeight: '600' }}>
          {porcentaje}%
        </Text>
      </View>

      <ProgressBar
        progress={progreso}
        color={objetivo.completado ? colors.success : colors.primary}
      />

      <View style={styles.montos}>
        <Text variant="footnote" color={colors.textSecondary}>
          Ahorrado
        </Text>
        <View style={styles.cantidades}>
          <Text variant="callout" style={{ fontWeight: '700' }}>
            {formatMonto(objetivo.monto_actual)}
          </Text>
          <Text variant="footnote" color={colors.textSecondary}>
            / {formatMonto(objetivo.monto_objetivo)}
          </Text>
        </View>
      </View>

      {objetivo.completado ? (
        <View style={[styles.completadoBanner, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.completadoText, { color: colors.success }]}>🎉 ¡Objetivo completado!</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icono: {
    fontSize: 28,
  },
  montos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cantidades: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  completadoBanner: {
    borderRadius: Radii.sm,
    padding: 10,
    alignItems: 'center',
  },
  completadoText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
