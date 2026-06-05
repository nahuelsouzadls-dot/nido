import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radii, Shadow } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useColors } from '@/hooks/useColors';
import { formatMonto } from '@/utils/format';
import type { Factura } from '@/types';

type Props = {
  factura: Factura;
  onPagar: () => void;
  onPress?: () => void;
};

function getEstadoBadge(factura: Factura) {
  const estado = factura.pago_actual?.estado;
  if (estado === 'pagada') return { variant: 'success' as const, label: 'Pagada' };
  if (estado === 'vencida') return { variant: 'danger' as const, label: 'Vencida' };
  return { variant: 'warning' as const, label: 'Pendiente' };
}

function getVencimientoLabel(dia: number): string {
  const hoy = new Date().getDate();
  const diff = dia - hoy;
  if (diff === 0) return 'Vence hoy';
  if (diff === 1) return 'Vence mañana';
  if (diff < 0) return `Venció el día ${dia}`;
  return `Vence el día ${dia}`;
}

export function FacturaCard({ factura, onPagar, onPress }: Props) {
  const colors = useColors();
  const { variant, label } = getEstadoBadge(factura);
  const esPagada = factura.pago_actual?.estado === 'pagada';

  const handlePagar = () => {
    if (esPagada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPagar();
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        esPagada && styles.cardPagada,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.top}>
        <View style={styles.info}>
          <Text variant="headline">{factura.nombre}</Text>
          <Text variant="caption" color={colors.textSecondary}>
            {getVencimientoLabel(factura.dia_vencimiento)}
          </Text>
        </View>
        <Badge variant={variant} label={label} />
      </View>

      <View style={styles.bottom}>
        <View>
          {factura.monto ? (
            <Text variant="title2" style={{ fontWeight: '700' }}>
              {formatMonto(factura.monto)}
            </Text>
          ) : (
            <Text variant="subhead" color={colors.textSecondary}>
              Monto variable
            </Text>
          )}
          {factura.responsable ? (
            <View style={styles.responsable}>
              <Avatar nombre={factura.responsable.nombre} size={16} />
              <Text variant="caption" color={colors.textSecondary}>
                {factura.responsable.nombre.split(' ')[0]}
              </Text>
            </View>
          ) : null}
        </View>

        {!esPagada ? (
          <TouchableOpacity
            style={[styles.botonPagar, { backgroundColor: colors.primary }]}
            onPress={handlePagar}
            activeOpacity={0.8}
          >
            <Text style={styles.botonLabel}>Pagar</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.pagadoPor, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
            {factura.pago_actual?.pagador ? (
              <Text variant="caption" color={colors.success}>
                {factura.pago_actual.pagador.nombre.split(' ')[0]}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    ...Shadow.sm,
  },
  cardPagada: {
    opacity: 0.85,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    gap: 2,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  responsable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  botonPagar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.full,
  },
  botonLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  pagadoPor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  checkmark: {
    fontWeight: '700',
    fontSize: 16,
  },
});
