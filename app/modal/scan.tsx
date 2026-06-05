import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radii } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

// El escaneo de recibos con cámara no está disponible en web.
// En la app móvil, esta pantalla usa expo-camera + OCR.
export default function ScanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icono}>📷</Text>
      <Text variant="headline" align="center" style={styles.titulo}>
        No disponible en web
      </Text>
      <Text variant="subhead" align="center" style={styles.descripcion}>
        El escaneo de recibos está disponible en la app móvil
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnTexto}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  icono: {
    fontSize: 64,
    marginBottom: 8,
  },
  titulo: {
    color: '#FFFFFF',
  },
  descripcion: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  btn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  btnTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
