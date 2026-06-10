import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { useColors } from '@/hooks/useColors';
import { formatMonto, formatFechaRelativa } from '@/utils/format';
import type { Gasto } from '@/types';

type Props = {
  gasto: Gasto;
  onPress?: () => void;
  onLongPress?: () => void;
};

function getIconName(icono: string): keyof typeof MaterialCommunityIcons.glyphMap {
  return (icono as keyof typeof MaterialCommunityIcons.glyphMap) || 'dots-horizontal';
}

export function GastoRow({ gasto, onPress, onLongPress }: Props) {
  const colors = useColors();
  const iconName = getIconName(gasto.categoria?.icono ?? 'dots-horizontal');
  const categoria = gasto.categoria?.nombre ?? 'Otros';
  const pagadorNombre = gasto.perfil?.nombre ?? 'Desconocido';

  let cuotaInfo: string | undefined;
  if (gasto.cuota_numero && gasto.cuota_total) {
    cuotaInfo = `Cuota ${gasto.cuota_numero} de ${gasto.cuota_total}`;
    if (gasto.tarjeta) cuotaInfo += ` · ${gasto.tarjeta}`;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: 'rgba(30,10,16,0.06)' }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: 'rgba(107,45,62,0.07)' }]}>
        <MaterialCommunityIcons name={iconName} size={18} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <RNText style={[styles.descripcion, { color: colors.textPrimary }]}>{gasto.descripcion}</RNText>
        {cuotaInfo ? (
          <RNText style={[styles.cuota, { color: colors.primary }]}>{cuotaInfo}</RNText>
        ) : null}
        <RNText style={[styles.meta, { color: colors.textSecondary }]}>
          {categoria} · {formatFechaRelativa(gasto.fecha)}
        </RNText>
      </View>

      <View style={styles.right}>
        <RNText style={[styles.monto, { color: colors.textPrimary }]}>{formatMonto(gasto.monto)}</RNText>
        <View style={styles.pagador}>
          <Avatar nombre={pagadorNombre} url={gasto.perfil?.avatar_url} size={16} color={colors.primaryLight} />
          <RNText style={[styles.pagadorNombre, { color: colors.textSecondary }]}>
            {pagadorNombre.split(' ')[0]}
          </RNText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    borderBottomWidth: 0.5,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: 2 },
  descripcion: { fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  cuota: { fontFamily: 'Manrope_500Medium', fontSize: 9 },
  meta: { fontFamily: 'Manrope_500Medium', fontSize: 9 },
  right: { alignItems: 'flex-end', gap: 3 },
  monto: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  pagador: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pagadorNombre: { fontFamily: 'Manrope_500Medium', fontSize: 9 },
});
