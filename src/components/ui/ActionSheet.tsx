import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
  Pressable,
  View,
  Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

export interface AccionItem {
  label: string;
  descripcion?: string;
  destructivo?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  titulo?: string;
  subtitulo?: string;
  acciones: AccionItem[];
  onClose: () => void;
}

export function ActionSheet({ visible, titulo, subtitulo, acciones, onClose }: Props) {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      transparent
      visible={visible}
      animationType={isWeb ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <Pressable style={[styles.backdrop, isWeb && styles.backdropCentered]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.background },
            isWeb && styles.sheetWeb,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {!isWeb && <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />}

          {(titulo || subtitulo) && (
            <View style={styles.header}>
              {titulo && (
                <RNText style={[styles.titulo, { color: colors.textSecondary }]}>
                  {titulo.toUpperCase()}
                </RNText>
              )}
              {subtitulo && (
                <RNText style={[styles.subtitulo, { color: colors.textPrimary }]}>
                  {subtitulo}
                </RNText>
              )}
            </View>
          )}

          <View style={[styles.lista, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            {acciones.map((accion, i) => (
              <React.Fragment key={accion.label}>
                {i > 0 && <View style={[styles.sep, { backgroundColor: colors.borderSubtle }]} />}
                <TouchableOpacity
                  style={styles.item}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    // Pequeño delay para que el modal cierre antes de disparar
                    // la siguiente acción (evita conflicto si abre otro Modal)
                    setTimeout(accion.onPress, 80);
                  }}
                >
                  <RNText
                    style={[
                      styles.itemLabel,
                      { color: accion.destructivo ? '#B52A2A' : colors.textPrimary },
                    ]}
                  >
                    {accion.label}
                  </RNText>
                  {accion.descripcion ? (
                    <RNText style={[styles.itemDesc, { color: colors.textSecondary }]}>
                      {accion.descripcion}
                    </RNText>
                  ) : null}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cancelar, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <RNText style={[styles.cancelarText, { color: colors.textSecondary }]}>Cancelar</RNText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdropCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 36,
    gap: 10,
  },
  sheetWeb: {
    borderRadius: 20,
    maxWidth: 380,
    width: '100%',
    paddingTop: 20,
    paddingBottom: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: { paddingHorizontal: 2, paddingBottom: 2, gap: 3 },
  titulo: { fontFamily: 'Manrope_700Bold', fontSize: 8, letterSpacing: 0.8 },
  subtitulo: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  lista: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  sep: { height: 0.5, marginHorizontal: 14 },
  item: { paddingHorizontal: 14, paddingVertical: 13 },
  itemLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  itemDesc: { fontFamily: 'Manrope_500Medium', fontSize: 10, marginTop: 2, lineHeight: 14 },
  cancelar: {
    borderRadius: 14,
    borderWidth: 0.5,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelarText: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
});
