import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';
import type { Factura } from '@/types';

type Props = {
  factura: Factura;
  onPagar: () => void;
  onPress?: () => void;
  accentColor?: string;
};

function getVencimientoLabel(dia: number): string {
  const hoy = new Date().getDate();
  const diff = dia - hoy;
  if (diff === 0) return 'Vence hoy';
  if (diff === 1) return 'Vence mañana';
  if (diff < 0) return `Venció el día ${dia}`;
  return `Vence el día ${dia}`;
}

export function FacturaCard({ factura, onPagar, onPress, accentColor }: Props) {
  const colors = useColors();
  const accent = accentColor ?? colors.primary;
  const esPagada = factura.pago_actual?.estado === 'pagada';
  const esVencida = factura.pago_actual?.estado === 'vencida';

  const handlePagar = () => {
    if (esPagada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPagar();
  };

  const cardBg = esPagada ? colors.cardSage : colors.card;
  const cardBorder = esPagada ? 'rgba(90,122,72,0.2)' : colors.borderSubtle;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <RNText style={[styles.nombre, { color: colors.textPrimary }]}>{factura.nombre}</RNText>
          {!esPagada && (
            <RNText style={[styles.vencimiento, { color: esVencida ? colors.primaryUrgent : colors.textSecondary }]}>
              {getVencimientoLabel(factura.dia_vencimiento)}
            </RNText>
          )}
          {factura.responsable ? (
            <RNText style={[styles.responsable, { color: colors.textSecondary }]}>
              Compartida con {factura.responsable.nombre.split(' ')[0]}
            </RNText>
          ) : null}
        </View>

        {/* Badge */}
        <View style={[
          styles.badge,
          { backgroundColor: esPagada ? 'rgba(90,122,72,0.12)' : `${accent}1A` },
        ]}>
          <RNText style={[styles.badgeText, { color: esPagada ? colors.sageDark : accent }]}>
            {esPagada ? 'Pagada' : 'Pendiente'}
          </RNText>
        </View>
      </View>

      <View style={styles.bottom}>
        <View>
          {factura.monto ? (
            <RNText style={[styles.monto, { color: esPagada ? colors.sageDark : colors.textPrimary }]}>
              {formatMonto(factura.monto)}
            </RNText>
          ) : (
            <RNText style={[styles.montoVariable, { color: colors.textSecondary }]}>
              Monto variable
            </RNText>
          )}
        </View>

        {!esPagada ? (
          <TouchableOpacity
            style={[styles.botonPagar, { backgroundColor: accent }]}
            onPress={handlePagar}
            activeOpacity={0.8}
          >
            <RNText style={styles.botonLabel}>Pagar</RNText>
          </TouchableOpacity>
        ) : (
          <View style={[styles.pagadoChip, { backgroundColor: 'rgba(90,122,72,0.12)' }]}>
            <MaterialCommunityIcons name="check" size={12} color={colors.sageDark} />
            <RNText style={[styles.pagadoText, { color: colors.sageDark }]}>Listo</RNText>
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
    padding: 14,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nombre: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  vencimiento: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
  },
  responsable: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monto: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  montoVariable: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
  },
  botonPagar: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 13,
  },
  botonLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#fff',
  },
  pagadoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 13,
  },
  pagadoText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
  },
});
