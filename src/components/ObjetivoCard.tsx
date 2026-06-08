import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { anim } from '@/theme/animations';
import { useMotion } from '@/hooks/useMotion';
import { formatMonto } from '@/utils/format';
import type { Objetivo } from '@/types';

type Props = {
  objetivo: Objetivo;
  onPress?: () => void;
  onAportar?: () => void;
  onDelete?: () => void;
  accentColor?: string;
  accentLight?: string;
};

export function ObjetivoCard({ objetivo, onPress, onAportar, onDelete, accentColor, accentLight }: Props) {
  const colors = useColors();
  const { reduceMotion } = useMotion();
  const accent = accentColor ?? colors.sage;
  const accentLightColor = accentLight ?? 'rgba(90,122,72,0.15)';
  const progreso = objetivo.monto_actual / objetivo.monto_objetivo;
  const porcentaje = Math.min(Math.round(progreso * 100), 100);
  const faltan = Math.max(0, objetivo.monto_objetivo - objetivo.monto_actual);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progressWidth.value = porcentaje;
    } else {
      anim.progressFill(progressWidth, porcentaje);
    }
  }, [porcentaje, reduceMotion]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as `${number}%`,
  }));

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
          <RNText style={[styles.porcentaje, { color: accent }]}>{porcentaje}%</RNText>
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

      {/* Progress bar — animada */}
      <View style={[styles.track, { backgroundColor: accentLightColor }]}>
        <Animated.View style={[styles.fill, barStyle, { backgroundColor: accent }]} />
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <RNText style={[styles.montos, { color: colors.textSecondary }]}>
          {formatMonto(objetivo.monto_actual)} de {formatMonto(objetivo.monto_objetivo)}
          {!objetivo.completado && faltan > 0 ? ` · faltan ${formatMonto(faltan)}` : ''}
        </RNText>
        {!objetivo.completado && (
          <TouchableOpacity
            style={[styles.aportarBtn, { backgroundColor: accent }]}
            onPress={onAportar ?? onPress}
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
  card: { borderRadius: 14, borderWidth: 0.5, padding: 13, gap: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nombre: { fontFamily: 'Manrope_700Bold', fontSize: 13, flex: 1 },
  porcentaje: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  montos: { fontFamily: 'Manrope_500Medium', fontSize: 9, flex: 1 },
  aportarBtn: { borderRadius: 13, paddingHorizontal: 12, paddingVertical: 6 },
  aportarText: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#fff' },
  completadoBadge: { borderRadius: 13, paddingHorizontal: 10, paddingVertical: 4 },
  completadoText: { fontFamily: 'Manrope_700Bold', fontSize: 9 },
});
