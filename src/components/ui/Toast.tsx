import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text as RNText, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Tipo = 'success' | 'error';

interface Props {
  visible: boolean;
  mensaje: string;
  tipo?: Tipo;
  duracion?: number;
  onHide: () => void;
}

export function Toast({ visible, mensaje, tipo = 'success', duracion = 2500, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const nd = Platform.OS !== 'web';

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);
    translateY.setValue(10);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: nd }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: nd }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: nd }),
        Animated.timing(translateY, { toValue: 10, duration: 200, useNativeDriver: nd }),
      ]).start(() => onHide());
    }, duracion);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <MaterialCommunityIcons
        name={tipo === 'success' ? 'check-circle-outline' : 'alert-circle-outline'}
        size={15}
        color={tipo === 'success' ? '#C8EAB0' : '#FFBCB0'}
      />
      <RNText style={styles.text}>{mensaje}</RNText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(30,10,16,0.92)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 320,
    zIndex: 999,
    elevation: 10,
  },
  text: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#F5F0F2',
    flexShrink: 1,
  },
});
