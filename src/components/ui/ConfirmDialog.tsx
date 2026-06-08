import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, Text as RNText, Pressable, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  visible: boolean;
  titulo: string;
  descripcion?: string;
  ctaPrimaria: string;
  ctaSecundaria?: string;
  destructivo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  visible,
  titulo,
  descripcion,
  ctaPrimaria,
  ctaSecundaria = 'Cancelar',
  destructivo,
  onConfirmar,
  onCancelar,
}: Props) {
  const colors = useColors();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancelar}>
      <Pressable style={styles.backdrop} onPress={onCancelar}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
          onPress={(e) => e.stopPropagation()}
        >
          <RNText style={[styles.titulo, { color: colors.textPrimary }]}>{titulo}</RNText>
          {descripcion ? (
            <RNText style={[styles.descripcion, { color: colors.textSecondary }]}>{descripcion}</RNText>
          ) : null}
          <TouchableOpacity
            style={[
              styles.btnPrimario,
              { backgroundColor: destructivo ? '#B52A2A' : colors.primary },
            ]}
            onPress={onConfirmar}
            activeOpacity={0.85}
          >
            <RNText style={styles.btnPrimarioText}>{ctaPrimaria}</RNText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancelar} activeOpacity={0.7} style={styles.btnSecundarioRow}>
            <RNText style={[styles.btnSecundario, { color: colors.textSecondary }]}>{ctaSecundaria}</RNText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 20,
    gap: 10,
  },
  titulo: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  descripcion: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    lineHeight: 16,
  },
  btnPrimario: {
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimarioText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  btnSecundarioRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  btnSecundario: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
  },
});
