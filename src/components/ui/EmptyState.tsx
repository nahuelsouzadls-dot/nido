import React from 'react';
import { View, StyleSheet, Text as RNText, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  icon?: IconName;
  titulo: string;
  descripcion?: string;
  ctaLabel?: string;
  onCta?: () => void;
  // Legacy prop — ignored
  emoji?: string;
};

export function EmptyState({ icon = 'file-document-outline', titulo, descripcion, ctaLabel, onCta }: Props) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
      </View>
      <RNText style={[styles.titulo, { color: colors.textPrimary }]}>{titulo}</RNText>
      {descripcion ? (
        <RNText style={[styles.descripcion, { color: colors.textSecondary }]}>{descripcion}</RNText>
      ) : null}
      {ctaLabel && onCta ? (
        <TouchableOpacity style={[styles.cta, { backgroundColor: colors.primary }]} onPress={onCta} activeOpacity={0.8}>
          <RNText style={styles.ctaText}>{ctaLabel}</RNText>
        </TouchableOpacity>
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
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    textAlign: 'center',
  },
  descripcion: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
  },
  cta: {
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  ctaText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#fff',
  },
});
