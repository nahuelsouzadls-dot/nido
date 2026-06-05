import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { useColors } from '@/hooks/useColors';
import { formatTiempoRelativo } from '@/utils/format';
import type { Actividad, ActividadTipo } from '@/types';

const ICONOS: Record<ActividadTipo, string> = {
  gasto_agregado: '💰',
  factura_pagada: '✅',
  factura_creada: '🧾',
  objetivo_creado: '🎯',
  objetivo_completado: '🎉',
  aporte_objetivo: '💪',
  factura_vencida: '⚠️',
};

type Props = {
  item: Actividad;
};

export function ActividadItem({ item }: Props) {
  const colors = useColors();
  const icono = ICONOS[item.tipo] ?? '📌';

  return (
    <View style={styles.container}>
      <View style={[styles.iconoContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={styles.icono}>{icono}</Text>
      </View>

      <View style={[styles.linea, { backgroundColor: colors.border }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          {item.perfil ? (
            <Avatar nombre={item.perfil.nombre} url={item.perfil.avatar_url} size={24} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text variant="subhead" style={{ fontWeight: '600' }}>
              {item.titulo}
            </Text>
            {item.descripcion ? (
              <Text variant="caption" color={colors.textSecondary}>
                {item.descripcion}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" color={colors.textTertiary}>
            {formatTiempoRelativo(item.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  iconoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  icono: {
    fontSize: 18,
  },
  linea: {
    position: 'absolute',
    left: 34,
    top: 44,
    bottom: 0,
    width: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
});
