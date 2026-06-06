import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { useColors } from '@/hooks/useColors';
import { formatTiempoRelativo } from '@/utils/format';
import type { Actividad, ActividadTipo } from '@/types';

type IconConfig = {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  bg: string;
  color: string;
};

const ICONOS: Record<ActividadTipo, IconConfig> = {
  gasto_agregado:     { name: 'cash-multiple',         bg: 'rgba(107,45,62,0.08)',  color: '#6B2D3E' },
  factura_pagada:     { name: 'check',                  bg: 'rgba(90,122,72,0.1)',   color: '#5A7A48' },
  factura_creada:     { name: 'file-document-outline',  bg: 'rgba(107,45,62,0.08)',  color: '#6B2D3E' },
  objetivo_creado:    { name: 'target',                 bg: 'rgba(90,122,72,0.1)',   color: '#5A7A48' },
  objetivo_completado:{ name: 'trophy-outline',         bg: 'rgba(90,122,72,0.15)',  color: '#3A5A28' },
  aporte_objetivo:    { name: 'trending-up',            bg: 'rgba(90,122,72,0.1)',   color: '#5A7A48' },
  factura_vencida:    { name: 'alert-outline',          bg: 'rgba(92,26,26,0.1)',    color: '#5C1A1A' },
};

type Props = {
  item: Actividad;
};

export function ActividadItem({ item }: Props) {
  const colors = useColors();
  const cfg = ICONOS[item.tipo] ?? { name: 'dots-horizontal', bg: 'rgba(107,45,62,0.08)', color: '#6B2D3E' };

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
        <MaterialCommunityIcons name={cfg.name} size={16} color={cfg.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <RNText style={[styles.titulo, { color: colors.textPrimary }]} numberOfLines={2}>
              {item.titulo}
            </RNText>
            {item.descripcion ? (
              <RNText style={[styles.descripcion, { color: colors.textSecondary }]}>
                {item.descripcion}
              </RNText>
            ) : null}
          </View>
          <RNText style={[styles.tiempo, { color: colors.textSecondary }]}>
            {formatTiempoRelativo(item.created_at)}
          </RNText>
        </View>
        {item.perfil ? (
          <View style={styles.perfilRow}>
            <Avatar nombre={item.perfil.nombre} url={item.perfil.avatar_url} size={16} color={colors.primaryLight} />
            <RNText style={[styles.perfilNombre, { color: colors.textSecondary }]}>
              {item.perfil.nombre.split(' ')[0]}
            </RNText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  titulo: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    lineHeight: 15,
  },
  descripcion: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    marginTop: 1,
  },
  tiempo: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
    flexShrink: 0,
  },
  perfilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  perfilNombre: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 9,
  },
});
