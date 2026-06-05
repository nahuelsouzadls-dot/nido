import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radii, Shadow } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { Text } from '@/components/ui/Text';
import { useRouter, type Href } from 'expo-router';

type Accion = {
  icono: string;
  label: string;
  ruta: Href;
};

const ACCIONES: Accion[] = [
  { icono: '💰', label: 'Registrar gasto', ruta: '/modal/gasto' },
  { icono: '🧾', label: 'Crear factura', ruta: '/modal/factura' },
  { icono: '🎯', label: 'Crear objetivo', ruta: '/modal/objetivo' },
];

export function FAB() {
  const router = useRouter();
  const colors = useColors();
  const [abierto, setAbierto] = useState(false);
  const rotacion = useRef(new Animated.Value(0)).current;
  const opacidad = useRef(new Animated.Value(0)).current;

  const abrir = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAbierto(true);
    Animated.parallel([
      Animated.spring(rotacion, { toValue: 1, useNativeDriver: true }),
      Animated.spring(opacidad, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const cerrar = () => {
    Animated.parallel([
      Animated.spring(rotacion, { toValue: 0, useNativeDriver: true }),
      Animated.timing(opacidad, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setAbierto(false));
  };

  const elegir = (ruta: Href) => {
    cerrar();
    setTimeout(() => router.push(ruta), 200);
  };

  const rotar = rotacion.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <>
      {abierto ? (
        <Modal transparent animationType="none" onRequestClose={cerrar}>
          <Pressable style={styles.overlay} onPress={cerrar}>
            <Animated.View
              style={[
                styles.menu,
                { backgroundColor: colors.card, opacity: opacidad },
              ]}
            >
              {ACCIONES.map((accion) => (
                <TouchableOpacity
                  key={accion.label}
                  style={styles.accion}
                  onPress={() => elegir(accion.ruta)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accionIcono}>{accion.icono}</Text>
                  <Text variant="callout" style={{ fontWeight: '500' }}>
                    {accion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </Pressable>
        </Modal>
      ) : null}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={abierto ? cerrar : abrir}
        activeOpacity={0.9}
      >
        <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotar }] }]}>
          +
        </Animated.Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingRight: 24,
    alignItems: 'flex-end',
  },
  menu: {
    borderRadius: Radii.xl,
    padding: 8,
    gap: 2,
    ...Shadow.lg,
    minWidth: 220,
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radii.md,
  },
  accionIcono: {
    fontSize: 22,
  },
});
