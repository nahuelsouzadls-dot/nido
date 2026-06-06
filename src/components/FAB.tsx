import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  Text as RNText,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Shadow } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { useSpace } from '@/context/SpaceContext';
import { useRouter, type Href } from 'expo-router';

type Accion = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  ruta: Href;
};

const ACCIONES_HOGAR: Accion[] = [
  { icon: 'cash-multiple',        label: 'Registrar gasto', ruta: '/modal/gasto' },
  { icon: 'file-document-outline',label: 'Crear factura',   ruta: '/modal/factura' },
  { icon: 'target',               label: 'Crear objetivo',  ruta: '/modal/objetivo' },
];

const ACCIONES_PERSONAL: Accion[] = [
  { icon: 'trending-up',          label: 'Registrar ingreso', ruta: '/modal/ingreso' },
  { icon: 'cash-multiple',        label: 'Registrar gasto',   ruta: '/modal/gasto' },
  { icon: 'file-document-outline',label: 'Crear factura',     ruta: '/modal/factura' },
  { icon: 'target',               label: 'Crear objetivo',    ruta: '/modal/objetivo' },
];

export function FAB() {
  const router = useRouter();
  const colors = useColors();
  const { activeContext } = useSpace();
  const acciones = activeContext === 'personal' ? ACCIONES_PERSONAL : ACCIONES_HOGAR;
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
            <Animated.View style={[styles.menu, { backgroundColor: colors.card, opacity: opacidad }]}>
              {acciones.map((accion) => (
                <TouchableOpacity
                  key={accion.label}
                  style={styles.accion}
                  onPress={() => elegir(accion.ruta)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.accionIconBox, { backgroundColor: 'rgba(107,45,62,0.08)' }]}>
                    <MaterialCommunityIcons name={accion.icon} size={18} color={colors.primary} />
                  </View>
                  <RNText style={[styles.accionLabel, { color: colors.textPrimary }]}>
                    {accion.label}
                  </RNText>
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
        <Animated.View style={{ transform: [{ rotate: rotar }] }}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    paddingBottom: 96,
    paddingRight: 24,
    alignItems: 'flex-end',
  },
  menu: {
    borderRadius: 20,
    padding: 6,
    gap: 2,
    ...Shadow.lg,
    minWidth: 220,
    borderWidth: 0.5,
    borderColor: 'rgba(107,45,62,0.15)',
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  accionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accionLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
  },
});
