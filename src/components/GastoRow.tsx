import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { useColors } from '@/hooks/useColors';
import { formatMonto, formatFechaRelativa } from '@/utils/format';
import type { Gasto } from '@/types';

type Props = {
  gasto: Gasto;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function GastoRow({ gasto, onPress, onLongPress }: Props) {
  const colors = useColors();
  const icono = gasto.categoria?.icono ?? '📦';
  const categoria = gasto.categoria?.nombre ?? 'Otros';
  const pagadorNombre = gasto.perfil?.nombre ?? 'Desconocido';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.icono}>{icono}</Text>
      </View>

      <View style={styles.info}>
        <Text variant="callout" style={{ fontWeight: '600' }}>
          {gasto.descripcion}
        </Text>
        <Text variant="caption" color={colors.textSecondary}>
          {categoria} · {formatFechaRelativa(gasto.fecha)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text variant="callout" style={{ fontWeight: '700' }}>
          {formatMonto(gasto.monto)}
        </Text>
        <View style={styles.pagador}>
          <Avatar nombre={pagadorNombre} url={gasto.perfil?.avatar_url} size={18} />
          <Text variant="caption" color={colors.textSecondary}>
            {pagadorNombre.split(' ')[0]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pagador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
