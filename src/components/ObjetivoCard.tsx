import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';
import type { Objetivo } from '@/types';

type Props = {
  objetivo: Objetivo;
  onPress?: () => void;
  onDelete?: () => void;
};

export function ObjetivoCard({ objetivo, onPress, onDelete }: Props) {
  const colors = useColors();
  const progreso = objetivo.monto_actual / objetivo.monto_objetivo;
  const porcentaje = Math.min(Math.round(progreso * 100), 100);
  const faltan = Math.max(0, objetivo.monto_objetivo - objetivo.monto_actual);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardSage, borderColor: 'rgba(90,122,72,0.2)' }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <RNText style={[styles.nombre, { color: colors.textPrimary }]}>{objetivo.nombre}</RNText>
        <View style={styles.topRight}>
          <RNText style={[styles.porcentaje, { color: colors.sage }]}>{porcentaje}%</RNText>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.track, { backgroundColor: 'rgba(90,122,72,0.15)' }]}>
        <View style={[styles.fill, { width: `${porcentaje}%` as `${number}%`, backgroundColor: colors.sage }]} />
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <RNText style={[styles.montos, { color: colors.textSecondary }]}>
          {formatMonto(objetivo.monto_actual)} de {formatMonto(objetivo.monto_objetivo)}
          {!objetivo.completado && faltan > 0 ? ` · faltan ${formatMonto(faltan)}` : ''}
        </RNText>
        {!objetivo.completado && (
          <TouchableOpacity
            style={[styles.aportarBtn, { backgroundColor: colors.sage }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <RNText style={styles.aportarText}>+ Aportar</RNText>
          </TouchableOpacity>
        )}
        {objetivo.completado && (
          <View style={[styles.completadoBadge, { backgroundColor: 'rgba(90,122,72,0.15)' }]}>
            <RNText style={[styles.completadoText, { color: colors.sageDark }]}>Completado</RNText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 13,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nombre: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    flex: 1,
  },
  porcentaje: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  montos: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    flex: 1,
  },
  aportarBtn: {
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aportarText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#fff',
  },
  completadoBadge: {
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completadoText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
  },
});
